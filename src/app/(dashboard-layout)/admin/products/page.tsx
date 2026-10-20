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

  const fetchSymptoms = async () => {
    try {
      if ((db as any).symptom) {
        return await (db as any).symptom.findMany({
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        });
      }
      return [];
    } catch {
      return [];
    }
  };

  const fetchAdminProducts = async () => {
    try {
      return await db.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          manufacturer: { select: { id: true, companyName: true, logo: true } },
          indications: { select: { id: true, name: true } },
          symptoms: { select: { id: true, name: true } },
        },
      });
    } catch {
      const items = await db.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          manufacturer: { select: { id: true, companyName: true, logo: true } },
          indications: { select: { id: true, name: true } },
        },
      });
      return items.map((item) => ({ ...item, symptoms: [] }));
    }
  };

  const [products, manufacturers, indications, symptoms, dbCategories] = await Promise.all([
    fetchAdminProducts(),
    db.manufacturer.findMany({
      orderBy: { companyName: 'asc' },
      select: { id: true, companyName: true, logo: true },
    }),
    db.indication.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    fetchSymptoms(),
    db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { name: true },
    }),
  ]);

  const safeProducts = products.map((p) => ({
    ...p,
    mrp: Number(p.mrp),
    sellingPrice: Number(p.sellingPrice),
    rating: Number(p.rating || 0),
    images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
  }));

  return (
    <ProductMasterClient
      initialProducts={safeProducts}
      manufacturers={manufacturers}
      indications={indications}
      symptoms={symptoms}
      dbCategories={dbCategories.map((c) => c.name)}
    />
  );
}
