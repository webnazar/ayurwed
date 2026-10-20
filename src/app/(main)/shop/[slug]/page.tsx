import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/shop/ProductDetailClient';

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { manufacturer: { select: { companyName: true } } },
  });

  if (!product) return { title: 'Product Not Found | AYURWED' };

  const baseUrl = 'https://www.ayurwed.com';
  const pageUrl = `${baseUrl}/shop/${slug}`;
  const desc =
    product.shortDesc ||
    product.description?.replace(/<[^>]+>/g, '').slice(0, 160) ||
    `Buy authentic ${product.name} on AYURWED. 100% genuine Ayurvedic formulation with clinical quality verification.`;

  // Parse images to get high-resolution product image for OG
  let imageUrl = `${baseUrl}/icon.png`;
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        const first = parsed[0].trim();
        if (first && first !== '/placeholder-product.png') {
          imageUrl = first.startsWith('http') ? first : `${baseUrl}${first.startsWith('/') ? '' : '/'}${first}`;
        }
      }
    } catch {
      if (product.images.trim() && !product.images.startsWith('[') && !product.images.startsWith('{')) {
        const clean = product.images.trim();
        imageUrl = clean.startsWith('http') ? clean : `${baseUrl}${clean.startsWith('/') ? '' : '/'}${clean}`;
      }
    }
  }

  const brandName = product.manufacturer?.companyName || 'AYURWED';
  const title = `${product.name} by ${brandName} — AYURWED Shop`;

  return {
    title,
    description: desc,
    keywords: [
      product.name,
      product.category || 'Ayurveda',
      brandName,
      'Ayurvedic medicine',
      'Classical Ayurvedic formulation',
      'AYURWED Shop',
      'Ancient Intelligence',
    ],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description: desc,
      url: pageUrl,
      siteName: 'AYURWED',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      manufacturer: true,
      indications: { select: { id: true, name: true } },
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
    include: {
      manufacturer: { select: { id: true, companyName: true } },
      indications: { select: { id: true, name: true } },
    },
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
