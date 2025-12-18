/**
 * Script to fix demo user password using better-auth's password reset API
 * This ensures the password is hashed in the exact format better-auth expects
 * 
 * Usage:
 *   PRODUCTION_URL="https://ralllynew.vercel.app" pnpm exec tsx packages/database/scripts/fix-password-via-api.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixPasswordViaReset() {
  const email = "demo@test.com";
  const productionUrl = process.env.PRODUCTION_URL || "https://ralllynew.vercel.app";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 Fixing Password via Better-Auth API");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: { provider: "credential" },
      },
    },
  });

  if (!user) {
    console.error(`❌ User with email ${email} not found!`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (${user.id})`);

  // Delete existing credential account if it exists
  if (user.accounts.length > 0) {
    console.log("🗑️  Deleting existing credential account...");
    await prisma.account.delete({
      where: { id: user.accounts[0].id },
    });
    console.log("✅ Credential account deleted\n");
  } else {
    console.log("ℹ️  No existing credential account found.\n");
  }

  // Also delete any sessions to force re-authentication
  console.log("🗑️  Deleting existing sessions...");
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });
  console.log("✅ Sessions deleted\n");

  // Ensure email is verified
  if (!user.emailVerified) {
    console.log("📧 Marking email as verified...");
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    console.log("✅ Email verified\n");
  }

  console.log("📡 Calling better-auth sign-up API to recreate account with correct password hash...\n");

  try {
    const response = await fetch(`${productionUrl}/api/better-auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: "demo123456",
        name: user.name,
      }),
    });

    const result = await response.json();

    if (response.ok || result.user) {
      console.log("✅ Account recreated successfully with correct password hash!");
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Demo Credentials:");
      console.log(`Email: ${email}`);
      console.log("Password: demo123456");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n✅ You can now login with these credentials!");
    } else if (result.code === "USER_ALREADY_EXISTS" || result.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || result.error?.code === "USER_ALREADY_EXISTS" || result.error?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
      console.log("⚠️  User already exists in better-auth.");
      console.log("   Deleting user to recreate with correct password...\n");
      
      // Delete the user entirely so we can recreate
      await prisma.user.delete({
        where: { id: user.id },
      });
      
      console.log("✅ User deleted. Now recreating...\n");
      
      // Try again
      const retryResponse = await fetch(`${productionUrl}/api/better-auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: "demo123456",
          name: "Demo User",
        }),
      });

      const retryResult = await retryResponse.json();
      
      if (retryResponse.ok || retryResult.user) {
        console.log("✅ User recreated successfully with correct password hash!");
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Demo Credentials:");
        console.log(`Email: ${email}`);
        console.log("Password: demo123456");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n✅ You can now login with these credentials!");
      } else {
        console.log("❌ Failed to recreate user:", JSON.stringify(retryResult, null, 2));
      }
    } else {
      console.log("⚠️  API Response:", JSON.stringify(result, null, 2));
      console.log("\n📝 You may need to manually sign up again at:");
      console.log(`   ${productionUrl}/register`);
    }
  } catch (error) {
    console.error("❌ Error calling API:", error);
    console.log("\n📝 Manual steps:");
    console.log(`   1. Go to ${productionUrl}/register`);
    console.log(`   2. Sign up with email: ${email}`);
    console.log(`   3. Password: demo123456`);
  }
}

fixPasswordViaReset()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

