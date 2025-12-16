import { prisma } from "../index";

async function fixAdminLogin() {
  const email = "iribnicova83@gmail.com";
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    console.error("User not found!");
    return;
  }

  console.log("✅ User found:", user.email);
  
  // Remove the password account (Better Auth will handle password hashing differently)
  const passwordAccount = user.accounts.find(
    (acc) => acc.provider === "credential"
  );

  if (passwordAccount) {
    await prisma.account.delete({
      where: { id: passwordAccount.id },
    });
    console.log("✅ Removed password account (will use email OTP instead)");
  }

  // Ensure user is admin and verified
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      role: "admin",
    },
  });

  console.log("✅ User is admin and email is verified");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("How to Login:");
  console.log("1. Go to http://localhost:3000/login");
  console.log("2. Enter your email: " + email);
  console.log("3. Click Continue (don't enter a password)");
  console.log("4. Check Mailpit at http://localhost:8025 for the OTP code");
  console.log("5. Enter the 6-digit code to login");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n💡 Tip: Mailpit shows all emails sent by the app.");
  console.log("   Open it in another tab to see your OTP code instantly!");
}

fixAdminLogin()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


