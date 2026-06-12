import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { targetUserId, description, website, contactEmail, contactPhone, gstNumber, logo, manufacturingLicense, certifications } = body;

  const isAdmin = (session.user as any).role === 'ADMIN';
  const isOwner = (session.user as any).role === 'MANUFACTURER';

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Determine which user's profile to update
  let profileUserId = Number((session.user as any).id);
  if (targetUserId) {
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized to edit other profiles' }, { status: 403 });
    profileUserId = Number(targetUserId);
  }

  try {
    const profile = await db.manufacturerProfile.update({
      where: { userId: profileUserId },
      data: {
        description: description || undefined,
        website: website || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        gstNumber: gstNumber || null,
        distributorInfo: null, // Wipe it out
        logo: logo || null,
        manufacturingLicense: manufacturingLicense || null,
        certifications: certifications || undefined,
      },
    });
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
