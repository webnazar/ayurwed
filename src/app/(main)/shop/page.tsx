import React from 'react';
import { db } from '@/lib/db';
import { Sparkles } from 'lucide-react';
import ShopInteractiveUI from '@/components/shop/ShopInteractiveUI';

export const revalidate = 0; // Ensure fresh data on search & filter change

interface ProductsPageProps {
  searchParams: {
    categories?: string;
    indications?: string;
    search?: string;
  };
}

export default async function ShopPage({ searchParams }: ProductsPageProps) {
  const searchKeyword = searchParams.search || '';
  const selectedCategories = searchParams.categories ? searchParams.categories.split(',') : [];
  const selectedIndications = searchParams.indications ? searchParams.indications.split(',') : [];

  // 1. Fetch data for filters
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });
  const indications = await db.indication.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // 2. Build Prisma where conditions
  const whereConditions: any = { isActive: true, isShopProduct: true };

  if (selectedCategories.length > 0) {
    whereConditions.category = { slug: { in: selectedCategories } };
  }

  if (selectedIndications.length > 0) {
    whereConditions.indications = { some: { slug: { in: selectedIndications } } };
  }

  if (searchKeyword) {
    whereConditions.name = { contains: searchKeyword };
  }

  // 3. Fetch products
  const products = await db.product.findMany({
    where: whereConditions,
    orderBy: { id: 'desc' },
    include: { category: true, indications: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="space-y-4 text-center sm:text-left pb-8">
        <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-brand-gold/30">
          <Sparkles className="h-3 w-3" />
          <span>Official AYURWED Products</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">
          AYURWED Exclusive Store
        </h1>
        <p className="text-sm sm:text-base text-brand-foreground/70">
          Premium preparations professionally manufactured, branded, and marketed exclusively by AYURWED.
        </p>
      </div>

      {/* Interactive Shop UI (Search, Sidebar Filters, Grid) */}
      <ShopInteractiveUI 
        categories={categories}
        indications={indications}
        products={products as any}
        initialSearch={searchKeyword}
        initialCategories={selectedCategories}
        initialIndications={selectedIndications}
      />
    </div>
  );
}
