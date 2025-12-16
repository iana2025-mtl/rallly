/**
 * Script to generate mock users, polls, and votes for testing AI Time Suggestions feature
 * 
 * Usage: pnpm tsx packages/database/scripts/generate-mock-data-for-ai.ts <user-email>
 */

import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";

const prisma = new PrismaClient();

// Mock user data
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

async function generateMockData(userEmail: string) {
  console.log(`\n🎯 Generating mock data for user: ${userEmail}\n`);

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`❌ User with email ${userEmail} not found!`);
    console.log("\n💡 Tip: Make sure you're logged in and using your actual email address.");
    process.exit(1);
  }

  // Find user's spaces
  const userSpaces = await prisma.space.findMany({
    where: {
      ownerId: user.id,
    },
    take: 1,
  });

  // Get or create a space
  let space = userSpaces.length > 0 ? userSpaces[0] : null;
  if (!space) {
    console.log("📦 Creating a space for the user...");
    space = await prisma.space.create({
      data: {
        id: createId(),
        name: `${user.name}'s Space`,
        ownerId: user.id,
        tier: "hobby",
      },
    });
  }

  console.log(`✅ Using space: ${space.name} (${space.id})\n`);

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
        userId: user.id,
        spaceId: space.id,
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
        userId: user.id,
        spaceId: space.id,
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
  console.log(`\n🎉 You can now test the AI Time Suggestions feature!`);
  console.log(`   Go to: http://localhost:3000/new`);
  console.log(`   Enable time slots and look for the "AI Time Suggestions" panel.\n`);
}

// Get user email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.error("❌ Please provide your user email as an argument");
  console.log("\nUsage: pnpm tsx packages/database/scripts/generate-mock-data-for-ai.ts <your-email>");
  console.log("\nExample: pnpm tsx packages/database/scripts/generate-mock-data-for-ai.ts iribnicova83@gmail.com");
  process.exit(1);
}

generateMockData(userEmail)
  .catch((error) => {
    console.error("❌ Error generating mock data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

