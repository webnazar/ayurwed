import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductInteraction from '@/components/products/ProductInteraction';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ProductDetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const product = await db.preparation.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: 'Product Not Found | AYURWED' };
  return {
    title: `${product.name} | AYURWED`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage(props: ProductDetailPageProps) {
  const params = await props.params;
  const product = await db.preparation.findUnique({
    where: { slug: params.slug },
    include: { indications: true }
  });

  if (!product || !product.isActive) notFound();

  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    mrp: product.mrp ? Number(product.mrp) : null,
    images: (() => {
      try {
        const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    ingredients: (() => {
      try {
        const parsed = typeof product.ingredients === 'string' ? JSON.parse(product.ingredients) : (product.ingredients || []);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    benefits: (() => {
      try {
        const parsed = typeof product.benefits === 'string' ? JSON.parse(product.benefits) : (product.benefits || []);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    usage: product.usage,
    type: product.type,
    volume: product.volume,
    volumeUnit: product.volumeUnit,
    weight: product.weight,
    weightUnit: product.weightUnit,
    count: product.count,
    countUnit: product.countUnit,
    indications: product.indications ? product.indications.map(i => i.name) : [],
  };

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal py-10 space-y-8">
      {/* Navigation Row (Breadcrumbs & Back Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
          <Link href="/" className="hover:text-brand-green">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-brand-green font-semibold line-clamp-1">{product.name}</span>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <ProductInteraction preparation={productData} />

      {/* Disclaimer */}
      <div className="bg-brand-green-light/40 border border-border rounded-3xl p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
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
