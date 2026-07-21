import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    const profile = await db.consultantProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Check if the doctor is CAI certified first
    if (!profile.isCaiCertified) {
      return NextResponse.json({ 
        error: 'In order to practice and activate platform access, you must first complete the Certificate in Ancient Intelligence (CAI).' 
      }, { status: 400 });
    }

    // Check if they are already approved
    if (profile.isAcfp) {
      return NextResponse.json({ error: 'Your platform access subscription is already active.' }, { status: 400 });
    }

    // Update the profile to platform active status immediately (simulates yearly platform fee payment)
    const updatedProfile = await db.consultantProfile.update({
      where: { userId },
      data: {
        isAcfp: true,
        acfpVerifiedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Your platform access subscription has been activated successfully.',
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Platform Activation Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
