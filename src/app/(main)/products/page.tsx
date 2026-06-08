import React from 'react';
import { db } from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { Sparkles, SlidersHorizontal, Search } from 'lucide-react';

export const revalidate = 0; // Ensure fresh data on search & filter change

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const selectedCategorySlug = searchParams.category || '';
  const searchKeyword = searchParams.search || '';

  // 1. Fetch all categories for filter sidebar
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  // 2. Build Prisma where conditions
  const whereConditions: any = { isActive: true };

  if (selectedCategorySlug) {
    whereConditions.category = { slug: selectedCategorySlug };
  }

  if (searchKeyword) {
    whereConditions.name = { contains: searchKeyword };
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
      <div className="space-y-4 text-center sm:text-left border-b border-brand-green-border/10 pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">
          Ayurvedic Formulations
        </h1>
        <p className="text-sm sm:text-base text-brand-foreground/70">
          Pure adaptogenic herbs, nourishing oils, and daily rejuvenators sourced from AYUSH certified manufacturers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
        {/* Sidebar Filters (Desktop) */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-brand-green font-bold border-b border-brand-green-light pb-3">
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </div>

            {/* Search Input (Simulated via GET Form) */}
            <form method="GET" action="/products" className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchKeyword}
                placeholder="Search formulations..."
                className="w-full bg-brand-green-light/40 text-brand-foreground placeholder-brand-foreground/40 text-sm border border-brand-green-border/10 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-brand-gold"
              />
              {selectedCategorySlug && (
                <input type="hidden" name="category" value={selectedCategorySlug} />
              )}
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-green">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-green">Categories</h3>
              <div className="flex flex-col space-y-2">
                <Link
                  href="/products"
                  className={`text-sm py-1.5 px-3 rounded-full transition-colors ${
                    !selectedCategorySlug
                      ? 'bg-brand-green text-white font-semibold'
                      : 'text-brand-foreground/80 hover:bg-brand-green-light hover:text-brand-green'
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}${searchKeyword ? `&search=${searchKeyword}` : ''}`}
                    className={`text-sm py-1.5 px-3 rounded-full transition-colors line-clamp-1 ${
                      selectedCategorySlug === cat.slug
                        ? 'bg-brand-green text-white font-semibold'
                        : 'text-brand-foreground/80 hover:bg-brand-green-light hover:text-brand-green'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
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
              <h3 className="text-xl font-bold text-brand-green">No Formulations Found</h3>
              <p className="text-brand-foreground/60 text-sm max-w-sm mx-auto">
                We couldn't find any formulations matching your filter. Try adjusting your query or category search.
              </p>
              <Link
                href="/products"
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
