'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, SlidersHorizontal, X, ShoppingBag, Tag, Building2,
  ChevronDown, ChevronUp, CheckSquare, Square, ListFilter
} from 'lucide-react';
import ShopProductCard from './ShopProductCard';
import CartDrawer from './CartDrawer';
import { useCart } from './CartContext';
import ShopFilterPillsHeader, { SortKey } from './ShopFilterPillsHeader';
import { HEALTH_SYMPTOMS } from '@/lib/constants';

interface Product {
  id: number;
  name: string;
  slug: string;
  shortDesc: string | null;
  botanicalName?: string | null;
  type?: string | null;
  category: string | null;
  mrp: number;
  sellingPrice: number;
  stock: number;
  unit: string | null;
  images: string[];
  isFeatured: boolean;
  tags?: string | null;
  manufacturer?: { id: number; companyName: string } | null;
  indications?: { id: number; name: string }[];
}

interface Manufacturer {
  id: number;
  companyName: string;
}

interface RawIndication {
  id: number;
  name: string;
  symptomsKeywords: string | null;
}

const PREPARATION_TYPES = [
  { id: '', label: 'All Formulations' },
  { id: 'READY_PRODUCT', label: 'Ready Product' },
  { id: 'CAPSULE', label: 'Capsules' },
  { id: 'TABLET', label: 'Tablets' },
  { id: 'POWDER', label: 'Powders (Churna)' },
  { id: 'LIQUID_EXTRACT', label: 'Liquid Extracts (Asava/Arishta)' },
  { id: 'OIL', label: 'Ayurvedic Oils (Taila)' },
  { id: 'CREAM', label: 'Creams & Ointments' },
];

