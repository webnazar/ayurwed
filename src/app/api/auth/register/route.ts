import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required profile fields' }, { status: 400 });
    }

    // 1. Check if user already exists
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Account with this email already exists' }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 3. Create user and nested profiles
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isActive: true,
        // Conditionally create matching sub-profiles
        ...(role === 'CONSULTANT' && {
          consultantProfile: {
            create: {
              specialization: 'General Ayurveda Medicine',
              experience: 0,
              bio: 'Certified Ayurvedic consultant profile.',
              languages: JSON.stringify(['English']),
              consultationFee: 300.00,
              followUpFee: 150.00,
              isVerified: false,
              availability: JSON.stringify({
                monday: ['09:00-12:00'],
              }),
            },
          },
        }),
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err: any) {
    console.error('[REGISTER_POST_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
