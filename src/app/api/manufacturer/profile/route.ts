import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'MANUFACTURER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { description, website, contactEmail, contactPhone, gstNumber, logo, manufacturingLicense, certifications } = body;

  try {
    const profile = await db.manufacturerProfile.update({
      where: { userId: Number((session.user as any).id) },
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
