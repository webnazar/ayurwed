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
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">My Courses</h1>
        <p className="text-sm text-brand-green-light mt-2">Track your Ayurvedic wellness learning journey and certificates.</p>
      </div>
      <MyCoursesClient initialEnrollments={enrollments as any} />
    </div>
  );
}
