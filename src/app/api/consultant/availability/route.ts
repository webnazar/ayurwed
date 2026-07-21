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
    
    let parsedAvailability = {};
    try {
      if (profile.availability) {
        parsedAvailability = JSON.parse(profile.availability);
      }
    } catch (e) {
      console.error('Failed to parse availability:', e);
    }
    return NextResponse.json({ availability: parsedAvailability });
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
    const serializedAvailability = typeof availability === 'object' ? JSON.stringify(availability) : availability;
    
    const updated = await db.consultantProfile.update({
      where: { userId: Number((session.user as any).id) },
      data: {
        ...(availability !== undefined && { availability: serializedAvailability }),
      },
    });
    
    let parsedAvailability = {};
    try {
      if (updated.availability) {
        parsedAvailability = JSON.parse(updated.availability);
      }
    } catch (e) {
      console.error('Failed to parse availability:', e);
    }
    return NextResponse.json({ availability: parsedAvailability });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
