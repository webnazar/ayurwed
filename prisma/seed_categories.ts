import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Classical Formulations', description: 'Traditional Ayurvedic formulations prepared strictly according to ancient texts.', icon: '📜' },
    { name: 'Proprietary Medicines', description: 'Modern formulations and blends created by Ayurvedic manufacturers.', icon: '🧪' },
    { name: 'Herbal Supplements', description: 'Single herb or herbal extract supplements for daily wellness.', icon: '🌿' },
    { name: 'Personal Care', description: 'Ayurvedic skin care, hair care, and body care products.', icon: '🧴' },
    { name: 'Dietary Foods', description: 'Nutritious Ayurvedic foods, teas, and healthy alternatives.', icon: '🍵' },
    { name: 'Panchakarma Supplies', description: 'Oils and tools used for Panchakarma therapies.', icon: '💆' }
  ];

  console.log('Seeding categories...');

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: cat.name,
        slug,
        description: cat.description,
      },
    });
    console.log(`Created category: ${cat.name}`);
  }

  console.log('Categories seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
