import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 401 });
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Endpoint disabled in production environment.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (key !== 'ayurwed_clean_2026') {
      return NextResponse.json({ error: 'Invalid key' }, { status: 403 });
    }

    // 1. Delete junctions and relations
    try { await db.$executeRawUnsafe(`DELETE FROM _IndicationToProduct`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM _SymptomToProduct`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM _SymptomToIndication`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM _ProductToProtocol`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM prescription_items WHERE productId IS NOT NULL`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM shop_order_items`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM order_items`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM reviews`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM shop_reviews`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM enquiries WHERE productId IS NOT NULL`); } catch (e) {}

    // 2. Delete all products
    const delProducts = await db.product.deleteMany({});

    // 3. Clear protocols and relations
    try { await db.$executeRawUnsafe(`DELETE FROM _IndicationToPrescription`); } catch (e) {}
    try { await db.protocol.deleteMany({}); } catch (e) {}

    // 4. Delete indications and symptoms
    const delIndications = await db.indication.deleteMany({});
    let delSymptoms = 0;
    try {
      if ((db as any).symptom) {
        const s = await (db as any).symptom.deleteMany({});
        delSymptoms = s.count;
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Purge complete.',
      productsRemoved: delProducts.count,
      symptomsRemoved: delIndications.count + delSymptoms,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
