import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const orderSubtotal = Number(subtotal) || 0;
    const cleanCode = code.trim().toUpperCase();

    // Query database for coupon
    let coupon: any = null;
    try {
      coupon = await db.shopCoupon.findUnique({
        where: { code: cleanCode },
      });
    } catch (e) {
      // Safe fallback raw query
      const rows: any[] = await db.$queryRaw`SELECT * FROM shop_coupons WHERE UPPER(code) = ${cleanCode} LIMIT 1`;
      if (rows && rows.length > 0) coupon = rows[0];
    }

    if (!coupon || !coupon.isPublished) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (orderSubtotal < minAmount) {
      return NextResponse.json({
        error: `Coupon '${cleanCode}' requires a minimum order subtotal of ₹${minAmount.toLocaleString('en-IN')}`,
      }, { status: 400 });
    }

    const val = Number(coupon.discountValue);
    let calculatedDiscount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      calculatedDiscount = (orderSubtotal * val) / 100;
      if (coupon.maxDiscountAmount && Number(coupon.maxDiscountAmount) > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, Number(coupon.maxDiscountAmount));
      }
    } else {
      // FLAT discount
      calculatedDiscount = Math.min(val, orderSubtotal);
    }

    calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: val,
        calculatedDiscount,
        minOrderAmount: minAmount,
      },
    });
  } catch (err: any) {
    console.error('Error validating coupon:', err);
    return NextResponse.json({ error: err.message || 'Error validating coupon' }, { status: 500 });
  }
}
