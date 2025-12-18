/**
 * Script to check the demo user's status in the database
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDemoUser() {
  const email = "demo@test.com";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 Checking Demo User Status");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

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
    console.log("❌ User not found!");
    return;
  }

  console.log(`✅ User found: ${user.name} (${user.id})`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Email Verified: ${user.emailVerified ?? false}`);
  console.log(`   Created: ${user.createdAt}`);
  console.log(`   Updated: ${user.updatedAt}\n`);

  console.log(`📦 Spaces: ${user.spaces.length}`);
  user.spaces.forEach((space) => {
    console.log(`   - ${space.name} (${space.id})`);
  });
  console.log();

  console.log(`🔐 Credential Accounts: ${user.accounts.length}`);
  if (user.accounts.length > 0) {
    const account = user.accounts[0];
    console.log(`   Provider: ${account.provider}`);
    console.log(`   Provider Account ID: ${account.providerAccountId}`);
    console.log(`   Has Password: ${account.password ? "Yes" : "No"}`);
    if (account.password) {
      console.log(`   Password Hash (first 50 chars): ${account.password.substring(0, 50)}...`);
      console.log(`   Password Hash Format: ${account.password.startsWith("$argon2id$") ? "Argon2id ✅" : "Unknown format ⚠️"}`);
      console.log(`   Full Hash Length: ${account.password.length}`);
    }
    console.log(`   Created: ${account.createdAt}`);
    console.log(`   Updated: ${account.updatedAt}`);
  } else {
    console.log("   ⚠️  No credential account found!");
  }
}

checkDemoUser()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

