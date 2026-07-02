import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Check if subscriber already exists
    const existingSubscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        // Reactivate subscription if they unsubscribed previously
        await db.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true },
        });
        return NextResponse.json({ message: 'Welcome back! Your subscription has been reactivated.' });
      }
      return NextResponse.json({ message: 'You are already subscribed to our newsletter.' });
    }

    // Create new subscriber
    await db.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json({ message: 'Successfully subscribed to the newsletter!' }, { status: 201 });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error', stack: error?.stack }, { status: 500 });
  }
}
