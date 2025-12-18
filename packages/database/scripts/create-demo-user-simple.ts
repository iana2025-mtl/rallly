/**
 * Simple script to create demo user in production database
 * This script uses Prisma directly and creates the user with a placeholder password
 * that will need to be set via better-auth's password reset flow
 * 
 * Usage:
 *   DATABASE_URL="your-production-db-url" pnpm tsx packages/database/scripts/create-demo-user-simple.ts
 */

import { prisma } from "../index";
import { createId } from "@paralleldrive/cuid2";

async function createDemoUserSimple() {
  const email = "demo@test.com";
  const name = "Demo User";

  console.log("🔧 Creating demo user in production database...\n");

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: { provider: "credential" },
      },
      spaces: true,
    },
  });

  if (existingUser) {
    console.log(`⚠️  User with email ${email} already exists.`);
    console.log(`   User ID: ${existingUser.id}`);
    console.log(`   Email Verified: ${existingUser.emailVerified}`);
    console.log(`   Has Credential Account: ${existingUser.accounts.length > 0}`);
    
    if (existingUser.accounts.length > 0) {
      console.log("\n💡 The user exists but login is failing.");
      console.log("   This is likely due to password hash mismatch.");
      console.log("\n📋 Solution: Use the password reset flow:");
      console.log("   1. Go to: https://ralllynew.vercel.app/forgot-password");
      console.log("   2. Enter: demo@test.com");
      console.log("   3. Check your email for the reset link");
      console.log("   4. Set password to: demo123456");
      return;
    }
  }

  // Create user
  const user = existingUser || await prisma.user.create({
    data: {
      id: createId(),
      email,
      name,
      emailVerified: true,
      role: "user",
      timeZone: "America/New_York",
      locale: "en",
    },
  });

  // Update email verification if needed
  if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
  }

  // Ensure user has a space
  let space = await prisma.space.findFirst({
    where: { ownerId: user.id },
  });

  if (!space) {
    console.log("📦 Creating demo space...");
    space = await prisma.space.create({
      data: {
        id: createId(),
        name: "Demo Space",
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
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ User created/verified!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  IMPORTANT: Password needs to be set via reset flow");
  console.log("\n📋 Next steps:");
  console.log("   1. Go to: https://ralllynew.vercel.app/forgot-password");
  console.log("   2. Enter: demo@test.com");
  console.log("   3. Check your email for the reset link");
  console.log("   4. Set password to: demo123456");
  console.log("\n   OR use the API endpoint (if REGISTRATION_ENABLED=true):");
  console.log("   curl -X POST https://ralllynew.vercel.app/api/better-auth/sign-up/email \\");
  console.log("     -H \"Content-Type: application/json\" \\");
  console.log("     -d '{\"email\":\"demo@test.com\",\"password\":\"demo123456\",\"name\":\"Demo User\",\"timeZone\":\"America/New_York\",\"locale\":\"en\"}'");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

createDemoUserSimple()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

