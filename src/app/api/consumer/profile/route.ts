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

    const profile = await db.consumerProfile.findUnique({
      where: { userId: Number(session.user.id) },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

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
