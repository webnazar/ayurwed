import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows: any[] = await prisma.$queryRaw`SELECT id, CAST(role AS CHAR) as role FROM users`;
  console.log("Found rows:", rows);

  let updated = 0;
  for (const row of rows) {
    if (row.role === 'MANUFACTURER') {
       await prisma.$executeRawUnsafe(`UPDATE users SET role = 'CONSUMER' WHERE id = ${row.id}`);
       updated++;
       console.log(`Updated user ${row.id}`);
    }
  }
  console.log(`Total updated: ${updated}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
