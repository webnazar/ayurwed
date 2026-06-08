import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProductMasterClient from '@/components/admin/ProductMasterClient';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [products, categories, manufacturers, indications] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, companyName: true } },
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.manufacturerProfile.findMany({ orderBy: { companyName: 'asc' } }),
    db.indication.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Product Master</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Create, edit, and manage all Ayurvedic formulations listed on the platform.
        </p>
      </div>
      <ProductMasterClient
        initialProducts={products as any}
        categories={categories}
        manufacturers={manufacturers}
        indications={indications}
      />
    </div>
  );
}
