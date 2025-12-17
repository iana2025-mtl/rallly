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
  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = client;
  }
  
  return client;
}

// Export a getter that lazily initializes Prisma Client
export const prisma = new Proxy({} as ExtendedPrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop as keyof ExtendedPrismaClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
