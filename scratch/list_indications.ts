import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  try {
    const indications = await db.indication.findMany({
      select: {
        name: true
      }
    });
    console.log(`Total indications: ${indications.length}`);
    console.log("Indications list (first 100):");
    console.log(indications.map(i => i.name).slice(0, 100).join(', '));
  } catch (e) {
    console.error(e);
  } finally {
    await db.$disconnect();
  }
}

main();
