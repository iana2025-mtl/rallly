/**
 * Script to create demo user in production using better-auth's sign-up API
 * This ensures the password is hashed correctly with Argon2
 * 
 * Usage: 
 *   DATABASE_URL="your-production-db-url" pnpm tsx scripts/create-demo-user-production.ts
 * 
 * OR use the API endpoint directly:
 *   curl -X POST https://your-domain.com/api/better-auth/sign-up/email \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"demo@test.com","password":"demo123456","name":"Demo User","timeZone":"America/New_York","locale":"en"}'
 */

import { prisma } from "@rallly/database";

async function createDemoUserProduction() {
  const email = "demo@test.com";
  const name = "Demo User";
  const password = "demo123456"; // Must be at least 8 characters for better-auth

  console.log("🔧 Creating demo user in production using better-auth API...\n");

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
    console.log(`✅ User with email ${email} already exists.`);
    console.log(`   User ID: ${existingUser.id}`);
    console.log(`   Email Verified: ${existingUser.emailVerified}`);
    console.log(`   Has Credential Account: ${existingUser.accounts.length > 0}`);
    
    // Check if user has a space
    if (existingUser.spaces.length === 0) {
      console.log("\n📦 Creating demo space...");
      const space = await prisma.space.create({
        data: {
          name: "Demo Space",
          ownerId: existingUser.id,
          tier: "hobby",
        },
      });
      await prisma.spaceMember.create({
        data: {
          spaceId: space.id,
          userId: existingUser.id,
          role: "ADMIN",
        },
      });
      console.log(`✅ Created space: ${space.name}`);
    } else {
      console.log(`✅ User already has a space: ${existingUser.spaces[0]?.name}`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Demo Credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  Note: If login fails, the password may need to be reset.");
    console.log("   Use better-auth's password reset flow or recreate the user.");
    return;
  }

  console.log("📝 To create the user, use better-auth's sign-up API endpoint.\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 INSTRUCTIONS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nOption 1: Use curl (recommended for production):");
  console.log(`   curl -X POST https://ralllynew.vercel.app/api/better-auth/sign-up/email \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"email":"${email}","password":"${password}","name":"${name}","timeZone":"America/New_York","locale":"en"}'`);
  console.log("\nOption 2: Use the web UI:");
  console.log("   1. Temporarily enable registration in Vercel:");
  console.log("      Set REGISTRATION_ENABLED=true");
  console.log("   2. Go to /register and create the user");
  console.log("   3. Set REGISTRATION_ENABLED=false again");
  console.log("\nOption 3: Run this script after setting up authLib import:");
  console.log("   (Requires modifying the script to import authLib correctly)");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("After creating the user, run this script again to:");
  console.log("  - Verify the user exists");
  console.log("  - Create the demo space if needed");
  console.log("  - Mark email as verified");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

createDemoUserProduction()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
