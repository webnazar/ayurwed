import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // 1. Ensure the flagship CAI course exists in the database
    const course = await db.course.upsert({
      where: { slug: 'cai' },
      update: {},
      create: {
        title: 'Certificate in Ancient Intelligence',
        slug: 'cai',
        description: 'Master the Ancient Extract Intelligence System (AEIS™) with our flagship Certificate in Ancient Intelligence (CAI) program.',
        price: 0.00,
        instructorId: 1, // Default admin/instructor ID
        thumbnail: '/academy-thumbnail.webp',
        isPublished: true,
      },
    });

    // 2. Create the enrollment
    const enrollment = await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId,
        courseId: course.id,
      },
    });

    // 3. If the user is a consultant, mark them as CAI certified in their profile
    if (session.user.role === 'CONSULTANT') {
      await db.consultantProfile.update({
        where: { userId },
        data: { isCaiCertified: true },
      });
    }

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
