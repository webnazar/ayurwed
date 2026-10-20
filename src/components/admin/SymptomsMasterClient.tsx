'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Activity,
  Layers,
  ShoppingBag,
  X,
  Check,
  Tag,
  AlignLeft,
  ToggleRight,
  ToggleLeft,
  Upload,
  FileUp,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  XCircle,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Symptom {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  _count: { products: number };
}

interface FormState {
  name: string;
  description: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  isActive: true,
};

export default function SymptomsMasterClient({ initialSymptoms }: { initialSymptoms: Symptom[] }) {
  const [symptoms, setSymptoms] = useState<Symptom[]>(initialSymptoms);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Modal / drawer state
  const [showForm, setShowForm] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Symptom | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingSymptom(null);
  };

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{
    name: string;
    description: string;
    isActive: string;
  }>({ name: '', description: '', isActive: '' });
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
          results.meta.fields.forEach((f) => {
            const lower = f.toLowerCase();
            if (lower.includes('name') || lower.includes('title') || lower.includes('symptom')) autoMap.name = f;
            else if (lower.includes('desc')) autoMap.description = f;
            else if (lower.includes('active') || lower.includes('status')) autoMap.isActive = f;
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
      toast.error("You must map a column to 'Symptom Name' before importing.");
      return;
    }

    setIsImporting(true);
    try {
      const payload = csvData
        .map((row) => ({
          name: row[mapping.name],
          description: mapping.description ? row[mapping.description] : '',
          isActive: mapping.isActive ? row[mapping.isActive] : true,
        }))
        .filter((item) => item.name);

      const res = await fetch('/api/admin/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(
        `Successfully imported/updated ${data.successful} symptoms. ${data.failed > 0 ? `${data.failed} failed.` : ''}`
      );

      const freshRes = await fetch('/api/admin/symptoms');
      if (freshRes.ok) {
        setSymptoms(await freshRes.json());
      }
      closeImportModal();
    } catch (err: any) {
      toast.error(err.message || 'Error during bulk import');
    } finally {
      setIsImporting(false);
    }
  };

  // CSV Export functions
  const exportToCsv = () => {
    if (symptoms.length === 0) {
      toast.error('No symptoms available to export');
      return;
    }
    const rows = symptoms.map((s) => ({
      name: s.name,
      description: s.description || '',
      isActive: s.isActive ? 'true' : 'false',
    }));
    const csvString = Papa.unparse(rows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `symptoms_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Symptoms exported to CSV successfully');
  };

  const downloadSampleCsv = () => {
    const sampleRows = [
      { name: 'Acidity & Gas', description: 'Hyperacidity, heartburn, and bloating in upper stomach', isActive: 'true' },
      { name: 'Hair Fall & Thinning', description: 'Premature hair shedding, weak follicles, Pitta dosha aggravation', isActive: 'true' },
      { name: 'Sleep Disturbance & Insomnia', description: 'Difficulty falling asleep or unrestful sleep due to Vata imbalance', isActive: 'true' },
      { name: 'Joint Pain & Stiffness', description: 'Painful joint inflammation, knee stiffness, and morning aches', isActive: 'true' },
      { name: 'Skin Allergies & Itching', description: 'Dry eczema, hives, or redness caused by Rakta-Pitta toxins', isActive: 'true' },
      { name: 'Sluggish Digestion & Constipation', description: 'Poor appetite, delayed bowel motility, and heavy stomach', isActive: 'true' },
    ];
    const csvString = Papa.unparse(sampleRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'symptoms_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample symptoms CSV template downloaded');
  };

  const executePurge = async () => {
    setIsPurging(true);
    try {
      const res = await fetch('/api/admin/purge-products-symptoms', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove products and symptoms');
      toast.success(`Removed ${data.productsRemoved} products and ${data.symptomsRemoved} symptoms.`);
      setSymptoms([]);
      setShowPurgeModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error executing purge');
    } finally {
      setIsPurging(false);
    }
  };

  // Global Keyboard Shortcuts (Alt+N: New, Alt+S: Save, Esc: Close)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt + N: New Symptom
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!showForm && !showImportModal && !deleteConfirmTarget) openCreate();
      }
      // Alt + S: Save Symptom
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (showForm && formRef.current) formRef.current.requestSubmit();
      }
      // Esc: Close active modal
      if (e.key === 'Escape') {
        if (showForm) {
          e.preventDefault();
          closeForm();
        } else if (showImportModal) {
          e.preventDefault();
          closeImportModal();
        } else if (deleteConfirmTarget) {
          e.preventDefault();
          setDeleteConfirmTarget(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showForm, showImportModal, deleteConfirmTarget]);

  // Counts & Filter logic
  const activeCount = symptoms.filter((c) => c.isActive).length;
  const inactiveCount = symptoms.filter((c) => !c.isActive).length;

  const filtered = useMemo(() => {
    return symptoms.filter((c) => {
      const t = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !t ||
        c.id.toString().includes(t) ||
        c.name.toLowerCase().includes(t) ||
        c.slug.includes(t) ||
        (c.description && c.description.toLowerCase().includes(t));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && c.isActive) ||
        (statusFilter === 'INACTIVE' && !c.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [symptoms, searchTerm, statusFilter]);

  const openCreate = () => {
    setEditingSymptom(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (sym: Symptom) => {
    setEditingSymptom(sym);
    setForm({
      name: sym.name,
      description: sym.description || '',
      isActive: sym.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Symptom name is required');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        symptomsKeywords: null,
        isActive: form.isActive,
      };

      let res: Response;
      if (editingSymptom) {
        payload.id = editingSymptom.id;
        res = await fetch('/api/admin/symptoms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/symptoms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save symptom');
      }

      const saved: Symptom = await res.json();

      if (editingSymptom) {
        setSymptoms((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
        toast.success(`Symptom ${saved.name} updated!`);
      } else {
        setSymptoms((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success(`Symptom ${saved.name} created!`);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingSymptom(null);
    } catch (err: any) {
      toast.error(err.message || 'Error saving symptom');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/symptoms?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      setSymptoms((prev) => prev.filter((c) => c.id !== id));
      toast.success('Symptom deleted');
      setDeleteConfirmTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting symptom');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (sym: Symptom) => {
    const val = !sym.isActive;
    setTogglingId(sym.id);

    // Optimistic update
    setSymptoms((prev) => prev.map((p) => (p.id === sym.id ? { ...p, isActive: val } : p)));

    try {
      const res = await fetch('/api/admin/symptoms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sym.id, isActive: val }),
      });
      if (!res.ok) throw new Error('Failed');
      const saved: Symptom = await res.json();
      setSymptoms((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      toast.success(`${sym.name} is now ${val ? 'Active' : 'Inactive'}`);
    } catch {
      // Revert on error
      setSymptoms((prev) => prev.map((p) => (p.id === sym.id ? { ...p, isActive: !val } : p)));
      toast.error('Update failed');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner with Merged Search & Action Buttons (Minimal Margins, No Subtitle) */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Symptoms</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                type="text"
                placeholder="Search symptoms (e.g. Acidity)..."
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

            {/* Reset / Clear All Button */}
            <button
              type="button"
              onClick={() => setShowPurgeModal(true)}
              title="Remove all products and symptoms to start fresh"
              className="inline-flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={exportToCsv}
              title="Export All Symptoms to CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            {/* CSV Import Button */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              title="Bulk Import Symptoms from CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Import CSV</span>
            </button>

            {/* Add Symptom Button */}
            <button
              type="button"
              onClick={openCreate}
              title="Add Symptom (Alt+N)"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Symptom</span>
              <kbd className="text-[10px] bg-white/20 px-1 py-0.5 rounded font-mono ml-0.5 hidden sm:inline">Alt+N</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-muted/60 border border-border rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-card text-brand-green shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Symptoms ({symptoms.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'INACTIVE'
                ? 'bg-card text-amber-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filtered.length}</strong> of{' '}
              <strong className="text-foreground">{symptoms.length}</strong>
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

      {/* Main Content: Cards or Table */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-3 shadow-sm">
          <Activity className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No symptoms match your search or filter.'
              : 'No health symptoms or conditions found.'}
          </p>
          <button
            type="button"
            onClick={searchTerm || statusFilter !== 'ALL' ? () => { setSearchTerm(''); setStatusFilter('ALL'); } : openCreate}
            className="text-xs font-bold text-brand-green underline"
          >
            {searchTerm || statusFilter !== 'ALL' ? 'Reset search & filters' : 'Add your first symptom'}
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((sym) => (
            <div
              key={sym.id}
              className={`relative bg-card rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                sym.isActive
                  ? 'border-border hover:border-brand-green/40 dark:hover:border-brand-gold/40'
                  : 'border-border/60 opacity-85 hover:opacity-100 bg-card/60'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`h-1.5 w-full ${
                  sym.isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-brand-green'
                    : 'bg-gradient-to-r from-amber-400 to-amber-600'
                }`}
              />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* Header Row: Name + Slug + Status Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-brand-green/70 bg-brand-green/10 px-2 py-0.5 rounded-md">
                        #{sym.id}
                      </span>
                      <h4 className="font-extrabold text-base text-foreground truncate" title={sym.name}>
                        {sym.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 font-mono">
                      <span>/{sym.slug}</span>
                    </p>
                  </div>

                  {/* Status Badge & 1-Click Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleStatus(sym)}
                    disabled={togglingId === sym.id}
                    title={`Click to ${sym.isActive ? 'Deactivate' : 'Activate'}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                      sym.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                        : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                    }`}
                  >
                    {sym.isActive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Description Box */}
                {sym.description ? (
                  <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed bg-muted/40 p-3 rounded-2xl border border-border">
                    {sym.description}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic bg-muted/20 p-2.5 rounded-2xl border border-border/50">
                    No description provided.
                  </p>
                )}

                {/* Linked Products Pill */}
                <div className="bg-background border border-border rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ShoppingBag className="h-3.5 w-3.5 text-brand-green" />
                    <span className="text-[11px] font-semibold">Treating Products</span>
                  </div>
                  <span className="font-extrabold text-foreground text-xs">
                    {sym._count?.products || 0} {sym._count?.products === 1 ? 'remedy' : 'remedies'}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(sym)}
                    disabled={togglingId === sym.id}
                    className="text-xs font-bold text-muted-foreground hover:text-brand-green flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-card transition-colors"
                    title={sym.isActive ? 'Deactivate symptom' : 'Activate symptom'}
                  >
                    {sym.isActive ? (
                      <ToggleRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="hidden sm:inline">{sym.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(sym)}
                    title="Edit Symptom"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-brand-green hover:text-white hover:border-brand-green transition-all shadow-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmTarget(sym)}
                    title="Delete Symptom"
                    className="p-1.5 rounded-xl bg-card border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table / Grid View */
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border uppercase font-extrabold text-[10px] tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">Symptom / Health Concern</th>
                  <th className="py-3 px-5">Slug</th>
                  <th className="py-3 px-5">Description & Keywords</th>
                  <th className="py-3 px-5 text-center">Treating Products</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filtered.map((sym) => (
                  <tr key={sym.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-5 font-mono font-bold text-brand-green/70">
                      #{sym.id}
                    </td>
                    <td className="py-3 px-5 font-bold text-foreground">
                      {sym.name}
                    </td>
                    <td className="py-3 px-5">
                      <code className="bg-muted text-foreground/80 text-[11px] px-2 py-0.5 rounded-md font-mono">
                        {sym.slug}
                      </code>
                    </td>
                    <td className="py-3 px-5 max-w-xs">
                      {sym.description ? (
                        <p className="text-foreground/80 truncate text-xs">{sym.description}</p>
                      ) : (
                        <span className="text-muted-foreground/40 italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className="bg-muted text-foreground font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3 text-brand-green" />
                        <span>{sym._count?.products || 0}</span>
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(sym)}
                        disabled={togglingId === sym.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                          sym.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {sym.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{sym.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(sym)}
                        className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors inline-flex"
                        title="Edit Symptom"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTarget(sym)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors inline-flex"
                        title="Delete Symptom"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />

          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 border border-border">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-5 sm:p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-brand-gold" />
                  {editingSymptom ? 'Edit Symptom' : 'New Symptom'}
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  {editingSymptom ? `Editing: ${editingSymptom.name}` : 'Add a user/patient health concern or symptom'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2 py-1 rounded-lg">
                  <span>Save</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold text-brand-gold">
                    Alt+S
                  </kbd>
                </span>
                <button
                  type="button"
                  onClick={closeForm}
                  title="Close (Esc)"
                  aria-label="Close"
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full flex items-center gap-1 transition-colors"
                >
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold text-white/80">
                    Esc
                  </kbd>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 text-xs">
              <div>
                <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">
                  Symptom / Concern Name *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Acidity & Gas, Hair Fall, Sleep Trouble"
                    className="pl-9 w-full px-4 py-2.5 bg-background border border-border rounded-xl font-bold text-foreground focus:outline-none focus:border-brand-green shadow-sm text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">
                  Description
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of this symptom..."
                    className="pl-9 w-full px-4 py-2.5 bg-background border border-border rounded-xl font-medium text-foreground focus:outline-none focus:border-brand-green resize-none shadow-sm text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="symptom-active-checkbox"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 text-brand-green rounded focus:ring-brand-green cursor-pointer"
                />
                <label htmlFor="symptom-active-checkbox" className="font-bold text-foreground cursor-pointer select-none">
                  Active Master Entry (Visible in Shop Search & Filters)
                </label>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span>{loading ? 'Saving...' : editingSymptom ? 'Update Symptom' : 'Create Symptom'}</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold hidden sm:inline">
                    Alt+S
                  </kbd>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeImportModal} />

          <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-5 sm:p-6 text-white flex items-center justify-between flex-shrink-0">
              <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
                <FileUp className="h-5 w-5 text-brand-gold" /> Bulk Import Symptoms
              </h3>
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
                  <p className="text-xs text-muted-foreground mb-3">Your CSV should include a symptom name column.</p>
                  
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
                      <Layers className="h-3.5 w-3.5" /> Map CSV Columns
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Symptom Name <span className="text-red-500">*</span>
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
                          Description (Optional)
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
                {isImporting ? 'Processing...' : 'Run Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && setDeleteConfirmTarget(null)}
          />

          <div className="relative bg-card rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center border border-red-500/30 animate-in zoom-in-95 duration-150">
            <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center text-red-600 mb-3">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">Delete Symptom?</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{deleteConfirmTarget.name}</strong>? This will remove product tag associations.
            </p>
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={loading}
                className="px-4 py-2 bg-muted rounded-xl text-xs font-bold border border-border hover:bg-card text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmTarget.id)}
                disabled={loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge All Products & Symptoms Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !isPurging && setShowPurgeModal(false)}
          />

          <div className="relative bg-card rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-md text-center border border-rose-500/40 animate-in zoom-in-95 duration-150">
            <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Clear All Products & Symptoms?</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              This action will permanently delete <strong>all products</strong> and <strong>all current symptoms/indications</strong> from the database, allowing you to re-import a clean symptoms list via CSV.
            </p>
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
                className="px-5 py-2.5 bg-muted rounded-xl text-xs font-bold border border-border hover:bg-card text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePurge}
                disabled={isPurging}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                <span>{isPurging ? 'Clearing Database...' : 'Yes, Delete Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
