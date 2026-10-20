import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    const [user, consultantProfile, consumerProfile] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
        },
      }),
      db.consultantProfile.findUnique({
        where: { userId },
      }),
      db.consumerProfile.findUnique({
        where: { userId },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse languages if string
    let languagesArray: string[] = [];
    if (consultantProfile?.languages) {
      try {
        const parsed = JSON.parse(consultantProfile.languages);
        languagesArray = Array.isArray(parsed) ? parsed : [consultantProfile.languages];
      } catch {
        languagesArray = consultantProfile.languages.split(',').map((l) => l.trim()).filter(Boolean);
      }
    }

    return NextResponse.json({
      user,
      role: user.role,
      consultantProfile: consultantProfile
        ? {
            ...consultantProfile,
            languagesArray,
            consultationFee: Number(consultantProfile.consultationFee || 0),
            followUpFee: Number(consultantProfile.followUpFee || 0),
          }
        : null,
      consumerProfile: consumerProfile || null,
    });
  } catch (err: any) {
    console.error('[USER_PROFILE_GET_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const body = await req.json();

    const {
      name,
      phone,
      avatar,
      password,
      // Doctor fields
      degree,
      registrationNumber,
      specialization,
      experience,
      bio,
      languages,
      consultationFee,
      followUpFee,
      // Shipping / Delivery address fields (both Doctor and User)
      address,
      landmark,
      city,
      state,
      pincode,
      dateOfBirth,
      gender,
    } = body;

    let hashedPassword: string | undefined = undefined;
    if (password && typeof password === 'string' && password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    // 1. Update basic User info
    await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
    });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isDoctor = user?.role === 'CONSULTANT';

    // 2. If Doctor, upsert ConsultantProfile
    if (isDoctor) {
      let formattedLanguages = '["English"]';
      if (languages) {
        if (Array.isArray(languages)) {
          formattedLanguages = JSON.stringify(languages);
        } else if (typeof languages === 'string') {
          const arr = languages.split(',').map((l) => l.trim()).filter(Boolean);
          formattedLanguages = JSON.stringify(arr);
        }
      }

      await db.consultantProfile.upsert({
        where: { userId },
        update: {
          ...(degree !== undefined && { degree }),
          ...(registrationNumber !== undefined && { registrationNumber }),
          ...(specialization !== undefined && { specialization }),
          ...(experience !== undefined && { experience: Number(experience) || 0 }),
          ...(bio !== undefined && { bio }),
          ...(languages !== undefined && { languages: formattedLanguages }),
          ...(consultationFee !== undefined && { consultationFee: Number(consultationFee) || 0 }),
          ...(followUpFee !== undefined && { followUpFee: Number(followUpFee) || 0 }),
        },
        create: {
          userId,
          degree: degree || 'BAMS',
          registrationNumber: registrationNumber || '',
          specialization: specialization || 'General Ayurvedic Medicine',
          experience: Number(experience) || 0,
          bio: bio || 'Practicing Ayurvedic doctor.',
          languages: formattedLanguages,
          consultationFee: Number(consultationFee) || 0,
          followUpFee: Number(followUpFee) || 0,
          availability: JSON.stringify({ Monday: ['10:00 AM', '11:00 AM'] }),
        },
      });
    }

    // 3. Upsert ConsumerProfile (Delivery Address for eCommerce store orders) for BOTH Doctor and User
    await db.consumerProfile.upsert({
      where: { userId },
      update: {
        ...(address !== undefined && { address }),
        ...(landmark !== undefined && { landmark }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(gender !== undefined && { gender }),
      },
      create: {
        userId,
        address: address || '',
        landmark: landmark || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('[USER_PROFILE_PUT_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
