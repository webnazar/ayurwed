'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import {
  Search, Plus, Edit, Trash2, X, Package, Star, Eye, EyeOff,
  ToggleLeft, ToggleRight, Building2, ImageIcon, ChevronDown, Check, HeartPulse,
  LayoutGrid, List, Sparkles, ShoppingCart, Download, FileUp, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

interface Manufacturer {
  id: number;
  companyName: string;
  logo: string | null;
}

interface Indication {
  id: number;
  name: string;
}

interface Symptom {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  botanicalName?: string | null;
  type?: string | null;
  ingredients?: string | null;
  benefits?: string | null;
  usage?: string | null;
  category: string | null;
  manufacturerId: number | null;
  sku: string | null;
  barcode?: string | null;
  mrp: number;
  sellingPrice: number;
  stock: number;
  unit: string | null;
  images: string[];
  tags: string | null;
  targetAudience?: string;
  isActive: boolean;
  isFeatured: boolean;
  manufacturer?: Manufacturer | null;
  indications?: Indication[];
  symptoms?: Symptom[];
}

const emptyForm = {
  id: 0,
  name: '',
  description: '',
  shortDesc: '',
  botanicalName: '',
  type: 'READY_PRODUCT',
  ingredients: '',
  benefits: '',
  usage: '',
  category: '',
  manufacturerId: '',
  sku: '',
  barcode: '',
  mrp: '',
  sellingPrice: '',
  stock: '0',
  unit: '',
  tags: '',
  targetAudience: 'BOTH',
  isActive: true,
  isFeatured: false,
  indicationIds: [] as number[],
  symptomIds: [] as number[],
};

const discount = (mrp: number, sp: number) =>
  mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ── Searchable Manufacturer Combobox (Type-to-filter dropdown) ──
