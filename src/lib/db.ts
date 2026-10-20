import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma_v19: PrismaClient | undefined;
};

const getDbInstance = (): PrismaClient => {
  if (!globalForPrisma.prisma_v19) {
    globalForPrisma.prisma_v19 = new PrismaClient();
  }
  return globalForPrisma.prisma_v19;
};

export const db = getDbInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v19 = db;


