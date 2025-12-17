import { PrismaClient } from "@prisma/client";

export type * from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

// biome-ignore lint/suspicious/noShadowRestrictedNames: Fix this later
declare const globalThis: {
  prismaGlobal: ExtendedPrismaClient;
} & typeof global;

// Lazy initialization: Prisma Client is only created when first accessed
function getPrisma(): ExtendedPrismaClient {
  if (globalThis.prismaGlobal) {
    return globalThis.prismaGlobal;
  }
  
  const client = prismaClientSingleton();
  
  // Cache in globalThis for reuse (especially important in serverless environments)
  // Always cache in production for serverless functions to ensure singleton behavior
  globalThis.prismaGlobal = client;
  
  return client;
}

// Export the actual Prisma Client instance (lazy via getPrisma)
// This ensures better-auth can access prisma.user directly without Proxy issues
export const prisma = getPrisma();
