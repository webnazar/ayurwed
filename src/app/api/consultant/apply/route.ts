import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = Number(session.user.id);
    const body = await req.json();
    const { degree, registrationNumber, specialization, experience, bio } = body;

    if (!degree || !registrationNumber) {
      return NextResponse.json({ error: 'Degree qualification and Medical Registration Number are required' }, { status: 400 });
    }

    // Create or update Consultant Profile
    const profile = await db.consultantProfile.upsert({
      where: { userId },
      update: {
        degree,
        registrationNumber,
        specialization: specialization || 'Ayurvedic Medicine',
        experience: Number(experience) || 1,
        bio: bio || 'Registered medical practitioner on AYURWED.',
      },
      create: {
        userId,
        degree,
        registrationNumber,
        specialization: specialization || 'Ayurvedic Medicine',
        experience: Number(experience) || 1,
        bio: bio || 'Registered medical practitioner on AYURWED.',
        languages: JSON.stringify(['English', 'Hindi']),
        consultationFee: 300.00,
        followUpFee: 150.00,
        availability: JSON.stringify([]),
        isVerified: false, // Admin verification required!
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Practitioner application submitted successfully for Admin verification.',
      profile,
    });
  } catch (err: any) {
    console.error('Error applying for doctor credentials:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit application' }, { status: 500 });
  }
}
