import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Connection pool settings for better reliability
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

let prisma: PrismaClient;

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    prisma = prismaClientSingleton();
  } else {
    // In development, use a global variable to preserve the connection across HMR
    if (!global.prisma) {
      global.prisma = prismaClientSingleton();
    }
    prisma = global.prisma;
  }
}

// Graceful shutdown handling
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
}

export { prisma };
