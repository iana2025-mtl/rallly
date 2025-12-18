/**
 * Script to completely fix the demo user - verify email and ensure correct account setup
 */

import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function fixDemoUserComplete() {
  const email = "demo@test.com";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 Complete Demo User Fix");
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

  console.log(`✅ Found user: ${user.name} (${user.id})\n`);

  // Fix 1: Verify email
  if (!user.emailVerified) {
    console.log("📧 Marking email as verified...");
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    console.log("✅ Email verified\n");
  } else {
    console.log("✅ Email already verified\n");
  }

  // Fix 2: Delete incorrect credential account
  if (user.accounts.length > 0) {
    console.log("🗑️  Deleting incorrect credential account...");
    for (const account of user.accounts) {
      await prisma.account.delete({
        where: { id: account.id },
      });
    }
    console.log("✅ Credential account(s) deleted\n");
  }

  // Fix 3: Delete user so better-auth can recreate it properly
  console.log("🗑️  Deleting user to allow proper recreation...");
  await prisma.user.delete({
    where: { id: user.id },
  });
  console.log("✅ User deleted\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Next Step:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nNow go to your production site and sign up:");
  console.log("1. Visit: https://ralllynew.vercel.app/register");
  console.log("2. Sign up with:");
  console.log(`   Email: ${email}`);
  console.log("   Password: demo123456");
  console.log("   Name: Demo User");
  console.log("\nThis will create the user with the correct password hash format.\n");
}

fixDemoUserComplete()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

