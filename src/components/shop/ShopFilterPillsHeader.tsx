'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Search, SlidersHorizontal, X, ShoppingBag, Tag, Building2,
  ArrowUpDown, Check, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, CircleDollarSign, Filter, ChevronDown
} from 'lucide-react';
import { SYMPTOM_QUICK_CHIPS } from '@/lib/constants';

export type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'newest';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured',   label: 'Featured First' },
  { key: 'price_asc',  label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'name_asc',   label: 'Name: A → Z' },
  { key: 'newest',     label: 'Newest First' },
];

export const PREPARATION_TYPE_OPTIONS = [
  { id: '', label: 'All Types' },
  { id: 'READY_PRODUCT', label: 'Ready Products' },
  { id: 'CAPSULE', label: 'Capsules' },
  { id: 'TABLET', label: 'Tablets' },
  { id: 'POWDER', label: 'Powders (Churna)' },
  { id: 'LIQUID_EXTRACT', label: 'Liquid Extracts' },
  { id: 'OIL', label: 'Ayurvedic Oils' },
  { id: 'CREAM', label: 'Creams & Ointments' },
];

interface ProductSummary {
  category: string | null;
  sellingPrice: number;
  stock: number;
  isFeatured: boolean;
}

interface ManufacturerSummary {
  id: number;
  companyName: string;
}

interface ShopFilterPillsHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedCats: string[];
  toggleCat: (c: string) => void;
  setSelectedCats: (cats: string[]) => void;
  selectedMfr: number;
  setSelectedMfr: (mfrId: number) => void;
  selectedSymptoms: string[];
  toggleSymptom: (s: string) => void;
  setSelectedSymptoms: (syms: string[]) => void;
  symptomMatchMode: 'OR' | 'AND';
  setSymptomMatchMode: (m: 'OR' | 'AND') => void;
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  inStockOnly: boolean;
  setInStockOnly: React.Dispatch<React.SetStateAction<boolean>>;
  priceMax: number;
  setPriceMax: (p: number) => void;
  maxPrice: number;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  activeFilterCount: number;
  clearFilters: () => void;
  categories: string[];
  manufacturers: ManufacturerSummary[];
  products: ProductSummary[];
  openCart: () => void;
  totalItems: number;
}

