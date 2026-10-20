import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const couponId = Number(id);

  try {
    const body = await req.json();
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, isPublished } = body;

    const cleanCode = code ? String(code).trim().toUpperCase() : undefined;
    const type = discountType ? (discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE') : undefined;
    const val = discountValue !== undefined ? Number(discountValue) : undefined;
    const minAmt = minOrderAmount !== undefined ? (minOrderAmount ? Number(minOrderAmount) : null) : undefined;
    const maxAmt = maxDiscountAmount !== undefined ? (maxDiscountAmount ? Number(maxDiscountAmount) : null) : undefined;
    const active = isPublished !== undefined ? Boolean(isPublished) : undefined;

    try {
      const updated = await db.shopCoupon.update({
        where: { id: couponId },
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
          ...updated,
          discountValue: Number(updated.discountValue),
          minOrderAmount: updated.minOrderAmount ? Number(updated.minOrderAmount) : null,
          maxDiscountAmount: updated.maxDiscountAmount ? Number(updated.maxDiscountAmount) : null,
        },
      });
    } catch (prismaErr) {
      // Raw SQL Fallback
      let setClauses: string[] = [];
      if (cleanCode !== undefined) setClauses.push(`code = '${cleanCode}'`);
      if (type !== undefined) setClauses.push(`discountType = '${type}'`);
      if (val !== undefined) setClauses.push(`discountValue = ${val}`);
      if (minAmt !== undefined) setClauses.push(`minOrderAmount = ${minAmt !== null ? minAmt : 'NULL'}`);
      if (maxAmt !== undefined) setClauses.push(`maxDiscountAmount = ${maxAmt !== null ? maxAmt : 'NULL'}`);
      if (active !== undefined) setClauses.push(`isPublished = ${active ? 'true' : 'false'}`);

      if (setClauses.length > 0) {
        await db.$executeRawUnsafe(`UPDATE shop_coupons SET ${setClauses.join(', ')} WHERE id = ${couponId}`);
      }

      const rows: any[] = await db.$queryRawUnsafe(`SELECT * FROM shop_coupons WHERE id = ${couponId} LIMIT 1`);
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
    return NextResponse.json({ error: err.message || 'Error updating coupon' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const couponId = Number(id);

  try {
    try {
      await db.shopCoupon.delete({
        where: { id: couponId },
      });
    } catch (e) {
      await db.$executeRawUnsafe(`DELETE FROM shop_coupons WHERE id = ${couponId}`);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting coupon' }, { status: 500 });
  }
}
