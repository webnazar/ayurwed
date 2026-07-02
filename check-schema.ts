import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SHOW COLUMNS FROM users WHERE Field = 'role'`;
  console.log(result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
