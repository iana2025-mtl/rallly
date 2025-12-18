/**
 * Script to fix demo user password by completely deleting and recreating via better-auth API
 * This ensures the password is hashed in the exact format better-auth expects
 * 
 * Usage:
 *   DATABASE_URL="your-production-db-url" PRODUCTION_URL="https://ralllynew.vercel.app" pnpm --filter @rallly/database exec tsx scripts/fix-password-via-api.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixPasswordViaAPI() {
  const email = "demo@test.com";
  const password = "demo123456";
  const productionUrl = process.env.PRODUCTION_URL || "https://ralllynew.vercel.app";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 Fixing Password via Better-Auth API");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Find the user and all related data
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
      sessions: true,
      spaces: {
        include: {
          members: true,
        },
      },
    },
  });

  if (user) {
    console.log(`✅ Found user: ${user.name} (${user.id})`);
    console.log(`   Accounts: ${user.accounts.length}`);
    console.log(`   Sessions: ${user.sessions.length}`);
    console.log(`   Spaces: ${user.spaces.length}\n`);

    // Delete all related data first (in correct order to avoid foreign key constraints)
    console.log("🗑️  Deleting all related data...");
    
    // Delete space members
    for (const space of user.spaces) {
      await prisma.spaceMember.deleteMany({
        where: { spaceId: space.id },
      });
    }
    
    // Delete spaces
    await prisma.space.deleteMany({
      where: { ownerId: user.id },
    });
    
    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
    
    // Delete accounts
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });
    
    // Finally delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });
    
    console.log("✅ All user data deleted\n");
  } else {
    console.log(`ℹ️  User with email ${email} not found. Will create new user.\n`);
  }

  console.log("📡 Calling better-auth sign-up API to create user with correct password hash...\n");

  try {
    const response = await fetch(`${productionUrl}/api/better-auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name: "Demo User",
        timeZone: "America/New_York",
        locale: "en",
      }),
    });

    const result = await response.json();

    if (response.ok || result.user) {
      console.log("✅ User created successfully with correct password hash!");
      
      // Ensure email is verified for demo mode
      const newUser = await prisma.user.findUnique({ where: { email } });
      if (newUser && !newUser.emailVerified) {
        console.log("📧 Marking email as verified...");
        await prisma.user.update({
          where: { id: newUser.id },
          data: { emailVerified: true },
        });
        console.log("✅ Email verified\n");
      }
      
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Demo Credentials:");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n✅ You can now login with these credentials!");
    } else {
      console.log("❌ Failed to create user via API");
      console.log("Response:", JSON.stringify(result, null, 2));
      console.log("\n📝 You may need to manually sign up at:");
      console.log(`   ${productionUrl}/register`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error calling API:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
    console.log("\n📝 Manual steps:");
    console.log(`   1. Go to ${productionUrl}/register`);
    console.log(`   2. Sign up with email: ${email}`);
    console.log(`   3. Password: ${password}`);
    process.exit(1);
  }
}

fixPasswordViaAPI()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

