'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, Package, Star, ShoppingBag,
  X, Check, Tag, AlignLeft, DollarSign, Layers, ToggleLeft,
  ToggleRight, Boxes, Image as ImageIcon, Sparkles, Filter, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from './ImageUploadCrop';
import { formatPrice } from '@/lib/utils';
import SearchSelect from '@/components/ui/SearchSelect';

interface Category { id: number; name: string; }
interface Manufacturer { id: number; companyName: string; }
interface Indication { id: number; name: string; }
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  mrp: number | null;
  images: string[];
  categoryId: number;
  manufacturerId: number;
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  category: { id: number; name: string };
  manufacturer: { id: number; companyName: string };
  indications: Indication[];
  _count: { reviews: number; enquiries: number };
}

interface FormState {
  name: string; description: string; usage: string;
  mrp: string;
  categoryId: string; manufacturerId: string;
  indicationIds: string[];
  isActive: boolean; isFeatured: boolean; isSponsored: boolean; isShopProduct: boolean;
  images: string[];
  ingredients: string; benefits: string;
}

const emptyForm: FormState = {
  name: '', description: '', usage: '',
  mrp: '',
  categoryId: '', manufacturerId: '',
  indicationIds: [],
  isActive: true, isFeatured: false, isSponsored: false, isShopProduct: false,
  images: [], ingredients: '', benefits: '',
};

