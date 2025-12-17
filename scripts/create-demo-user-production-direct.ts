/**
 * Script to create demo user directly in production database
 * Uses better-auth's internal password hashing to ensure compatibility
 * 
 * Usage:
 *   1. Get your production DATABASE_URL from Vercel
 *   2. Run: DATABASE_URL="your-production-db-url" pnpm tsx scripts/create-demo-user-production-direct.ts
 * 
 * OR set DATABASE_URL in your environment and run:
 *   pnpm tsx scripts/create-demo-user-production-direct.ts
 */

import { prisma } from "@rallly/database";
import { createId } from "@paralleldrive/cuid2";
import { authLib } from "../apps/web/src/lib/auth";

async function createDemoUserProductionDirect() {
  const email = "demo@test.com";
  const name = "Demo User";
  const password = "demo123456";

  console.log("🔧 Creating demo user in production database...\n");
  console.log("⚠️  This script uses better-auth's sign-up API internally");
  console.log("   to ensure the password is hashed correctly.\n");

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
      console.log("   This might be due to password hash mismatch.");
      console.log("   We'll delete and recreate the account...\n");
      
      // Delete existing credential account
      await prisma.account.deleteMany({
        where: {
          userId: existingUser.id,
          provider: "credential",
        },
      });
    }
  }

  try {
    // Use better-auth's sign-up API to create the user
    // This ensures the password is hashed correctly with Argon2
    console.log("📝 Creating user via better-auth sign-up API...");
    const result = await authLib.api.signUp.email({
      body: {
        email,
        password,
        name,
        timeZone: "America/New_York",
        locale: "en",
      },
      headers: new Headers(),
    });

    if (result.error) {
      if (result.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        console.log("⚠️  User already exists. Updating password...");
        
        // User exists, but we need to update the password
        // Use better-auth's password reset flow or update directly
        // For now, let's try to delete the account and recreate it
        const user = await prisma.user.findUnique({
          where: { email },
        });
        
        if (user) {
          await prisma.account.deleteMany({
            where: {
              userId: user.id,
              provider: "credential",
            },
          });
          
          // Try sign-up again
          const retryResult = await authLib.api.signUp.email({
            body: {
              email,
              password,
              name,
              timeZone: "America/New_York",
              locale: "en",
            },
            headers: new Headers(),
          });
          
          if (retryResult.error) {
            throw new Error(`Failed to recreate user: ${retryResult.error.message}`);
          }
          
          console.log("✅ User password updated successfully!");
        }
      } else {
        throw new Error(`Failed to create user: ${result.error.message}`);
      }
    } else if (result.data?.user) {
      console.log(`✅ User created successfully!`);
      console.log(`   User ID: ${result.data.user.id}`);
    } else {
      throw new Error("User creation succeeded but no user data returned");
    }

    // Get the user to ensure it exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        spaces: true,
      },
    });

    if (!user) {
      throw new Error("User was not created in database");
    }

    // Mark email as verified (demo mode)
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      console.log("✅ Email marked as verified\n");
    }

    // Ensure user has a space
    if (user.spaces.length === 0) {
      console.log("📦 Creating demo space...");
      const space = await prisma.space.create({
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
    } else {
      console.log(`✅ User already has a space: ${user.spaces[0]?.name}\n`);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Demo user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Demo Credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\nYou can now login with these credentials.");
  } catch (error) {
    console.error("❌ Error creating user:", error);
    console.log("\n💡 Alternative: Use the web UI to register:");
    console.log("   1. Go to https://ralllynew.vercel.app/register");
    console.log("   2. Create the user with:");
    console.log(`      Email: ${email}`);
    console.log(`      Password: ${password}`);
    console.log(`      Name: ${name}`);
    throw error;
  }
}

createDemoUserProductionDirect()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

