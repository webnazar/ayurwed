const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purge() {
  console.log('--- PURGING ALL PRODUCTS AND SYMPTOMS ---');
  
  // 1. Delete junctions and product relations
  try {
    await prisma.$executeRawUnsafe('DELETE FROM _IndicationToProduct');
    console.log('Cleared _IndicationToProduct');
  } catch (e) {
    console.log('_IndicationToProduct error or not found:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe('DELETE FROM _SymptomToProduct');
    console.log('Cleared _SymptomToProduct');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM _SymptomToIndication');
    console.log('Cleared _SymptomToIndication');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM _ProductToProtocol');
    console.log('Cleared _ProductToProtocol');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM prescription_items WHERE productId IS NOT NULL');
    console.log('Cleared prescription_items linking to products');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM shop_order_items');
    console.log('Cleared shop_order_items');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM order_items');
    console.log('Cleared order_items');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM reviews');
    console.log('Cleared reviews');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM shop_reviews');
    console.log('Cleared shop_reviews');
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe('DELETE FROM enquiries WHERE productId IS NOT NULL');
    console.log('Cleared enquiries with productId');
  } catch (e) {}

  // 2. Delete all products
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`Deleted ${deletedProducts.count} products.`);

  // 3. Clear protocols and prescriptions relation
  try {
    await prisma.$executeRawUnsafe('DELETE FROM _IndicationToPrescription');
  } catch (e) {}

  try {
    await prisma.protocol.deleteMany({});
  } catch (e) {}

  // 4. Delete indications and symptoms
  const deletedIndications = await prisma.indication.deleteMany({});
  console.log(`Deleted ${deletedIndications.count} records from indications.`);

  try {
    if (prisma.symptom) {
      const deletedSymptoms = await prisma.symptom.deleteMany({});
      console.log(`Deleted ${deletedSymptoms.count} records from symptoms.`);
    }
  } catch (e) {}

  console.log('--- PURGE COMPLETE ---');
}

purge()
  .catch((e) => {
    console.error('Error during purge:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
