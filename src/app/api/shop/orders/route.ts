import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await db.shopOrder.findMany({
    where: { userId: parseInt(session.user.id as string) },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, images: true, unit: true } } },
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
