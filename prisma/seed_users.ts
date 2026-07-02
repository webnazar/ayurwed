import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy users (consumers, consultants, manufacturers)...');
  
  const defaultPassword = await bcrypt.hash('Test@123', 10);

  // 1. Consumers
  const consumers = [
    { email: 'john.consumer@example.com', name: 'John Consumer', phone: '9876543210' },
    { email: 'sarah.seeker@example.com', name: 'Sarah Seeker', phone: '9876543211' },
    { email: 'amit.patel@example.com', name: 'Amit Patel', phone: '9876543212' },
  ];

  for (const c of consumers) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        name: c.name,
        password: defaultPassword,
        phone: c.phone,
        role: 'CONSUMER',
      },
    });
  }

  // 2. Consultants
  const consultants = [
    { email: 'dr.sharma@ayurwed.com', name: 'Dr. R. K. Sharma', phone: '9876543213', spec: 'Ayurvedic General Medicine', fee: 500 },
    { email: 'dr.nair@ayurwed.com', name: 'Dr. Priya Nair', phone: '9876543214', spec: 'Panchakarma Specialist', fee: 800 },
  ];

  for (const c of consultants) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        name: c.name,
        password: defaultPassword,
        phone: c.phone,
        role: 'CONSULTANT',
      },
    });

    await prisma.consultantProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialization: c.spec,
        experience: 10,
        bio: `${c.name} is a highly experienced Ayurvedic consultant.`,
        languages: JSON.stringify(['English', 'Hindi']),
        consultationFee: c.fee,
        isVerified: true,
        availability: JSON.stringify([]),
      },
    });
  }


  console.log('Dummy users seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
