'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, Star, MessageSquare,
  X, Check, ToggleLeft, ToggleRight, User, Hash, AlignLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Testimonial {
  id: number;
  name: string;
  subtitle: string;
  quote: string;
  rating: number;
  avatar: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface FormState {
  name: string;
  subtitle: string;
  quote: string;
  rating: number;
  avatar: string;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: FormState = {
  name: '', subtitle: '', quote: '', rating: 5, avatar: '', isActive: true, sortOrder: '0',
};

const lbl = 'text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5';
const inp = 'w-full border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`transition-colors ${n <= value ? 'text-brand-gold' : 'text-brand-foreground/20 hover:text-brand-gold/50'}`}>
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const closeForm = () => { setShowForm(false); setForm(emptyForm); setEditing(null); };
  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, subtitle: t.subtitle, quote: t.quote, rating: t.rating, avatar: t.avatar || '', isActive: t.isActive, sortOrder: String(t.sortOrder) });
    setShowForm(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
      if (e.altKey && e.key.toLowerCase() === 'n') { e.preventDefault(); if (!showForm) openCreate(); }
      if (e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); if (showForm) formRef.current?.requestSubmit(); }
      if (e.key === 'Escape' && showForm && !inField) closeForm();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showForm]);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(t => t.isActive).length,
    avgRating: items.length ? (items.reduce((a, t) => a + t.rating, 0) / items.length).toFixed(1) : '—',
  }), [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(t => t.name.toLowerCase().includes(q) || t.quote.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q));
  }, [items, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subtitle.trim() || !form.quote.trim()) {
      toast.error('Name, subtitle and quote are required'); return;
    }
    setLoading(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      const method = editing ? 'PATCH' : 'POST';
      if (editing) (payload as any).id = editing.id;
      const res = await fetch('/api/admin/testimonials', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const saved: Testimonial = await res.json();
      if (editing) {
        setItems(prev => prev.map(t => t.id === saved.id ? saved : t));
        toast.success('Testimonial updated!');
      } else {
        setItems(prev => [saved, ...prev]);
        toast.success('Testimonial created!');
      }
      closeForm();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setItems(prev => prev.filter(t => t.id !== id));
      toast.success('Deleted');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); setDeleteConfirmId(null); }
  };

  const toggleActive = async (t: Testimonial) => {
    try {
      const res = await fetch('/api/admin/testimonials', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, isActive: !t.isActive }) });
      if (!res.ok) throw new Error('Failed');
      const saved: Testimonial = await res.json();
      setItems(prev => prev.map(x => x.id === saved.id ? saved : x));
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: MessageSquare, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Active on Homepage', value: stats.active, icon: ToggleRight, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input type="text" placeholder="Search testimonials..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-full" />
          </div>
          <button onClick={openCreate} title="New Testimonial (Alt+N)"
            className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex-shrink-0">
            <Plus className="h-4 w-4" /> Add Testimonial
            <kbd className="text-[10px] bg-card/20 px-1.5 py-0.5 rounded font-mono ml-1">Alt+N</kbd>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                {['Person', 'Quote', 'Rating', 'Order', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${h === 'Actions' ? 'text-right' : (['Rating', 'Order', 'Status'].includes(h) ? 'text-center' : 'text-left')}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-brand-foreground/40 font-medium">
                  No testimonials yet. Click <strong>Add Testimonial</strong> to create one.
                </td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={t.avatar && t.avatar.trim().length > 0 ? t.avatar : "/avatar.webp"} 
                        alt={t.name} 
                        className="h-9 w-9 rounded-full object-cover border border-brand-gold/15 flex-shrink-0" 
                      />
                      <div>
                        <div className="font-bold text-brand-green">{t.name}</div>
                        <div className="text-xs text-brand-foreground/50">{t.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-brand-foreground/70 italic text-xs line-clamp-2">"{t.quote}"</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-0.5 text-brand-gold">
                      {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-xs font-bold text-brand-foreground/60 bg-brand-gold-light/50 px-2 py-1 rounded-full">{t.sortOrder}</span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button onClick={() => toggleActive(t)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors mx-auto ${t.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40' : 'bg-muted text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80'}`}>
                      {t.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                      {t.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="p-2 text-brand-gold-dark hover:bg-brand-gold/20 rounded-lg transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(t.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-lg">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{editing ? `Editing: ${editing.name}` : 'Add a customer testimonial to the homepage'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Alt+S</kbd>
                  <span className="text-[10px] text-white/50">{editing ? 'Save' : 'Create'}</span>
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                  <span className="text-[10px] text-white/50">Close</span>
                </div>
              </div>
              <button onClick={closeForm} className="p-1.5 bg-card/10 hover:bg-card/20 rounded-full transition-colors" title="Close (Esc)">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Name + Subtitle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Name <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sunita Sharma" className={inp} required />
                </div>
                <div>
                  <label className={lbl}>Subtitle <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                    placeholder="e.g. Vata Prakriti · Mumbai" className={inp} required />
                </div>
              </div>

              {/* Quote */}
              <div>
                <label className={lbl}>Quote <span className="text-rose-500">*</span></label>
                <textarea value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                  rows={4} placeholder="What did this person say about Ayurwed?" className={`${inp} resize-none`} required />
              </div>

              {/* Rating */}
              <div>
                <label className={lbl}>Rating</label>
                <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>

              {/* Avatar + Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Avatar URL (optional)</label>
                  <input type="url" value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                    placeholder="https://..." className={inp} />
                </div>
                <div>
                  <label className={lbl}>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                    placeholder="0" className={inp} min="0" />
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                  {form.isActive ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                </button>
                <span className="text-sm font-semibold text-brand-foreground/70">Show on Homepage</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-card pb-1">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold text-brand-foreground/60 hover:bg-brand-gold-light/40 transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-60">
                  {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Delete Testimonial?</h3>
              <p className="text-sm text-brand-foreground/60">
                Are you sure you want to delete this testimonial? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-muted border-t border-border flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-card border border-border text-sm font-bold hover:bg-muted-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)} 
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
