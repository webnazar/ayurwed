import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCT_CATEGORIES = [
  'Syrup & Liquid',
  'Powder',
  'Capsule',
  'Tablet',
  'Oil',
  'Ghee',
  'Cream & Ointment',
  'Gel',
  'Drops',
  'Juice',
  'Herbal Tea',
  'Soap & Wash',
  'Spray',
  'Patch',
  'Granules',
  'Lotion',
  'Other',
];

const manufacturersData = [
  { companyName: 'Himalaya Wellness', slug: 'himalaya-wellness', description: 'Trusted brand since 1930.', isVerified: true },
  { companyName: 'Patanjali Ayurved', slug: 'patanjali-ayurved', description: 'Pioneers of modern Ayurvedic products.', isVerified: true },
  { companyName: 'Dabur India', slug: 'dabur-india', description: 'One of the oldest and largest Ayurvedic medicine brands.', isVerified: true },
  { companyName: 'Baidyanath', slug: 'baidyanath', description: 'Great quality classical Ayurvedic preparations.', isVerified: true },
];

async function main() {
  console.log('Seeding manufacturers...');
  const mfrs: any[] = [];
  for (const m of manufacturersData) {
    const created = await prisma.manufacturer.upsert({
      where: { slug: m.slug },
      update: { isVerified: true },
      create: m,
    });
    mfrs.push(created);
  }

  console.log('Seeding products in each category...');
  
  const sampleProducts = PRODUCT_CATEGORIES.flatMap((category, index) => {
    const mfrId = mfrs[index % mfrs.length].id;
    const cleanCat = category.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    // Generate a premium (featured + discounted) and a classical (standard price) item for each category
    return [
      {
        name: `Premium ${category} Formula`,
        slug: `premium-${cleanCat}-formula`,
        description: `This is a high quality Ayurvedic preparation in the form of ${category}, prepared using traditional guidelines and modern quality controls.`,
        shortDesc: `High quality Ayurvedic ${category.toLowerCase()} preparation.`,
        category: category,
        manufacturerId: mfrId,
        sku: `SKU-${cleanCat}-01`,
        mrp: 290.00,
        sellingPrice: 240.00,
        stock: 50,
        unit: index % 2 === 0 ? '100ml' : '60 Tabs',
        images: '[]',
        tags: `ayurvedic, ${cleanCat}, formula`,
        isActive: true,
        isFeatured: index % 3 === 0,
      },
      {
        name: `Classical ${category} Blend`,
        slug: `classical-${cleanCat}-blend`,
        description: `Traditional scriptural Ayurvedic preparation in the form of ${category}, highly effective and completely natural.`,
        shortDesc: `Pure classical ${category.toLowerCase()} blend.`,
        category: category,
        manufacturerId: mfrId,
        sku: `SKU-${cleanCat}-02`,
        mrp: 180.00,
        sellingPrice: 180.00,
        stock: 15,
        unit: index % 2 === 0 ? '50g' : '1 Bottle',
        images: '[]',
        tags: `classical, natural, ${cleanCat}`,
        isActive: true,
        isFeatured: false,
      }
    ];
  });

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        shortDesc: p.shortDesc,
        category: p.category,
        manufacturerId: p.manufacturerId,
        sku: p.sku,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        unit: p.unit,
        images: p.images,
        tags: p.tags,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
      },
      create: p,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
