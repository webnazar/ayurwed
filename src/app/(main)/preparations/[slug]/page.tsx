import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductInteraction from '@/components/products/ProductInteraction';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

interface ProductDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: 'Product Not Found | AYURWED' };
  return {
    title: `${product.name} | AYURWED`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      manufacturer: {
        select: {
          id: true, companyName: true, slug: true,
          website: true, contactEmail: true, contactPhone: true, isVerified: true,
        },
      },
    },
  });

  if (!product || !product.isActive) notFound();

  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    mrp: product.mrp ? Number(product.mrp) : null,
    images: Array.isArray(product.images) ? (product.images as string[]) : [],
    ingredients: Array.isArray(product.ingredients) ? (product.ingredients as string[]) : [],
    benefits: Array.isArray(product.benefits) ? (product.benefits as string[]) : [],
    usage: product.usage,
    isSponsored: product.isSponsored,
    isFeatured: product.isFeatured,
    isShopProduct: product.isShopProduct,
    manufacturer: product.manufacturer as any,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
        <Link href="/" className="hover:text-brand-green">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/preparations" className="hover:text-brand-green">Preparations</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-brand-green font-semibold line-clamp-1">{product.name}</span>
      </div>

      <Link href="/preparations" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Preparations
      </Link>

      <ProductInteraction product={productData} />

      {/* Disclaimer */}
      <div className="bg-brand-green-light/40 border border-brand-green-border/20 rounded-3xl p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
        <div className="bg-brand-green p-3 rounded-2xl text-white flex-shrink-0">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-brand-green">Ayurvedic Health Advisory</h4>
          <p className="text-xs sm:text-sm text-brand-foreground/70 leading-relaxed">
            AYURWED is an information and discovery platform. We do not sell products directly. Individual body constitutions (Prakriti) respond differently to preparations. Please consult a certified Ayurvedic practitioner before use.
          </p>
        </div>
      </div>
    </div>
  );
}
