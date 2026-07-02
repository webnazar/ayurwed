import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const herbs = [
  "Ashwagandha", "Brahmi", "Tulsi", "Triphala", "Amalaki", "Haritaki", "Vibhitaki", "Guduchi", 
  "Shatavari", "Guggulu", "Turmeric", "Ginger", "Licorice", "Neem", "Gotu Kola", "Arjuna",
  "Shilajit", "Aloe Vera", "Cumin", "Coriander", "Fennel", "Cardamom", "Cinnamon", "Clove",
  "Pippali", "Kalmegh", "Punarnava", "Gokshura", "Bhringraj", "Manjistha", "Kutki", "Musta"
];

const variants = [
  "Root Extract", "Leaf Extract", "Stem Extract", "Whole Plant Extract", "Resin Extract", "Berry Extract"
];

async function main() {
  console.log('Seeding preparations...');

  const preparations = [];
  
  for (let i = 0; i < 100; i++) {
    const herb1 = herbs[Math.floor(Math.random() * herbs.length)];
    const herb2 = Math.random() > 0.5 ? herbs[Math.floor(Math.random() * herbs.length)] : null;
    const variant = variants[Math.floor(Math.random() * variants.length)];
    
    let name = `${herb1} ${variant}`;
    if (herb2 && herb1 !== herb2) {
      name = `${herb1} & ${herb2} Blend Extract`;
    }
    
    // Ensure unique names
    name = `${name} (Batch ${i + 1})`;
    
    const slug = slugify(name);
    
    preparations.push({
      name,
      slug,
      type: "LIQUID_EXTRACT" as any,
      description: `A potent, purely natural ${name} prepared using classical Ayurvedic extraction methods to preserve the full spectrum of active compounds.`,
      botanicalName: `Botanical name for ${herb1}`,
      volume: 500,
      volumeUnit: "ml",
      mrp: Math.floor(Math.random() * 500) + 100, // Random price 100-600
      stock: Math.floor(Math.random() * 200) + 50,
      ingredients: [herb1, herb2].filter(Boolean) as any,
      benefits: ["Immunity", "Vitality", "Digestion", "Stress Relief"].sort(() => 0.5 - Math.random()).slice(0, 2) as any,
      usage: "Take 10-15 ml twice daily with warm water or as directed by an Ayurvedic physician.",
      images: ["https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=400&q=80"] as any,
      isActive: true
    });
  }

  // Insert in chunks of 20 to avoid payload limits
  let count = 0;
  for (const prep of preparations) {
    await prisma.preparation.upsert({
      where: { slug: prep.slug },
      update: {},
      create: prep
    });
    count++;
    if (count % 20 === 0) console.log(`Inserted ${count}/100`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