// ── Searchable Category Combobox (Type-to-Filter Dropdown) ──
function SearchableCategorySelect({
  categories,
  selectedCats,
  toggleCat,
  setSelectedCats,
  catCounts,
}: {
  categories: string[];
  selectedCats: string[];
  toggleCat: (cat: string) => void;
  setSelectedCats: (cats: string[]) => void;
  catCounts: Record<string, number>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    return categories.filter(c => c.toLowerCase().includes(query.toLowerCase()));
  }, [categories, query]);

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3.5 py-2.5 bg-card border rounded-2xl text-xs font-bold focus:outline-none transition-colors shadow-xs ${
          selectedCats.length > 0
            ? 'border-brand-green text-brand-green bg-brand-green-light/40'
            : 'border-border text-foreground/70 hover:border-brand-green/40'
        }`}
      >
        <Tag className="h-3.5 w-3.5 text-brand-green" />
        <span>
          {selectedCats.length === 0
            ? 'Category'
            : selectedCats.length === 1
              ? selectedCats[0]
              : `${selectedCats.length} Categories`}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-foreground/40" />
      </button>

      {isOpen && (
        <div className="absolute z-[100] left-0 mt-1.5 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-foreground/40 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to filter categories..."
              className="w-full bg-transparent text-xs text-foreground focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-foreground/40 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 text-xs">
            <button
              type="button"
              onClick={() => { setSelectedCats([]); setIsOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors font-bold ${
                selectedCats.length === 0 ? 'bg-brand-green text-white' : 'text-foreground/70 hover:bg-muted'
              }`}
            >
              All Categories
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-foreground/40 text-center">No categories match &quot;{query}&quot;</div>
            ) : (
              filtered.map(cat => {
                const isSelected = selectedCats.includes(cat);
                const count = catCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between font-semibold ${
                      isSelected
                        ? 'bg-brand-green-light text-brand-green font-bold border border-brand-green/30'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {count > 0 && (
                        <span className="text-[10px] text-foreground/50 bg-muted px-1.5 py-0.2 rounded-full font-mono">
                          {count}
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-brand-green" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Searchable Manufacturer Combobox ──
function SearchableManufacturerSelect({
  manufacturers,
  selectedMfr,
  setSelectedMfr,
}: {
  manufacturers: ManufacturerSummary[];
  selectedMfr: number;
  setSelectedMfr: (mfrId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return manufacturers;
    return manufacturers.filter(m => m.companyName.toLowerCase().includes(query.toLowerCase()));
  }, [manufacturers, query]);

  const selectedMfrName = manufacturers.find(m => m.id === selectedMfr)?.companyName;

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3.5 py-2.5 bg-card border rounded-2xl text-xs font-bold focus:outline-none transition-colors shadow-xs ${
          selectedMfr > 0
            ? 'border-brand-gold text-brand-gold-dark bg-brand-gold-light/40'
            : 'border-border text-foreground/70 hover:border-brand-gold/40'
        }`}
      >
        <Building2 className="h-3.5 w-3.5 text-brand-gold-dark" />
        <span>{selectedMfr > 0 ? selectedMfrName : 'Brand'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-foreground/40" />
      </button>

      {isOpen && (
        <div className="absolute z-[100] left-0 mt-1.5 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-foreground/40 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to filter brands..."
              className="w-full bg-transparent text-xs text-foreground focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-foreground/40 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 text-xs">
            <button
              type="button"
              onClick={() => { setSelectedMfr(0); setIsOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors font-bold ${
                selectedMfr === 0 ? 'bg-brand-gold text-brand-green-dark' : 'text-foreground/70 hover:bg-muted'
              }`}
            >
              All Brands
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-foreground/40 text-center">No brands match &quot;{query}&quot;</div>
            ) : (
              filtered.map(mfr => {
                const isSelected = selectedMfr === mfr.id;
                return (
                  <button
                    key={mfr.id}
                    type="button"
                    onClick={() => { setSelectedMfr(isSelected ? 0 : mfr.id); setIsOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between font-semibold ${
                      isSelected
                        ? 'bg-brand-gold-light text-brand-gold-dark font-bold border border-brand-gold/30'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <span className="truncate pr-2">{mfr.companyName}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-brand-gold-dark" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopFilterPillsHeader({
  search, setSearch,
  selectedType, setSelectedType,
  selectedCats, toggleCat, setSelectedCats,
  selectedMfr, setSelectedMfr,
  selectedSymptoms, toggleSymptom, setSelectedSymptoms,
  symptomMatchMode, setSymptomMatchMode,
  sortKey, setSortKey,
  inStockOnly, setInStockOnly,
  priceMax, setPriceMax, maxPrice,
  showSidebar, setShowSidebar,
  activeFilterCount, clearFilters,
  categories, manufacturers, products,
  openCart, totalItems,
}: ShopFilterPillsHeaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const catCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(c => { counts[c] = 0; });
    products.forEach(p => {
      if (p.category) {
        if (counts[p.category] !== undefined) {
          counts[p.category] += 1;
        } else {
          const match = categories.find(cat => {
            const catNorm = cat.toLowerCase().replace(/[^a-z0-9]+/g, '');
            const prodCatNorm = p.category!.toLowerCase().replace(/[^a-z0-9]+/g, '');
            return catNorm === prodCatNorm || catNorm.includes(prodCatNorm) || prodCatNorm.includes(catNorm);
          });
          if (match) {
            counts[match] = (counts[match] || 0) + 1;
          } else {
            counts[p.category] = (counts[p.category] || 0) + 1;
          }
        }
      }
    });
    return counts;
  }, [products, categories]);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -260 : 260;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const isUnder500 = priceMax <= 500;
  const toggleUnder500 = () => {
    if (isUnder500) {
      setPriceMax(maxPrice);
    } else {
      setPriceMax(Math.min(500, maxPrice));
    }
  };

  return (
    <div className="sticky top-16 sm:top-20 z-40 bg-background/95 backdrop-blur-md pt-2 pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-border/80 shadow-xs transition-all relative">
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-2.5">

        {/* Embedded Type-to-Filter Search Input */}
        <div className="relative flex-1 flex items-center bg-card border border-border rounded-2xl shadow-xs focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/20 transition-all">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by title, category, herb, or symptom..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-xs sm:text-sm focus:outline-none text-foreground placeholder:text-foreground/40"
          />

          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/40 hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Searchable Category + Manufacturer + Sort + Cart */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-visible z-50">
          {/* Searchable Category Combobox */}
          <SearchableCategorySelect
            categories={categories}
            selectedCats={selectedCats}
            toggleCat={toggleCat}
            setSelectedCats={setSelectedCats}
            catCounts={catCounts}
          />

          {/* Searchable Manufacturer Combobox */}
          <SearchableManufacturerSelect
            manufacturers={manufacturers}
            selectedMfr={selectedMfr}
            setSelectedMfr={setSelectedMfr}
          />

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/50 pointer-events-none" />
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="pl-8 pr-7 py-2.5 bg-card border border-border rounded-2xl text-xs focus:outline-none focus:border-brand-gold appearance-none text-foreground font-bold cursor-pointer shadow-xs hover:border-brand-green/40 transition-colors"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 bg-brand-green text-white px-3.5 py-2.5 rounded-2xl font-bold text-xs hover:bg-brand-gold hover:text-brand-green transition-all shadow-xs flex-shrink-0"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center -mr-1 animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border/50 text-xs">
          <span className="text-foreground/50 font-medium text-[11px] uppercase tracking-wider">
            Active Filters:
          </span>

          {selectedCats.map(c => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 bg-brand-green-light text-brand-green font-bold px-2.5 py-0.5 rounded-full border border-brand-green/20 text-xs"
            >
              <Tag className="h-3 w-3" />
              {c}
              <button
                onClick={() => toggleCat(c)}
                className="hover:bg-brand-green/10 rounded-full p-0.5 transition-colors"
                title={`Remove ${c}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {selectedSymptoms.map(sym => (
            <span
              key={sym}
              className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 text-xs"
            >
              <span>🩺</span>
              {sym}
              <button
                onClick={() => toggleSymptom(sym)}
                className="hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
                title={`Remove ${sym}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {selectedMfr > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-brand-gold-light text-brand-gold-dark font-bold px-2.5 py-0.5 rounded-full border border-brand-gold/20 text-xs">
              <Building2 className="h-3 w-3" />
              {manufacturers.find(m => m.id === selectedMfr)?.companyName}
              <button
                onClick={() => setSelectedMfr(0)}
                className="hover:bg-brand-gold/10 rounded-full p-0.5 transition-colors"
                title="Remove Brand filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-xs">
              In Stock Only
              <button
                onClick={() => setInStockOnly(false)}
                className="hover:bg-emerald-200/50 rounded-full p-0.5 transition-colors"
                title="Remove In Stock filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {priceMax < maxPrice && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 text-xs">
              ≤ ₹{priceMax.toLocaleString('en-IN')}
              <button
                onClick={() => setPriceMax(maxPrice)}
                className="hover:bg-amber-200/50 rounded-full p-0.5 transition-colors"
                title="Reset price limit"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline ml-auto flex items-center gap-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
