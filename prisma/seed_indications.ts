import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const indicationsData = [
  { name: 'Indigestion', slug: 'indigestion', description: 'Difficulty in digesting food, typically accompanied by discomfort in the upper abdomen.' },
  { name: 'Hyperacidity', slug: 'hyperacidity', description: 'Excessive acidity in the stomach causing heartburn.' },
  { name: 'Gas', slug: 'gas', description: 'Excess intestinal gas causing burping or flatulence.' },
  { name: 'Bloating', slug: 'bloating', description: 'A swollen and tight feeling in the abdomen due to trapped gas.' },
  { name: 'Constipation', slug: 'constipation', description: 'Infrequent or difficult bowel movements.' },
];

async function main() {
  console.log('Seeding indications...');

  for (const ind of indicationsData) {
    await prisma.indication.upsert({
      where: { slug: ind.slug },
      update: {},
      create: {
        name: ind.name,
        slug: ind.slug,
        description: ind.description,
      },
    });
  }

  console.log('Indications seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
