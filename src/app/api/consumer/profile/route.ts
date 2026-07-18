import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await db.consumerProfile.findUnique({
      where: { userId: Number(session.user.id) },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    if (!profile) {
      const user = await db.user.findUnique({
        where: { id: Number(session.user.id) },
        select: { name: true, email: true, phone: true }
      });
      if (user) {
        profile = {
          id: 0,
          userId: Number(session.user.id),
          address: '',
          landmark: '',
          city: '',
          state: '',
          pincode: '',
          dateOfBirth: null,
          gender: null,
          medicalHistory: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user
        } as any;
      }
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching consumer profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      address, 
      landmark,
      city, 
      state, 
      pincode, 
      dateOfBirth, 
      gender, 
      medicalHistory,
      phone 
    } = body;

    const userId = Number(session.user.id);

    // Update phone in user model if provided
    if (phone !== undefined) {
      await db.user.update({
        where: { id: userId },
        data: { phone }
      });
    }

    const profile = await db.consumerProfile.upsert({
      where: { userId },
      update: {
        address,
        landmark,
        city,
        state,
        pincode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        medicalHistory
      },
      create: {
        userId,
        address,
        landmark,
        city,
        state,
        pincode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        medicalHistory
      }
    });

    return NextResponse.json({ profile, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating consumer profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
