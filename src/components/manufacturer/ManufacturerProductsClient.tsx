'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, Package, Star, Boxes, Clock,
  X, Check, Filter, Image as ImageIcon, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';
import { formatPrice } from '@/lib/utils';

interface Category { id: number; name: string; }
interface Indication { id: number; name: string; isActive: boolean; }
interface Product {
  id: number; name: string; slug: string; description: string;
  ingredients: string[]; benefits: string[]; usage: string;
  mrp: string | null;
  images: string[]; categoryId: number; isActive: boolean;
  isFeatured: boolean; isSponsored: boolean; isShopProduct: boolean;
  category: { id: number; name: string };
  indications?: { id: number; name: string }[];
  _count: { reviews: number; enquiries: number };
}
interface FormState {
  name: string; description: string; usage: string;
  mrp: string;
  categoryId: string; images: string[];
  indicationIds: string[];
  ingredients: string; benefits: string;
  isShopProduct: boolean;
}

const emptyForm: FormState = {
  name: '', description: '', usage: '',
  mrp: '',
  categoryId: '', images: [],
  indicationIds: [],
  ingredients: '', benefits: '',
  isShopProduct: false,
};

const inp = "w-full border border-brand-green-border/20 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20";
const lbl = "text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5";

export default function ManufacturerProductsClient({
  initialProducts, categories, indications,
}: { initialProducts: Product[]; categories: Category[]; indications: Indication[]; }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [searchIndication, setSearchIndication] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const stats = useMemo(() => ({
    total: products.length,
    pending: products.filter(p => !p.isActive).length,
    active: products.filter(p => p.isActive).length,
    sponsored: products.filter(p => p.isSponsored).length,
  }), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus === 'active') list = list.filter(p => p.isActive);
    if (filterStatus === 'pending') list = list.filter(p => !p.isActive);
    return list;
  }, [products, search, filterStatus]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, usage: p.usage,
      mrp: p.mrp ? String(p.mrp) : '',
      categoryId: String(p.categoryId),
      indicationIds: p.indications?.map(ind => String(ind.id)) || [],
      images: p.images || [],
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.join('\n') : '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : '',
      isShopProduct: p.isShopProduct || false,
    });
    setShowForm(true);
    setSearchIndication('');
  };
  const closeForm = () => { setShowForm(false); setForm(emptyForm); setEditing(null); setSearchIndication(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mrp || !form.categoryId) { toast.error('Fill required fields'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name, description: form.description, usage: form.usage,
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        categoryId: form.categoryId, images: form.images,
        indicationIds: form.indicationIds,
        ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
        benefits: form.benefits.split('\n').map(s => s.trim()).filter(Boolean),
        isShopProduct: form.isShopProduct,
      };
      const method = editing ? 'PATCH' : 'POST';
      if (editing) (payload as any).id = editing.id;
      const res = await fetch('/api/manufacturer/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const saved: Product = await res.json();
      if (editing) {
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
        toast.success('Preparation updated!');
      } else {
        setProducts(prev => [saved, ...prev]);
        toast.success('Preparation submitted for approval!');
      }
      closeForm();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/manufacturer/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Preparation deleted');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); setDeleteConfirmId(null); }
  };

  const addImage = (url: string) => setForm(f => ({ ...f, images: [...f.images, url] }));
  const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Preparations', value: stats.total, icon: Package, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Live & Active', value: stats.active, icon: ToggleRight, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Sponsored', value: stats.sponsored, icon: Star, color: 'text-indigo-600 bg-indigo-50' },
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-brand-green-border/10">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <input type="text" placeholder="Search preparations..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-56" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex-shrink-0">
            <Plus className="h-4 w-4" /> Submit Preparation
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                {['Product', 'Category', 'MRP', 'Visibility', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${['MRP', 'Actions', 'Visibility'].includes(h) ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-brand-foreground/40 font-medium">
                  No preparations yet. Click <strong>Submit Preparation</strong> to add your first product.
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
                        <div className="font-bold text-brand-green line-clamp-1 max-w-[160px]">{p.name}</div>
                        {p.isFeatured && <span className="text-[10px] bg-brand-gold/15 text-brand-gold-dark px-1.5 py-0.5 rounded-full font-semibold mr-1">Featured</span>}
                        {p.isShopProduct && <span className="text-[10px] bg-brand-green/15 text-brand-green px-1.5 py-0.5 rounded-full font-semibold">In Shop</span>}
                        {p.indications && p.indications.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.indications.map(ind => (
                              <span key={ind.id} className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                                {ind.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-brand-foreground/70">{p.category?.name}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-brand-green">{p.mrp ? formatPrice(Number(p.mrp)) : 'N/A'}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.isSponsored ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isSponsored ? 'Sponsored' : 'Organic'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.isActive ? <><ToggleRight className="h-3 w-3" /> Live</> : <><Clock className="h-3 w-3" /> Pending</>}
                    </span>
                  </td>
                  {/* Deleted Reviews cell */}
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-2 rounded-xl text-brand-green hover:bg-brand-green-light transition-colors border border-brand-green/20" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deleteConfirmId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(p.id)} disabled={loading}
                            className="p-2 rounded-xl text-white bg-rose-500 hover:bg-rose-600 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteConfirmId(null)}
                            className="p-2 rounded-xl text-brand-foreground/60 hover:bg-gray-100 transition-colors"><X className="h-3.5 w-3.5" /></button>
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
                <h3 className="font-extrabold text-lg">{editing ? 'Edit Preparation' : 'Submit New Preparation'}</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{editing ? `Editing: ${editing.name}` : 'Will be live after admin approval'}</p>
              </div>
              <button onClick={closeForm} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={lbl}>Name <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ashwagandha Capsules" className={inp} required />
                </div>
              </div>
              <div>
                <label className={lbl}>Description <span className="text-rose-500">*</span></label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={`${inp} resize-none`} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Ingredients (one per line)</label>
                  <textarea value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} rows={4} className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className={lbl}>Benefits (one per line)</label>
                  <textarea value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} rows={4} className={`${inp} resize-none`} />
                </div>
              </div>
              <div>
                <label className={lbl}>Usage Instructions</label>
                <textarea value={form.usage} onChange={e => setForm(f => ({ ...f, usage: e.target.value }))} rows={2} className={`${inp} resize-none`} />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={lbl}>Reference MRP (₹) <span className="text-rose-500">*</span></label>
                  <input type="number" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} placeholder="599" className={inp} required />
                </div>
              </div>
              <div>
                <label className={lbl}>Category <span className="text-rose-500">*</span></label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={`${inp} appearance-none`} required>
                  <option value="">— Select Category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

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
                        <label key={ind.id} className="flex items-start gap-2 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-0.5">
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
                              className="peer sr-only"
                            />
                            <div className="h-4 w-4 rounded bg-white border border-brand-green-border/30 peer-checked:bg-brand-green peer-checked:border-brand-green transition-colors flex items-center justify-center">
                              <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-brand-foreground/70 group-hover:text-brand-green transition-colors leading-tight">
                            {ind.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              </div>
              <div>
                <label className={lbl}>Product Images (up to 5)</label>
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} className="h-16 w-16 rounded-xl object-cover border-2 border-brand-green" />
                      <button type="button" onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {form.images.length < 5 && <ImageUploadCrop value="" onChange={addImage} folder="products" label="" />}
                </div>
              </div>
              
              <div className="bg-brand-green-light/30 border border-brand-green/20 rounded-2xl p-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={form.isShopProduct} onChange={e => setForm(f => ({ ...f, isShopProduct: e.target.checked }))} className="peer sr-only" />
                    <div className="h-6 w-11 rounded-full bg-brand-green-border/20 peer-checked:bg-brand-green transition-colors"></div>
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-brand-green block leading-none mb-1">AYURWED Shop Integration</span>
                    <span className="text-[10px] font-bold text-brand-foreground/60 leading-tight block">Opt-in to make this preparation available for direct sale on the official AYURWED Storefront.</span>
                  </div>
                </label>
              </div>
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl border border-brand-green-border/20 text-sm font-bold text-brand-foreground/60 hover:bg-brand-gold-light/40 transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 disabled:opacity-60">
                  {loading ? 'Saving...' : editing ? 'Save Changes' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
