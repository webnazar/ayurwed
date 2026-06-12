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
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Product Master</h1>
        <p className="dashboard-header-subtitle">
          Create, edit, and manage all Ayurvedic preparations listed on the platform.
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
