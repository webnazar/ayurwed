'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, Search, Check } from 'lucide-react';

interface FilterSidebarClientProps {
  categories: { id: number; name: string; slug: string }[];
  indications: { id: number; name: string; slug: string }[];
  initialSearch: string;
  initialCategories: string[];
  initialIndications: string[];
}

export default function FilterSidebarClient({
  categories,
  indications,
  initialSearch,
  initialCategories,
  initialIndications
}: FilterSidebarClientProps) {
  const router = useRouter();
  
  const [search, setSearch] = useState(initialSearch);
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategories);
  const [selectedInds, setSelectedInds] = useState<string[]>(initialIndications);
  const [indSearch, setIndSearch] = useState('');

  const applyFilters = (newSearch: string, newCats: string[], newInds: string[]) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCats.length > 0) params.set('category', newCats.join(','));
    if (newInds.length > 0) params.set('indication', newInds.join(','));
    router.push(`/preparations?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, selectedCats, selectedInds);
  };

  const toggleCategory = (slug: string) => {
    const next = selectedCats.includes(slug)
      ? selectedCats.filter(s => s !== slug)
      : [...selectedCats, slug];
    setSelectedCats(next);
    applyFilters(search, next, selectedInds);
  };

  const toggleIndication = (slug: string) => {
    const next = selectedInds.includes(slug)
      ? selectedInds.filter(s => s !== slug)
      : [...selectedInds, slug];
    setSelectedInds(next);
    applyFilters(search, selectedCats, next);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-brand-green font-bold border-b border-brand-green-light pb-3">
        <SlidersHorizontal className="h-5 w-5" />
        <span>Filters</span>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand-green">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
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

      {/* Indications Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-green">Indications</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-foreground/40" />
          <input
            type="text"
            placeholder="Find indications..."
            value={indSearch}
            onChange={(e) => setIndSearch(e.target.value)}
            className="w-full bg-brand-green-light/20 text-brand-foreground text-xs border border-brand-green-border/10 rounded-lg py-1.5 pl-8 pr-3 focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {indications.filter(ind => ind.name.toLowerCase().includes(indSearch.toLowerCase())).map((ind) => {
            const isSelected = selectedInds.includes(ind.slug);
            return (
              <button
                key={ind.id}
                onClick={() => toggleIndication(ind.slug)}
                className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-full transition-all duration-200 border ${
                  isSelected
                    ? 'bg-brand-green text-white border-brand-green shadow-md'
                    : 'bg-transparent text-brand-foreground/70 border-brand-green-border/20 hover:border-brand-green/50 hover:text-brand-green'
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {ind.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
