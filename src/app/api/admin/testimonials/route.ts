import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function adminGuard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await req.json();
  const { name, subtitle, quote, rating, avatar, isActive, sortOrder } = body;

  if (!name?.trim() || !quote?.trim() || !subtitle?.trim()) {
    return NextResponse.json({ error: 'Name, subtitle and quote are required' }, { status: 400 });
  }

  const testimonial = await db.testimonial.create({
    data: {
      name: name.trim(),
      subtitle: subtitle.trim(),
      quote: quote.trim(),
      rating: Number(rating) || 5,
      avatar: avatar?.trim() || null,
      isActive: isActive ?? false,
      sortOrder: Number(sortOrder) || 0,
    },
  });
  return NextResponse.json(testimonial, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const testimonial = await db.testimonial.update({
    where: { id: Number(id) },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle.trim() }),
      ...(data.quote !== undefined && { quote: data.quote.trim() }),
      ...(data.rating !== undefined && { rating: Number(data.rating) }),
      ...(data.avatar !== undefined && { avatar: data.avatar?.trim() || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
    },
  });
  return NextResponse.json(testimonial);
}

export async function DELETE(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await db.testimonial.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
