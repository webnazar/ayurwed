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
    const profile = await db.consultantProfile.findUnique({ where: { userId: Number((session.user as any).id) } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    return NextResponse.json({ availability: profile.availability });
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
    const { availability } = await req.json();
    const updated = await db.consultantProfile.update({
      where: { userId: Number((session.user as any).id) },
      data: {
        ...(availability !== undefined && { availability }),
      },
    });
    return NextResponse.json({ availability: updated.availability });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
