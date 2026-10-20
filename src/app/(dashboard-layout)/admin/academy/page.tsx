import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AdminAcademyClient from '@/components/admin/AdminAcademyClient';

export const revalidate = 0;

export default async function AdminAcademyPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  let initialCourse: any = {
    id: 1,
    title: 'Certificate in Ancient Intelligence (CAI)',
    slug: 'cai',
    description: 'Master the Ancient Extract Intelligence System (AEIS™) with our flagship Certificate in Ancient Intelligence (CAI) program.',
    price: 9999,
    discountPrice: 4999,
    isPublished: true,
    enrollmentsCount: 0,
  };

  try {
    const [caiCourse, enrollmentsCount] = await Promise.all([
      db.course.findFirst({
        where: { slug: 'cai' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          price: true,
          discountPrice: true,
          couponCode: true,
          couponDiscountPrice: true,
          isPublished: true,
        },
      }),
      db.enrollment.count({
        where: { course: { slug: 'cai' } },
      }),
    ]);

    if (caiCourse) {
      initialCourse = {
        id: caiCourse.id,
        title: caiCourse.title,
        slug: caiCourse.slug,
        description: caiCourse.description,
        price: Number(caiCourse.price),
        discountPrice: caiCourse.discountPrice ? Number(caiCourse.discountPrice) : null,
        couponCode: caiCourse.couponCode || null,
        couponDiscountPrice: caiCourse.couponDiscountPrice ? Number(caiCourse.couponDiscountPrice) : null,
        isPublished: caiCourse.isPublished,
        enrollmentsCount,
      };
    }
  } catch (err) {
    try {
      const rows: any[] = await db.$queryRawUnsafe(`SELECT * FROM courses WHERE slug = 'cai' LIMIT 1`);
      if (rows && rows.length > 0) {
        const c = rows[0];
        initialCourse = {
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          price: Number(c.price),
          discountPrice: c.discountPrice ? Number(c.discountPrice) : null,
          couponCode: c.couponCode || null,
          couponDiscountPrice: c.couponDiscountPrice ? Number(c.couponDiscountPrice) : null,
          isPublished: Boolean(c.isPublished),
          enrollmentsCount: 0,
        };
      }
    } catch (e) {
      console.error('Admin CAI course fetch error:', e);
    }
  }

  return <AdminAcademyClient initialCourse={initialCourse} />;
}
