'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import {
  Search, Plus, Pencil, Trash2, Package, Star, ShoppingBag,
  X, Check, Tag, AlignLeft, DollarSign, Layers, ToggleLeft,
  ToggleRight, Boxes, Image as ImageIcon, Sparkles, Filter, Building2, FileUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from './ImageUploadCrop';
import { formatPrice } from '@/lib/utils';
import SearchSelect from '@/components/ui/SearchSelect';


interface Indication { id: number; name: string; }
interface Preparation {
  id: number;
  type: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  mrp: number | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  indications: Indication[];
  _count: { reviews: number; enquiries: number };
}

interface FormState {
  type: string;
  volume: string; volumeUnit: string;
  weight: string; weightUnit: string;
  count: string; countUnit: string;
  name: string; description: string; usage: string;
  mrp: string;
  indicationIds: string[];
  isActive: boolean; isFeatured: boolean; isSponsored: boolean;
  images: string[];
  ingredients: string; benefits: string;
}

const emptyForm: FormState = {
  type: 'LIQUID_EXTRACT',
  volume: '', volumeUnit: 'ml',
  weight: '', weightUnit: 'g',
  count: '', countUnit: 'pcs',
  name: '', description: '', usage: '',
  mrp: '',
  indicationIds: [],
  isActive: true, isFeatured: false, isSponsored: false,
  images: [], ingredients: '', benefits: '',
};

