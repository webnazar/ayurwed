import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProductApprovalsClient from '@/components/admin/ProductApprovalsClient';

export const revalidate = 0; // Dynamic rendering to fetch latest submissions

export default async function AdminApprovalsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch all products with category and manufacturer relations
  const products = await db.product.findMany({
    include: {
      category: { select: { name: true } },
      manufacturer: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize product decimal values & dates to make them serializable for client component props
  const serializedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    ingredients: product.ingredients,
    benefits: product.benefits,
    usage: product.usage,
    mrp: product.mrp ? product.mrp.toString() : null,
    isSponsored: product.isSponsored,
    images: product.images,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    category: product.category,
    manufacturer: product.manufacturer,
    createdAt: product.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Product Submissions & Approvals</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Review premium ayurvedic formulations submitted by manufacturers, toggle live shop status, and select featured items.
        </p>
      </div>

      <ProductApprovalsClient initialProducts={serializedProducts} />
    </div>
  );
}
