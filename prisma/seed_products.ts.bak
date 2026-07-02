import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy products...');

  // Get categories (we assume they exist from a previous seed)
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error('No categories found. Please seed categories first.');
    return;
  }

  // Get manufacturers (seeded previously)
  const himalaya = await prisma.manufacturerProfile.findUnique({ where: { slug: 'himalaya-wellness' } });
  const patanjali = await prisma.manufacturerProfile.findUnique({ where: { slug: 'patanjali-ayurved' } });

  if (!himalaya || !patanjali) {
    console.error('Manufacturers not found. Run seed_users.ts first.');
    return;
  }

  // Get indications
  const indigestion = await prisma.indication.findUnique({ where: { slug: 'indigestion' } });
  const gas = await prisma.indication.findUnique({ where: { slug: 'gas' } });

  const products = [
    {
      name: 'Liv.52 Tablets',
      slug: 'liv-52-tablets',
      description: 'Unsurpassed hepatoprotective that restores the functional efficiency of the liver.',
      ingredients: ['Himsra', 'Kasani', 'Mandur Bhasma'],
      benefits: ['Protects liver against hepatotoxins', 'Promotes appetite and growth'],
      usage: '1-2 tablets twice daily or as directed by your physician.',
      mrp: 180.00,
      images: ['/placeholder-product.png'],
      categoryId: categories[0].id, // Just pick first available category
      manufacturerId: himalaya.id,
      isActive: true,
      isFeatured: true,
      isSponsored: false,
      indications: indigestion ? [indigestion.id] : [],
    },
    {
      name: 'Gasex Syrup',
      slug: 'gasex-syrup',
      description: 'For symptomatic control and relief of dyspepsia/indigestion.',
      ingredients: ['Prativisha', 'Cowrie Bhasma', 'Shankh Bhasma'],
      benefits: ['Relieves indigestion', 'Reduces gas and bloating'],
      usage: '2-3 teaspoonfuls after meals.',
      mrp: 140.00,
      images: ['/placeholder-product.png'],
      categoryId: categories[0].id,
      manufacturerId: himalaya.id,
      isActive: true,
      isFeatured: false,
      isSponsored: true,
      indications: gas ? [gas.id] : [],
    },
    {
      name: 'Divya Churna',
      slug: 'divya-churna',
      description: 'Effective for constipation and related digestive issues.',
      ingredients: ['Senna Leaves', 'Haritaki', 'Fennel'],
      benefits: ['Relieves constipation', 'Improves digestion'],
      usage: '1 teaspoon with warm water at bedtime.',
      mrp: 95.00,
      images: ['/placeholder-product.png'],
      categoryId: categories.length > 1 ? categories[1].id : categories[0].id,
      manufacturerId: patanjali.id,
      isActive: true,
      isFeatured: true,
      isSponsored: false,
      indications: gas && indigestion ? [gas.id, indigestion.id] : [],
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        ingredients: p.ingredients,
        benefits: p.benefits,
        usage: p.usage,
        mrp: p.mrp,
        images: p.images,
        categoryId: p.categoryId,
        manufacturerId: p.manufacturerId,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isSponsored: p.isSponsored,
        indications: p.indications.length > 0 ? {
          connect: p.indications.map(id => ({ id }))
        } : undefined,
      },
    });
  }

  console.log('Dummy products seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
