import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const appointments = await db.appointment.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { scheduledAt: 'desc' },
      include: {
        consultant: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });
    return NextResponse.json(appointments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, status } = await req.json();
    const appt = await db.appointment.findFirst({ where: { id: Number(id), userId: (session.user as any).id } });
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (appt.status !== 'PENDING') return NextResponse.json({ error: 'Cannot cancel non-pending appointment' }, { status: 400 });
    const updated = await db.appointment.update({
      where: { id: Number(id) }, data: { status },
      include: { consultant: { include: { user: { select: { name: true, avatar: true } } } } },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
