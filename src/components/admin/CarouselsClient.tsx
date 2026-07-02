'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, Image as ImageIcon, Activity, Layers,
  X, Tag, ToggleRight, ToggleLeft, GripVertical, Link as LinkIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CarouselsClient({ initialCarousels }: { initialCarousels: any[] }) {
  const router = useRouter();
  const [carousels, setCarousels] = useState(initialCarousels);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    imageFile: null as File | null,
    imagePreview: '',
    link: '',
    isActive: true,
    sortOrder: 0,
  });

  const handleOpenModal = (carousel?: any) => {
    if (carousel) {
      setEditingId(carousel.id);
      setFormData({
        title: carousel.title,
        imageFile: null,
        imagePreview: carousel.image,
        link: carousel.link || '',
        isActive: carousel.isActive,
        sortOrder: carousel.sortOrder,
      });
    } else {
      if (carousels.length >= 5) {
        toast.error('Maximum 5 carousels allowed. Please delete one first.');
        return;
      }
      setEditingId(null);
      setFormData({
        title: '',
        imageFile: null,
        imagePreview: '',
        link: '',
        isActive: true,
        sortOrder: carousels.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'image/webp') {
      toast.error('Please upload only .webp images');
      return;
    }

    setFormData({
      ...formData,
      imageFile: file,
      imagePreview: URL.createObjectURL(file)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !formData.imageFile && !formData.imagePreview) {
      toast.error('Image is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/admin/carousels/${editingId}` : '/api/admin/carousels';
      const method = editingId ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('title', formData.title);
      data.append('link', formData.link);
      data.append('isActive', formData.isActive.toString());
      data.append('sortOrder', formData.sortOrder.toString());
      if (formData.imageFile) {
        data.append('image', formData.imageFile);
      }

      const res = await fetch(url, {
        method,
        body: data,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success(editingId ? 'Carousel updated!' : 'Carousel created!');
      setIsModalOpen(false);
      router.refresh();
      
      const saved = await res.json();
      if (editingId) {
        setCarousels(carousels.map(c => c.id === editingId ? saved : c));
      } else {
        setCarousels([...carousels, saved]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/carousels/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Deleted successfully');
      setCarousels(carousels.filter(c => c.id !== deletingId));
      router.refresh();
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error('Error deleting carousel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (carousel: any) => {
    try {
      const res = await fetch(`/api/admin/carousels/${carousel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !carousel.isActive }),
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      setCarousels(carousels.map(c => c.id === carousel.id ? { ...c, isActive: !c.isActive } : c));
      toast.success(carousel.isActive ? 'Deactivated' : 'Activated');
      router.refresh();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
      if (e.altKey && e.key.toLowerCase() === 'n') { e.preventDefault(); if (!isModalOpen && carousels.length < 5) handleOpenModal(); }
      if (e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); if (isModalOpen) formRef.current?.requestSubmit(); }
      if (e.key === 'Escape' && isModalOpen && !inField) handleCloseModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isModalOpen, carousels.length]);

  // Stats
  const stats = useMemo(() => ({
    total: carousels.length,
    active: carousels.filter(c => c.isActive).length,
    available: 5 - carousels.length,
  }), [carousels]);

  // Filtered list
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return carousels;
    const t = searchTerm.toLowerCase();
    return carousels.filter(c =>
      c.id.toString().includes(t) ||
      c.title.toLowerCase().includes(t) ||
      (c.link && c.link.toLowerCase().includes(t))
    );
  }, [carousels, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Carousels', value: `${stats.total}/5`, icon: ImageIcon, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Active', value: stats.active, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Available Slots', value: stats.available, icon: Layers, color: 'text-amber-600 bg-amber-50' },
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
              placeholder="Search carousels..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 w-full bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal()}
              disabled={carousels.length >= 5}
              title="New Carousel (Alt+N)"
              className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Carousel
              <kbd className="text-[10px] bg-card/20 px-1.5 py-0.5 rounded font-mono ml-1 hidden sm:inline">Alt+N</kbd>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider w-16">#</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Title & Link</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-brand-foreground/40 font-medium">
                    No carousels found. Click <strong>Add Carousel</strong> to get started.
                  </td>
                </tr>
              ) : filtered.map((carousel, index) => (
                <tr key={carousel.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-brand-foreground/20 cursor-move" />
                      <span className="font-mono text-sm font-bold text-brand-green/60">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <img src={carousel.image} alt={carousel.title} className="h-16 w-32 object-cover rounded-xl border border-border shadow-sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-green">{carousel.title}</div>
                    {carousel.link && (
                      <div className="text-xs text-brand-foreground/50 truncate max-w-[200px] font-mono mt-0.5">{carousel.link}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => toggleStatus(carousel)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${carousel.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40' : 'bg-muted text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80'}`}>
                      {carousel.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                      {carousel.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(carousel)}
                        className="p-2 text-brand-gold-dark hover:bg-brand-gold/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(carousel.id)}
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">
                  {editingId ? 'Edit Carousel' : 'New Carousel'}
                </h3>
                <p className="text-xs text-brand-green-light mt-0.5">
                  {editingId ? `Editing banner details` : 'Add a new homepage banner'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Alt+S</kbd>
                  <span className="text-[10px] text-white/50">{editingId ? 'Save Changes' : 'Create'}</span>
                  <kbd className="text-[10px] bg-card/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                  <span className="text-[10px] text-white/50">Close</span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 bg-card/10 hover:bg-card/20 rounded-full transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5">
                  Banner Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/35" />
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Winter Wellness Sale"
                    className="pl-9 w-full border border-border rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20"
                  />
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5">
                  Banner Link (Optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/35" />
                  <input
                    type="text"
                    value={formData.link}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    placeholder="e.g. /products/chyawanprash"
                    className="pl-9 w-full border border-border rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5">
                  Banner Image (.webp only, Width &gt; 1200px)
                </label>
                <div className="flex flex-col gap-4">
                  <label className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-brand-gold-light/20 transition-colors bg-brand-gold-light/10">
                    <input type="file" accept="image/webp" className="hidden" onChange={handleImageUpload} />
                    <ImageIcon className="h-6 w-6 text-brand-gold" />
                    <span className="text-sm text-brand-foreground/70 font-medium">Click to upload .webp</span>
                  </label>
                  {formData.imagePreview && (
                    <div className="w-full relative rounded-2xl overflow-hidden border border-border shadow-sm">
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-auto object-cover max-h-40" />
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <button type="button" onClick={() => setFormData(f => ({ ...f, isActive: !f.isActive }))}>
                  {formData.isActive ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                </button>
                <span className="text-sm font-semibold text-brand-foreground/70">Visible on homepage</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold text-brand-foreground/60 hover:bg-brand-gold-light/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Carousel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Delete Carousel?</h3>
              <p className="text-sm text-brand-foreground/60">
                Are you sure you want to permanently delete this banner? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-muted border-t border-border flex gap-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingId(null);
                }} 
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl bg-card border border-border text-sm font-bold hover:bg-muted-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
