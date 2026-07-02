import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ enrolled: false });
    }

    const enrollment = await db.enrollment.findFirst({
      where: { userId: Number(session.user.id) },
    });

    return NextResponse.json({ enrolled: !!enrollment });
  } catch (error) {
    console.error('Error checking course enrollment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