function SearchableManufacturerSelect({
  manufacturers,
  value,
  onChange,
  placeholder = "Select Brand...",
}: {
  manufacturers: Manufacturer[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
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

  const selected = manufacturers.find(m => m.id.toString() === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return manufacturers;
    return manufacturers.filter(m => m.companyName.toLowerCase().includes(query.toLowerCase()));
  }, [manufacturers, query]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm flex items-center justify-between focus:outline-none focus:border-brand-gold transition-colors text-left"
      >
        <span className={selected ? 'font-semibold text-foreground flex items-center gap-2' : 'text-foreground/40'}>
          {selected ? (
            <>
              <Building2 className="h-4 w-4 text-brand-green/70 flex-shrink-0" />
              <span>{selected.companyName}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-foreground/40" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-2 border-b border-border bg-muted/30 flex items-center gap-2">
            <Search className="h-4 w-4 text-foreground/40 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to filter manufacturers..."
              className="w-full bg-transparent text-xs text-foreground focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-foreground/40 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-border/50 text-sm">
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-muted/60 transition-colors ${!value ? 'font-bold text-brand-green bg-brand-green-light/30' : 'text-foreground/60'}`}
            >
              — No Brand —
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-foreground/40 text-center">No brands match &quot;{query}&quot;</div>
            ) : (
              filtered.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onChange(m.id.toString()); setIsOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-muted/60 transition-colors ${value === m.id.toString() ? 'font-bold text-brand-green bg-brand-green-light/40' : 'text-foreground'}`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-brand-green/70" />
                    {m.companyName}
                  </span>
                  {value === m.id.toString() && <Check className="h-3.5 w-3.5 text-brand-green" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Searchable Category Combobox (Modern Type-to-Filter & Select) ──
function SearchableCategorySelect({
  categories,
  value,
  onChange,
  placeholder = "Select Category...",
  isFilter = false,
}: {
  categories: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isFilter?: boolean;
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
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          isFilter
            ? "px-3 py-2 bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/30 shadow-sm flex items-center justify-between gap-2 min-w-[140px] text-left transition-colors"
            : "w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm flex items-center justify-between focus:outline-none focus:border-brand-gold transition-colors text-left"
        }
      >
        <span className={value ? (isFilter ? 'font-bold text-brand-green truncate' : 'font-semibold text-foreground truncate') : 'text-foreground/40 truncate'}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 min-w-[190px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-2 border-b border-border bg-muted/30 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-foreground/40 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filter categories..."
              className="w-full bg-transparent text-xs text-foreground focus:outline-none placeholder:text-foreground/40"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-foreground/40 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-border/50 text-xs">
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 transition-colors ${!value ? 'font-bold text-brand-green bg-brand-green-light/30' : 'text-foreground/60 hover:bg-muted/60'}`}
            >
              {isFilter ? 'All Categories' : '— No Category —'}
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-foreground/40 text-center">No categories match &quot;{query}&quot;</div>
            ) : (
              filtered.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { onChange(cat); setIsOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-muted/60 transition-colors ${value === cat ? 'font-bold text-brand-green bg-brand-green-light/40' : 'text-foreground'}`}
                >
                  <span className="truncate">{cat}</span>
                  {value === cat && <Check className="h-3.5 w-3.5 text-brand-green shrink-0 ml-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Searchable Multi-Select Generic Component ──
function SearchableMultiSelect({
  label,
  badgeIcon: BadgeIcon,
  placeholder,
  items,
  selectedIds,
  onChange,
  badgeStyle = "bg-brand-green-light text-brand-green border-brand-green/20",
}: {
  label: string;
  badgeIcon: React.ElementType;
  placeholder: string;
  items: { id: number; name: string }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  badgeStyle?: string;
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

  const selectedItems = useMemo(() => {
    return items.filter(i => selectedIds.includes(i.id));
  }, [items, selectedIds]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  const toggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wide flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <BadgeIcon className="h-3.5 w-3.5 text-brand-green" />
          {label}
        </span>
        <span className="text-[10px] text-foreground/40 font-normal">Multi-Select</span>
      </label>

      {/* Selected Items Badges Container */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex flex-wrap gap-1.5 min-h-[44px] p-2.5 bg-card border border-border rounded-xl items-center cursor-pointer hover:border-brand-gold/60 transition-colors"
      >
        {selectedItems.length === 0 ? (
          <span className="text-xs text-foreground/40 px-1">{placeholder}</span>
        ) : (
          selectedItems.map(item => (
            <span
              key={item.id}
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${badgeStyle}`}
            >
              {item.name}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
                className="opacity-70 hover:opacity-100 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="ml-auto text-xs font-bold text-brand-green hover:text-brand-gold px-2.5 py-1 rounded-lg border border-dashed border-brand-green/30 hover:border-brand-gold transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> Select Items
        </button>
      </div>

      {/* Popover Dropdown Grid */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-3 border-b border-border bg-muted/40 flex items-center gap-2">
            <Search className="h-4 w-4 text-foreground/40 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Type to filter ${label.toLowerCase()}...`}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-foreground/40 hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {filtered.length === 0 ? (
              <div className="col-span-full py-6 text-center text-foreground/40">No items match &quot;{query}&quot;</div>
            ) : (
              filtered.map(item => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all border ${
                      isChecked
                        ? 'bg-brand-green-light/70 border-brand-green text-brand-green font-bold shadow-xs'
                        : 'bg-muted/20 border-border/50 hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <span className="truncate pr-2">{item.name}</span>
                    <div className={`h-4 w-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${isChecked ? 'bg-brand-green border-brand-green text-white' : 'border-border bg-card'}`}>
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-border bg-muted/30 flex justify-between items-center text-xs">
            <span className="text-foreground/70 font-semibold">{selectedIds.length} item(s) selected</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-gold hover:text-brand-green transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductMasterClient({
  initialProducts,
  manufacturers,
  indications = [],
  symptoms = [],
  dbCategories = [],
}: {
  initialProducts: Product[];
  manufacturers: Manufacturer[];
  indications?: Indication[];
  symptoms?: Symptom[];
  dbCategories?: string[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'OUT_OF_STOCK' | 'FEATURED'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [savedProductId, setSavedProductId] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{
    name: string;
    sku: string;
    category: string;
    brand: string;
    mrp: string;
    sellingPrice: string;
    stock: string;
    unit: string;
    barcode: string;
    shortDesc: string;
    description: string;
    isActive: string;
    isFeatured: string;
  }>({
    name: '',
    sku: '',
    category: '',
    brand: '',
    mrp: '',
    sellingPrice: '',
    stock: '',
    unit: '',
    barcode: '',
    shortDesc: '',
    description: '',
    isActive: '',
    isFeatured: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeImportModal = () => {
    setShowImportModal(false);
    setCsvData([]);
    setCsvHeaders([]);
    setMapping({
      name: '',
      sku: '',
      category: '',
      brand: '',
      mrp: '',
      sellingPrice: '',
      stock: '',
      unit: '',
      barcode: '',
      shortDesc: '',
      description: '',
      isActive: '',
      isFeatured: '',
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!isFormOpen) openCreate();
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isFormOpen) {
          formRef.current?.requestSubmit();
        } else {
          searchRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        if (showImportModal) {
          closeImportModal();
        } else if (isFormOpen) {
          const tag = (e.target as HTMLElement).tagName;
          if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) setIsFormOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFormOpen, showImportModal]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          const autoMap = {
            name: '',
            sku: '',
            category: '',
            brand: '',
            mrp: '',
            sellingPrice: '',
            stock: '',
            unit: '',
            barcode: '',
            shortDesc: '',
            description: '',
            isActive: '',
            isFeatured: '',
          };
          results.meta.fields.forEach((f) => {
            const lower = f.toLowerCase();
            if (lower === 'name' || lower.includes('product name') || lower.includes('title')) autoMap.name = f;
            else if (lower.includes('sku') || lower.includes('item code')) autoMap.sku = f;
            else if (lower.includes('category') || lower.includes('cat')) autoMap.category = f;
            else if (lower.includes('brand') || lower.includes('manufacturer') || lower.includes('company')) autoMap.brand = f;
            else if (lower === 'mrp' || lower.includes('retail price')) autoMap.mrp = f;
            else if (lower.includes('selling') || lower.includes('price') || lower.includes('rate')) autoMap.sellingPrice = f;
            else if (lower.includes('stock') || lower.includes('qty') || lower.includes('quantity')) autoMap.stock = f;
            else if (lower.includes('unit') || lower.includes('size')) autoMap.unit = f;
            else if (lower.includes('barcode') || lower.includes('ean') || lower.includes('upc')) autoMap.barcode = f;
            else if (lower.includes('short') || lower.includes('brief')) autoMap.shortDesc = f;
            else if (lower.includes('desc')) autoMap.description = f;
            else if (lower.includes('active') || lower.includes('status')) autoMap.isActive = f;
            else if (lower.includes('featured')) autoMap.isFeatured = f;
          });
          setMapping(autoMap);
        }
        setCsvData(results.data);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      },
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeBulkImport = async () => {
    if (csvData.length === 0) return;
    if (!mapping.name) {
      toast.error("You must map a column to 'Product Name' before importing.");
      return;
    }

    setIsImporting(true);
    try {
      const payload = csvData
        .map((row) => ({
          name: row[mapping.name],
          sku: mapping.sku ? row[mapping.sku] : '',
          category: mapping.category ? row[mapping.category] : '',
          brand: mapping.brand ? row[mapping.brand] : '',
          mrp: mapping.mrp ? parseFloat(row[mapping.mrp]) || 0 : (mapping.sellingPrice ? parseFloat(row[mapping.sellingPrice]) || 0 : 0),
          sellingPrice: mapping.sellingPrice ? parseFloat(row[mapping.sellingPrice]) || 0 : (mapping.mrp ? parseFloat(row[mapping.mrp]) || 0 : 0),
          stock: mapping.stock ? parseInt(row[mapping.stock]) || 0 : 0,
          unit: mapping.unit ? row[mapping.unit] : '',
          barcode: mapping.barcode ? row[mapping.barcode] : '',
          shortDesc: mapping.shortDesc ? row[mapping.shortDesc] : '',
          description: mapping.description ? row[mapping.description] : '',
          isActive: mapping.isActive
            ? String(row[mapping.isActive]).toLowerCase() === 'true' || row[mapping.isActive] === '1' || row[mapping.isActive] === true
            : true,
          isFeatured: mapping.isFeatured
            ? String(row[mapping.isFeatured]).toLowerCase() === 'true' || row[mapping.isFeatured] === '1' || row[mapping.isFeatured] === true
            : false,
        }))
        .filter((item) => item.name);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(
        `Successfully imported/updated ${data.successful} products. ${data.failed > 0 ? `${data.failed} failed.` : ''}`
      );

      const freshRes = await fetch('/api/admin/products');
      if (freshRes.ok) {
        setProducts(await freshRes.json());
      }
      closeImportModal();
    } catch (err: any) {
      toast.error(err.message || 'Error during bulk import');
    } finally {
      setIsImporting(false);
    }
  };

  const exportToCsv = () => {
    if (products.length === 0) {
      toast.error('No products available to export');
      return;
    }
    const rows = products.map((p) => ({
      name: p.name,
      sku: p.sku || '',
      category: p.category || '',
      brand: p.manufacturer?.companyName || '',
      mrp: p.mrp || 0,
      sellingPrice: p.sellingPrice || 0,
      stock: p.stock || 0,
      unit: p.unit || '',
      barcode: p.barcode || '',
      shortDesc: p.shortDesc || '',
      description: p.description || '',
      isActive: p.isActive ? 'true' : 'false',
      isFeatured: p.isFeatured ? 'true' : 'false',
    }));
    const csvString = Papa.unparse(rows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Products exported to CSV successfully');
  };

  const downloadSampleCsv = () => {
    const sampleRows = [
      {
        name: 'Chyawanprash Awaleha 500g',
        sku: 'AYU-CHY-500',
        category: 'Rasayana & Immunity',
        brand: 'Dabur India Ltd',
        mrp: 395,
        sellingPrice: 349,
        stock: 50,
        unit: '500g Jar',
        barcode: '8901207010014',
        shortDesc: 'Classical Ayurvedic immunity enhancer with Amla and 40+ rejuvenating herbs',
        description: 'Time-tested Ayurvedic formulation enriched with wild Amla and natural botanicals to support vitality and digestion.',
        isActive: 'true',
        isFeatured: 'true',
      },
      {
        name: 'Ashwagandha Organic Vati 60 Tabs',
        sku: 'AYU-ASH-060',
        category: 'Capsules & Tablets',
        brand: 'Baidyanath Ayurved',
        mrp: 299,
        sellingPrice: 249,
        stock: 100,
        unit: '60 Tablets',
        barcode: '8901207020020',
        shortDesc: 'Stress relief, adaptogenic calm, and deep restorative sleep support',
        description: 'Standardized root extract of Withania somnifera promoting balanced cortisol levels and adrenal strength.',
        isActive: 'true',
        isFeatured: 'false',
      },
      {
        name: 'Brahmi Ghrita 150ml',
        sku: 'AYU-BRH-150',
        category: 'Medicated Ghee (Ghrita)',
        brand: 'Kottakkal Arya Vaidya Sala',
        mrp: 450,
        sellingPrice: 420,
        stock: 30,
        unit: '150ml Bottle',
        barcode: '8901207030037',
        shortDesc: 'Classical medicated ghee for cognitive clarity and memory retention',
        description: 'Pure cow ghee infused with Brahmi, Shankhpushpi, and Vacha prepared as per Sahasrayogam text.',
        isActive: 'true',
        isFeatured: 'true',
      },
    ];
    const csvString = Papa.unparse(sampleRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample products CSV template downloaded');
  };

  const categories = useMemo(() => {
    const fromDb = products.map(p => p.category).filter(Boolean) as string[];
    const base = dbCategories.length > 0 ? dbCategories : PRODUCT_CATEGORIES;
    const extra = fromDb.filter(c => !base.includes(c));
    return [...base, ...extra];
  }, [products, dbCategories]);

  const filtered = useMemo(() => {
    let list = products;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.indications?.some(ind => ind.name.toLowerCase().includes(q)) ||
        p.symptoms?.some(sym => sym.name.toLowerCase().includes(q))
      );
    }
    if (filterCategory) list = list.filter(p => p.category === filterCategory);
    if (filterManufacturer) list = list.filter(p => p.manufacturerId?.toString() === filterManufacturer);

    if (statusFilter === 'ACTIVE') list = list.filter(p => p.isActive);
    if (statusFilter === 'OUT_OF_STOCK') list = list.filter(p => p.stock === 0);
    if (statusFilter === 'FEATURED') list = list.filter(p => p.isFeatured);

    return list;
  }, [products, searchTerm, filterCategory, filterManufacturer, statusFilter]);

  const openCreate = () => {
    setForm(emptyForm);
    setImages([]);
    setSavedProductId(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      shortDesc: p.shortDesc || '',
      botanicalName: p.botanicalName || '',
      type: p.type || 'READY_PRODUCT',
      ingredients: p.ingredients || '',
      benefits: p.benefits || '',
      usage: p.usage || '',
      category: p.category || '',
      manufacturerId: p.manufacturerId?.toString() || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      mrp: p.mrp.toString(),
      sellingPrice: p.sellingPrice.toString(),
      stock: p.stock.toString(),
      unit: p.unit || '',
      tags: p.tags || '',
      targetAudience: p.targetAudience || 'BOTH',
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      indicationIds: p.indications ? p.indications.map(i => i.id) : [],
      symptomIds: p.symptoms ? p.symptoms.map(s => s.id) : [],
    });
    setImages(p.images || []);
    setSavedProductId(p.id);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name required');
    if (!form.mrp || !form.sellingPrice) return toast.error('MRP and Selling Price required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        images,
        manufacturerId: form.manufacturerId ? parseInt(form.manufacturerId) : null,
        indicationIds: form.indicationIds,
        symptomIds: form.symptomIds,
      };
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const saved = await res.json();
      if (isEditing) {
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
        toast.success('Product updated');
        setIsFormOpen(false);
      } else {
        setProducts(prev => [saved, ...prev]);
        setSavedProductId(saved.id);
        setForm(f => ({ ...f, id: saved.id }));
        setIsEditing(true);
        toast.success(`Product "${saved.name}" saved! Now add product images below.`);
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setProducts(prev => prev.filter(p => p.id !== deleteId));
      toast.success('Product deleted');
      setDeleteId(null);
    } catch { toast.error('Could not delete product'); }
    finally { setLoading(false); }
  };

  const addImage = async (url: string) => {
    if (!url || !savedProductId) return;
    const nextImages = [...images, url];
    setImages(nextImages);
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedProductId, images: nextImages }),
      });
      setProducts(prev => prev.map(p => p.id === savedProductId ? { ...p, images: nextImages } : p));
    } catch { toast.error('Could not save image to product'); }
  };

  const removeImage = async (idx: number) => {
    const nextImages = images.filter((_, i) => i !== idx);
    setImages(nextImages);
    if (!savedProductId) return;
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedProductId, images: nextImages }),
      });
      setProducts(prev => prev.map(p => p.id === savedProductId ? { ...p, images: nextImages } : p));
    } catch { toast.error('Could not update images'); }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold transition-colors';
  const labelCls = 'block text-xs font-bold text-foreground/60 mb-1.5 uppercase tracking-wide';

  return (
    <div className="space-y-3.5">
      {/* ── Header Banner with Merged Search & Category Filter (Minimal Margins, No Subtitle) ── */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Products</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products, SKU, symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-foreground placeholder:text-foreground/40 shadow-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category Dropdown (Modern Type-to-Filter & Select) */}
            <div className="relative flex-shrink-0 w-36 sm:w-44">
              <SearchableCategorySelect
                categories={categories}
                value={filterCategory}
                onChange={setFilterCategory}
                placeholder="All Categories"
                isFilter={true}
              />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={exportToCsv}
              title="Export All Products to CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            {/* CSV Import Button */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              title="Bulk Import Products from CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Import CSV</span>
            </button>

            {/* Add Product Button */}
            <button
              type="button"
              onClick={openCreate}
              title="Add Product (Alt+N)"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
              <kbd className="text-[10px] bg-white/20 px-1 py-0.5 rounded font-mono ml-0.5 hidden sm:inline">Alt+N</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid (Equal & Minimal Margins) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: 'Total Products', value: products.length, color: 'text-brand-green bg-brand-green-light dark:bg-brand-green-light/20' },
          { label: 'Active', value: products.filter(p => p.isActive).length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
          { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
          { label: 'Featured', value: products.filter(p => p.isFeatured).length, color: 'text-brand-gold-dark bg-brand-gold/15 dark:text-brand-gold' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-3.5 border border-border shadow-sm flex items-center gap-3 hover:border-brand-green/30 transition-colors">
            <div className={`p-2.5 rounded-xl shrink-0 ${s.color}`}><Package className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider block truncate">{s.label}</span>
              <span className="text-lg font-extrabold text-foreground truncate block">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs & View Mode Switcher Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-muted/60 border border-border rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-card text-brand-green shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({products.filter(p => p.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'OUT_OF_STOCK'
                ? 'bg-card text-rose-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Out of Stock ({products.filter(p => p.stock === 0).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('FEATURED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
              statusFilter === 'FEATURED'
                ? 'bg-card text-brand-gold-dark shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Featured ({products.filter(p => p.isFeatured).length})
          </button>
        </div>

        {/* Manufacturer Filter & View Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground shrink-0">
          <div className="w-44 sm:w-52">
            <SearchableManufacturerSelect
              manufacturers={manufacturers}
              value={filterManufacturer}
              onChange={setFilterManufacturer}
              placeholder="All Brands..."
            />
          </div>

          <span className="hidden md:flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filtered.length}</strong> of{' '}
              <strong className="text-foreground">{products.length}</strong>
            </span>
          </span>

          <div className="inline-flex items-center p-1 bg-muted/70 border border-border rounded-2xl text-xs gap-1">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              title="Card View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-card text-brand-green shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              title="Grid / Table View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-card text-brand-green shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content: Cards or Table ── */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-extrabold text-base text-foreground">No products found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          {(searchTerm || filterCategory || filterManufacturer || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterManufacturer('');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-brand-green hover:underline inline-block pt-1"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        /* ── Cards View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map(p => (
            <div
              key={p.id}
              className="relative bg-card rounded-2xl border border-border hover:border-brand-green/40 dark:hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {/* Top row: Image + Name + Category + Badges */}
                <div className="flex items-start gap-3">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-16 w-16 rounded-xl object-cover border border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-brand-gold-light/30 flex items-center justify-center border border-border flex-shrink-0">
                      <ImageIcon className="h-6 w-6 text-brand-green/40" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      {p.category ? (
                        <span className="text-[10px] font-bold text-brand-green bg-brand-green-light/50 px-2 py-0.5 rounded-full">
                          {p.category}
                        </span>
                      ) : <span />}

                      <div className="flex items-center gap-1 shrink-0">
                        {p.isFeatured && (
                          <span className="text-[9px] font-bold text-brand-gold-dark bg-brand-gold/15 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-current" /> Featured
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-1" title={p.name}>
                      {p.name}
                    </h4>

                    {p.botanicalName && (
                      <p className="text-[11px] text-muted-foreground italic font-serif truncate">
                        {p.botanicalName}
                      </p>
                    )}

                    {p.manufacturer && (
                      <p className="text-[11px] text-foreground/70 flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 text-brand-green/70 shrink-0" />
                        <span className="truncate">{p.manufacturer.companyName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Symptoms & Indications badges */}
                {((p.symptoms && p.symptoms.length > 0) || (p.indications && p.indications.length > 0)) && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {p.symptoms?.slice(0, 3).map(sym => (
                      <span key={`sym-${sym.id}`} className="bg-amber-500/15 text-amber-900 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        💬 {sym.name}
                      </span>
                    ))}
                    {p.indications?.slice(0, 2).map(ind => (
                      <span key={`ind-${ind.id}`} className="bg-brand-green-light text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-green/20">
                        🩺 {ind.name}
                      </span>
                    ))}
                    {((p.symptoms?.length || 0) + (p.indications?.length || 0) > 5) && (
                      <span className="text-[10px] text-muted-foreground font-bold px-1.5 py-0.5">
                        +{((p.symptoms?.length || 0) + (p.indications?.length || 0)) - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Pricing & Stock Row */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="text-base font-extrabold text-brand-green">
                      {formatPrice(p.sellingPrice)}
                    </div>
                    {p.mrp > p.sellingPrice && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground line-through">{formatPrice(p.mrp)}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                          {discount(p.mrp, p.sellingPrice)}% off
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Stock</span>
                    <span className={`text-xs font-extrabold ${p.stock === 0 ? 'text-rose-500' : p.stock < 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {p.stock} {p.unit || 'units'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !p.isActive;
                    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, isActive: nextVal } : item));
                    try {
                      await fetch('/api/admin/products', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: p.id, isActive: nextVal }),
                      });
                      toast.success(`${p.name} is now ${nextVal ? 'Active' : 'Hidden'}`);
                    } catch {
                      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, isActive: !nextVal } : item));
                      toast.error('Failed to update status');
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground/70 hover:text-foreground"
                >
                  {p.isActive ? (
                    <ToggleRight className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-foreground/40" />
                  )}
                  <span>{p.isActive ? 'Active' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    title="Edit Product"
                    className="p-1.5 text-brand-green hover:bg-brand-green/10 border border-brand-green/20 rounded-xl transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(p.id)}
                    title="Delete Product"
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Table / Grid View ── */
        <div className="bg-card rounded-2xl border border-border overflow-x-auto shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                {['Product & Clinical Specs', 'Category', 'Pricing', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-xl object-cover border border-border flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-brand-gold-light/30 flex items-center justify-center border border-border flex-shrink-0 mt-0.5">
                          <ImageIcon className="h-5 w-5 text-brand-green/40" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="font-bold text-brand-green leading-tight">{p.name}</div>
                        {p.sku && <div className="text-[10px] text-foreground/50 font-mono">SKU: {p.sku}</div>}
                        {p.barcode && <div className="text-[10px] text-foreground/50 font-mono">EAN: {p.barcode}</div>}
                        {p.manufacturer && (
                          <div className="text-[10px] text-foreground/60 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-brand-green/70" /> {p.manufacturer.companyName}
                          </div>
                        )}

                        {/* Doctor Indications & Patient Symptoms Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.indications?.map(ind => (
                            <span key={`ind-${ind.id}`} className="bg-brand-green-light/80 text-brand-green text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-green/20" title="Clinical Indication (Doctor Facing)">
                              🩺 {ind.name}
                            </span>
                          ))}
                          {p.symptoms?.map(sym => (
                            <span key={`sym-${sym.id}`} className="bg-amber-500/15 text-amber-900 dark:text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30" title="Plain Symptom (Patient Facing)">
                              💬 {sym.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {p.category ? (
                      <span className="bg-brand-green-light/50 text-brand-green text-[10px] font-bold px-2 py-1 rounded-full">{p.category}</span>
                    ) : <span className="text-foreground/30 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-brand-green">{formatPrice(p.sellingPrice)}</div>
                    {p.mrp > p.sellingPrice && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-foreground/40 line-through">{formatPrice(p.mrp)}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">{discount(p.mrp, p.sellingPrice)}% off</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${p.stock === 0 ? 'text-rose-500' : p.stock < 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {p.stock} {p.unit || 'units'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${p.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                        {p.isActive ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                        (p.targetAudience || 'BOTH') === 'B2C'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                          : (p.targetAudience || 'BOTH') === 'B2B'
                            ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                      }`}>
                        {(p.targetAudience || 'BOTH') === 'B2C' ? '🛍️ B2C Only' : (p.targetAudience || 'BOTH') === 'B2B' ? '🩺 B2B Only' : '🛍️&🩺 B2C & B2B'}
                      </span>
                      {p.isFeatured && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit bg-brand-gold-light/50 text-brand-gold-dark">
                          <Star className="h-2.5 w-2.5" /> Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    <button onClick={() => openEdit(p)} className="p-2 text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-3xl my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-brand-green to-[#0f381b] text-white rounded-t-3xl">
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                {isEditing ? <Edit className="h-5 w-5 text-brand-gold" /> : <Plus className="h-5 w-5 text-brand-gold" />}
                {isEditing ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white/70 hover:text-white bg-card/10 hover:bg-card/20 p-1.5 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">

                {/* ── Section: Basic Info ── */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-brand-green uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-5 h-[2px] bg-brand-green rounded" />
                    Basic Info
                  </h4>
                  <div>
                    <label className={labelCls}>Product Name *</label>
                    <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Ashwagandha Root Capsules" />
                  </div>

                  <div>
                    <label className={labelCls}>Ingredients & Composition (Single Herb or Polyherbal Formula)</label>
                    <textarea
                      rows={2}
                      value={form.ingredients || ''}
                      onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                      className={`${inputCls} resize-none`}
                      placeholder="e.g. Haritaki 33.3%, Bibhitaki 33.3%, Amalaki 33.3% — or list key active botanical extracts..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Key Benefits & Actions</label>
                      <textarea
                        rows={2}
                        value={form.benefits || ''}
                        onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))}
                        className={`${inputCls} resize-none`}
                        placeholder="e.g. Relieves hyperacidity, supports digestive fire (Agni), calms Pitta..."
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Dosage & Usage Instructions</label>
                      <textarea
                        rows={2}
                        value={form.usage || ''}
                        onChange={e => setForm(f => ({ ...f, usage: e.target.value }))}
                        className={`${inputCls} resize-none`}
                        placeholder="e.g. 1-2 tablets twice daily with warm water after meals or as directed by practitioner..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Category</label>
                      <SearchableCategorySelect
                        categories={categories}
                        value={form.category}
                        onChange={cat => setForm(f => ({ ...f, category: cat }))}
                        placeholder="Select Category..."
                      />
                    </div>
                    <div>
                      <label className={labelCls}>SKU</label>
                      <input type="text" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inputCls} placeholder="Unique product code" />
                    </div>
                    <div>
                      <label className={labelCls}>EAN Barcode (Optional)</label>
                      <input type="text" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className={inputCls} placeholder="e.g. 8901234567890" />
                    </div>
                  </div>

                  {/* Searchable Manufacturer Combobox */}
                  <div>
                    <label className={labelCls}>Brand (Search & Select)</label>
                    <SearchableManufacturerSelect
                      manufacturers={manufacturers}
                      value={form.manufacturerId}
                      onChange={val => setForm(f => ({ ...f, manufacturerId: val }))}
                    />
                  </div>

                  {/* ── Patient Symptoms Section ── */}
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-4">
                    {/* Patient Plain Symptoms */}
                    <SearchableMultiSelect
                      label="Patient Symptoms (Plain Language Search & Discovery)"
                      badgeIcon={HeartPulse}
                      placeholder="Select symptoms for users (e.g. Acidity, Stomach Burning, Joint Pain)..."
                      items={symptoms}
                      selectedIds={form.symptomIds}
                      onChange={ids => setForm(f => ({ ...f, symptomIds: ids }))}
                      badgeStyle="bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/30"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Short Description</label>
                    <input type="text" value={form.shortDesc} onChange={e => setForm(f => ({ ...f, shortDesc: e.target.value }))} className={inputCls} placeholder="One-line product summary" maxLength={200} />
                  </div>
                  <div>
                    <label className={labelCls}>Full Description *</label>
                    <textarea required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Detailed product description..." />
                  </div>
                  <div>
                    <label className={labelCls}>Marketing & Dietary Tags (comma-separated)</label>
                    <input type="text" value={form.tags || ''} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className={inputCls} placeholder="e.g. sugar-free, organic, vegan, gmp-certified, seasonal-special" />
                  </div>
                  <div className="flex items-center gap-6 pt-1">
                    <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className="flex items-center gap-2 text-sm font-bold">
                      {form.isActive ? <ToggleRight className="h-6 w-6 text-emerald-500" /> : <ToggleLeft className="h-6 w-6 text-foreground/30" />}
                      <span className={form.isActive ? 'text-emerald-600' : 'text-foreground/50'}>Active (visible in shop)</span>
                    </button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))} className="flex items-center gap-2 text-sm font-bold">
                      {form.isFeatured ? <ToggleRight className="h-6 w-6 text-brand-gold-dark" /> : <ToggleLeft className="h-6 w-6 text-foreground/30" />}
                      <span className={form.isFeatured ? 'text-brand-gold-dark' : 'text-foreground/50'}>Featured</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* ── Section: Pricing & Stock ── */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-brand-green uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-5 h-[2px] bg-brand-green rounded" />
                    Pricing & Stock
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>MRP (₹) *</label>
                      <input required type="number" step="0.01" min="0" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} className={inputCls} placeholder="0.00" />
                    </div>
                    <div>
                      <label className={labelCls}>Selling Price (₹) *</label>
                      <input required type="number" step="0.01" min="0" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} className={inputCls} placeholder="0.00" />
                    </div>
                  </div>
                  {form.mrp && form.sellingPrice && Number(form.mrp) > Number(form.sellingPrice) && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                      ✓ Customer saves {discount(Number(form.mrp), Number(form.sellingPrice))}% — {formatPrice(Number(form.mrp) - Number(form.sellingPrice))} off
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Stock Quantity</label>
                      <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Unit</label>
                      <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={inputCls} placeholder="e.g. Bottle, Pack, 60 Tabs" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* ── Section: Images ── */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-brand-green uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-5 h-[2px] bg-brand-green rounded" />
                    Product Images
                  </h4>

                  {!savedProductId ? (
                    <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center space-y-2">
                      <ImageIcon className="h-10 w-10 mx-auto text-foreground/20" />
                      <p className="text-sm font-semibold text-foreground/50">Save the product details first</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, i) => (
                          <div key={i} className="relative group rounded-2xl overflow-hidden border border-border aspect-square">
                            <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                            {i === 0 && (
                              <span className="absolute top-2 left-2 bg-brand-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Main</span>
                            )}
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <ImageUploadCrop
                          value=""
                          onChange={addImage}
                          folder="products"
                          filename={`product_${savedProductId}_${images.length + 1}`}
                        >
                          <div className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-foreground/40 hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer">
                            <Plus className="h-8 w-8" />
                            <span className="text-xs font-semibold">Add Image</span>
                          </div>
                        </ImageUploadCrop>
                      </div>
                    </>
                  )}
                </div>

              </div>

              <div className="p-5 border-t border-border bg-muted/30 rounded-b-3xl flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-card border border-border hover:bg-muted transition-colors">
                  {savedProductId && !isEditing ? 'Close' : 'Cancel'}
                </button>
                {savedProductId && !isEditing ? (
                  <button type="button" onClick={() => setIsFormOpen(false)}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green transition-colors">
                    Done
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green transition-colors disabled:opacity-50">
                    {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Save & Add Images →'}
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-card rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold mb-2">Delete Product?</h3>
            <p className="text-sm text-foreground/60 mb-6">This will permanently remove the product.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-muted rounded-xl text-sm font-bold border hover:bg-card">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-brand-green text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <FileUp className="h-5 w-5 text-brand-gold" />
                <h3 className="text-base font-extrabold tracking-tight">Bulk Import Products via CSV</h3>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                title="Close (Esc)"
                className="text-white/70 hover:text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-5 text-xs">
              {!csvData.length ? (
                <div
                  className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 text-brand-green mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-foreground mb-1">Click to select CSV file</h4>
                  <p className="text-xs text-muted-foreground mb-3">Your CSV should include a product name, and optionally sku, category, brand, price, stock, etc.</p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSampleCsv();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green/10 hover:bg-brand-green hover:text-white text-brand-green text-xs font-bold transition-all border border-brand-green/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Sample CSV Template</span>
                  </button>

                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-brand-green/10 p-4 rounded-xl flex items-center justify-between border border-brand-green/20">
                    <div className="flex items-center gap-3 text-brand-green">
                      <FileUp className="h-5 w-5" />
                      <div>
                        <p className="text-sm font-bold">CSV Loaded Successfully</p>
                        <p className="text-xs text-brand-green/80">{csvData.length} records detected.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCsvData([])}
                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-full"
                    >
                      Remove File
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-green flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" /> Map CSV Columns
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={mapping.name}
                          onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          SKU / Item Code (Optional)
                        </label>
                        <select
                          value={mapping.sku}
                          onChange={(e) => setMapping({ ...mapping, sku: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore / Auto-generate --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Category (Optional)
                        </label>
                        <select
                          value={mapping.category}
                          onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Brand / Manufacturer (Optional)
                        </label>
                        <select
                          value={mapping.brand}
                          onChange={(e) => setMapping({ ...mapping, brand: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Selling Price / Rate (₹)
                        </label>
                        <select
                          value={mapping.sellingPrice}
                          onChange={(e) => setMapping({ ...mapping, sellingPrice: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore (Default 0) --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          MRP / Maximum Retail Price (₹)
                        </label>
                        <select
                          value={mapping.mrp}
                          onChange={(e) => setMapping({ ...mapping, mrp: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Same as Selling Price --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Stock Quantity (Optional)
                        </label>
                        <select
                          value={mapping.stock}
                          onChange={(e) => setMapping({ ...mapping, stock: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Default 0 --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Packaging Unit / Size (Optional)
                        </label>
                        <select
                          value={mapping.unit}
                          onChange={(e) => setMapping({ ...mapping, unit: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Barcode / EAN (Optional)
                        </label>
                        <select
                          value={mapping.barcode}
                          onChange={(e) => setMapping({ ...mapping, barcode: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Short Description (Optional)
                        </label>
                        <select
                          value={mapping.shortDesc}
                          onChange={(e) => setMapping({ ...mapping, shortDesc: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Full Description (Optional)
                        </label>
                        <select
                          value={mapping.description}
                          onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Active Status (Optional)
                        </label>
                        <select
                          value={mapping.isActive}
                          onChange={(e) => setMapping({ ...mapping, isActive: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Default to Active --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border sm:col-span-2">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Featured Status (Optional)
                        </label>
                        <select
                          value={mapping.isFeatured}
                          onChange={(e) => setMapping({ ...mapping, isFeatured: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Default to Not Featured --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-muted/30 border-t border-border flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={closeImportModal}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkImport}
                disabled={isImporting || !csvData.length || !mapping.name}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    <span>Run Import ({csvData.length} Products)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
