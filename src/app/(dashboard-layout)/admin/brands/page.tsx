import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import BrandMasterClient from '@/components/admin/BrandMasterClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brands Master — Ayurwed Admin',
  description: 'Manage Ayurvedic commercial brands, licenses, and verified certifications.',
};

export const revalidate = 0;

export default async function AdminBrandsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const brands = await db.manufacturer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  });

  const safeBrands = brands.map((b) => ({
    ...b,
    certifications: (() => { try { return JSON.parse(b.certifications || '[]'); } catch { return []; } })(),
  }));

  return <BrandMasterClient initialBrands={safeBrands} />;
}
