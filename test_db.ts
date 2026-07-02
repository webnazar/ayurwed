import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  try {
    const res = await db.newsletterSubscriber.findMany();
    console.log("Success:", res);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await db.$disconnect();
  }
}
main();
