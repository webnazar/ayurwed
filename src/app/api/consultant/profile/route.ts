import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const body = await req.json();
    const { name, avatar, specialization, experience, bio, languages, consultationFee } = body;

    // Use a transaction to update both User and ConsultantProfile
    const [updatedUser, updatedProfile] = await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          avatar: avatar !== undefined ? avatar : undefined,
        },
      }),
      db.consultantProfile.update({
        where: { userId },
        data: {
          specialization: specialization || undefined,
          experience: experience !== undefined ? experience : undefined,
          bio: bio || undefined,
          languages: languages || undefined,
          consultationFee: consultationFee !== undefined ? Number(consultationFee) : undefined,
        },
      })
    ]);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
