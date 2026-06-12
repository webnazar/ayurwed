import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ManufacturerProductsClient from '@/components/manufacturer/ManufacturerProductsClient';

export const revalidate = 0;

export default async function ManufacturerProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'MANUFACTURER') redirect('/login');

  const profile = await db.manufacturerProfile.findUnique({ where: { userId: parseInt((session.user as any).id, 10) } });
  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-brand-green">Profile Not Set Up</h2>
        <p className="text-brand-foreground/60 text-sm">Contact admin to set up your manufacturer profile.</p>
      </div>
    );
  }

  const [products, categories, indications] = await Promise.all([
    db.product.findMany({
      where: { manufacturerId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true } }, indications: { select: { id: true, name: true } }, _count: { select: { reviews: true, enquiries: true } } },
    }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.indication.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">My Products</h1>
        <p className="dashboard-header-subtitle">
          Manage your Ayurvedic product listings. New submissions require admin approval before going live.
        </p>
      </div>
      <ManufacturerProductsClient
        initialProducts={products as any}
        categories={categories}
        indications={indications}
      />
    </div>
  );
}
