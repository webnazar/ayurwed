import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import MyCoursesClient from '@/components/consumer/MyCoursesClient';

export const revalidate = 0;

export default async function ConsumerCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const enrollments = await db.enrollment.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' },
    include: {
      course: {
        include: { lessons: { select: { id: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">My Courses</h1>
        <p className="dashboard-header-subtitle">Track your Ayurvedic wellness learning journey and certificates.</p>
      </div>
      <MyCoursesClient initialEnrollments={enrollments as any} />
    </div>
  );
}
