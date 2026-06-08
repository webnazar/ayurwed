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
        languages: ['English', 'Hindi'],
        consultationFee: c.fee,
        isVerified: true,
        availability: [],
      },
    });
  }

  // 3. Manufacturers
  const manufacturers = [
    { email: 'contact@himalayawellness.com', name: 'Himalaya Wellness Rep', phone: '9876543215', companyName: 'Himalaya Wellness', slug: 'himalaya-wellness' },
    { email: 'sales@patanjali.com', name: 'Patanjali Rep', phone: '9876543216', companyName: 'Patanjali Ayurved', slug: 'patanjali-ayurved' },
  ];

  for (const m of manufacturers) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        name: m.name,
        password: defaultPassword,
        phone: m.phone,
        role: 'MANUFACTURER',
      },
    });

    await prisma.manufacturerProfile.upsert({
      where: { slug: m.slug },
      update: {},
      create: {
        userId: user.id,
        companyName: m.companyName,
        slug: m.slug,
        description: `Official profile for ${m.companyName}.`,
        certifications: ['GMP Certified'],
        address: { city: 'New Delhi', state: 'Delhi' },
        isVerified: true,
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
