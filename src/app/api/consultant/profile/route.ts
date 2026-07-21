import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { 
      targetUserId, name, avatar, degree, specialization, experience, bio, languages, consultationFee, followUpFee,
      isCaiCertified, isVerified, isAcfp, fulfillmentMethod,
      hasClinicPickup, hasSelfDispatch, hasAyurwedDelivery,
      procurementDeclaration, procurementReference,
      registrationNumber
    } = body;

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
          degree: degree || undefined,
          specialization: specialization || undefined,
          experience: experience !== undefined ? experience : undefined,
          bio: bio || undefined,
          languages: Array.isArray(languages) ? JSON.stringify(languages) : (languages || undefined),
          consultationFee: consultationFee !== undefined ? Number(consultationFee) : undefined,
          followUpFee: followUpFee !== undefined ? Number(followUpFee) : undefined,
          fulfillmentMethod: (fulfillmentMethod === 'COURIER' || fulfillmentMethod === 'PICKUP') ? fulfillmentMethod : undefined,
          hasClinicPickup: hasClinicPickup !== undefined ? Boolean(hasClinicPickup) : undefined,
          hasSelfDispatch: hasSelfDispatch !== undefined ? Boolean(hasSelfDispatch) : undefined,
          hasAyurwedDelivery: hasAyurwedDelivery !== undefined ? Boolean(hasAyurwedDelivery) : undefined,
          procurementDeclaration: procurementDeclaration !== undefined ? Boolean(procurementDeclaration) : undefined,
          procurementReference: procurementReference !== undefined ? procurementReference : undefined,
          registrationNumber: registrationNumber !== undefined ? registrationNumber : undefined,
          // Admin override flags
          isCaiCertified: (isAdmin && isCaiCertified !== undefined) ? isCaiCertified : undefined,
          isVerified: (isAdmin && isVerified !== undefined) ? isVerified : undefined,
          isAcfp: (isAdmin && isAcfp !== undefined) ? isAcfp : undefined,
          acfpVerifiedAt: (isAdmin && isAcfp === true) ? new Date() : (isAdmin && isAcfp === false) ? null : undefined,
        },
      })
    ]);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
