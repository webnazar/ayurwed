import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Login required to place an order' }, { status: 401 });
  }

  const body = await req.json();
  const { items, shippingAddress, paymentMethod, paymentStatus, notes, couponCode } = body;

  if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  if (!shippingAddress) return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
  if (paymentMethod && paymentMethod !== 'PREPAID') {
    return NextResponse.json({ error: 'Only prepaid payment is allowed' }, { status: 400 });
  }

  // Fetch products to get current prices & stock
  const productIds = items.map((i: any) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Some products are no longer available' }, { status: 400 });
  }

  // Validate stock & calculate totals
  let subtotal = 0;
  const orderItems: { productId: number; quantity: number; price: number; total: number }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 400 });
    }

    if (product.stock < item.quantity) {
      return NextResponse.json({
        error: `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) remaining.`,
      }, { status: 400 });
    }

    const price = Number(product.sellingPrice);
    const total = price * item.quantity;
    subtotal += total;
    orderItems.push({ productId: item.productId, quantity: item.quantity, price, total });
  }

  let discount = 0;
  let validCouponCode: string | null = null;
  let couponRecordId: number | null = null;

  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    let couponRecord: any = null;
    try {
      couponRecord = await db.shopCoupon.findUnique({ where: { code: cleanCode } });
    } catch (e) {
      const rows: any[] = await db.$queryRaw`SELECT * FROM shop_coupons WHERE UPPER(code) = ${cleanCode} LIMIT 1`;
      if (rows && rows.length > 0) couponRecord = rows[0];
    }

    if (couponRecord && couponRecord.isPublished) {
      const minAmount = couponRecord.minOrderAmount ? Number(couponRecord.minOrderAmount) : 0;
      if (subtotal >= minAmount) {
        const val = Number(couponRecord.discountValue);
        if (couponRecord.discountType === 'PERCENTAGE') {
          discount = (subtotal * val) / 100;
          if (couponRecord.maxDiscountAmount && Number(couponRecord.maxDiscountAmount) > 0) {
            discount = Math.min(discount, Number(couponRecord.maxDiscountAmount));
          }
        } else {
          discount = Math.min(val, subtotal);
        }
        discount = Math.round(discount * 100) / 100;
        validCouponCode = couponRecord.code;
        couponRecordId = couponRecord.id;
      }
    }
  }

  const shipping = subtotal >= 500 ? 0 : 60;
  const total = Math.max(0, subtotal - discount + shipping);

  // Generate order number
  const orderNumber = `AW-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  // Atomic database transaction
  const order = await db.$transaction(async (tx) => {
    // 1. Create order
    const createdOrder = await tx.shopOrder.create({
      data: {
        orderNumber,
        userId: parseInt(session.user.id as string),
        status: 'PENDING',
        paymentMethod: paymentMethod || 'PREPAID',
        paymentStatus: 'PENDING', // Security: always initialize as PENDING at creation
        subtotal,
        discount,
        couponCode: validCouponCode,
        shipping,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
      },
    });

    // 2. Increment coupon usage count if used
    if (couponRecordId) {
      try {
        await tx.shopCoupon.update({
          where: { id: couponRecordId },
          data: { usageCount: { increment: 1 } },
        });
      } catch (err) {
        await tx.$executeRaw`UPDATE shop_coupons SET usageCount = usageCount + 1 WHERE id = ${couponRecordId}`;
      }
    }

    // 3. Deduct stock atomically
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return createdOrder;
  });

  // Trigger email notification in background
  if (session.user.email) {
    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount || 0),
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: Number(i.price),
        total: Number(i.total),
      })),
      userEmail: session.user.email,
      userName: session.user.name || 'Valued Customer',
      shippingAddress,
    }).catch((err) => console.error('Error triggering order confirmation email:', err));
  }

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
  });
}
