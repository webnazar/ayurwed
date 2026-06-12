'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, Search, Check } from 'lucide-react';

interface ManufacturerFilterSidebarClientProps {
  categories: { id: number; name: string; slug: string }[];
  initialSearch: string;
  initialCategories: string[];
}

export default function ManufacturerFilterSidebarClient({
  categories,
  initialSearch,
  initialCategories,
}: ManufacturerFilterSidebarClientProps) {
  const router = useRouter();
  
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategories);
  const [catSearch, setCatSearch] = useState('');

  const applyFilters = (newCats: string[]) => {
    const params = new URLSearchParams();
    if (initialSearch) params.set('search', initialSearch); // Persist global search
    if (newCats.length > 0) params.set('category', newCats.join(','));
    router.push(`/manufacturers?${params.toString()}`);
  };

  const toggleCategory = (slug: string) => {
    const next = selectedCats.includes(slug)
      ? selectedCats.filter(s => s !== slug)
      : [...selectedCats, slug];
    setSelectedCats(next);
    applyFilters(next);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-brand-green font-bold border-b border-brand-green-light pb-3">
        <SlidersHorizontal className="h-5 w-5" />
        <span>Filters</span>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-green">Product Categories</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-foreground/40" />
          <input
            type="text"
            placeholder="Find categories..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            className="w-full bg-brand-green-light/20 text-brand-foreground text-xs border border-brand-green-border/10 rounded-lg py-1.5 pl-8 pr-3 focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.filter(cat => cat.name.toLowerCase().includes(catSearch.toLowerCase())).map((cat) => {
            const isSelected = selectedCats.includes(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-full transition-all duration-200 border ${
                  isSelected
                    ? 'bg-brand-green text-white border-brand-green shadow-md'
                    : 'bg-transparent text-brand-foreground/70 border-brand-green-border/20 hover:border-brand-green/50 hover:text-brand-green'
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
