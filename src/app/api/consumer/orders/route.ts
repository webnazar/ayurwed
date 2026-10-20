import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const orders = await db.order.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { id: true, name: true, images: true, slug: true } } } } },
    });
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
