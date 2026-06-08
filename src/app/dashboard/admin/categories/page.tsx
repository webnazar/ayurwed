import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import CategoryMasterClient from '@/components/admin/CategoryMasterClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  const categories = await db.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  // Serialize for client component
  const serialized = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    parentId: c.parentId,
    parent: c.parent,
    children: c.children,
    _count: c._count,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Category Master</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Manage product categories and sub-categories. Categories are required before adding products.
        </p>
      </div>

      <CategoryMasterClient initialCategories={serialized} />
    </div>
  );
}
