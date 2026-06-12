'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Sparkles, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

interface ShopInteractiveUIProps {
  categories: any[];
  indications: any[];
  products: any[];
  initialSearch: string;
  initialCategories: string[];
  initialIndications: string[];
}

export default function ShopInteractiveUI({
  categories,
  indications,
  products,
  initialSearch,
  initialCategories,
  initialIndications,
}: ShopInteractiveUIProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedIndications, setSelectedIndications] = useState<string[]>(initialIndications);

  // Mini-search states
  const [categorySearch, setCategorySearch] = useState('');
  const [indicationSearch, setIndicationSearch] = useState('');

  // Update URL whenever filters change
  const updateFilters = (newSearch: string, newCats: string[], newInds: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch) params.set('search', newSearch);
    else params.delete('search');

    if (newCats.length > 0) params.set('categories', newCats.join(','));
    else params.delete('categories');

    if (newInds.length > 0) params.set('indications', newInds.join(','));
    else params.delete('indications');

    router.push(`/shop?${params.toString()}`);
  };

  // Debounced general search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== initialSearch) {
        updateFilters(search, selectedCategories, selectedIndications);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const toggleCategory = (slug: string) => {
    const updated = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(updated);
    updateFilters(search, updated, selectedIndications);
  };

  const toggleIndication = (slug: string) => {
    const updated = selectedIndications.includes(slug)
      ? selectedIndications.filter((i) => i !== slug)
      : [...selectedIndications, slug];
    setSelectedIndications(updated);
    updateFilters(search, selectedCategories, updated);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedIndications([]);
    router.push('/shop');
  };

  // Filtered lists for sidebar
  const filteredCategories = categories.filter((c) => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  
  const filteredIndications = indications.filter((i) => 
    i.name.toLowerCase().includes(indicationSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* General Search - Full Width */}
      <div className="relative w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name..."
          className="w-full bg-white text-brand-foreground placeholder-brand-foreground/40 text-lg border-2 border-brand-green-border/20 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-brand-gold shadow-sm transition-all duration-300 hover:shadow-md"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-green text-white p-2 rounded-full shadow">
          <Search className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between text-brand-green font-bold border-b border-brand-green-light pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filters</span>
              </div>
              {(selectedCategories.length > 0 || selectedIndications.length > 0 || search) && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-brand-gold-dark hover:text-brand-gold underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Multi-Select Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-green">Categories</h3>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-foreground/40" />
                <input
                  type="text"
                  placeholder="Find category..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full text-xs border border-brand-green-border/20 rounded-md py-1.5 pl-8 pr-3 focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.slug);
                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => toggleCategory(cat.slug)}
                      className="flex items-center space-x-3 cursor-pointer group py-0.5"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-brand-green border-brand-green' 
                          : 'border-brand-foreground/30 group-hover:border-brand-gold'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${
                        isSelected ? 'text-brand-green font-semibold' : 'text-brand-foreground/80 group-hover:text-brand-green'
                      }`}>
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
                {filteredCategories.length === 0 && (
                  <p className="text-xs text-brand-foreground/50 italic">No categories found.</p>
                )}
              </div>
            </div>

            <hr className="border-brand-green-border/10" />

            {/* Indication Multi-Select Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-green">Indications</h3>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-foreground/40" />
                <input
                  type="text"
                  placeholder="Find indication..."
                  value={indicationSearch}
                  onChange={(e) => setIndicationSearch(e.target.value)}
                  className="w-full text-xs border border-brand-green-border/20 rounded-md py-1.5 pl-8 pr-3 focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filteredIndications.map((ind) => {
                  const isSelected = selectedIndications.includes(ind.slug);
                  return (
                    <div 
                      key={ind.id} 
                      onClick={() => toggleIndication(ind.slug)}
                      className="flex items-center space-x-3 cursor-pointer group py-0.5"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-brand-gold border-brand-gold' 
                          : 'border-brand-foreground/30 group-hover:border-brand-gold'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-brand-green" />}
                      </div>
                      <span className={`text-sm transition-colors line-clamp-1 ${
                        isSelected ? 'text-brand-green font-semibold' : 'text-brand-foreground/80 group-hover:text-brand-green'
                      }`} title={ind.name}>
                        {ind.name}
                      </span>
                    </div>
                  );
                })}
                {filteredIndications.length === 0 && (
                  <p className="text-xs text-brand-foreground/50 italic">No indications found.</p>
                )}
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
              <h3 className="text-xl font-bold text-brand-green">No Preparations Found</h3>
              <p className="text-brand-foreground/60 text-sm max-w-sm mx-auto">
                We couldn't find any products matching your current filters. Try removing some selections.
              </p>
              <button
                onClick={clearFilters}
                className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold hover:text-brand-green transition-colors duration-200 mt-4"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}</style>
    </div>
  );
}
