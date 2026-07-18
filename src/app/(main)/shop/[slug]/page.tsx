import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/shop/ProductDetailClient';

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} — Ayurwed Shop`,
    description: product.shortDesc || product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      manufacturer: true,
      shopReviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!product) return notFound();

  // Related products
  const related = await db.product.findMany({
    where: { isActive: true, category: product.category, id: { not: product.id } },
    take: 4,
    include: { manufacturer: { select: { id: true, companyName: true } } },
  });

  const safeProduct = {
    ...product,
    mrp: Number(product.mrp),
    sellingPrice: Number(product.sellingPrice),
    images: (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })(),
    manufacturer: product.manufacturer ? {
      ...product.manufacturer,
      certifications: (() => { try { return JSON.parse(product.manufacturer!.certifications || '[]'); } catch { return []; } })(),
    } : null,
  };

  const safeRelated = related.map(r => ({
    ...r,
    mrp: Number(r.mrp),
    sellingPrice: Number(r.sellingPrice),
    images: (() => { try { return JSON.parse(r.images || '[]'); } catch { return []; } })(),
  }));

  return <ProductDetailClient product={safeProduct} related={safeRelated} />;
}
