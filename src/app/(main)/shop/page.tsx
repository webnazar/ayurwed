import React from 'react';
import { db } from '@/lib/db';
import ShopPageClient from '@/components/shop/ShopPageClient';
import type { Metadata } from 'next';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { serialize } from '@/lib/utils';

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
  let searchParams: { [key: string]: string | string[] | undefined } = {};
  try {
    searchParams = props.searchParams ? await props.searchParams : {};
  } catch (err) {
    console.error('Error reading searchParams in ShopPage:', err);
  }

  const categoryParam = typeof searchParams.category === 'string'
    ? searchParams.category
    : Array.isArray(searchParams.category)
      ? searchParams.category[0] || ''
      : '';
  const searchParam = typeof searchParams.search === 'string'
    ? searchParams.search
    : Array.isArray(searchParams.search)
      ? searchParams.search[0] || ''
      : '';

  let products: any[] = [];
  let manufacturers: any[] = [];
  let dbIndications: any[] = [];
  let dbSymptoms: any[] = [];
  let dbCategories: any[] = [];

  try {
    // 1. Fetch shop products safely
    try {
      products = await db.product.findMany({
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
      try {
        const items = await db.product.findMany({
          where: { isActive: true },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          include: {
            manufacturer: { select: { id: true, companyName: true } },
            indications: { select: { id: true, name: true } },
          },
        });
        products = items.map((item) => ({ ...item, symptoms: [], categoryRef: null }));
      } catch {
        products = [];
      }
    }

    // 2. Fetch verified manufacturers safely
    try {
      manufacturers = await db.manufacturer.findMany({
        where: { isVerified: true },
        select: { id: true, companyName: true },
        orderBy: { companyName: 'asc' },
      });
    } catch (err) {
      console.error('Error fetching manufacturers on ShopPage:', err);
      manufacturers = [];
    }

    // 3. Fetch indications safely
    try {
      dbIndications = await db.indication.findMany({
        where: { isActive: true },
        select: { id: true, name: true, symptomsKeywords: true },
        orderBy: { name: 'asc' },
      });
    } catch {
      try {
        const simple = await db.indication.findMany({
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        });
        dbIndications = simple.map((i) => ({ ...i, symptomsKeywords: null }));
      } catch {
        dbIndications = [];
      }
    }

    // 4. Fetch symptoms safely
    try {
      if ((db as any).symptom) {
        dbSymptoms = await (db as any).symptom.findMany({
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        });
      }
    } catch {
      dbSymptoms = [];
    }

    // 5. Fetch dynamic categories safely
    try {
      dbCategories = await db.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true },
      });
    } catch {
      dbCategories = [];
    }
  } catch (globalDbErr) {
    console.error('Global DB error on ShopPage:', globalDbErr);
  }

  // Sanitize products to plain JSON primitives (no Decimal / Date object leakage to client component)
  const safeProducts = (products || []).map((p) => ({
    id: p.id,
    name: p.name || '',
    slug: p.slug || '',
    shortDesc: p.shortDesc || null,
    botanicalName: p.botanicalName || null,
    type: p.type || null,
    category: p.categoryRef?.name || p.category || null,
    mrp: Number(p.mrp) || 0,
    sellingPrice: Number(p.sellingPrice) || 0,
    stock: typeof p.stock === 'number' ? p.stock : 0,
    unit: p.unit || null,
    images: (() => {
      try {
        if (Array.isArray(p.images)) return p.images;
        if (typeof p.images === 'string') return JSON.parse(p.images || '[]');
        return [];
      } catch {
        return [];
      }
    })(),
    isFeatured: Boolean(p.isFeatured),
    tags: p.tags || null,
    manufacturer: p.manufacturer ? { id: p.manufacturer.id, companyName: p.manufacturer.companyName } : null,
    indications: Array.isArray(p.indications) ? p.indications.map((ind: any) => ({ id: ind.id, name: ind.name })) : [],
  }));

  const dbCategoryNames = (dbCategories || []).map((c) => c?.name).filter(Boolean);
  const fromDb = safeProducts.map((p) => p.category).filter(Boolean) as string[];
  const extra = fromDb.filter((c) => !dbCategoryNames.includes(c));
  const categories = dbCategoryNames.length > 0
    ? [...dbCategoryNames, ...new Set(extra)]
    : [...PRODUCT_CATEGORIES, ...new Set(extra)];

  const indicationsList = (dbIndications || []).flatMap((i) => {
    if (!i?.name) return [];
    const list = [i.name];
    if (i.symptomsKeywords && typeof i.symptomsKeywords === 'string') {
      const keywords = i.symptomsKeywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      list.push(...keywords);
    }
    return list;
  });

  return (
    <ShopPageClient
      products={serialize(safeProducts)}
      manufacturers={serialize(manufacturers || [])}
      categories={serialize(categories)}
      dbIndications={serialize(indicationsList)}
      rawIndications={serialize(dbIndications || [])}
      initialCategory={categoryParam}
      initialSearch={searchParam}
    />
  );
}
