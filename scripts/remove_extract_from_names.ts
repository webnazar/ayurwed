import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const preparations = await prisma.preparation.findMany();
  let updatedCount = 0;

  for (const prep of preparations) {
    let newName = prep.name.trim();
    
    // Check if name ends with "Extract" or "extract", etc.
    // Case-insensitive replace of the word "Extract" anywhere in the string
    const regex = /\bExtract\b/ig;
    
    if (regex.test(newName)) {
      newName = newName.replace(regex, '').replace(/\s+/g, ' ').trim();
      
      await prisma.preparation.update({
        where: { id: prep.id },
        data: { name: newName },
      });
      
      console.log(`Updated: "${prep.name}" -> "${newName}"`);
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} preparations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
