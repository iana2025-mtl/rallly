import { prisma } from "@rallly/database";
import { hash } from "bcryptjs";

async function createAdminUser() {
  const email = "iribnicova83@gmail.com";
  const name = "Admin User";
  const password = "admin123"; // You can change this password
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    console.log("Updating user to admin and verifying email...");
    
    // Update existing user to admin and verify email
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        role: "admin",
      },
    });
    
    console.log(`✅ User updated successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${updatedUser.role}`);
    console.log(`Email Verified: ${updatedUser.emailVerified}`);
    
    // Check if they have a space
    const space = await prisma.space.findFirst({
      where: { ownerId: updatedUser.id },
    });
    
    if (!space) {
      // Create a space for the user
      const newSpace = await prisma.space.create({
        data: {
          name: "Personal",
          ownerId: updatedUser.id,
          tier: "pro",
        },
      });
      
      await prisma.spaceMember.create({
        data: {
          spaceId: newSpace.id,
          userId: updatedUser.id,
          role: "ADMIN",
        },
      });
      
      console.log(`✅ Created space: ${newSpace.name}`);
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
      emailVerified: true,
      role: "admin",
      timeZone: "America/New_York",
      spaces: {
        create: {
          name: "Personal",
          tier: "pro",
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

  console.log("✅ Admin user created successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Credentials:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: admin`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nYou can now login at http://localhost:3000/login");
  console.log("Use email/password login with the credentials above.");
}

createAdminUser()
  .catch((e) => {
    console.error("Error creating admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




