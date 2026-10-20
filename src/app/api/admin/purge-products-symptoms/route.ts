import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Database purge is disabled in production environment.' }, { status: 403 });
    }

    // 1. Delete relations/junctions or cascading records
    // Delete product relations first
    await db.$executeRawUnsafe(`DELETE FROM _IndicationToProduct`);
    try {
      await db.$executeRawUnsafe(`DELETE FROM _SymptomToProduct`);
    } catch (e) {
      // table might not exist
    }
    try {
      await db.$executeRawUnsafe(`DELETE FROM _SymptomToIndication`);
    } catch (e) {}

    // Clean prescription items and order items linking to products if needed
    try {
      await db.$executeRawUnsafe(`DELETE FROM prescription_items WHERE productId IS NOT NULL`);
    } catch (e) {}
    try {
      await db.$executeRawUnsafe(`DELETE FROM shop_order_items`);
    } catch (e) {}
    try {
      await db.$executeRawUnsafe(`DELETE FROM order_items`);
    } catch (e) {}
    try {
      await db.$executeRawUnsafe(`DELETE FROM reviews`);
    } catch (e) {}
    try {
      await db.$executeRawUnsafe(`DELETE FROM shop_reviews`);
    } catch (e) {}
    try {
      await db.$executeRawUnsafe(`DELETE FROM enquiries WHERE productId IS NOT NULL`);
    } catch (e) {}

    // 2. Delete all products
    const deletedProducts = await db.product.deleteMany({});

    // 3. Delete symptoms and indications
    try {
      await db.$executeRawUnsafe(`DELETE FROM _IndicationToPrescription`);
    } catch (e) {}
    try {
      await db.$executeRawUnsafe(`DELETE FROM protocols`);
    } catch (e) {}

    const deletedIndications = await db.indication.deleteMany({});
    let deletedSymptomsCount = 0;
    try {
      if ((db as any).symptom) {
        const res = await (db as any).symptom.deleteMany({});
        deletedSymptomsCount = res.count;
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'All products and symptoms removed successfully.',
      productsRemoved: deletedProducts.count,
      symptomsRemoved: deletedIndications.count + deletedSymptomsCount,
    });
  } catch (err: any) {
    console.error('[PURGE_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
