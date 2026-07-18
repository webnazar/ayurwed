import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const orders = await db.shopOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, images: true, unit: true } },
        },
      },
    },
  });

  return NextResponse.json(
    orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      shippingAddress: (() => { try { return o.shippingAddress ? JSON.parse(o.shippingAddress) : null; } catch { return null; } })(),
      items: o.items.map((i) => ({
        ...i,
        price: Number(i.price),
        total: Number(i.total),
        product: {
          ...i.product,
          images: (() => { try { return JSON.parse(i.product.images || '[]'); } catch { return []; } })(),
        },
      })),
    }))
  );
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { id, status, paymentStatus } = body;
  if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

  const dataToUpdate: any = {};
  if (status) dataToUpdate.status = status;
  if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

  const order = await db.shopOrder.update({
    where: { id },
    data: dataToUpdate,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, images: true, unit: true } },
        },
      },
    },
  });

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    shippingAddress: (() => { try { return order.shippingAddress ? JSON.parse(order.shippingAddress) : null; } catch { return null; } })(),
    items: order.items.map((i) => ({
      ...i,
      price: Number(i.price),
      total: Number(i.total),
      product: {
        ...i.product,
        images: (() => { try { return JSON.parse(i.product.images || '[]'); } catch { return []; } })(),
      },
    })),
  });
}
