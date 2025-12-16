import { prisma } from "@rallly/database";
import { hash } from "bcryptjs";

async function createDemoUser() {
  const email = "demo@test.com";
  const name = "Demo User";
  const password = "demo123";
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
    },
  });

  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    console.log("Updating user and ensuring password is set...");
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Check if account exists
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: existingUser.id,
        provider: "credential",
        providerAccountId: email,
      },
    });

    if (existingAccount) {
      // Update password
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      // Create account with password
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          provider: "credential",
          providerAccountId: email,
          password: hashedPassword,
        },
      });
    }
    
    // Update user to ensure email is verified
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
      },
    });
    
    console.log(`✅ User updated successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Email Verified: ${updatedUser.emailVerified}`);
    
    // Ensure user has a space
    let space = await prisma.space.findFirst({
      where: { ownerId: updatedUser.id },
    });
    
    if (!space) {
      space = await prisma.space.create({
        data: {
          name: "Demo Space",
          ownerId: updatedUser.id,
          tier: "hobby",
        },
      });
      
      await prisma.spaceMember.create({
        data: {
          spaceId: space.id,
          userId: updatedUser.id,
          role: "ADMIN",
        },
      });
      
      console.log(`✅ Created space: ${space.name}`);
    }
    
    return;
  }

  // Hash password for Better Auth
  const hashedPassword = await hash(password, 10);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: true, // Skip verification in demo mode
      role: "user",
      timeZone: "America/New_York",
      locale: "en",
      spaces: {
        create: {
          name: "Demo Space",
          tier: "hobby",
        },
      },
    },
  });

  // Create account with password for Better Auth
  await prisma.account.create({
    data: {
      userId: user.id,
      provider: "credential",
      providerAccountId: email,
      password: hashedPassword,
    },
  });

  // Create space member
  const space = await prisma.space.findFirst({
    where: { ownerId: user.id },
  });

  if (space) {
    await prisma.spaceMember.create({
      data: {
        spaceId: space.id,
        userId: user.id,
        role: "ADMIN",
      },
    });
  }

  console.log("✅ Demo user created successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Credentials:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nYou can now login with these credentials.");
}

createDemoUser()
  .catch((e) => {
    console.error("Error creating demo user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
