import React from 'react';
import { db } from '@/lib/db';
import ShopPageClient from '@/components/shop/ShopPageClient';
import type { Metadata } from 'next';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Ayurwed Shop — Authentic Ayurvedic Products',
  description: 'Browse certified Ayurvedic products from trusted manufacturers. Free shipping on orders above ₹500.',
};

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, manufacturers] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { manufacturer: { select: { id: true, companyName: true } } },
    }),
    db.manufacturer.findMany({
      where: { isVerified: true },
      select: { id: true, companyName: true },
      orderBy: { companyName: 'asc' },
    }),
  ]);

  const safeProducts = products.map((p) => ({
    ...p,
    mrp: Number(p.mrp),
    sellingPrice: Number(p.sellingPrice),
    images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
  }));

  const fromDb = products.map((p) => p.category).filter(Boolean) as string[];
  const extra = fromDb.filter((c) => !PRODUCT_CATEGORIES.includes(c));
  const categories = [...PRODUCT_CATEGORIES, ...new Set(extra)];

  return <ShopPageClient products={safeProducts} manufacturers={manufacturers} categories={categories} />;
}
