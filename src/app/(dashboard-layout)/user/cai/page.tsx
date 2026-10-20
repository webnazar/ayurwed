import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import MyCoursesClient from '@/components/consumer/MyCoursesClient';

export const revalidate = 0;

export default async function ConsumerCaiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = Number((session.user as any).id);
  const [enrollments, consultantProfile] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        progress: true,
        completedAt: true,
        certificateUrl: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            description: true,
            lessons: { select: { id: true } },
          },
        },
      },
    }),
    db.consultantProfile.findUnique({
      where: { userId },
      select: { isVerified: true, degree: true }
    })
  ]);

  const isVerifiedDoctor = Boolean(consultantProfile?.isVerified);
  const doctorDegree = consultantProfile?.degree || null;

  return (
    <MyCoursesClient
      initialEnrollments={enrollments as any}
      isVerifiedDoctor={isVerifiedDoctor}
      doctorDegree={doctorDegree}
    />
  );
}
