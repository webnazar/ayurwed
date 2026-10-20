import { db } from '../src/lib/db';

const CATEGORY_DEFINITIONS = [
  { name: 'Capsules', slug: 'capsule', icon: '💊', desc: 'Concentrated daily herbal extracts', sort: 1 },
  { name: 'Tablets & Vati', slug: 'tablet', icon: '🌿', desc: 'Classical compressed herbs & rasayanas', sort: 2 },
  { name: 'Syrup & Liquid', slug: 'syrup-liquid', icon: '🍯', desc: 'Fast-acting fermented Asavas & Arishtas', sort: 3 },
  { name: 'Powders (Churna)', slug: 'powder', icon: '🍃', desc: 'Pure micronized single & multi-herbs', sort: 4 },
  { name: 'Ayurvedic Oils', slug: 'oil', icon: '🪔', desc: 'Traditional medicated massage & hair oils', sort: 5 },
  { name: 'Herbal Ghee', slug: 'ghee', icon: '🧈', desc: 'Nourishing medicated Ghritas & rasayanas', sort: 6 },
  { name: 'Avaleha & Lehya', slug: 'avaleha-lehya', icon: '🍯', desc: 'Nutritive herbal jams, Chyawanprash, and rasayana confections', sort: 7 },
  { name: 'Juice', slug: 'juice', icon: '🧃', desc: 'Fresh therapeutic herbal juices and swaras', sort: 8 },
  { name: 'Herbal Tea', slug: 'herbal-tea', icon: '🍵', desc: 'Therapeutic herbal infusions and kwath teas', sort: 9 },
  { name: 'Cream & Ointment', slug: 'cream-ointment', icon: '🧴', desc: 'Topical soothing balms and herbal ointments', sort: 10 },
  { name: 'Drops', slug: 'drops', icon: '💧', desc: 'Nasyam and therapeutic ear/eye drops', sort: 11 },
  { name: 'Granules', slug: 'granules', icon: '🌾', desc: 'Flavored granular herbal rasayanas', sort: 12 },
  { name: 'Soap & Wash', slug: 'soap-wash', icon: '🧼', desc: 'Pure Ayurvedic bath & cleansing formulations', sort: 13 },
  { name: 'Gel', slug: 'gel', icon: '✨', desc: 'Cooling herbal and aloe vera gels', sort: 14 },
  { name: 'Spray', slug: 'spray', icon: '💨', desc: 'Instant pain and throat relief sprays', sort: 15 },
  { name: 'Patch', slug: 'patch', icon: '🩹', desc: 'Transdermal Ayurvedic herbal patches', sort: 16 },
  { name: 'Lotion', slug: 'lotion', icon: '🧴', desc: 'Nourishing medicated body lotions', sort: 17 },
  { name: 'Other Formulations', slug: 'other', icon: '📦', desc: 'General classical Ayurvedic preparations', sort: 99 },
];

async function seedCategories() {
  console.log('Seeding default categories into database...');

  for (const item of CATEGORY_DEFINITIONS) {
    const existing = await db.category.findFirst({
      where: {
        OR: [
          { name: item.name },
          { slug: item.slug },
        ]
      }
    });

    if (existing) {
      await db.category.update({
        where: { id: existing.id },
        data: {
          icon: item.icon,
          description: item.desc,
          sortOrder: item.sort,
          isActive: true,
        }
      });
      console.log(`Updated category: ${item.name}`);
    } else {
      await db.category.create({
        data: {
          name: item.name,
          slug: item.slug,
          icon: item.icon,
          description: item.desc,
          sortOrder: item.sort,
          isActive: true,
        }
      });
      console.log(`Created category: ${item.name}`);
    }
  }

  // Link existing products to category records
  const allCategories = await db.category.findMany();
  const products = await db.product.findMany();

  for (const prod of products) {
    if (prod.category) {
      const match = allCategories.find(c =>
        c.name.toLowerCase() === prod.category!.toLowerCase() ||
        c.slug.toLowerCase() === prod.category!.toLowerCase() ||
        prod.category!.toLowerCase().includes(c.slug.toLowerCase()) ||
        c.name.toLowerCase().includes(prod.category!.toLowerCase())
      );
      if (match && prod.categoryId !== match.id) {
        await db.product.update({
          where: { id: prod.id },
          data: { categoryId: match.id }
        });
        console.log(`Linked product "${prod.name}" (${prod.category}) -> Category "${match.name}"`);
      }
    }
  }

  console.log('Category seeding complete!');
}

seedCategories()
  .catch((err) => {
    console.error('Error seeding categories:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