export default function ProductMasterClient({
  initialProducts, categories, manufacturers, indications
}: {
  initialProducts: Product[];
  categories: Category[];
  manufacturers: Manufacturer[];
  indications: Indication[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [searchIndication, setSearchIndication] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [imageTab, setImageTab] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if focus is inside an input/textarea/select (except Alt combos)
      const tag = (e.target as HTMLElement).tagName;
      const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);

      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!showForm) openCreate();
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (showForm) formRef.current?.requestSubmit();
      }
      if (e.key === 'Escape' && showForm && !inField) {
        closeForm();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showForm]);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.isActive).length,
    featured: products.filter(p => p.isFeatured).length,
    sponsored: products.filter(p => p.isSponsored).length,
  }), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search));
    if (filterStatus === 'active') list = list.filter(p => p.isActive);
    if (filterStatus === 'inactive') list = list.filter(p => !p.isActive);
    if (filterStatus === 'featured') list = list.filter(p => p.isFeatured);
    if (filterStatus === 'sponsored') list = list.filter(p => p.isSponsored);
    if (filterStatus === 'shop') list = list.filter(p => (p as any).isShopProduct);
    if (filterCat) list = list.filter(p => p.categoryId === Number(filterCat));
    return list;
  }, [products, search, filterStatus, filterCat]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setImageTab(0); setShowForm(true); setSearchIndication(''); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, usage: p.usage,
      mrp: p.mrp ? String(p.mrp) : '',
      categoryId: String(p.categoryId),
      manufacturerId: String(p.manufacturerId),
      indicationIds: p.indications?.map(ind => String(ind.id)) || [],
      isActive: p.isActive, isFeatured: p.isFeatured, isSponsored: p.isSponsored, isShopProduct: (p as any).isShopProduct || false,
      images: p.images || [],
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.join('\n') : '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : '',
    });
    setImageTab(0);
    setShowForm(true);
    setSearchIndication('');
  };

  const closeForm = () => { setShowForm(false); setForm(emptyForm); setEditing(null); setSearchIndication(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId || !form.manufacturerId) {
      toast.error('Fill all required fields'); return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name, description: form.description, usage: form.usage,
        mrp: form.mrp,
        categoryId: form.categoryId, manufacturerId: form.manufacturerId,
        indicationIds: form.indicationIds.map(id => Number(id)),
        isActive: form.isActive, isFeatured: form.isFeatured, isSponsored: form.isSponsored, isShopProduct: form.isShopProduct,
        images: form.images,
        ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
        benefits: form.benefits.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const method = editing ? 'PATCH' : 'POST';
      if (editing) (payload as any).id = editing.id;
      const res = await fetch('/api/admin/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const saved: Product = await res.json();
      if (editing) {
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
        toast.success('Product updated!');
      } else {
        setProducts(prev => [saved, ...prev]);
        toast.success('Product created!');
      }
      closeForm();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); setDeleteConfirmId(null); }
  };

  const toggleField = async (id: number, field: 'isActive' | 'isFeatured' | 'isSponsored', val: boolean) => {
    try {
      const res = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: val }) });
      if (!res.ok) throw new Error('Failed');
      const saved: Product = await res.json();
      setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
      toast.success(`${field === 'isActive' ? (val ? 'Activated' : 'Deactivated') : (val ? 'Featured' : 'Unfeatured')}`);
    } catch { toast.error('Update failed'); }
  };

  const addImage = (url: string) => {
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setImageTab(form.images.length);
  };
  const removeImage = (idx: number) => {
    setForm(f => {
      const imgs = f.images.filter((_, i) => i !== idx);
      return { ...f, images: imgs };
    });
    setImageTab(0);
  };

  const inp = "w-full border border-brand-green-border/20 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20";
  const lbl = "text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Active', value: stats.active, icon: ToggleRight, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Featured', value: stats.featured, icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
          { label: 'Sponsored', value: stats.sponsored, icon: Tag, color: 'text-indigo-600 bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-brand-green-border/10">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-full" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
                <option value="sponsored">Sponsored</option>
                <option value="shop">Ayurwed Shop</option>
              </select>
            </div>
            <SearchSelect
              options={categories.map(c => ({ value: String(c.id), label: c.name }))}
              value={filterCat}
              onChange={setFilterCat}
              placeholder="All Categories"
              icon={<Layers className="h-4 w-4" />}
              clearable
              className="w-48"
            />
          </div>
          <button onClick={openCreate} title="New Product (Alt+N)"
            className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex-shrink-0">
            <Plus className="h-4 w-4" /> Add Product
            <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono ml-1">Alt+N</kbd>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                {['Product', 'Category', 'MRP', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${h === 'Actions' || h === 'MRP' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-brand-foreground/40 font-medium">
                  No products found. Click <strong>Add Product</strong> to get started.
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-xl object-cover border border-brand-gold/15 flex-shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-4 w-4 text-brand-green" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-brand-green line-clamp-1 max-w-[180px]">{p.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-brand-foreground/70">{p.category?.name}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-brand-green">{p.mrp ? formatPrice(Number(p.mrp)) : 'N/A'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => toggleField(p.id, 'isActive', !p.isActive)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${p.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {p.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => toggleField(p.id, 'isFeatured', !p.isFeatured)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${p.isFeatured ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <Star className="h-3 w-3" />
                        {p.isFeatured ? 'Featured' : 'Not Featured'}
                      </button>
                      <button onClick={() => toggleField(p.id, 'isSponsored', !p.isSponsored)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${p.isSponsored ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <Tag className="h-3 w-3" />
                        {p.isSponsored ? 'Sponsored' : 'Not Sponsored'}
                      </button>
                      <button onClick={() => toggleField(p.id, 'isShopProduct', !(p as any).isShopProduct)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${(p as any).isShopProduct ? 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <Package className="h-3 w-3" />
                        {(p as any).isShopProduct ? 'In Shop' : 'Not in Shop'}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-2 rounded-xl text-brand-green hover:bg-brand-green-light transition-colors border border-brand-green/20" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deleteConfirmId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(p.id)} disabled={loading}
                            className="p-2 rounded-xl text-white bg-rose-500 hover:bg-rose-600 transition-colors" title="Confirm">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)}
                            className="p-2 rounded-xl text-brand-foreground/60 hover:bg-gray-100 transition-colors" title="Cancel">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(p.id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors border border-rose-200" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-lg">{editing ? 'Edit Product' : 'New Product'}</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{editing ? `Editing: ${editing.name}` : 'Add a new Ayurvedic preparation'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">Alt+S</kbd>
                  <span className="text-[10px] text-white/50">{editing ? 'Save Changes' : 'Create'}</span>
                  <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                  <span className="text-[10px] text-white/50">Close</span>
                </div>
              </div>
              <button onClick={closeForm} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors" title="Close (Esc)">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Name */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={lbl}>Name <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Ashwagandha Capsules" className={inp} required />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={lbl}>Description <span className="text-rose-500">*</span></label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Brief product description..." className={`${inp} resize-none`} required />
              </div>

              {/* Ingredients + Benefits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Ingredients (one per line)</label>
                  <textarea value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                    rows={4} placeholder="Ashwagandha Root&#10;Brahmi Extract" className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className={lbl}>Benefits (one per line)</label>
                  <textarea value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))}
                    rows={4} placeholder="Reduces stress&#10;Improves sleep" className={`${inp} resize-none`} />
                </div>
              </div>

              {/* Usage */}
              <div>
                <label className={lbl}>Usage Instructions</label>
                <textarea value={form.usage} onChange={e => setForm(f => ({ ...f, usage: e.target.value }))}
                  rows={2} placeholder="Take 2 capsules daily with warm milk..." className={`${inp} resize-none`} />
              </div>

              {/* MRP */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={lbl}>Reference MRP (₹)</label>
                  <input type="number" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
                    placeholder="599" className={inp} min="0" step="0.01" />
                </div>
              </div>

              {/* Category + Manufacturer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Category <span className="text-rose-500">*</span></label>
                  <SearchSelect
                    options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                    value={form.categoryId}
                    onChange={v => setForm(f => ({ ...f, categoryId: v }))}
                    placeholder="— Select Category —"
                    icon={<Layers className="h-4 w-4" />}
                    clearable={false}
                  />
                  {/* Hidden native input for required validation */}
                  <input type="text" value={form.categoryId} required onChange={() => {}} className="sr-only" />
                </div>
                <div>
                  <label className={lbl}>Manufacturer <span className="text-rose-500">*</span></label>
                  <SearchSelect
                    options={manufacturers.map(m => ({ value: String(m.id), label: m.companyName }))}
                    value={form.manufacturerId}
                    onChange={v => setForm(f => ({ ...f, manufacturerId: v }))}
                    placeholder="— Select Manufacturer —"
                    icon={<Building2 className="h-4 w-4" />}
                    clearable={false}
                  />
                  {/* Hidden native input for required validation */}
                  <input type="text" value={form.manufacturerId} required onChange={() => {}} className="sr-only" />
                </div>
              </div>

              {/* Indications */}
              <div>
                <label className={lbl}>Indications (Health Conditions)</label>
                <div className="bg-brand-gold-light/20 border border-brand-green-border/20 rounded-2xl p-4 max-h-64 flex flex-col gap-3">
                  <div className="relative flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
                    <input type="text" placeholder="Search indications..." value={searchIndication} onChange={e => setSearchIndication(e.target.value)}
                      className="pl-9 w-full bg-white border border-brand-green-border/20 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-brand-green shadow-sm" />
                  </div>
                  <div className="overflow-y-auto flex-1 pr-2">
                    {indications.filter(ind => ind.name.toLowerCase().includes(searchIndication.toLowerCase())).length === 0 ? (
                      <p className="text-xs text-brand-foreground/50 py-2">No matching indications found.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {indications.filter(ind => ind.name.toLowerCase().includes(searchIndication.toLowerCase())).map(ind => (
                        <label key={ind.id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={form.indicationIds.includes(String(ind.id))}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setForm(f => ({
                                ...f,
                                indicationIds: checked 
                                  ? [...f.indicationIds, String(ind.id)]
                                  : f.indicationIds.filter(id => id !== String(ind.id))
                              }));
                            }}
                            className="h-4 w-4 rounded border-brand-green-border/20 text-brand-green focus:ring-brand-green/30"
                          />
                          <span className="text-sm text-brand-foreground/80 group-hover:text-brand-green transition-colors">{ind.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                    {form.isActive ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-gray-400" />}
                  </button>
                  <span className="text-sm font-semibold text-brand-foreground/70">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}>
                    {form.isFeatured ? <ToggleRight className="h-7 w-7 text-amber-500" /> : <ToggleLeft className="h-7 w-7 text-gray-400" />}
                  </button>
                  <span className="text-sm font-semibold text-brand-foreground/70">Featured on Home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => setForm(f => ({ ...f, isSponsored: !f.isSponsored }))}>
                    {form.isSponsored ? <ToggleRight className="h-7 w-7 text-indigo-500" /> : <ToggleLeft className="h-7 w-7 text-gray-400" />}
                  </button>
                  <span className="text-sm font-semibold text-brand-foreground/70">Sponsored</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => setForm(f => ({ ...f, isShopProduct: !f.isShopProduct }))}>
                    {form.isShopProduct ? <ToggleRight className="h-7 w-7 text-fuchsia-600" /> : <ToggleLeft className="h-7 w-7 text-gray-400" />}
                  </button>
                  <span className="text-sm font-semibold text-brand-foreground/70">AYURWED Shop</span>
                </label>
              </div>

              {/* Images */}
              <div>
                <label className={lbl}>Product Images</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`img-${idx}`} className={`h-16 w-16 rounded-xl object-cover border-2 cursor-pointer transition-all ${imageTab === idx ? 'border-brand-green' : 'border-transparent'}`}
                        onClick={() => setImageTab(idx)} />
                      <button type="button" onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {form.images.length < 5 && (
                    <ImageUploadCrop value="" onChange={addImage} folder="products" label="" />
                  )}
                </div>
                {form.images.length === 0 && (
                  <p className="text-xs text-brand-foreground/40">Upload up to 5 product images.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl border border-brand-green-border/20 text-sm font-bold text-brand-foreground/60 hover:bg-brand-gold-light/40 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-60">
                  {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
