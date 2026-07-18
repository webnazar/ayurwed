'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Edit, Trash2, X, Package, Tag, Star, Eye, EyeOff,
  ToggleLeft, ToggleRight, Building2, ImageIcon, ChevronDown, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

interface Manufacturer { id: number; companyName: string; logo: string | null; }
interface Product {
  id: number; name: string; slug: string; description: string; shortDesc: string | null;
  category: string | null; manufacturerId: number | null; sku: string | null;
  mrp: number; sellingPrice: number; stock: number; unit: string | null;
  images: string[]; tags: string | null; isActive: boolean; isFeatured: boolean;
  manufacturer?: Manufacturer | null;
}

const emptyForm = {
  id: 0, name: '', description: '', shortDesc: '', category: '',
  manufacturerId: '', sku: '', mrp: '', sellingPrice: '', stock: '0',
  unit: '', tags: '', isActive: true, isFeatured: false,
};

const discount = (mrp: number, sp: number) =>
  mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ProductMasterClient({
  initialProducts, manufacturers,
}: { initialProducts: Product[]; manufacturers: Manufacturer[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  // After phase-1 save, holds the product ID so images can be named correctly
  const [savedProductId, setSavedProductId] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Global keyboard shortcuts (Alt+N = new, Alt+S = save, Esc = close)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') { e.preventDefault(); if (!isFormOpen) openCreate(); }
      if (e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); if (isFormOpen) formRef.current?.requestSubmit(); }
      if (e.key === 'Escape' && isFormOpen) {
        const tag = (e.target as HTMLElement).tagName;
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) setIsFormOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isFormOpen]);

  // Merge predefined list with any custom values already saved in DB
  const categories = useMemo(() => {
    const fromDb = products.map(p => p.category).filter(Boolean) as string[];
    const extra = fromDb.filter(c => !PRODUCT_CATEGORIES.includes(c));
    return [...PRODUCT_CATEGORIES, ...extra];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (searchTerm) list = list.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filterCategory) list = list.filter(p => p.category === filterCategory);
    return list;
  }, [products, searchTerm, filterCategory]);

  const openCreate = () => {
    setForm(emptyForm); setImages([]); setSavedProductId(null); setIsEditing(false); setIsFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id, name: p.name, description: p.description, shortDesc: p.shortDesc || '',
      category: p.category || '', manufacturerId: p.manufacturerId?.toString() || '',
      sku: p.sku || '', mrp: p.mrp.toString(), sellingPrice: p.sellingPrice.toString(),
      stock: p.stock.toString(), unit: p.unit || '', tags: p.tags || '',
      isActive: p.isActive, isFeatured: p.isFeatured,
    });
    setImages(p.images || []);
    setSavedProductId(p.id);   // editing: ID already exists, images can upload immediately
    setIsEditing(true); setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name required');
    if (!form.mrp || !form.sellingPrice) return toast.error('MRP and Selling Price required');
    setLoading(true);
    try {
      const payload = { ...form, images, manufacturerId: form.manufacturerId ? parseInt(form.manufacturerId) : null };
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/products', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const saved = await res.json();
      if (isEditing) {
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
        toast.success('Product updated');
        setIsFormOpen(false);
      } else {
        // Phase 1 complete — product saved, now allow image uploads
        setProducts(prev => [saved, ...prev]);
        setSavedProductId(saved.id);
        setForm(f => ({ ...f, id: saved.id }));
        setIsEditing(true); // switch to edit mode so re-submit does PATCH
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

  // Add image: upload immediately and PATCH product images array in DB
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

  // Remove image: update state and PATCH product in DB
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
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input type="text" placeholder="Search products..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold" />
          </div>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-muted text-foreground border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold appearance-none w-full sm:w-56">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button onClick={openCreate}
          title="New Product (Alt+N)"
          className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors text-sm w-full sm:w-auto justify-center flex-shrink-0">
          <Plus className="h-4 w-4" /> Add Product
          <kbd className="text-[10px] bg-card/20 px-1.5 py-0.5 rounded font-mono ml-1 hidden sm:inline">Alt+N</kbd>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Active', value: products.filter(p => p.isActive).length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Featured', value: products.filter(p => p.isFeatured).length, color: 'text-brand-gold-dark bg-brand-gold-light/40' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color}`}><Package className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider block">{s.label}</span>
              <span className="text-2xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {['Product', 'Category', 'Pricing', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-foreground/40">No products found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-xl object-cover border border-border flex-shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-brand-gold-light/30 flex items-center justify-center border border-border flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-brand-green/40" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-brand-green leading-tight">{p.name}</div>
                      {p.sku && <div className="text-[10px] text-foreground/50 font-mono mt-0.5">SKU: {p.sku}</div>}
                      {p.manufacturer && (
                        <div className="text-[10px] text-foreground/60 flex items-center gap-1 mt-0.5">
                          <Building2 className="h-2.5 w-2.5" /> {p.manufacturer.companyName}
                        </div>
                      )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Category</label>
                      <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" />
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className={`${inputCls} appearance-none pr-10`}>
                          <option value="">— Select Category —</option>
                          {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>SKU</label>
                      <input type="text" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inputCls} placeholder="Unique product code" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Manufacturer</label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" />
                      <select value={form.manufacturerId} onChange={e => setForm(f => ({ ...f, manufacturerId: e.target.value }))} className={`${inputCls} appearance-none pr-10`}>
                        <option value="">— No Manufacturer —</option>
                        {manufacturers.map(m => <option key={m.id} value={m.id}>{m.companyName}</option>)}
                      </select>
                    </div>
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
                    <label className={labelCls}>Tags (comma-separated)</label>
                    <input type="text" value={form.tags || ''} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className={inputCls} placeholder="ayurvedic, immunity, herbs" />
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
                  <div className="bg-muted/50 rounded-2xl p-4 border border-border text-sm space-y-1.5">
                    <p className="font-bold text-foreground/70">Shipping Policy</p>
                    <p className="text-foreground/60">• Free shipping on orders above ₹500</p>
                    <p className="text-foreground/60">• ₹60 flat shipping fee otherwise</p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* ── Section: Images ── */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-brand-green uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-5 h-[2px] bg-brand-green rounded" />
                    Product Images
                    {savedProductId && (
                      <span className="ml-auto text-[10px] font-mono text-foreground/40 normal-case tracking-normal">
                        ID: {savedProductId}
                      </span>
                    )}
                  </h4>

                  {!savedProductId ? (
                    /* Locked state — product must be saved first */
                    <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center space-y-2">
                      <ImageIcon className="h-10 w-10 mx-auto text-foreground/20" />
                      <p className="text-sm font-semibold text-foreground/50">Save the product details first</p>
                      <p className="text-xs text-foreground/40">
                        Images will be named <span className="font-mono">product_<em>id</em>_1.jpg</span>, <span className="font-mono">product_<em>id</em>_2.jpg</span> …
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-foreground/60">
                        Images are saved automatically. First image is the thumbnail.
                        Files are stored as <span className="font-mono text-brand-green">product_{savedProductId}_1.jpg</span>, <span className="font-mono text-brand-green">product_{savedProductId}_2.jpg</span> …
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, i) => (
                          <div key={i} className="relative group rounded-2xl overflow-hidden border border-border aspect-square">
                            <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                            {i === 0 && (
                              <span className="absolute top-2 left-2 bg-brand-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Main</span>
                            )}
                            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                              product_{savedProductId}_{i + 1}
                            </span>
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
                      {images.length > 1 && (
                        <p className="text-[10px] text-foreground/50">💡 First image = thumbnail. Drag-to-reorder coming soon.</p>
                      )}
                    </>
                  )}
                </div>

              </div>

              <div className="p-5 border-t border-border bg-muted/30 rounded-b-3xl flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-card border border-border hover:bg-muted transition-colors">
                  {savedProductId && !isEditing ? 'Close' : 'Cancel'}
                </button>
                {/* After phase-1 save of a new product, show Done instead of another submit */}
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
            <p className="text-sm text-foreground/60 mb-6">This will permanently remove the product. Orders referencing it may be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-muted rounded-xl text-sm font-bold border hover:bg-card">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
