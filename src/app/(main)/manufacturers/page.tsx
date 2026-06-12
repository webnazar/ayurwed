import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Building2, CheckCircle2, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import { Metadata } from 'next';
import ManufacturerFilterSidebarClient from '@/components/manufacturers/ManufacturerFilterSidebarClient';

export const revalidate = 0;
export const metadata: Metadata = {
  title: 'Ayurvedic Manufacturers | AYURWED',
  description: 'Discover verified Ayurvedic manufacturers and brands on India\'s Ayurveda Discovery Platform.',
};

interface ManufacturersPageProps {
  searchParams: { search?: string; category?: string };
}

export default async function ManufacturersPage({ searchParams }: ManufacturersPageProps) {
  const search = searchParams.search || '';
  const selectedCategorySlugs = searchParams.category ? searchParams.category.split(',') : [];

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } });

  const where: any = { user: { isActive: true } };
  if (search) where.companyName = { contains: search };
  
  if (selectedCategorySlugs.length > 0) {
    where.products = { some: { category: { slug: { in: selectedCategorySlugs } } } };
  }

  const manufacturers = await db.manufacturerProfile.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { isPremium: 'desc' }, { companyName: 'asc' }],
    include: {
      user: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">
          Ayurvedic Manufacturers
        </h1>
        <p className="text-sm sm:text-base text-brand-foreground/70 whitespace-nowrap overflow-hidden text-ellipsis">
          Discover verified manufacturers, explore catalogs, and connect directly — no intermediaries.
        </p>
      </div>

      {/* Global Search */}
      <form method="GET" action="/manufacturers" className="relative mt-8 w-full mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-foreground/40" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search manufacturers by company name..."
          className="w-full bg-white text-brand-foreground text-sm sm:text-base border border-brand-green-border/20 rounded-full py-4 pl-12 pr-6 shadow-sm focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all"
        />
        {selectedCategorySlugs.length > 0 && (
          <input type="hidden" name="category" value={selectedCategorySlugs.join(',')} />
        )}
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold hover:text-brand-green transition-colors">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1">
          <ManufacturerFilterSidebarClient
            categories={categories}
            initialSearch={search}
            initialCategories={selectedCategorySlugs}
          />
        </aside>

        {/* Manufacturer Grid */}
        <main className="lg:col-span-3">
          {manufacturers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {manufacturers.map((mfr) => (
                <Link key={mfr.id} href={`/manufacturers/${mfr.slug}`}
                  className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col space-y-4 relative overflow-hidden">
                  {/* Tier badge */}
                  {mfr.isFeatured && (
                    <span className="absolute top-4 right-4 bg-brand-gold text-brand-green text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> Featured
                    </span>
                  )}
                  {/* Logo placeholder */}
                  <div className="h-16 w-16 rounded-2xl bg-brand-green-light flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-brand-green" />
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-extrabold text-brand-green text-base group-hover:text-brand-gold transition-colors">{mfr.companyName}</h2>
                      {mfr.isVerified && <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-brand-foreground/60 line-clamp-3">{mfr.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-brand-green-light text-xs">
                    <span className="text-brand-foreground/50 font-medium">{mfr._count.products} preparation{mfr._count.products !== 1 ? 's' : ''}</span>
                    <span className="text-brand-gold font-bold group-hover:text-brand-green">View Profile →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
              <Building2 className="h-12 w-12 text-brand-foreground/30 mx-auto" />
              <h3 className="text-xl font-bold text-brand-green">No Manufacturers Found</h3>
              <Link href="/manufacturers" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold">
                Clear Filters
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
