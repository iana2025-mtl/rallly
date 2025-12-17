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

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
