import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();

async function main() {
  try {
    const preparations = await db.preparation.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        ingredients: true,
        benefits: true,
        indications: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const indications = await db.indication.findMany({
      select: {
        id: true,
        name: true
      }
    });

    const output = {
      preparations,
      indications
    };

    fs.writeFileSync(
      path.join(__dirname, 'db_dump.json'),
      JSON.stringify(output, null, 2)
    );
    console.log(`Successfully dumped ${preparations.length} preparations and ${indications.length} indications to db_dump.json`);
  } catch (e) {
    console.error("Error dumping DB:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
