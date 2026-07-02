import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId, action } = await req.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    if (action === 'approve') {
      const updatedProfile = await db.consultantProfile.update({
        where: { id: Number(profileId) },
        data: {
          isAcfp: true,
          acfpVerifiedAt: new Date(),
          isVerified: true,
          hasOnline: true,
          hasOffline: true,
          hasFulfillment: true,
          hasHomeDelivery: true,
        },
      });
      return NextResponse.json({ success: true, profile: updatedProfile });
    } else if (action === 'reject') {
      const updatedProfile = await db.consultantProfile.update({
        where: { id: Number(profileId) },
        data: {
          isAcfp: false,
          acfpVerifiedAt: null, // Reset the application
        },
      });
      return NextResponse.json({ success: true, profile: updatedProfile });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('ACFP Admin Approval Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
