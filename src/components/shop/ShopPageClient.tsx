'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, SlidersHorizontal, X, ShoppingBag, Tag, Building2,
  ArrowUpDown, CheckSquare, Square, ChevronDown, ChevronUp
} from 'lucide-react';
import ShopProductCard from './ShopProductCard';
import CartDrawer from './CartDrawer';
import { useCart } from './CartContext';

interface Product {
  id: number; name: string; slug: string; shortDesc: string | null; category: string | null;
  mrp: number; sellingPrice: number; stock: number; unit: string | null; images: string[];
  isFeatured: boolean; manufacturer?: { id: number; companyName: string } | null;
}
interface Manufacturer { id: number; companyName: string; }

type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'newest';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured',   label: 'Featured First' },
  { key: 'price_asc',  label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'name_asc',   label: 'Name: A → Z' },
  { key: 'newest',     label: 'Newest First' },
];

function discount(mrp: number, sp: number) {
  return mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;
}

export default function ShopPageClient({
  products, manufacturers, categories,
}: { products: Product[]; manufacturers: Manufacturer[]; categories: string[] }) {

  const [search, setSearch]             = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedMfr, setSelectedMfr]   = useState(0);
  const [sortKey, setSortKey]           = useState<SortKey>('featured');
  const [inStockOnly, setInStockOnly]   = useState(false);
  const [showSidebar, setShowSidebar]   = useState(true);
  const [catExpanded, setCatExpanded]   = useState(true);
  const [mfrExpanded, setMfrExpanded]   = useState(true);
  const [catSearch, setCatSearch]       = useState('');
  const [mfrSearch, setMfrSearch]       = useState('');
  const [visibleCount, setVisibleCount] = useState(9);
  const { openCart, totalItems } = useCart();

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Derive max price from products
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map(p => p.sellingPrice), 500) / 100) * 100, [products]);
  const [priceMax, setPriceMax] = useState<number>(maxPrice);

  const toggleCat = (c: string) =>
    setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const activeFilterCount = selectedCats.length + (selectedMfr ? 1 : 0) + (inStockOnly ? 1 : 0) + (priceMax < maxPrice ? 1 : 0);

  const clearFilters = () => {
    setSelectedCats([]); setSelectedMfr(0); setInStockOnly(false);
    setPriceMax(maxPrice); setSearch('');
    setCatSearch(''); setMfrSearch('');
    setVisibleCount(9);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDesc?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
    if (selectedCats.length) list = list.filter(p => p.category && selectedCats.includes(p.category));
    if (selectedMfr) list = list.filter(p => p.manufacturer?.id === selectedMfr);
    if (inStockOnly) list = list.filter(p => p.stock > 0);
    list = list.filter(p => p.sellingPrice <= priceMax);

    switch (sortKey) {
      case 'featured':   list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); break;
      case 'price_asc':  list.sort((a, b) => a.sellingPrice - b.sellingPrice); break;
      case 'price_desc': list.sort((a, b) => b.sellingPrice - a.sellingPrice); break;
      case 'name_asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest':     list.sort((a, b) => b.id - a.id); break;
    }
    return list;
  }, [products, search, selectedCats, selectedMfr, inStockOnly, priceMax, sortKey]);

  // Reset visible count when any filter changes
  useEffect(() => {
    setVisibleCount(9);
  }, [search, selectedCats, selectedMfr, inStockOnly, priceMax, sortKey]);

  // Infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount(prev => prev + 9);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [filtered.length, visibleCount]);

  const visibleProducts = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  /* ── Shared sidebar content ─────────────────────────────── */
  const FilterSidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-brand-green flex items-center gap-2 text-sm">
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {activeFilterCount > 0 && (
            <span className="bg-brand-green text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline font-bold flex items-center gap-1">
              <X className="h-3 w-3" /> Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors lg:hidden">
              <X className="h-4 w-4 text-foreground/60" />
            </button>
          )}
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div>
        <button
          onClick={() => setInStockOnly(v => !v)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-colors ${
            inStockOnly ? 'border-brand-green bg-brand-green-light/30 text-brand-green' : 'border-border text-foreground/60 hover:border-brand-green/40'
          }`}
        >
          {inStockOnly ? <CheckSquare className="h-4 w-4 flex-shrink-0" /> : <Square className="h-4 w-4 flex-shrink-0" />}
          In Stock Only
        </button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-xs font-extrabold text-foreground/60 uppercase tracking-widest">Price Range</label>
        <div className="px-1">
          <input
            type="range" min={0} max={maxPrice} step={50}
            value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))}
            className="w-full accent-brand-green cursor-pointer"
          />
          <div className="flex justify-between text-xs text-foreground/50 mt-1 font-semibold">
            <span>₹0</span>
            <span className="text-brand-green font-extrabold">up to ₹{priceMax.toLocaleString('en-IN')}</span>
            <span>₹{maxPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <button
          onClick={() => setCatExpanded(v => !v)}
          className="w-full flex items-center justify-between text-xs font-extrabold text-foreground/60 uppercase tracking-widest"
        >
          <span className="flex items-center gap-1.5"><Tag className="h-3 w-3" /> Category</span>
          {catExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {catExpanded && (
          <div className="space-y-2 pt-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-foreground/40" />
              <input
                type="text"
                placeholder="Search categories..."
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                className="w-full pl-7 pr-7 py-1.5 bg-muted/60 border border-border rounded-xl text-xs focus:outline-none focus:border-brand-green/40 text-foreground placeholder:text-foreground/40"
              />
              {catSearch && (
                <button onClick={() => setCatSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCats([])}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                  !selectedCats.length ? 'bg-brand-green text-white border-transparent' : 'border-border text-foreground/60 hover:border-brand-green'
                }`}
              >All</button>
              {categories
                .filter(c => c.toLowerCase().includes(catSearch.toLowerCase()))
                .map(c => (
                  <button key={c} onClick={() => toggleCat(c)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                      selectedCats.includes(c) ? 'bg-brand-green text-white border-transparent' : 'border-border text-foreground/60 hover:border-brand-green'
                    }`}
                  >{c}</button>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Manufacturer */}
      {manufacturers.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setMfrExpanded(v => !v)}
            className="w-full flex items-center justify-between text-xs font-extrabold text-foreground/60 uppercase tracking-widest"
          >
            <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Manufacturer</span>
            {mfrExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {mfrExpanded && (
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search manufacturers..."
                  value={mfrSearch}
                  onChange={e => setMfrSearch(e.target.value)}
                  className="w-full pl-7 pr-7 py-1.5 bg-muted/60 border border-border rounded-xl text-xs focus:outline-none focus:border-brand-green/40 text-foreground placeholder:text-foreground/40"
                />
                {mfrSearch && (
                  <button onClick={() => setMfrSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedMfr(0)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl text-left border transition-colors ${
                    !selectedMfr ? 'bg-brand-green text-white border-transparent' : 'border-border text-foreground/60 hover:border-brand-green'
                  }`}
                >All Manufacturers</button>
                {manufacturers
                  .filter(m => m.companyName.toLowerCase().includes(mfrSearch.toLowerCase()))
                  .map(m => (
                    <button key={m.id} onClick={() => setSelectedMfr(m.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl text-left border transition-colors ${
                        selectedMfr === m.id ? 'bg-brand-green text-white border-transparent' : 'border-border text-foreground/60 hover:border-brand-green'
                      }`}
                    >{m.companyName}</button>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <CartDrawer />

      <div className="min-h-screen bg-background">



        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {/* Search + Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-border">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                type="text" placeholder="Search products…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:border-brand-gold shadow-sm text-foreground placeholder:text-foreground/40" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" />
              <select
                value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                className="pl-9 pr-8 py-2.5 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:border-brand-gold appearance-none text-foreground font-semibold cursor-pointer shadow-sm w-full sm:w-52"
              >
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowSidebar(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm border transition-colors ${
                showSidebar ? 'bg-brand-green text-white border-brand-green' : 'bg-card border-border text-foreground/70 hover:border-brand-green'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showSidebar ? 'Hide Filters' : 'Filters'} {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>

            {/* Cart */}
            <button onClick={openCart}
              className="relative flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-2xl font-bold text-sm hover:bg-brand-gold hover:text-brand-green transition-colors shadow-sm">
              <ShoppingBag className="h-4 w-4" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedCats.map(c => (
                <span key={c} className="flex items-center gap-1.5 bg-brand-green-light text-brand-green text-xs font-bold px-3 py-1 rounded-full border border-brand-green/20">
                  <Tag className="h-3 w-3" />{c}
                  <button onClick={() => toggleCat(c)} className="hover:text-rose-500 transition-colors"><X className="h-3 w-3" /></button>
                </span>
              ))}
              {selectedMfr > 0 && (
                <span className="flex items-center gap-1.5 bg-brand-gold-light text-brand-gold-dark text-xs font-bold px-3 py-1 rounded-full border border-brand-gold/20">
                  <Building2 className="h-3 w-3" />{manufacturers.find(m => m.id === selectedMfr)?.companyName}
                  <button onClick={() => setSelectedMfr(0)} className="hover:text-rose-500 transition-colors"><X className="h-3 w-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  In Stock
                  <button onClick={() => setInStockOnly(false)} className="hover:text-rose-500 transition-colors"><X className="h-3 w-3" /></button>
                </span>
              )}
              {priceMax < maxPrice && (
                <span className="flex items-center gap-1.5 bg-muted text-foreground/70 text-xs font-bold px-3 py-1 rounded-full border border-border">
                  ≤ ₹{priceMax.toLocaleString('en-IN')}
                  <button onClick={() => setPriceMax(maxPrice)} className="hover:text-rose-500 transition-colors"><X className="h-3 w-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs font-bold text-rose-500 hover:underline px-2">
                Clear all
              </button>
            </div>
          )}

          {/* Layout: sidebar + grid */}
          <div className="flex gap-4 sm:gap-6 items-start">

            {/* Sidebar */}
            <aside className={`flex-shrink-0 bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-5 sticky top-28 sm:top-36 transition-all duration-300 ${
              showSidebar ? 'w-40 xs:w-48 sm:w-56 md:w-60 lg:w-64 block' : 'w-0 hidden'
            }`}>
              <FilterSidebar onClose={() => setShowSidebar(false)} />
            </aside>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {/* Result count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-foreground/60">
                  Showing <span className="font-extrabold text-brand-green">{filtered.length}</span> of {products.length} products
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-foreground/20" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground/50">No products found</h3>
                  <p className="text-sm text-foreground/40">Try adjusting your filters or search</p>
                  <button onClick={clearFilters} className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-gold hover:text-brand-green transition-colors">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleProducts.map(p => <ShopProductCard key={p.id} product={p} />)}
                  </div>

                  {visibleCount < filtered.length && (
                    <div ref={loaderRef} className="py-12 flex items-center justify-center mt-6">
                      <div className="flex items-center gap-2 text-sm text-foreground/50 font-bold bg-card border border-border px-5 py-2.5 rounded-2xl shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-green border-t-transparent"></div>
                        <span>Loading more formulations...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
