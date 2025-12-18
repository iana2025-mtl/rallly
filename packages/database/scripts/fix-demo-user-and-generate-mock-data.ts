/**
 * Script to fix demo user password hash and generate mock data for AI suggestions
 * 
 * This script:
 * 1. Fixes the password hash for demo@test.com (uses correct Argon2 format)
 * 2. Ensures email is verified
 * 3. Creates a default space if missing
 * 4. Generates mock historical polls for AI time suggestions
 * 
 * Usage: 
 *   DATABASE_URL="your-production-db-url" pnpm tsx packages/database/scripts/fix-demo-user-and-generate-mock-data.ts
 */

import { prisma } from "@rallly/database";
import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import argon2 from "argon2";

// Mock user data for poll participants
const mockUsers = [
  { name: "Alice Johnson", email: "alice.johnson@example.com" },
  { name: "Bob Smith", email: "bob.smith@example.com" },
  { name: "Charlie Brown", email: "charlie.brown@example.com" },
  { name: "Diana Prince", email: "diana.prince@example.com" },
  { name: "Eve Wilson", email: "eve.wilson@example.com" },
  { name: "Frank Miller", email: "frank.miller@example.com" },
  { name: "Grace Lee", email: "grace.lee@example.com" },
  { name: "Henry Davis", email: "henry.davis@example.com" },
];

// Poll titles for variety
const pollTitles = [
  "Team Standup Meeting",
  "Project Planning Session",
  "Client Review Call",
  "Sprint Retrospective",
  "Design Review",
  "Code Review Session",
  "Weekly Sync",
  "Quarterly Planning",
  "Product Demo",
  "Strategy Discussion",
];

const voteTypes = ["yes", "no", "ifNeedBe"] as const;

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function hashPassword(password: string): Promise<string> {
    // better-auth uses Argon2id with specific parameters
    // The argon2 package produces a hash in the format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
    // But better-auth might expect a slightly different format
    // Let's use the standard argon2 format which should be compatible
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 65536, // 64 MB in KB
      parallelism: 4,
      saltLength: 16,
      hashLength: 32,
    });
    
    // The hash is already in the correct format
    // Format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
    return hash;
  }

