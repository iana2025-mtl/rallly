import { prisma } from "../index";
import { authLib } from "../../../apps/web/src/lib/auth";

async function setPasswordViaReset() {
  const email = "iribnicova83@gmail.com";
  const newPassword = "admin123";
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    console.error("User not found!");
    return;
  }

  console.log("User found:", user.email);
  console.log("Attempting to set password using Better Auth API...");

  try {
    // Use Better Auth's forgot password to generate a token
    // Then we'll use the reset password API
    const result = await authLib.api.forgotPassword({
      body: {
        email: user.email,
      },
      headers: new Headers(),
    });

    console.log("Forgot password result:", result);
    
    // Actually, let's try a different approach - use Better Auth's internal password hashing
    // Better Auth uses Argon2 by default
    console.log("\n⚠️  Better Auth uses its own password hashing.");
    console.log("The easiest solution is to use Email OTP login instead.");
    console.log("\nAlternatively, you can:");
    console.log("1. Go to http://localhost:3000/forgot-password");
    console.log("2. Enter your email: " + email);
    console.log("3. Check Mailpit at http://localhost:8025 for the reset link");
    console.log("4. Use the reset link to set your password");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

setPasswordViaReset()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




