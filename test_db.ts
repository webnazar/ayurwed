import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  try {
    const res = await db.consultantProfile.findFirst({
      select: { id: true, availability: true }
    });
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await db.$disconnect();
  }
}
main();
