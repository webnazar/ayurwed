'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, FolderTree, Layers, ShoppingBag,
  X, Check, ChevronRight, Tag, AlignLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from './ImageUploadCrop';
import SearchSelect from '@/components/ui/SearchSelect';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  parent: { id: number; name: string } | null;
  children: { id: number; name: string }[];
  _count: { products: number };
}

interface FormState {
  name: string;
  description: string;
  image: string;
  parentId: string;
}

const emptyForm: FormState = { name: '', description: '', image: '', parentId: '' };

export default function CategoryMasterClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal/drawer state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeForm = () => { setShowForm(false); setForm(emptyForm); setEditingCategory(null); };

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
    total: categories.length,
    parentCats: categories.filter(c => !c.parentId).length,
    subCats: categories.filter(c => !!c.parentId).length,
    withProducts: categories.filter(c => c._count.products > 0).length,
  }), [categories]);

  // Filtered list
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const t = searchTerm.toLowerCase();
    return categories.filter(c =>
      c.name.toLowerCase().includes(t) ||
      c.slug.includes(t) ||
      (c.description && c.description.toLowerCase().includes(t)) ||
      (c.parent && c.parent.name.toLowerCase().includes(t))
    );
  }, [categories, searchTerm]);

  // Open create form
  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  // Open edit form
  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      parentId: cat.parentId ? String(cat.parentId) : '',
    });
    setShowForm(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        image: form.image || null,
        parentId: form.parentId ? Number(form.parentId) : null,
      };

      let res: Response;
      if (editingCategory) {
        payload.id = editingCategory.id;
        res = await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save category');
      }

      const saved: Category = await res.json();

      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === saved.id ? saved : c));
        toast.success('Category updated!');
      } else {
        setCategories(prev => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Category created!');
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingCategory(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setDeleteConfirmId(null);
    }
  };

  // Parent options (exclude self and self's children when editing)
  const parentOptions = useMemo(() => {
    if (!editingCategory) return categories.filter(c => !c.parentId);
    const childIds = editingCategory.children.map(c => c.id);
    return categories.filter(c =>
      !c.parentId &&
      c.id !== editingCategory.id &&
      !childIds.includes(c.id)
    );
  }, [categories, editingCategory]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Categories', value: stats.total, icon: FolderTree, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Parent Categories', value: stats.parentCats, icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Sub-Categories', value: stats.subCats, icon: ChevronRight, color: 'text-amber-600 bg-amber-50' },
          { label: 'With Products', value: stats.withProducts, icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
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
      <div className="bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-brand-green-border/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 w-full bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
          <button
            onClick={openCreate}
            title="New Category (Alt+N)"
            className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Category
            <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono ml-1">Alt+N</kbd>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Parent</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Sub-cats</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Products</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-brand-foreground/40 font-medium">
                    No categories found. Click <strong>Add Category</strong> to get started.
                  </td>
                </tr>
              ) : filtered.map(cat => (
                <tr key={cat.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="h-9 w-9 rounded-xl object-cover border border-brand-gold/15 flex-shrink-0" />
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
                          <Tag className="h-4 w-4 text-brand-green" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-brand-green">{cat.name}</div>
                        {cat.description && (
                          <div className="text-xs text-brand-foreground/50 truncate max-w-[200px]">{cat.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-brand-gold-light/50 text-brand-gold-dark text-xs px-2 py-1 rounded-lg font-mono">{cat.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-foreground/70">
                    {cat.parent ? (
                      <span className="flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-brand-foreground/30" />
                        {cat.parent.name}
                      </span>
                    ) : (
                      <span className="text-brand-green font-semibold text-xs bg-brand-green-light px-2 py-0.5 rounded-full">Root</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-foreground/70">
                    {cat.children.length > 0 ? (
                      <span className="text-indigo-600 font-bold">{cat.children.length} sub-cats</span>
                    ) : (
                      <span className="text-brand-foreground/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {cat._count.products > 0 ? (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {cat._count.products} products
                      </span>
                    ) : (
                      <span className="text-brand-foreground/30 text-xs">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 rounded-xl text-brand-green hover:bg-brand-green-light transition-colors border border-brand-green/20"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deleteConfirmId === cat.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={loading}
                            className="p-2 rounded-xl text-white bg-rose-500 hover:bg-rose-600 transition-colors"
                            title="Confirm Delete"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-2 rounded-xl text-brand-foreground/60 hover:bg-gray-100 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(cat.id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors border border-rose-200"
                          title="Delete"
                        >
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

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <p className="text-xs text-brand-green-light mt-0.5">
                  {editingCategory ? `Editing: ${editingCategory.name}` : 'Add a new product category to the catalogue'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">Alt+S</kbd>
                  <span className="text-[10px] text-white/50">{editingCategory ? 'Save Changes' : 'Create'}</span>
                  <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                  <span className="text-[10px] text-white/50">Close</span>
                </div>
              </div>
              <button
                onClick={closeForm}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
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
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/35" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Herbal Supplements"
                    className="pl-9 w-full border border-brand-green-border/20 rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20"
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
                    placeholder="Brief description of this category..."
                    rows={3}
                    className="pl-9 w-full border border-brand-green-border/20 rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20 resize-none"
                  />
                </div>
              </div>

              {/* Image Upload & Crop */}
              <ImageUploadCrop
                value={form.image}
                onChange={url => setForm(f => ({ ...f, image: url }))}
                folder="categories"
                label="Category Image"
              />

              {/* Parent Category */}
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5">Parent Category</label>
                <SearchSelect
                  options={parentOptions.map(p => ({ value: String(p.id), label: p.name }))}
                  value={form.parentId}
                  onChange={v => setForm(f => ({ ...f, parentId: v }))}
                  placeholder="— None (Root Category) —"
                  icon={<FolderTree className="h-4 w-4" />}
                  clearable
                />
                <p className="text-[10px] text-brand-foreground/40 mt-1 pl-1">
                  Leave blank to create a top-level category.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl border border-brand-green-border/20 text-sm font-bold text-brand-foreground/60 hover:bg-brand-gold-light/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  {loading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
