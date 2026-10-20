import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, subtitle, quote, rating, avatar } = body;

    if (!name?.trim() || !quote?.trim()) {
      return NextResponse.json({ error: 'Name and review quote are required' }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        name: name.trim(),
        subtitle: (subtitle || 'Wellness Member').trim(),
        quote: quote.trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        avatar: avatar?.trim() || null,
        isActive: false, // Default is strictly unapproved until admin approves
        sortOrder: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending administrator approval.',
      testimonial,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return NextResponse.json({ error: err.message || 'Error submitting review' }, { status: 500 });
  }
}
