import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy testimonials...');

  const testimonials = [
    {
      name: 'Ramesh Singh',
      subtitle: 'Verified Buyer',
      quote: 'The Ayurwed platform made it incredibly easy to find genuine Ayurvedic remedies. The products I ordered arrived on time and have been highly effective.',
      rating: 5,
      avatar: '/placeholder-user.png',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Priya Sharma',
      subtitle: 'Yoga Instructor',
      quote: 'I love how I can book consultations with verified Ayurvedic practitioners. Dr. Nair was wonderful, and the prescribed medicines were delivered right to my door.',
      rating: 5,
      avatar: '/placeholder-user.png',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Anil Desai',
      subtitle: 'Health Enthusiast',
      quote: 'Finally, a platform that categorizes Ayurvedic products by their actual indications and symptoms. It takes the guesswork out of finding the right formulation!',
      rating: 4,
      avatar: '/placeholder-user.png',
      isActive: true,
      sortOrder: 3,
    }
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: t
    });
  }

  console.log('Dummy testimonials seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
