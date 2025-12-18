/**
 * Script to verify demo user and generate mock data for AI suggestions
 * 
 * IMPORTANT: This script does NOT modify the password hash!
 * The password hash must be set correctly using fix-password-via-api.ts first.
 * 
 * This script:
 * 1. Verifies demo@test.com user exists and has credential account
 * 2. Ensures email is verified
 * 3. Creates a default space if missing
 * 4. Generates mock historical polls for AI time suggestions
 * 
 * Usage: 
 *   DATABASE_URL="your-production-db-url" pnpm tsx packages/database/scripts/fix-demo-user-and-generate-mock-data.ts
 * 
 * Prerequisites:
 *   Run fix-password-via-api.ts first to create user with correct password hash
 */

import { prisma } from "@rallly/database";
import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";

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

async function fixDemoUser() {
  const email = "demo@test.com";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 Verifying Demo User (NOT changing password)");
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
    console.log("   Please run fix-password-via-api.ts first to create the user.");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (${user.id})`);
  console.log(`   Email Verified: ${user.emailVerified ?? false}`);
  console.log(`   Has Credential Account: ${user.accounts.length > 0}`);

  // Update email verification if needed
  if (!user.emailVerified) {
    console.log("📧 Marking email as verified...");
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    console.log("✅ Email verified\n");
  }

  // DON'T TOUCH THE PASSWORD HASH - it was set correctly by fix-password-via-api.ts
  if (user.accounts.length === 0) {
    console.log("⚠️  WARNING: User has no credential account!");
    console.log("   Please run fix-password-via-api.ts first to create the account with correct password hash.");
    console.log("   Skipping password setup to avoid breaking login.\n");
  } else {
    console.log("✅ Credential account exists - NOT modifying password hash (preserving correct format)\n");
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
  console.log("✅ Demo user verified (password NOT changed)!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Credentials:");
  console.log(`Email: ${email}`);
  console.log(`Password: demo123456`);
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
      // Still return - user has enough data
      return;
    }
    console.log("   Regenerating mock data (deleting old polls)...\n");
    
    // Delete old finalized polls if forcing regeneration
    await prisma.vote.deleteMany({
      where: {
        poll: {
          userId,
          status: "finalized",
        },
      },
    });
    await prisma.participant.deleteMany({
      where: {
        poll: {
          userId,
          status: "finalized",
        },
      },
    });
    await prisma.option.deleteMany({
      where: {
        poll: {
          userId,
          status: "finalized",
        },
      },
    });
    await prisma.poll.deleteMany({
      where: {
        userId,
        status: "finalized",
      },
    });
    console.log("   ✅ Old polls deleted\n");
  } else if (existingPolls > 0) {
    console.log(`⚠️  User has ${existingPolls} finalized polls (need at least 3).`);
    console.log("   Generating additional polls...\n");
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
    // Step 1: Verify demo user (don't touch password hash)
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

