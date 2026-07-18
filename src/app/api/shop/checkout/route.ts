import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Login required to place an order' }, { status: 401 });
  }

  const body = await req.json();
  const { items, shippingAddress, paymentMethod, notes } = body;

  if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  if (!shippingAddress) return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });

  // Fetch products to get current prices
  const productIds = items.map((i: any) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Some products are no longer available' }, { status: 400 });
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = items.map((item: any) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error('Product not found');
    const price = Number(product.sellingPrice);
    const total = price * item.quantity;
    subtotal += total;
    return { productId: item.productId, quantity: item.quantity, price, total };
  });

  const shipping = subtotal >= 500 ? 0 : 60;
  const total = subtotal + shipping;

  // Generate order number
  const orderNumber = `AW-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const order = await db.shopOrder.create({
    data: {
      orderNumber,
      userId: parseInt(session.user.id as string),
      status: 'PENDING',
      paymentMethod: paymentMethod || 'COD',
      subtotal,
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

  // Deduct stock
  for (const item of orderItems) {
    await db.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
  });
}
