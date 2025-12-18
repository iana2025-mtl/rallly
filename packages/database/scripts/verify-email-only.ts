/**
 * Script to verify the demo user's email
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyEmail() {
  const email = "demo@test.com";

  console.log("📧 Verifying email for demo user...\n");

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found!`);
    process.exit(1);
  }

  if (user.emailVerified) {
    console.log("✅ Email already verified!");
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    console.log("✅ Email verified!");
  }
}

verifyEmail()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

