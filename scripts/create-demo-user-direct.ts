/**
 * Script to create demo user directly in production database
 * This script uses better-auth's password hashing to ensure compatibility
 * 
 * Usage:
 *   DATABASE_URL="your-production-db-url" pnpm tsx scripts/create-demo-user-direct.ts
 * 
 * OR set DATABASE_URL in your environment and run:
 *   pnpm tsx scripts/create-demo-user-direct.ts
 */

import { prisma } from "@rallly/database";
import { createId } from "@paralleldrive/cuid2";

// better-auth uses @noble/hash for Argon2 password hashing
// We'll use the same approach
import { argon2id } from "@noble/hash/argon2";

async function hashPassword(password: string): Promise<string> {
  // better-auth uses Argon2id with these parameters
  // This matches better-auth's default configuration
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await argon2id(password, salt, {
    t: 3, // time cost
    m: 65536, // memory cost (64 MB)
    p: 4, // parallelism
  });
  
  // Convert to base64 string format that better-auth expects
  // Format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
  const saltBase64 = Buffer.from(salt).toString("base64").replace(/\+/g, ".").replace(/\//g, "_").replace(/=/g, "");
  const hashBase64 = Buffer.from(hash).toString("base64").replace(/\+/g, ".").replace(/\//g, "_").replace(/=/g, "");
  
  return `$argon2id$v=19$m=65536,t=3,p=4$${saltBase64}$${hashBase64}`;
}

async function createDemoUserDirect() {
  const email = "demo@test.com";
  const name = "Demo User";
  const password = "demo123456";

  console.log("🔧 Creating demo user directly in database...\n");

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
      console.log("   Deleting the existing account to recreate it...\n");
      
      // Delete existing credential account
      await prisma.account.deleteMany({
        where: {
          userId: existingUser.id,
          provider: "credential",
        },
      });
    } else {
      console.log("\n📝 User exists but has no credential account. Creating one...\n");
    }
  }

  // Hash password using Argon2 (same as better-auth)
  console.log("🔐 Hashing password with Argon2...");
  const hashedPassword = await hashPassword(password);
  console.log("✅ Password hashed\n");

  // Create or update user
  const user = existingUser || await prisma.user.create({
    data: {
      id: createId(),
      email,
      name,
      emailVerified: true, // Skip verification in demo mode
      role: "user",
      timeZone: "America/New_York",
      locale: "en",
    },
  });

  // Update email verification if needed
  if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
  }

  // Create credential account with hashed password
  console.log("📝 Creating credential account...");
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "credential",
        providerAccountId: email,
      },
    },
    create: {
      id: createId(),
      userId: user.id,
      provider: "credential",
      providerAccountId: email,
      password: hashedPassword,
    },
    update: {
      password: hashedPassword, // Update password if account exists
    },
  });
  console.log("✅ Credential account created\n");

  // Ensure user has a space
  let space = await prisma.space.findFirst({
    where: { ownerId: user.id },
  });

  if (!space) {
    console.log("📦 Creating demo space...");
    space = await prisma.space.create({
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
    console.log(`✅ User already has a space: ${space.name}\n`);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Demo user created successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Credentials:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nYou can now login with these credentials.");
}

createDemoUserDirect()
  .catch((e) => {
    console.error("❌ Error creating user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