async function fixDemoUser() {
  const email = "demo@test.com";
  const password = "demo123456";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 Fixing Demo User Password Hash");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Find existing user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: { provider: "credential" },
      },
      spaces: true,
    },
  });

  if (!user) {
    console.error(`❌ User with email ${email} not found!`);
    console.log("   Please register first at /register");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (${user.id})`);
  console.log(`   Email Verified: ${user.emailVerified ?? false}`);

  // Update email verification if needed
  if (!user.emailVerified) {
    console.log("📧 Marking email as verified...");
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    console.log("✅ Email verified\n");
  }

  // Hash password using Argon2 (same as better-auth)
  console.log("🔐 Generating correct Argon2 password hash...");
  const hashedPassword = await hashPassword(password);
  console.log("✅ Password hashed\n");

  // Update or create credential account
  if (user.accounts.length > 0) {
    console.log("📝 Updating existing credential account with correct password hash...");
    await prisma.account.update({
      where: { id: user.accounts[0].id },
      data: { password: hashedPassword },
    });
    console.log("✅ Password hash updated\n");
  } else {
    console.log("📝 Creating credential account...");
    await prisma.account.create({
      data: {
        id: createId(),
        userId: user.id,
        provider: "credential",
        providerAccountId: email,
        password: hashedPassword,
      },
    });
    console.log("✅ Credential account created\n");
  }

  // Ensure user has a space
  let space = user.spaces.length > 0 ? user.spaces[0] : null;
  if (!space) {
    console.log("📦 Creating default space...");
    space = await prisma.space.create({
      data: {
        id: createId(),
        name: "Personal",
        ownerId: user.id,
        tier: "hobby",
      },
    });
    
    await prisma.spaceMember.create({
      data: {
        id: createId(),
        spaceId: space.id,
        userId: user.id,
        role: "ADMIN",
      },
    });
    console.log(`✅ Created space: ${space.name}\n`);
  } else {
    console.log(`✅ User already has a space: ${space.name}\n`);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Demo user fixed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Credentials:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  return { user, space };
}

async function generateMockData(userId: string, spaceId: string) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Generating Mock Data for AI Suggestions");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Check if user already has finalized polls
  const existingPolls = await prisma.poll.count({
    where: {
      userId,
      status: "finalized",
    },
  });

  if (existingPolls >= 3) {
    console.log(`ℹ️  User already has ${existingPolls} finalized polls.`);
    console.log("   AI suggestions should already be available.\n");
    
    const shouldRegenerate = process.argv.includes("--force");
    if (!shouldRegenerate) {
      console.log("   Use --force flag to regenerate mock data anyway.\n");
      return;
    }
    console.log("   Regenerating mock data...\n");
  }

  // Create mock polls with finalized status
  const numberOfPolls = 8; // Enough for good AI suggestions
  const polls = [];

  console.log(`📊 Creating ${numberOfPolls} finalized polls with votes...\n`);

  for (let i = 0; i < numberOfPolls; i++) {
    const pollTitle = randomChoice(pollTitles);
    const pollDate = dayjs()
      .subtract(randomInt(1, 180), "days") // Polls from last 6 months
      .hour(randomInt(9, 17))
      .minute(0)
      .second(0);

    const duration = randomInt(30, 120); // 30-120 minutes
    const numberOfOptions = randomInt(3, 6); // 3-6 time options per poll
    const numberOfParticipants = randomInt(4, 8); // 4-8 participants per poll

    // Create poll options (time slots)
    const options = [];
    let currentTime = pollDate;
    for (let j = 0; j < numberOfOptions; j++) {
      options.push({
        id: createId(),
        startTime: currentTime.toDate(),
        duration,
        createdAt: currentTime.toDate(),
      });
      // Next option is 1-3 days later
      currentTime = currentTime.add(randomInt(1, 3), "days");
    }

    // Create poll
    const poll = await prisma.poll.create({
      data: {
        id: createId(),
        title: pollTitle,
        description: `Mock poll for testing AI suggestions - ${pollTitle.toLowerCase()}`,
        userId,
        spaceId,
        status: "finalized", // Important: finalized polls are used by AI
        timeZone: "America/New_York",
        adminUrlId: createId(),
        participantUrlId: createId(),
        createdAt: pollDate.toDate(),
        options: {
          create: options,
        },
      },
      include: {
        options: true,
      },
    });

    // Create participants
    const selectedMockUsers = mockUsers.slice(0, numberOfParticipants);
    const participants = [];

    for (const mockUser of selectedMockUsers) {
      const participant = await prisma.participant.create({
        data: {
          id: createId(),
          pollId: poll.id,
          name: mockUser.name,
          email: mockUser.email,
          timeZone: "America/New_York",
          createdAt: pollDate.toDate(),
        },
      });
      participants.push(participant);
    }

    // Create votes for each participant
    const votes = [];
    for (const participant of participants) {
      for (const option of poll.options) {
        // Most votes should be "yes" for finalized polls (70% yes, 20% ifNeedBe, 10% no)
        const rand = Math.random();
        let voteType: typeof voteTypes[number];
        if (rand < 0.7) {
          voteType = "yes";
        } else if (rand < 0.9) {
          voteType = "ifNeedBe";
        } else {
          voteType = "no";
        }

        votes.push({
          id: createId(),
          participantId: participant.id,
          optionId: option.id,
          pollId: poll.id,
          type: voteType,
          createdAt: pollDate.toDate(),
        });
      }
    }

    await prisma.vote.createMany({
      data: votes,
    });

    // Create scheduled event for finalized poll (using the first option as the finalized time)
    const finalizedOption = poll.options[0];
    const scheduledEventId = createId();
    const scheduledEvent = await prisma.scheduledEvent.create({
      data: {
        id: scheduledEventId,
        userId,
        spaceId,
        title: poll.title,
        description: poll.description,
        location: poll.location,
        start: finalizedOption.startTime,
        end: dayjs(finalizedOption.startTime)
          .add(finalizedOption.duration, "minutes")
          .toDate(),
        status: "confirmed",
        timeZone: poll.timeZone || "America/New_York",
        uid: `${createId()}-${Date.now()}@rallly.test`,
        createdAt: pollDate.toDate(),
      },
    });

    // Update poll with scheduled event
    await prisma.poll.update({
      where: { id: poll.id },
      data: { scheduledEventId: scheduledEvent.id },
    });

    polls.push({
      id: poll.id,
      title: poll.title,
      participants: participants.length,
      votes: votes.length,
      options: poll.options.length,
    });

    console.log(
      `  ✓ Created poll "${poll.title}" with ${participants.length} participants, ${votes.length} votes, ${poll.options.length} options`,
    );
  }

  console.log(`\n✅ Successfully created ${polls.length} finalized polls!`);
  console.log(`\n📈 Summary:`);
  console.log(`   - Total polls: ${polls.length}`);
  console.log(`   - Total participants: ${polls.reduce((sum, p) => sum + p.participants, 0)}`);
  console.log(`   - Total votes: ${polls.reduce((sum, p) => sum + p.votes, 0)}`);
  console.log(`   - All polls are finalized and have scheduled events`);
}

async function main() {
  try {
    // Step 1: Fix demo user password
    const { user, space } = await fixDemoUser();

    // Step 2: Generate mock data
    await generateMockData(user.id, space.id);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 All done! Demo user is ready to use.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✅ You can now:");
    console.log("   1. Login with demo@test.com / demo123456");
    console.log("   2. Create a new poll at /new");
    console.log("   3. Use AI Time Suggestions feature");
    console.log("\n🌐 Production URL: https://ralllynew.vercel.app\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

