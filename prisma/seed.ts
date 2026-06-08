import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmails = ['webnazar@gmail.com', 'ayurwed.com@gmail.com'];
  const defaultPassword = await bcrypt.hash('Admin@2025#', 10);

  console.log('Seeding default admins...');

  for (const email of adminEmails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
      },
      create: {
        email,
        name: email.split('@')[0],
        password: defaultPassword,
        role: 'ADMIN',
      },
    });
    console.log(`Admin created/updated: ${user.email}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
