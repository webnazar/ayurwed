import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let coupons: any[] = [];
    try {
      coupons = await db.shopCoupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      coupons = await db.$queryRawUnsafe(`SELECT * FROM shop_coupons ORDER BY createdAt DESC`);
    }

    const serialized = coupons.map((c: any) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
      maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
      isPublished: Boolean(c.isPublished),
      usageCount: Number(c.usageCount || 0),
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ coupons: serialized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, isPublished } = body;

    if (!code || discountValue === undefined || discountValue === null) {
      return NextResponse.json({ error: 'Coupon code and discount value are required' }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const type = discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE';
    const val = Number(discountValue);
    const minAmt = minOrderAmount ? Number(minOrderAmount) : null;
    const maxAmt = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    const active = isPublished !== undefined ? Boolean(isPublished) : true;

    try {
      const created = await db.shopCoupon.create({
        data: {
          code: cleanCode,
          discountType: type,
          discountValue: val,
          minOrderAmount: minAmt,
          maxDiscountAmount: maxAmt,
          isPublished: active,
        },
      });

      return NextResponse.json({
        success: true,
        coupon: {
          ...created,
          discountValue: Number(created.discountValue),
          minOrderAmount: created.minOrderAmount ? Number(created.minOrderAmount) : null,
          maxDiscountAmount: created.maxDiscountAmount ? Number(created.maxDiscountAmount) : null,
        },
      });
    } catch (prismaErr: any) {
      // Raw SQL Fallback if Prisma model hasn't reloaded in Next.js memory
      await db.$executeRawUnsafe(`
        INSERT INTO shop_coupons (code, discountType, discountValue, minOrderAmount, maxDiscountAmount, isPublished, usageCount, createdAt, updatedAt)
        VALUES ('${cleanCode}', '${type}', ${val}, ${minAmt !== null ? minAmt : 'NULL'}, ${maxAmt !== null ? maxAmt : 'NULL'}, ${active ? 'true' : 'false'}, 0, NOW(), NOW())
      `);

      const rows: any[] = await db.$queryRawUnsafe(`SELECT * FROM shop_coupons WHERE UPPER(code) = '${cleanCode}' LIMIT 1`);
      const c = rows[0];

      return NextResponse.json({
        success: true,
        coupon: {
          id: c.id,
          code: c.code,
          discountType: c.discountType,
          discountValue: Number(c.discountValue),
          minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
          maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
          isPublished: Boolean(c.isPublished),
          usageCount: Number(c.usageCount || 0),
          createdAt: c.createdAt,
        },
      });
    }
  } catch (err: any) {
    console.error('Error creating coupon:', err);
    if (err.message?.includes('Duplicate') || err.message?.includes('Unique')) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Error creating coupon' }, { status: 500 });
  }
}
