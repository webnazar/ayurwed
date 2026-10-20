'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Layers,
  ShoppingBag,
  X,
  Check,
  Tag,
  ToggleRight,
  ToggleLeft,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  AlertTriangle,
  Download,
  FileUp,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: { products: number };
}

interface FormState {
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  icon: '🌿',
  description: '',
  image: '',
  sortOrder: 0,
  isActive: true,
};

const QUICK_EMOJI_SUGGESTIONS = ['💊', '🌿', '🍯', '🍃', '🪔', '🧈', '🧃', '🍵', '🧴', '💧', '🌾', '🧼', '✨', '💨', '🩹', '📦'];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CategoryMasterClient({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [autoSlug, setAutoSlug] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [forceDelete, setForceDelete] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      ...emptyForm,
      sortOrder: (categories.length + 1) * 10,
    });
    setAutoSlug(true);
    setShowForm(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '🌿',
      description: cat.description || '',
      image: cat.image || '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setAutoSlug(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{
    name: string;
    slug: string;
    icon: string;
    description: string;
    sortOrder: string;
    isActive: string;
  }>({ name: '', slug: '', icon: '', description: '', sortOrder: '', isActive: '' });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeImportModal = () => {
    setShowImportModal(false);
    setCsvData([]);
    setCsvHeaders([]);
    setMapping({ name: '', slug: '', icon: '', description: '', sortOrder: '', isActive: '' });
  };

  // Global Keyboard Shortcuts (Alt+N: New, Alt+S: Save/Search, Esc: Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!showForm) openCreateModal();
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (showForm) {
          formRef.current?.requestSubmit();
        } else {
          searchRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        if (showImportModal) {
          closeImportModal();
        } else if (showForm) {
          const activeTag = (e.target as HTMLElement)?.tagName;
          if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
            closeForm();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm, showImportModal]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          const autoMap = { name: '', slug: '', icon: '', description: '', sortOrder: '', isActive: '' };
          results.meta.fields.forEach((f) => {
            const lower = f.toLowerCase();
            if (lower.includes('name') || lower.includes('title') || lower.includes('category')) autoMap.name = f;
            else if (lower.includes('slug')) autoMap.slug = f;
            else if (lower.includes('icon') || lower.includes('emoji')) autoMap.icon = f;
            else if (lower.includes('desc')) autoMap.description = f;
            else if (lower.includes('sort') || lower.includes('order')) autoMap.sortOrder = f;
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
      toast.error("You must map a column to 'Category Name' before importing.");
      return;
    }

    setIsImporting(true);
    try {
      const payload = csvData
        .map((row) => ({
          name: row[mapping.name],
          slug: mapping.slug ? row[mapping.slug] : '',
          icon: mapping.icon ? row[mapping.icon] : '🌿',
          description: mapping.description ? row[mapping.description] : '',
          sortOrder: mapping.sortOrder && row[mapping.sortOrder] ? Number(row[mapping.sortOrder]) : 0,
          isActive: mapping.isActive
            ? String(row[mapping.isActive]).toLowerCase() === 'true' || row[mapping.isActive] === '1' || row[mapping.isActive] === true
            : true,
        }))
        .filter((item) => item.name);

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(
        `Successfully imported/updated ${data.successful} categories. ${data.failed > 0 ? `${data.failed} failed.` : ''}`
      );

      const freshRes = await fetch('/api/admin/categories');
      if (freshRes.ok) {
        setCategories(await freshRes.json());
      }
      closeImportModal();
    } catch (err: any) {
      toast.error(err.message || 'Error during bulk import');
    } finally {
      setIsImporting(false);
    }
  };

  const exportToCsv = () => {
    if (categories.length === 0) {
      toast.error('No categories available to export');
      return;
    }
    const rows = categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon || '🌿',
      description: c.description || '',
      sortOrder: c.sortOrder ?? 0,
      isActive: c.isActive ? 'true' : 'false',
    }));
    const csvString = Papa.unparse(rows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `categories_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Categories exported to CSV successfully');
  };

  const downloadSampleCsv = () => {
    const sampleRows = [
      { name: 'Capsules & Tablets', slug: 'capsules-tablets', icon: '💊', description: 'Standardized herbal extract capsules and classical vatis', sortOrder: 10, isActive: 'true' },
      { name: 'Medicated Ghee (Ghrita)', slug: 'medicated-ghee', icon: '🧈', description: 'Classical herbal ghee formulations processed according to Charaka Samhita', sortOrder: 20, isActive: 'true' },
      { name: 'Herbal Oils (Taila)', slug: 'herbal-oils', icon: '🪔', description: 'Ayurvedic medicated oils for external application, abhyanga, and nasya', sortOrder: 30, isActive: 'true' },
      { name: 'Syrups & Arishtas', slug: 'syrups-arishtas', icon: '🧃', description: 'Naturally fermented herbal decoctions and sweet tonics', sortOrder: 40, isActive: 'true' },
      { name: 'Herbal Powders (Churna)', slug: 'herbal-powders', icon: '🌾', description: 'Finely ground single herbs and classical synergistic polyherbal blends', sortOrder: 50, isActive: 'true' },
    ];
    const csvString = Papa.unparse(sampleRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'categories_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample categories CSV template downloaded');
  };

  const handleNameChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      name: val,
      slug: autoSlug ? slugify(val) : prev.slug,
    }));
  };

  // Quick Active/Inactive Toggle
  const handleToggleActive = async (cat: CategoryItem) => {
    setTogglingId(cat.id);
    const newStatus = !cat.isActive;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, isActive: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update category');
      }

      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, isActive: newStatus } : c))
      );
      toast.success(`Category "${cat.name}" is now ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      toast.error(err.message || 'Error toggling status');
    } finally {
      setTogglingId(null);
    }
  };

  // Form Submit (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingCategory) {
        // Update
        const res = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCategory.id,
            name: form.name.trim(),
            slug: form.slug.trim() || slugify(form.name),
            icon: form.icon.trim() || null,
            description: form.description.trim() || null,
            image: form.image.trim() || null,
            sortOrder: Number(form.sortOrder) || 0,
            isActive: form.isActive,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update category');

        setCategories(prev =>
          prev.map(c => (c.id === editingCategory.id ? { ...c, ...data } : c))
        );
        toast.success(`Category "${data.name}" updated!`);
      } else {
        // Create
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim() || slugify(form.name),
            icon: form.icon.trim() || null,
            description: form.description.trim() || null,
            image: form.image.trim() || null,
            sortOrder: Number(form.sortOrder) || 0,
            isActive: form.isActive,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create category');

        setCategories(prev => [...prev, data]);
        toast.success(`Category "${data.name}" created successfully!`);
      }
      closeForm();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete Category
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);

    try {
      const url = `/api/admin/categories?id=${deleteTarget.id}${forceDelete ? '&force=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data.error || 'Category has linked products');
          setForceDelete(true);
          return;
        }
        throw new Error(data.error || 'Failed to delete category');
      }

      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success(`Category "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      setForceDelete(false);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting category');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search
  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => {
        if (statusFilter === 'ACTIVE' && !cat.isActive) return false;
        if (statusFilter === 'INACTIVE' && cat.isActive) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      });
  }, [categories, searchTerm, statusFilter]);

  // Statistics
  const totalCount = categories.length;
  const activeCount = categories.filter(c => c.isActive).length;
  const totalLinkedProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);

  return (
    <div className="space-y-3.5">
      {/* ── Header Banner with Merged Search (Minimal Margins, No Subtitle) ── */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Categories</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search categories, slug or desc..."
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

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={exportToCsv}
              title="Export All Categories to CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            {/* CSV Import Button */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              title="Bulk Import Categories from CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Import CSV</span>
            </button>

            {/* Add Category Button */}
            <button
              type="button"
              onClick={openCreateModal}
              title="Add Category (Alt+N)"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Category</span>
              <kbd className="text-[10px] bg-white/20 px-1 py-0.5 rounded font-mono ml-0.5 hidden sm:inline">Alt+N</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid (Equal & Minimal Margins) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Total Categories</span>
            <span className="text-2xl font-black text-brand-green dark:text-brand-gold mt-1 block">
              {totalCount}
            </span>
          </div>
          <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Active &amp; Visible</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {activeCount}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Check className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Linked Products</span>
            <span className="text-2xl font-black text-brand-gold-dark mt-1 block">
              {totalLinkedProducts}
            </span>
          </div>
          <div className="p-2.5 bg-brand-gold/15 text-brand-gold-dark rounded-xl">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Filter Tabs & View Mode Switcher Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-muted/60 border border-border rounded-2xl text-xs">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-card text-brand-green dark:text-brand-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'ALL'
                ? `All (${categories.length})`
                : tab === 'ACTIVE'
                ? `Active (${categories.filter(c => c.isActive).length})`
                : `Inactive (${categories.filter(c => !c.isActive).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto text-xs text-muted-foreground shrink-0">
          <span className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filteredCategories.length}</strong> of{' '}
              <strong className="text-foreground">{categories.length}</strong>
            </span>
          </span>

          {/* View Toggle */}
          <div className="inline-flex items-center p-1 bg-muted/70 border border-border rounded-2xl text-xs gap-1">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              title="Cards View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-card text-brand-green dark:text-brand-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              title="Table View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-card text-brand-green dark:text-brand-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories View: CARDS or TABLE */}
      {filteredCategories.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-title-primary">No categories found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try modifying your search keywords or status filter.'
              : 'Get started by creating your first category or formulation delivery format.'}
          </p>
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-brand-green hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map(cat => {
            const isToggling = togglingId === cat.id;
            return (
              <div
                key={cat.id}
                className={`bg-card rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  cat.isActive ? 'border-border hover:border-brand-green/30' : 'border-border/60 bg-muted/20 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon & Status Toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-brand-green/10 dark:bg-brand-gold/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {cat.icon || '🌿'}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">
                        Order #{cat.sortOrder}
                      </span>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        disabled={isToggling}
                        title={cat.isActive ? 'Deactivate' : 'Activate'}
                        className="p-1 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {cat.isActive ? (
                          <ToggleRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Name & Slug */}
                  <div>
                    <h3 className="font-extrabold text-title-primary text-base group-hover:text-brand-green transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                      /{cat.slug}
                    </span>
                  </div>

                  {/* Description */}
                  {cat.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Footer: Linked Products & Actions */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-green hover:underline"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    <span>{cat._count?.products || 0} products</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      title="Edit Category"
                      className="p-2 rounded-xl hover:bg-brand-green/10 text-muted-foreground hover:text-brand-green transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(cat);
                        setForceDelete(false);
                      }}
                      title="Delete Category"
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 w-12">Icon</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Sort Order</th>
                  <th className="py-3.5 px-4 text-center">Products</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map(cat => {
                  const isToggling = togglingId === cat.id;
                  return (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 text-lg text-center">{cat.icon || '🌿'}</td>
                      <td className="py-3.5 px-4 font-bold text-title-primary">{cat.name}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">{cat.slug}</td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">{cat.sortOrder}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/shop?category=${encodeURIComponent(cat.name)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-bold text-brand-green hover:underline"
                        >
                          <span>{cat._count?.products || 0}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          disabled={isToggling}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors"
                          style={{
                            backgroundColor: cat.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                            color: cat.isActive ? '#059669' : '#64748b',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cat.isActive ? '#059669' : '#64748b' }}
                          />
                          <span>{cat.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-xl hover:bg-brand-green/10 text-muted-foreground hover:text-brand-green"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(cat);
                            setForceDelete(false);
                          }}
                          className="p-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeForm}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">Category Master</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-title-primary">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Set category name, delivery format emoji, slug, and display order.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capsules, Tablets & Vati, Herbal Ghee..."
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-brand-green text-foreground"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-foreground">Slug (URL identifier)</label>
                  <label className="text-[11px] text-muted-foreground flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={e => setAutoSlug(e.target.checked)}
                      className="rounded"
                    />
                    <span>Auto-generate</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="capsule, tablet, ghee..."
                  value={form.slug}
                  disabled={autoSlug}
                  onChange={e => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  className={`w-full px-4 py-2.5 border rounded-2xl text-xs font-mono focus:outline-none text-foreground ${
                    autoSlug ? 'bg-muted/30 border-border text-muted-foreground cursor-not-allowed' : 'bg-muted/50 border-border focus:border-brand-green'
                  }`}
                />
              </div>

              {/* Icon / Emoji Picker */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Delivery Format Icon / Emoji
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-brand-green/10 flex items-center justify-center text-xl flex-shrink-0">
                    {form.icon || '🌿'}
                  </div>
                  <input
                    type="text"
                    placeholder="Emoji (e.g. 💊, 🌿, 🍯) or icon URL"
                    value={form.icon}
                    onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="flex-1 px-4 py-2 bg-muted/50 border border-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-brand-green text-foreground"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_EMOJI_SUGGESTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, icon: emoji }))}
                      className={`w-7 h-7 rounded-xl text-sm flex items-center justify-center border transition-all ${
                        form.icon === emoji ? 'border-brand-green bg-brand-green/10 scale-110' : 'border-border hover:bg-muted'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short explanation for consumers and storefront browsing..."
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-brand-green text-foreground resize-none"
                />
              </div>

              {/* Sort Order & Active Switch */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-2xl text-xs focus:outline-none focus:border-brand-green text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground">Lower numbers show first</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-full py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      form.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    {form.isActive ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>{form.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-border">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 rounded-2xl border border-border text-xs font-bold hover:bg-muted text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-title-primary">
                Delete Category &ldquo;{deleteTarget.name}&rdquo;?
              </h3>
              <p className="text-xs text-muted-foreground">
                This will permanently delete this category from the store database.
              </p>
            </div>

            {(deleteTarget._count?.products || 0) > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                <p className="font-bold">
                  ⚠️ {deleteTarget._count?.products} products currently belong to this category!
                </p>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[11px] pt-1">
                  <input
                    type="checkbox"
                    checked={forceDelete}
                    onChange={e => setForceDelete(e.target.checked)}
                    className="rounded text-brand-green"
                  />
                  <span>Unlink these products automatically and delete category</span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setForceDelete(false);
                }}
                className="px-4 py-2.5 rounded-2xl border border-border text-xs font-bold hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || ((deleteTarget._count?.products || 0) > 0 && !forceDelete)}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-40"
              >
                {loading ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-brand-green text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <FileUp className="h-5 w-5 text-brand-gold" />
                <h3 className="text-base font-extrabold tracking-tight">Bulk Import Categories via CSV</h3>
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
                  <p className="text-xs text-muted-foreground mb-3">Your CSV should include a category name column.</p>

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
                          Category Name <span className="text-red-500">*</span>
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
                          Slug / URL Key (Optional)
                        </label>
                        <select
                          value={mapping.slug}
                          onChange={(e) => setMapping({ ...mapping, slug: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Auto-generate from Name --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Icon / Emoji (Optional)
                        </label>
                        <select
                          value={mapping.icon}
                          onChange={(e) => setMapping({ ...mapping, icon: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Default (🌿) --</option>
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
                          Sort Order (Optional)
                        </label>
                        <select
                          value={mapping.sortOrder}
                          onChange={(e) => setMapping({ ...mapping, sortOrder: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Auto (0) --</option>
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
    </div>
  );
}
