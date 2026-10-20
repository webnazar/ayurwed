import React from 'react';
import { db } from '@/lib/db';
import ShopPageClient from '@/components/shop/ShopPageClient';
import type { Metadata } from 'next';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'AYURWED Shop — Authentic Classical Ayurvedic Medicines & Products',
  description: 'Browse authentic Ayurvedic products, classical herbal formulations, churnas, asavas, and wellness remedies from certified manufacturers. Fast delivery across India.',
  keywords: [
    'Ayurvedic store online',
    'Ayurveda medicines',
    'classical formulations',
    'herbal supplements India',
    'authentic Ayurveda products',
    'AYURWED Shop',
  ],
  alternates: {
    canonical: 'https://www.ayurwed.com/shop',
  },
  openGraph: {
    title: 'AYURWED Shop — Authentic Ayurvedic Medicines & Products',
    description: 'Browse authentic Ayurvedic products, classical herbal formulations, and remedies from certified manufacturers.',
    url: 'https://www.ayurwed.com/shop',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.ayurwed.com/icon.png',
        width: 512,
        height: 512,
        alt: 'AYURWED Shop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AYURWED Shop — Authentic Ayurvedic Medicines & Products',
    description: 'Browse authentic Ayurvedic products and remedies from certified manufacturers.',
    images: ['https://www.ayurwed.com/icon.png'],
  },
};

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage(props: ShopPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const categoryParam = typeof searchParams.category === 'string'
    ? searchParams.category
    : Array.isArray(searchParams.category)
      ? searchParams.category[0]
      : '';
  const searchParam = typeof searchParams.search === 'string'
    ? searchParams.search
    : Array.isArray(searchParams.search)
      ? searchParams.search[0]
      : '';

  const fetchIndications = async () => {
    try {
      return await db.indication.findMany({
        where: { isActive: true },
        select: { id: true, name: true, symptomsKeywords: true },
        orderBy: { name: 'asc' },
      });
    } catch {
      // Fallback for stale cached Prisma client
      const simple = await db.indication.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
      return simple.map(i => ({ ...i, symptomsKeywords: null }));
    }
  };

  const fetchSymptoms = async () => {
    try {
      if ((db as any).symptom) {
        return await (db as any).symptom.findMany({
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        });
      }
      return [];
    } catch {
      return [];
    }
  };

  const fetchShopProducts = async () => {
    try {
      return await db.product.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          manufacturer: { select: { id: true, companyName: true } },
          indications: { select: { id: true, name: true } },
          symptoms: { select: { id: true, name: true } },
          categoryRef: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch {
      const items = await db.product.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          manufacturer: { select: { id: true, companyName: true } },
          indications: { select: { id: true, name: true } },
        },
      });
      return items.map((item) => ({ ...item, symptoms: [], categoryRef: null }));
    }
  };

  const fetchCategories = async () => {
    try {
      return await db.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true },
      });
    } catch {
      return [];
    }
  };

  const [products, manufacturers, dbIndications, dbSymptoms, dbCategories] = await Promise.all([
    fetchShopProducts(),
    db.manufacturer.findMany({
      where: { isVerified: true },
      select: { id: true, companyName: true },
      orderBy: { companyName: 'asc' },
    }),
    fetchIndications(),
    fetchSymptoms(),
    fetchCategories(),
  ]);

  const safeProducts = products.map((p) => ({
    ...p,
    category: p.categoryRef?.name || p.category,
    mrp: Number(p.mrp),
    sellingPrice: Number(p.sellingPrice),
    images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
  }));

  const dbCategoryNames = dbCategories.map((c) => c.name);
  const fromDb = safeProducts.map((p) => p.category).filter(Boolean) as string[];
  const extra = fromDb.filter((c) => !dbCategoryNames.includes(c));
  const categories = dbCategoryNames.length > 0
    ? [...dbCategoryNames, ...new Set(extra)]
    : [...PRODUCT_CATEGORIES, ...new Set(extra)];

  const indicationsList = dbIndications.flatMap((i) => {
    const list = [i.name];
    if (i.symptomsKeywords) {
      const keywords = i.symptomsKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      list.push(...keywords);
    }
    return list;
  });

  return (
    <ShopPageClient
      products={safeProducts}
      manufacturers={manufacturers}
      categories={categories}
      dbIndications={indicationsList}
      rawIndications={dbIndications}
      initialCategory={categoryParam}
      initialSearch={searchParam}
    />
  );
}
