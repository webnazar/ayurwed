import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { productId, name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enquiry = await db.enquiry.create({
      data: {
        productId: productId ? Number(productId) : null,
        userId: session ? Number((session.user as any).id) : null,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        message: String(message).trim(),
      },
    });

    return NextResponse.json({ success: true, id: enquiry.id });
  } catch (err) {
    console.error('Enquiry error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
