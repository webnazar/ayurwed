import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  try {
    const preps = await db.preparation.findMany({
      include: {
        indications: true
      }
    });
    const unmapped = preps.filter(p => p.indications.length === 0);
    console.log('Total preparations:', preps.length);
    console.log('Unmapped preparations:', unmapped.length);
    if (unmapped.length > 0) {
      console.log('Unmapped preparations list:');
      console.log(unmapped.map(p => `- ${p.name}`).join('\n'));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await db.$disconnect();
  }
}

main();
