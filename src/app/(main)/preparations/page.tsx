import React from 'react';
import { db } from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { Sparkles, Search } from 'lucide-react';
import FilterSidebarClient from '@/components/products/FilterSidebarClient';

export const revalidate = 0; // Ensure fresh data on search & filter change

interface ProductsPageProps {
  searchParams: {
    category?: string;
    indication?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const searchKeyword = searchParams.search || '';
  
  // Parse comma-separated strings into arrays for multi-select
  const selectedCategorySlugs = searchParams.category ? searchParams.category.split(',') : [];
  const selectedIndicationSlugs = searchParams.indication ? searchParams.indication.split(',') : [];

  // 1. Fetch categories and indications for filter sidebar
  const [categories, indications] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.indication.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  ]);

  // 2. Build Prisma where conditions
  const whereConditions: any = { isActive: true, isShopProduct: false };

  if (selectedCategorySlugs.length > 0) {
    whereConditions.category = { slug: { in: selectedCategorySlugs } };
  }

  if (selectedIndicationSlugs.length > 0) {
    whereConditions.indications = { some: { slug: { in: selectedIndicationSlugs } } };
  }

  if (searchKeyword) {
    whereConditions.OR = [
      { name: { contains: searchKeyword } },
      { description: { contains: searchKeyword } },
      { category: { name: { contains: searchKeyword } } },
      { indications: { some: { name: { contains: searchKeyword } } } }
    ];
  }

  // 3. Fetch products
  const products = await db.product.findMany({
    where: whereConditions,
    orderBy: { id: 'desc' },
    include: { category: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="space-y-4 text-center sm:text-left pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">
          Ayurvedic Preparations
        </h1>
        <p className="text-sm sm:text-base text-brand-foreground/70">
          Pure adaptogenic herbs, nourishing oils, and daily rejuvenators sourced from AYUSH certified manufacturers.
        </p>

        {/* Global Search */}
        <form method="GET" action="/preparations" className="relative mt-8 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-foreground/40" />
          <input
            type="text"
            name="search"
            defaultValue={searchKeyword}
            placeholder="Search all preparations by name or benefit..."
            className="w-full bg-white text-brand-foreground text-sm sm:text-base border border-brand-green-border/20 rounded-full py-4 pl-12 pr-6 shadow-sm focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all"
          />
          {selectedCategorySlugs.length > 0 && (
            <input type="hidden" name="category" value={selectedCategorySlugs.join(',')} />
          )}
          {selectedIndicationSlugs.length > 0 && (
            <input type="hidden" name="indication" value={selectedIndicationSlugs.join(',')} />
          )}
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold hover:text-brand-green transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
        {/* Sidebar Filters (Desktop) */}
        <aside className="lg:col-span-1">
          <FilterSidebarClient
            categories={categories}
            indications={indications}
            initialSearch={searchKeyword}
            initialCategories={selectedCategorySlugs}
            initialIndications={selectedIndicationSlugs}
          />
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
              <Sparkles className="h-12 w-12 text-brand-gold mx-auto animate-pulse-slow" />
              <h3 className="text-xl font-bold text-brand-green">No Preparations Found</h3>
              <p className="text-brand-foreground/60 text-sm max-w-sm mx-auto">
                We couldn't find any preparations matching your filter. Try adjusting your query or category search.
              </p>
              <Link
                href="/preparations"
                className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold hover:text-brand-green transition-colors duration-200"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
