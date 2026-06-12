import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { targetUserId, name, avatar, specialization, experience, bio, languages, consultationFee } = body;

    const isAdmin = session && (session.user as any).role === 'ADMIN';
    const isOwner = session && (session.user as any).role === 'CONSULTANT';

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profileUserId = Number((session.user as any).id);
    if (targetUserId) {
      if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      profileUserId = Number(targetUserId);
    }

    // Use a transaction to update both User and ConsultantProfile
    const [updatedUser, updatedProfile] = await db.$transaction([
      db.user.update({
        where: { id: profileUserId },
        data: {
          name: name || undefined,
          avatar: avatar !== undefined ? avatar : undefined,
        },
      }),
      db.consultantProfile.update({
        where: { userId: profileUserId },
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
