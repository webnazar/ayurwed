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

  const [products, manufacturers] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { manufacturer: { select: { id: true, companyName: true, logo: true } } },
    }),
    db.manufacturer.findMany({
      orderBy: { companyName: 'asc' },
      select: { id: true, companyName: true, logo: true },
    }),
  ]);

  const safeProducts = products.map((p) => ({
    ...p,
    mrp: Number(p.mrp),
    sellingPrice: Number(p.sellingPrice),
    images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Product Master</h1>
        <p className="dashboard-header-subtitle">
          Manage shop products with pricing, inventory, images, and manufacturer details.
        </p>
      </div>
      <ProductMasterClient initialProducts={safeProducts} manufacturers={manufacturers} />
    </div>
  );
}
