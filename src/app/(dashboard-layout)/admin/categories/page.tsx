import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import CategoryMasterClient from '@/components/admin/CategoryMasterClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Category & Formulations Master — Ayurwed Admin',
  description: 'Manage dynamic delivery formats, product categories, and classical formulation masters.',
};

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { products: true } },
    },
  });

  const safeCategories = categories.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <CategoryMasterClient initialCategories={safeCategories} />;
}