export default function PreparationMasterClient({
  initialExtracts, indications
}: {
  initialExtracts: Preparation[];
  indications: Indication[];
}) {
  const [preparations, setExtracts] = useState<Preparation[]>(initialExtracts);
  const [search, setSearch] = useState('');
  const [searchIndication, setSearchIndication] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Preparation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({
    name: '', type: '', mrp: '', description: '',
    usage: '', volume: '', volumeUnit: '', weight: '', weightUnit: '', count: '', countUnit: '', ingredients: '', benefits: ''
  });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeImportModal = () => {
    setShowImportModal(false);
    setCsvData([]);
    setCsvHeaders([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = Object.keys(results.data[0] as any);
          setCsvHeaders(headers);
          setCsvData(results.data as any[]);
          
          const autoMap = { ...mapping };
          headers.forEach(h => {
            const hl = h.toLowerCase();
            if (hl.includes('name') && !hl.includes('manufacturer')) autoMap.name = h;
            if (hl.includes('type')) autoMap.type = h;
            if (hl.includes('mrp') || hl.includes('price')) autoMap.mrp = h;
            if (hl.includes('description') || hl.includes('desc')) autoMap.description = h;
            if (hl.includes('usage')) autoMap.usage = h;
            if (hl.includes('volume') && !hl.includes('unit')) autoMap.volume = h;
            if (hl.includes('volume') && hl.includes('unit')) autoMap.volumeUnit = h;
            if (hl.includes('weight') && !hl.includes('unit')) autoMap.weight = h;
            if (hl.includes('weight') && hl.includes('unit')) autoMap.weightUnit = h;
            if (hl.includes('count') && !hl.includes('unit')) autoMap.count = h;
            if (hl.includes('count') && hl.includes('unit')) autoMap.countUnit = h;
            if (hl.includes('ingredients')) autoMap.ingredients = h;
            if (hl.includes('benefits')) autoMap.benefits = h;
          });
          setMapping(autoMap);
        }
      },
      error: (err) => {
        toast.error('Failed to parse CSV file.');
      }
    });
  };

  const executeBulkImport = async () => {
    if (csvData.length === 0) return;
    if (!mapping.name) {
      toast.error("You must map 'Preparation Name'.");
      return;
    }
    if (!mapping.name) {
      toast.error("You must map 'Preparation Name'.");
      return;
    }

    setIsImporting(true);
    try {
      const payload = csvData.map(row => {
        const item: any = {};
        Object.keys(mapping).forEach(key => {
          if ((mapping as any)[key]) {
            item[key] = row[(mapping as any)[key]];
          }
        });
        return item;
      }).filter(item => item.name);

      const res = await fetch('/api/admin/preparations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      if (data.failed > 0) {
        console.error('Import errors:', data.errors);
        toast.error(`${data.failed} rows failed. First error: ${data.errors[0] || 'Unknown error'}`);
        setIsImporting(false);
      } else {
        toast.success(`Successfully imported ${data.successful} preparations.`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error during bulk import');
      setIsImporting(false);
    }
  };
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
    total: preparations.length,
    active: preparations.filter(p => p.isActive).length,
  }), [preparations]);

  const filtered = useMemo(() => {
    let list = preparations;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search) || String(p.id).includes(search));
    if (filterType) list = list.filter(p => p.type === filterType);
    if (filterStatus === 'active') list = list.filter(p => p.isActive);
    if (filterStatus === 'inactive') list = list.filter(p => !p.isActive);
    return list;
  }, [preparations, search, filterType, filterStatus]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setImageTab(0); setShowForm(true); setSearchIndication(''); };
  const openEdit = (p: Preparation) => {
    setEditing(p);
    setForm({
      type: (p as any).type || 'LIQUID_EXTRACT',
      volume: (p as any).volume ? String((p as any).volume) : '',
      volumeUnit: (p as any).volumeUnit || 'ml',
      weight: (p as any).weight ? String((p as any).weight) : '',
      weightUnit: (p as any).weightUnit || 'g',
      count: (p as any).count ? String((p as any).count) : '',
      countUnit: (p as any).countUnit || 'pcs',
      name: p.name, description: p.description, usage: p.usage,
      mrp: p.mrp ? String(p.mrp) : '',
      indicationIds: p.indications?.map(ind => String(ind.id)) || [],
      isActive: p.isActive, isFeatured: p.isFeatured, isSponsored: p.isSponsored,
      images: p.images || [],
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.join('\n') : '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : '',
    });
    setImageTab(0);
    setShowForm(true);
    setSearchIndication('');
  };

  const closeForm = () => { setShowForm(false); setForm(emptyForm); setEditing(null); setSearchIndication(''); };

  const parseSavedPrep = (p: any): Preparation => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    ingredients: typeof p.ingredients === 'string' ? JSON.parse(p.ingredients) : (p.ingredients || []),
    benefits: typeof p.benefits === 'string' ? JSON.parse(p.benefits) : (p.benefits || []),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required'); return;
    }
    setLoading(true);
    try {
      const payload = {
        type: form.type,
        volume: form.volume ? Number(form.volume) : null, volumeUnit: form.volumeUnit,
        weight: form.weight ? Number(form.weight) : null, weightUnit: form.weightUnit,
        count: form.count ? Number(form.count) : null, countUnit: form.countUnit,
        name: form.name, description: form.description, usage: form.usage,
        mrp: form.mrp,
        indicationIds: form.indicationIds.map(id => Number(id)),
        isActive: form.isActive, isFeatured: form.isFeatured, isSponsored: form.isSponsored,
        images: form.images,
        ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
        benefits: form.benefits.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const method = editing ? 'PATCH' : 'POST';
      if (editing) (payload as any).extractId = editing.id;
      const res = await fetch('/api/admin/preparations', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const rawSaved = await res.json();
      const saved = parseSavedPrep(rawSaved);
      if (editing) {
        setExtracts(prev => prev.map(p => p.id === saved.id ? saved : p));
        toast.success('Preparation updated!');
      } else {
        setExtracts(prev => [saved, ...prev]);
        toast.success('Preparation created!');
      }
      closeForm();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/preparations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setExtracts(prev => prev.filter(p => p.id !== id));
      toast.success('Preparation deleted');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); setDeleteConfirmId(null); }
  };

  const toggleField = async (id: number, field: 'isActive' | 'isFeatured' | 'isSponsored', val: boolean) => {
    try {
      const res = await fetch('/api/admin/preparations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ extractId: id, [field]: val }) });
      if (!res.ok) throw new Error('Failed');
      const rawSaved = await res.json();
      const saved = parseSavedPrep(rawSaved);
      setExtracts(prev => prev.map(p => p.id === saved.id ? saved : p));
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

  const inp = "w-full border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20";
  const lbl = "text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Total Preparations', value: stats.total, icon: Package, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Active', value: stats.active, icon: ToggleRight, color: 'text-emerald-600 bg-emerald-50' },
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
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <input type="text" placeholder="Search preparations..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-full" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
                <option value="">All Types</option>
                <option value="LIQUID_EXTRACT">Liquid Extract</option>
                <option value="POWDER">Powder</option>
                <option value="TABLET">Tablet</option>
                <option value="CAPSULE">Capsule</option>
                <option value="OIL">Oil</option>
                <option value="CREAM">Creame</option>
                <option value="READY_PRODUCT">Ready Product</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowImportModal(true)} title="Import CSV"
              className="flex items-center gap-2 bg-brand-gold-light/20 text-brand-green px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-gold-light/40 transition-colors shadow-sm flex-shrink-0">
              <FileUp className="h-4 w-4" /> Import CSV
            </button>
            <button onClick={openCreate} title="New Preparation (Alt+N)"
              className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex-shrink-0">
              <Plus className="h-4 w-4" /> Add Preparation
              <kbd className="text-[10px] bg-card/20 px-1.5 py-0.5 rounded font-mono ml-1">Alt+N</kbd>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                {['ID', 'Preparation', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${['ID', 'Preparation', 'Type'].includes(h) ? 'text-left' : 'text-right'} ${h === 'Status' ? 'w-32' : ''} ${h === 'ID' ? 'w-16' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-brand-foreground/40 font-medium">
                  No preparations found. Click <strong>Add Preparation</strong> to get started.
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-5 py-4 text-xs text-brand-foreground/50 font-medium">#{p.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={p.images?.[0] || '/icon.webp'}
                        alt={p.name}
                        className={`h-10 w-10 rounded-xl border border-brand-gold/15 flex-shrink-0 ${
                          p.images?.[0] ? 'object-cover' : 'object-contain p-1.5 bg-emerald-50/50'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-brand-green line-clamp-1 max-w-[180px]">{p.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-brand-foreground/70 text-xs font-medium uppercase tracking-wider">
                    {p.type.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <button onClick={() => toggleField(p.id, 'isActive', !p.isActive)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${p.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40' : 'bg-muted text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80'}`}>
                        {p.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-2 text-brand-gold-dark hover:bg-brand-gold/20 rounded-lg transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(p.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
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
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-lg">{editing ? 'Edit Preparation' : 'New Preparation'}</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{editing ? `Editing: ${editing.name}` : 'Add a new Ayurvedic preparation'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Alt+S</kbd>
                  <span className="text-[10px] text-white/50">{editing ? 'Save Changes' : 'Create'}</span>
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                  <span className="text-[10px] text-white/50">Close</span>
                </div>
              </div>
              <button onClick={closeForm} className="p-1.5 bg-card/10 hover:bg-card/20 rounded-full transition-colors" title="Close (Esc)">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Type and Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Type <span className="text-rose-500">*</span></label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                    <option value="LIQUID_EXTRACT">Liquid Extract</option>
                    <option value="POWDER">Powder</option>
                    <option value="TABLET">Tablet</option>
                    <option value="CAPSULE">Capsule</option>
                    <option value="OIL">Oil</option>
                    <option value="CREAM">Creame</option>
                    <option value="READY_PRODUCT">Ready Product</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Name <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Ashwagandha Preparation" className={inp} required />
                </div>
              </div>

              {/* Dynamic Size Fields */}
              {form.type === 'LIQUID_EXTRACT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Volume</label>
                    <input type="number" value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))} className={inp} placeholder="20" />
                  </div>
                  <div>
                    <label className={lbl}>Unit</label>
                    <select value={form.volumeUnit} onChange={e => setForm(f => ({ ...f, volumeUnit: e.target.value }))} className={inp}>
                      <option value="ml">ml (Milliliters)</option>
                      <option value="l">l (Liters)</option>
                    </select>
                  </div>
                </div>
              )}
              {form.type === 'POWDER' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Weight</label>
                    <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className={inp} placeholder="100" />
                  </div>
                  <div>
                    <label className={lbl}>Unit</label>
                    <select value={form.weightUnit} onChange={e => setForm(f => ({ ...f, weightUnit: e.target.value }))} className={inp}>
                      <option value="g">g (Grams)</option>
                      <option value="kg">kg (Kilograms)</option>
                    </select>
                  </div>
                </div>
              )}
              {(form.type === 'CAPSULE' || form.type === 'TABLET') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Count</label>
                    <input type="number" value={form.count} onChange={e => setForm(f => ({ ...f, count: e.target.value }))} className={inp} placeholder="60" />
                  </div>
                  <div>
                    <label className={lbl}>Unit</label>
                    <select value={form.countUnit} onChange={e => setForm(f => ({ ...f, countUnit: e.target.value }))} className={inp}>
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="pack">pack (Packs)</option>
                    </select>
                  </div>
                </div>
              )}
              {form.type === 'READY_PRODUCT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Net Quantity</label>
                    <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className={inp} placeholder="1" />
                  </div>
                  <div>
                    <label className={lbl}>Unit</label>
                    <select value={form.weightUnit} onChange={e => setForm(f => ({ ...f, weightUnit: e.target.value }))} className={inp}>
                      <option value="ml">ml (Milliliters)</option>
                      <option value="l">l (Liters)</option>
                      <option value="g">g (Grams)</option>
                      <option value="kg">kg (Kilograms)</option>
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="pack">pack (Packs)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className={lbl}>Description <span className="text-rose-500">*</span></label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Brief preparation description..." className={`${inp} resize-none`} required />
              </div>

              {/* Ingredients + Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.type !== 'LIQUID_EXTRACT' && (
                  <div>
                    <label className={lbl}>Ingredients (one per line)</label>
                    <textarea value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                      rows={4} placeholder="Ashwagandha Root&#10;Brahmi" className={`${inp} resize-none`} />
                  </div>
                )}
                <div className={form.type === 'LIQUID_EXTRACT' ? 'col-span-1 md:col-span-2' : ''}>
                  <label className={lbl}>Benefits (one per line)</label>
                  <textarea value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))}
                    rows={4} placeholder="Reduces stress&#10;Improves sleep" className={`${inp} resize-none`} />
                </div>
              </div>

              {/* Usage */}
              <div>
                <label className={lbl}>Usage Instructions</label>
                <textarea value={form.usage} onChange={e => setForm(f => ({ ...f, usage: e.target.value }))}
                  rows={2} placeholder="Take 2 drops daily..." className={`${inp} resize-none`} />
              </div>

              {/* MRP */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={lbl}>Reference MRP (₹)</label>
                  <input type="number" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
                    placeholder="599" className={inp} min="0" step="0.01" />
                </div>
              </div>

              {/* Indications */}
              <div>
                <label className={lbl}>Indications (Health Conditions)</label>
                <div className="bg-brand-gold-light/20 border border-border rounded-2xl p-4 max-h-64 flex flex-col gap-3">
                  <div className="relative flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
                    <input type="text" placeholder="Search indications..." value={searchIndication} onChange={e => setSearchIndication(e.target.value)}
                      className="pl-9 w-full bg-card border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-brand-green shadow-sm" />
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
                            className="h-4 w-4 rounded border-border text-brand-green focus:ring-brand-green/30"
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
                    {form.isActive ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                  </button>
                  <span className="text-sm font-semibold text-brand-foreground/70">Active</span>
                </label>
              </div>

              {/* Preparation Image */}
              <div>
                <label className={lbl}>Preparation Image (Primary)</label>
                <div className="flex flex-col items-center py-6 bg-brand-green-light/10 border border-dashed border-brand-green/20 rounded-2xl">
                  <ImageUploadCrop
                    value={form.images[0] || ''}
                    onChange={(url) => setForm(f => ({ ...f, images: [url] }))}
                    folder="preparations"
                    aspect={16/9}
                    outputWidth={800}
                    outputHeight={450}
                  >
                    <div className="relative group cursor-pointer">
                      <img
                        src={form.images[0] || '/icon.webp'}
                        alt="Preparation"
                        className={`w-56 aspect-video rounded-2xl border-4 border-brand-gold/50 shadow-md group-hover:opacity-90 transition-opacity ${
                          form.images[0] ? 'object-cover' : 'object-contain p-4 bg-emerald-50/50'
                        }`}
                      />
                      {/* Edit Icon Overlay */}
                      <div className="absolute -top-2 -right-2 bg-brand-green text-white p-2 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                        <Pencil className="h-4 w-4" />
                      </div>
                    </div>
                  </ImageUploadCrop>
                  <p className="text-[10px] text-brand-foreground/40 mt-4 text-center">Click to upload photo · 16:9 Ratio · Max 100KB</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-card pb-1">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold text-brand-foreground/60 hover:bg-brand-gold-light/40 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-60">
                  {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Preparation'}
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
              <h3 className="text-xl font-extrabold text-foreground">Delete Preparation?</h3>
              <p className="text-sm text-brand-foreground/60">
                Are you sure you want to delete this preparation? This action cannot be undone.
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
      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-brand-green to-[#0f381b] text-white">
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                <FileUp className="h-5 w-5" /> Bulk Import Preparations
              </h3>
              <button onClick={closeImportModal} className="text-white/70 hover:text-white bg-card/10 hover:bg-card/20 p-1.5 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {!csvData.length ? (
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center space-y-4">
                  <FileUp className="h-10 w-10 text-brand-green/40 mx-auto" />
                  <div>
                    <h4 className="font-bold text-brand-green">Upload CSV File</h4>
                    <p className="text-sm text-foreground/60 mt-1">Make sure your file has a header row.</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="block w-full text-sm text-brand-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20 mx-auto max-w-xs"
                  />
                  <div className="text-xs text-brand-foreground/50 bg-muted p-3 rounded-xl text-left mt-4 space-y-2">
                    <p className="font-bold">Required columns:</p>
                    <ul className="list-disc pl-4">
                      <li>Preparation Name</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">File Parsed Successfully</p>
                      <p className="text-sm text-emerald-700/80 mt-1">Found {csvData.length} rows and {csvHeaders.length} columns. Please map your CSV columns to the preparation fields below.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border p-4 rounded-xl space-y-4">
                      <h4 className="font-bold text-brand-green text-sm flex items-center gap-2"><Tag className="h-4 w-4" /> Required Mapping</h4>
                      
                      <div>
                        <label className="block text-xs font-bold text-foreground/60 mb-1.5">Preparation Name *</label>
                        <select
                          value={mapping.name}
                          onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                          className="w-full bg-muted border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-brand-gold"
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground/60 mb-1.5">MRP</label>
                        <select
                          value={mapping.mrp}
                          onChange={(e) => setMapping({ ...mapping, mrp: e.target.value })}
                          className="w-full bg-muted border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-brand-gold"
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-card border border-border p-4 rounded-xl space-y-4">
                      <h4 className="font-bold text-brand-green text-sm flex items-center gap-2"><AlignLeft className="h-4 w-4" /> Optional Details</h4>
                      
                      <div>
                        <label className="block text-xs font-bold text-foreground/60 mb-1.5">Type</label>
                        <select
                          value={mapping.type}
                          onChange={(e) => setMapping({ ...mapping, type: e.target.value })}
                          className="w-full bg-muted border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-brand-gold"
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground/60 mb-1.5">Volume & Unit</label>
                        <div className="flex gap-2">
                          <select
                            value={mapping.volume}
                            onChange={(e) => setMapping({ ...mapping, volume: e.target.value })}
                            className="w-1/2 bg-muted border border-border rounded-xl py-2 px-3 text-sm focus:outline-none"
                          >
                            <option value="">-- Vol --</option>
                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <select
                            value={mapping.volumeUnit}
                            onChange={(e) => setMapping({ ...mapping, volumeUnit: e.target.value })}
                            className="w-1/2 bg-muted border border-border rounded-xl py-2 px-3 text-sm focus:outline-none"
                          >
                            <option value="">-- Unit --</option>
                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground/60 mb-1.5">Description</label>
                        <select
                          value={mapping.description}
                          onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                          className="w-full bg-muted border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-brand-gold"
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {csvData.length > 0 && (
              <div className="p-4 bg-muted border-t border-border flex justify-end gap-3">
                <button 
                  onClick={closeImportModal} 
                  disabled={isImporting}
                  className="px-6 py-2.5 rounded-full bg-card border border-border text-sm font-bold hover:bg-muted-foreground/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeBulkImport}
                  disabled={isImporting || !csvData.length || !mapping.name}
                  className="px-6 py-2.5 rounded-full bg-brand-green text-white text-sm font-bold hover:bg-brand-gold hover:text-brand-green transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting ? 'Processing...' : 'Run Import'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