export default function ShopPageClient({
  products,
  manufacturers,
  categories,
  dbIndications = [],
  rawIndications = [],
  initialCategory = '',
  initialSearch = '',
}: {
  products: Product[];
  manufacturers: Manufacturer[];
  categories: string[];
  dbIndications?: string[];
  rawIndications?: RawIndication[];
  initialCategory?: string;
  initialSearch?: string;
}) {
  const allSymptomsList = useMemo(() => {
    const combined = [...HEALTH_SYMPTOMS, ...dbIndications];
    return Array.from(new Set(combined)).sort();
  }, [dbIndications]);

  const resolvedInitialCat = useMemo(() => {
    if (!initialCategory) return '';
    const match = categories.find(
      c => c.toLowerCase() === initialCategory.toLowerCase() ||
           c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === initialCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
           c.toLowerCase().includes(initialCategory.toLowerCase()) ||
           initialCategory.toLowerCase().includes(c.toLowerCase())
    );
    return match || initialCategory;
  }, [initialCategory, categories]);

  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCats, setSelectedCats] = useState<string[]>(
    resolvedInitialCat ? [resolvedInitialCat] : []
  );
  const [selectedMfr, setSelectedMfr] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomMatchMode, setSymptomMatchMode] = useState<'OR' | 'AND'>('OR');
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);
  const [symExpanded, setSymExpanded] = useState(true);
  const [mfrExpanded, setMfrExpanded] = useState(true);
  const [typeExpanded, setTypeExpanded] = useState(true);

  const [catSearch, setCatSearch] = useState('');
  const [symSearch, setSymSearch] = useState('');
  const [mfrSearch, setMfrSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  const { openCart, totalItems, addItem } = useCart();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map(p => p.sellingPrice), 500) / 100) * 100, [products]);
  const [priceMax, setPriceMax] = useState<number>(maxPrice);

  const toggleCat = (c: string) =>
    setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const activeFilterCount =
    selectedCats.length + selectedSymptoms.length + (selectedMfr ? 1 : 0) + (selectedType ? 1 : 0) + (inStockOnly ? 1 : 0) + (priceMax < maxPrice ? 1 : 0);

  const clearFilters = () => {
    setSelectedCats([]); setSelectedSymptoms([]); setSelectedMfr(0); setSelectedType(''); setInStockOnly(false);
    setPriceMax(maxPrice); setSearch('');
    setCatSearch(''); setSymSearch(''); setMfrSearch('');
    setVisibleCount(12);
  };

  const matchedSymptomIndications = useMemo(() => {
    if (!search.trim() || !rawIndications.length) return [];
    const q = search.toLowerCase().trim();
    return rawIndications.filter(ind =>
      ind.name.toLowerCase().includes(q) ||
      (ind.symptomsKeywords && ind.symptomsKeywords.toLowerCase().includes(q))
    );
  }, [search, rawIndications]);

  const filtered = useMemo(() => {
    let list = [...products];

    // Sales Channel / Target Audience Filtering (B2C consumer catalog)
    list = list.filter(p => {
      const aud = (p as any).targetAudience || 'BOTH';
      return aud === 'B2C' || aud === 'BOTH';
    });

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchedIndicationNames = matchedSymptomIndications.map(i => i.name.toLowerCase());

      list = list.filter(p => {
        const formattedType = (p.type || 'READY_PRODUCT').replace('_', ' ');
        const prodText = `${p.name} ${p.botanicalName || ''} ${formattedType} ${p.shortDesc || ''} ${p.category || ''} ${p.tags || ''}`.toLowerCase();
        if (prodText.includes(q)) return true;
        return matchedIndicationNames.some(indName => {
          const mainKey = indName.split('(')[0].trim();
          return prodText.includes(mainKey);
        });
      });
    }

    if (selectedCats.length) {
      list = list.filter(p => {
        if (!p.category) return false;
        if (selectedCats.includes(p.category)) return true;
        return selectedCats.some(cat => {
          const catNorm = cat.toLowerCase().replace(/[^a-z0-9]+/g, '');
          const prodCatNorm = p.category!.toLowerCase().replace(/[^a-z0-9]+/g, '');
          return catNorm === prodCatNorm || catNorm.includes(prodCatNorm) || prodCatNorm.includes(catNorm);
        });
      });
    }

    if (selectedMfr) {
      list = list.filter(p => p.manufacturer?.id === selectedMfr);
    }

    if (selectedType) {
      list = list.filter(p => (p.type || 'READY_PRODUCT') === selectedType);
    }

    if (selectedSymptoms.length > 0) {
      list = list.filter(p => {
        const prodText = `${p.name} ${p.shortDesc || ''} ${p.tags || ''}`.toLowerCase();
        if (symptomMatchMode === 'AND') {
          return selectedSymptoms.every(sym => {
            const symKeyword = sym.toLowerCase().split('(')[0].trim();
            return prodText.includes(symKeyword);
          });
        } else {
          return selectedSymptoms.some(sym => {
            const symKeyword = sym.toLowerCase().split('(')[0].trim();
            return prodText.includes(symKeyword);
          });
        }
      });
    }

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
  }, [products, search, selectedCats, selectedMfr, selectedType, selectedSymptoms, symptomMatchMode, inStockOnly, priceMax, sortKey, matchedSymptomIndications]);

  useEffect(() => {
    setVisibleCount(12);
  }, [search, selectedCats, selectedMfr, selectedType, selectedSymptoms, symptomMatchMode, inStockOnly, priceMax, sortKey]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount(prev => prev + 12);
        }
      },
      { threshold: 0.1 }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => { if (currentLoader) observer.unobserve(currentLoader); };
  }, [filtered.length, visibleCount]);

  const visibleProducts = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  /* ── Filter Sidebar ── */
  const FilterSidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-6">
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

      {/* Formulation Type Filter (B2B & B2C) */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <button
          onClick={() => setTypeExpanded(v => !v)}
          className="w-full flex items-center justify-between text-xs font-extrabold text-brand-green uppercase tracking-widest"
        >
          <span className="flex items-center gap-1.5">
            <ListFilter className="h-3.5 w-3.5" /> Formulation Type
          </span>
          {typeExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {typeExpanded && (
          <div className="flex flex-col gap-1 pt-1 max-h-48 overflow-y-auto">
            {PREPARATION_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => setSelectedType(pt.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl text-left border transition-colors flex items-center justify-between ${
                  selectedType === pt.id
                    ? 'bg-brand-green text-white border-transparent'
                    : 'border-border text-foreground/70 hover:border-brand-green/40'
                }`}
              >
                <span>{pt.label}</span>
                {selectedType === pt.id && <span className="text-[10px] font-extrabold">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Health Concerns & Symptoms Section */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <button
          onClick={() => setSymExpanded(v => !v)}
          className="w-full flex items-center justify-between text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-widest"
        >
          <span className="flex items-center gap-1.5">
            <span>🩺</span> Health Concerns & Symptoms
          </span>
          {symExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {symExpanded && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-[10px]">
              <span className="font-extrabold text-amber-900 dark:text-amber-300">Match Mode:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSymptomMatchMode('OR')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    symptomMatchMode === 'OR' ? 'bg-amber-600 text-white' : 'bg-card text-foreground/60 hover:text-foreground'
                  }`}
                >
                  ANY (OR)
                </button>
                <button
                  type="button"
                  onClick={() => setSymptomMatchMode('AND')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    symptomMatchMode === 'AND' ? 'bg-amber-600 text-white' : 'bg-card text-foreground/60 hover:text-foreground'
                  }`}
                >
                  ALL (AND)
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-foreground/40" />
              <input
                type="text"
                placeholder="Search symptoms (e.g. pain, sleep)..."
                value={symSearch}
                onChange={e => setSymSearch(e.target.value)}
                className="w-full pl-7 pr-7 py-1.5 bg-muted/60 border border-border rounded-xl text-xs focus:outline-none focus:border-amber-500/40 text-foreground placeholder:text-foreground/40"
              />
              {symSearch && (
                <button onClick={() => setSymSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
              {allSymptomsList
                .filter(s => s.toLowerCase().includes(symSearch.toLowerCase()))
                .map(s => {
                  const isChecked = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl text-left border flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold'
                          : 'border-border text-foreground/70 hover:border-amber-500/30'
                      }`}
                    >
                      <span className="truncate pr-1">{s}</span>
                      {isChecked ? <CheckSquare className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" /> : <Square className="h-3.5 w-3.5 text-foreground/30 flex-shrink-0" />}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
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

      {/* Brand */}
      {manufacturers.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setMfrExpanded(v => !v)}
            className="w-full flex items-center justify-between text-xs font-extrabold text-foreground/60 uppercase tracking-widest"
          >
            <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Brand</span>
            {mfrExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {mfrExpanded && (
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search brands..."
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
                >All Brands</button>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── Top Bar: Ayurwed Catalog Banner ── */}
          <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold bg-brand-green-light text-brand-green px-3 py-1 rounded-full uppercase tracking-wider">
                  Ayurwed Catalog
                </span>
                <span className="text-xs font-bold text-foreground/50">
                  Classical &amp; Wellness Formulations
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-green">
                Authentic Ayurvedic Remedies &amp; Formulations
              </h1>
              <p className="text-xs sm:text-sm text-foreground/70">
                Browse authentic ready remedies, classical churnas, single herbs, and daily supplements crafted in adherence to Ayurvedic traditions.
              </p>
            </div>
          </div>

          {/* Filter Pills Header */}
          <ShopFilterPillsHeader
            search={search}
            setSearch={setSearch}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedCats={selectedCats}
            toggleCat={toggleCat}
            setSelectedCats={setSelectedCats}
            selectedMfr={selectedMfr}
            setSelectedMfr={setSelectedMfr}
            selectedSymptoms={selectedSymptoms}
            toggleSymptom={toggleSymptom}
            setSelectedSymptoms={setSelectedSymptoms}
            symptomMatchMode={symptomMatchMode}
            setSymptomMatchMode={setSymptomMatchMode}
            sortKey={sortKey}
            setSortKey={setSortKey}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            maxPrice={maxPrice}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            activeFilterCount={activeFilterCount}
            clearFilters={clearFilters}
            categories={categories}
            manufacturers={manufacturers}
            products={products}
            openCart={openCart}
            totalItems={totalItems}
          />

          {/* Main Full-Width Content Container */}
          <div className="w-full min-w-0">
              {/* Symptom Search Intelligence Banner */}
              {search.trim() && matchedSymptomIndications.length > 0 && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
                    <span className="text-lg leading-none">🩺</span>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-amber-900 dark:text-amber-300">
                        Symptom Search Intelligence Active
                      </p>
                      <p className="text-brand-foreground/80 leading-relaxed">
                        Searching <code className="bg-amber-500/20 px-1.5 py-0.5 rounded font-bold">&quot;{search}&quot;</code> matched clinical indication{matchedSymptomIndications.length > 1 ? 's' : ''}: <strong>{matchedSymptomIndications.map(i => i.name).join(', ')}</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSyms = Array.from(new Set([...selectedSymptoms, ...matchedSymptomIndications.map(i => i.name)]));
                      setSelectedSymptoms(newSyms);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 py-2 rounded-xl transition-colors flex-shrink-0"
                  >
                    + Add to Symptom Filters
                  </button>
                </div>
              )}

              {/* Count */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <p className="text-foreground/60">
                  Showing <span className="font-extrabold text-brand-green">{filtered.length}</span> of {products.length} formulations
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-foreground/20" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground/50">No products found</h3>
                  <p className="text-sm text-foreground/40 max-w-sm">
                    No Ayurvedic formulations match your current symptom or category filters. Try resetting filters.
                  </p>
                  <button onClick={clearFilters} className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-gold hover:text-brand-green transition-colors">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Grid View (B2C Catalog) */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visibleProducts.map(p => (
                      <ShopProductCard
                        key={p.id}
                        product={p}
                        mode="B2C"
                        onSelectSymptom={(sym) => {
                          if (!selectedSymptoms.includes(sym)) {
                            setSelectedSymptoms([...selectedSymptoms, sym]);
                          }
                        }}
                      />
                    ))}
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
    </>
  );
}
