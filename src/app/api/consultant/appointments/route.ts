import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await db.consultantProfile.findUnique({ where: { userId: (session.user as any).id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const where: any = { consultantId: profile.id };
    if (status) where.status = status;

    const appointments = await db.appointment.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    return NextResponse.json(appointments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await db.consultantProfile.findUnique({ where: { userId: (session.user as any).id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const { id, status, meetingLink, notes } = await req.json();
    const appt = await db.appointment.findFirst({ where: { id: Number(id), consultantId: profile.id } });
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await db.appointment.update({
      where: { id: Number(id) },
      data: {
        ...(status && { status }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(notes !== undefined && { notes }),
      },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
