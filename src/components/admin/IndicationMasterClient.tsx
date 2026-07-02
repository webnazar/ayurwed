'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import {
  Search, Plus, Pencil, Trash2, HeartPulse, Activity, Layers, ShoppingBag,
  X, Check, Tag, AlignLeft, ToggleRight, ToggleLeft, Upload, FileUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Indication {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  _count: { preparations: number };
}

interface FormState {
  name: string;
  description: string;
  isActive: boolean;
}

const emptyForm: FormState = { name: '', description: '', isActive: true };

export default function IndicationMasterClient({ initialIndications }: { initialIndications: Indication[] }) {
  const [indications, setIndications] = useState<Indication[]>(initialIndications);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal/drawer state
  const [showForm, setShowForm] = useState(false);
  const [editingIndication, setEditingIndication] = useState<Indication | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeForm = () => { setShowForm(false); setForm(emptyForm); setEditingIndication(null); };

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{name: string, description: string, isActive: string}>({ name: '', description: '', isActive: '' });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeImportModal = () => {
    setShowImportModal(false);
    setCsvData([]);
    setCsvHeaders([]);
    setMapping({ name: '', description: '', isActive: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          const autoMap = { name: '', description: '', isActive: '' };
          results.meta.fields.forEach(f => {
            const lower = f.toLowerCase();
            if (lower.includes('name') || lower.includes('title') || lower.includes('indication')) autoMap.name = f;
            else if (lower.includes('desc')) autoMap.description = f;
            else if (lower.includes('active') || lower.includes('status')) autoMap.isActive = f;
          });
          setMapping(autoMap);
        }
        setCsvData(results.data);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeBulkImport = async () => {
    if (csvData.length === 0) return;
    if (!mapping.name) {
      toast.error("You must map a column to 'Indication Name' before importing.");
      return;
    }

    setIsImporting(true);
    try {
      const payload = csvData.map(row => ({
        name: row[mapping.name],
        description: mapping.description ? row[mapping.description] : '',
        isActive: mapping.isActive ? row[mapping.isActive] : true,
      })).filter(item => item.name); // only include rows with a name

      const res = await fetch('/api/admin/indications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(`Successfully imported/updated ${data.successful} indications. ${data.failed > 0 ? `${data.failed} failed.` : ''}`);
      if (data.errors && data.errors.length > 0) {
        console.error('Import errors:', data.errors);
      }
      
      const freshRes = await fetch('/api/admin/indications');
      if (freshRes.ok) {
        setIndications(await freshRes.json());
      }
      closeImportModal();
    } catch (err: any) {
      toast.error(err.message || 'Error during bulk import');
    } finally {
      setIsImporting(false);
    }
  };

  // Global keyboard shortcuts
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

  // Stats
  const stats = useMemo(() => ({
    total: indications.length,
    active: indications.filter(c => c.isActive).length,
    withExtracts: indications.filter(c => c._count.preparations > 0).length,
  }), [indications]);

  // Filtered list
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return indications;
    const t = searchTerm.toLowerCase();
    return indications.filter(c =>
      c.id.toString().includes(t) ||
      c.name.toLowerCase().includes(t) ||
      c.slug.includes(t) ||
      (c.description && c.description.toLowerCase().includes(t))
    );
  }, [indications, searchTerm]);

  // Open create form
  const openCreate = () => {
    setEditingIndication(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  // Open edit form
  const openEdit = (ind: Indication) => {
    setEditingIndication(ind);
    setForm({
      name: ind.name,
      description: ind.description || '',
      isActive: ind.isActive,
    });
    setShowForm(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Indication name is required');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        isActive: form.isActive,
      };

      let res: Response;
      if (editingIndication) {
        payload.id = editingIndication.id;
        res = await fetch('/api/admin/indications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/indications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save indication');
      }

      const saved: Indication = await res.json();

      if (editingIndication) {
        setIndications(prev => prev.map(c => c.id === saved.id ? saved : c));
        toast.success('Indication updated!');
      } else {
        setIndications(prev => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Indication created!');
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingIndication(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete indication
  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/indications?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      setIndications(prev => prev.filter(c => c.id !== id));
      toast.success('Indication deleted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setDeleteConfirmId(null);
    }
  };

  const toggleStatus = async (id: number, val: boolean) => {
    try {
      const res = await fetch('/api/admin/indications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: val }) });
      if (!res.ok) throw new Error('Failed');
      const saved: Indication = await res.json();
      setIndications(prev => prev.map(p => p.id === saved.id ? saved : p));
      toast.success(val ? 'Activated' : 'Deactivated');
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Indications', value: stats.total, icon: HeartPulse, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Active', value: stats.active, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'With Preparations', value: stats.withExtracts, icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input
              type="text"
              placeholder="Search indications (e.g. Indigestion)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 w-full bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-card border-2 border-brand-green text-brand-green px-5 py-2 rounded-2xl text-sm font-bold hover:bg-brand-green hover:text-white transition-colors shadow-sm flex-shrink-0"
            >
              <FileUp className="h-4 w-4" />
              Import CSV
            </button>
            <button
              onClick={openCreate}
              title="New Indication (Alt+N)"
              className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Indication
              <kbd className="text-[10px] bg-card/20 px-1.5 py-0.5 rounded font-mono ml-1">Alt+N</kbd>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Indication</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Preparations</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-brand-foreground/40 font-medium">
                    No indications found. Click <strong>Add Indication</strong> to get started.
                  </td>
                </tr>
              ) : filtered.map(ind => (
                <tr key={ind.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-brand-green/60">#{ind.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-green">{ind.name}</div>
                    {ind.description && (
                      <div className="text-xs text-brand-foreground/50 truncate max-w-[200px]">{ind.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-brand-gold-light/50 text-brand-gold-dark text-xs px-2 py-1 rounded-lg font-mono">{ind.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => toggleStatus(ind.id, !ind.isActive)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${ind.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40' : 'bg-muted text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80'}`}>
                      {ind.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                      {ind.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {ind._count.preparations > 0 ? (
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                        {ind._count.preparations} preparations
                      </span>
                    ) : (
                      <span className="text-brand-foreground/30 text-xs">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(ind)}
                        className="p-2 text-brand-gold-dark hover:bg-brand-gold/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(ind.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
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

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">
                  {editingIndication ? 'Edit Indication' : 'New Indication'}
                </h3>
                <p className="text-xs text-brand-green-light mt-0.5">
                  {editingIndication ? `Editing: ${editingIndication.name}` : 'Add an ailment or condition'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Alt+S</kbd>
                  <span className="text-[10px] text-white/50">{editingIndication ? 'Save Changes' : 'Create'}</span>
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                  <span className="text-[10px] text-white/50">Close</span>
                </div>
              </div>
              <button
                onClick={closeForm}
                className="p-1.5 bg-card/10 hover:bg-card/20 rounded-full transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5">
                  Indication Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/35" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Indigestion"
                    className="pl-9 w-full border border-border rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5">Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-brand-foreground/35" />
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description..."
                    rows={3}
                    className="pl-9 w-full border border-border rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20 resize-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                  {form.isActive ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                </button>
                <span className="text-sm font-semibold text-brand-foreground/70">Active Master Entry</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold text-brand-foreground/60 hover:bg-brand-gold-light/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  {loading ? 'Saving...' : editingIndication ? 'Save Changes' : 'Create Indication'}
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
              <h3 className="text-xl font-extrabold text-foreground">Delete Indication?</h3>
              <p className="text-sm text-brand-foreground/60">
                Are you sure you want to delete this indication? This action cannot be undone.
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[32px] border border-border shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-250 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between flex-shrink-0">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FileUp className="h-5 w-5" /> Bulk Import Indications
              </h3>
              <button onClick={closeImportModal} className="text-white/70 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-6">
              {!csvData.length ? (
                <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:bg-brand-gold-light/20 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-10 w-10 text-brand-green mx-auto mb-4" />
                  <h4 className="text-sm font-bold mb-1">Click to upload CSV</h4>
                  <p className="text-xs text-brand-foreground/60">Your CSV must include an indication name column.</p>
                  <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-brand-green-light/20 p-4 rounded-xl flex items-center justify-between border border-brand-green/20">
                    <div className="flex items-center gap-3 text-brand-green">
                      <FileUp className="h-5 w-5" />
                      <div>
                        <p className="text-sm font-bold">CSV Loaded Successfully</p>
                        <p className="text-xs text-brand-green/70">{csvData.length} rows detected.</p>
                      </div>
                    </div>
                    <button onClick={() => setCsvData([])} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full">
                      Remove File
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-brand-foreground flex items-center gap-2">
                      <Layers className="h-4 w-4 text-brand-gold" /> Map CSV Columns
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-muted p-4 rounded-xl border border-border">
                        <label className="text-xs font-bold text-brand-foreground/60 block mb-2">Indication Name <span className="text-red-500">*</span></label>
                        <select 
                          value={mapping.name} 
                          onChange={(e) => setMapping({...mapping, name: e.target.value})}
                          className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold font-semibold"
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div className="bg-muted p-4 rounded-xl border border-border">
                        <label className="text-xs font-bold text-brand-foreground/60 block mb-2">Description (Optional)</label>
                        <select 
                          value={mapping.description} 
                          onChange={(e) => setMapping({...mapping, description: e.target.value})}
                          className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold font-semibold"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div className="bg-muted p-4 rounded-xl border border-border sm:col-span-2">
                        <label className="text-xs font-bold text-brand-foreground/60 block mb-2">Is Active Status (Optional)</label>
                        <select 
                          value={mapping.isActive} 
                          onChange={(e) => setMapping({...mapping, isActive: e.target.value})}
                          className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold font-semibold"
                        >
                          <option value="">-- Default to Active --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <p className="text-[10px] text-brand-foreground/50 mt-1">If mapped, should contain 'true' or 'false'.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-muted border-t border-border flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={closeImportModal} 
                disabled={isImporting}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-brand-foreground hover:bg-brand-foreground/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeBulkImport}
                disabled={isImporting || !csvData.length || !mapping.name}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
              >
                {isImporting ? 'Processing...' : 'Run Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
