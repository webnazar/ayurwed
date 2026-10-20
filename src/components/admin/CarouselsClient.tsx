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
  const searchRef = useRef<HTMLInputElement>(null);

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
        isActive: carousel.isActive ?? true,
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
      data.append('isActive', formData.isActive ? 'true' : 'false');
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
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!isModalOpen && carousels.length < 5) handleOpenModal();
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isModalOpen) {
          formRef.current?.requestSubmit();
        } else {
          searchRef.current?.focus();
        }
      }
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
    <div className="space-y-3.5">
      {/* ── Header Banner with Merged Search & Action Button (Minimal Margins, No Subtitle) ── */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Carousels</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search carousels, title, link..."
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

            {/* Add Carousel Button */}
            <button
              type="button"
              onClick={() => handleOpenModal()}
              disabled={carousels.length >= 5}
              title={carousels.length >= 5 ? 'Maximum 5 carousels reached' : 'Add Carousel (Alt+N)'}
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Carousel</span>
              <kbd className="text-[10px] bg-white/20 px-1 py-0.5 rounded font-mono ml-0.5 hidden sm:inline">Alt+N</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid (Equal & Minimal Margins) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Total Carousels</span>
            <span className="text-2xl font-black text-brand-green dark:text-brand-gold mt-1 block">
              {stats.total} / 5
            </span>
          </div>
          <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl">
            <ImageIcon className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Active</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.active}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Available Slots</span>
            <span className="text-2xl font-black text-brand-gold-dark mt-1 block">
              {stats.available}
            </span>
          </div>
          <div className="p-2.5 bg-brand-gold/15 text-brand-gold-dark rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium">
            <span>Showing <strong className="text-foreground">{filtered.length}</strong> of <strong className="text-foreground">{carousels.length}</strong> banners</span>
            {searchTerm && <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-bold">Filtered</span>}
          </div>
          <span className="text-[11px] text-muted-foreground/80 font-medium hidden sm:inline">Max limit: 5 banners</span>
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
                    <img src={carousel.image} alt={carousel.title} className="h-16 aspect-video object-cover rounded-xl border border-border shadow-sm" />
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between flex-shrink-0">
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
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
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

                {/* Image Upload & 16:9 Ratio Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block">
                      Banner Image (.webp only) {!editingId && <span className="text-rose-500">*</span>}
                    </label>
                    <span className="text-[10px] font-extrabold text-brand-green bg-brand-green-light dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-brand-green/20">
                      16:9 Ratio Banner
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="w-full flex flex-col items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-brand-gold-light/20 hover:border-brand-gold/60 transition-all bg-brand-gold-light/10 group">
                      <input type="file" accept="image/webp" className="hidden" onChange={handleImageUpload} />
                      <div className="p-2 rounded-xl bg-brand-gold/15 text-brand-gold group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-brand-foreground/80 font-bold block">
                          {formData.imagePreview ? 'Click to change image (.webp)' : 'Click to upload banner (.webp)'}
                        </span>
                        <span className="text-[10px] text-brand-foreground/50 block mt-0.5">
                          Recommended 16:9 banner: 1920 × 1080 px or 1280 × 720 px
                        </span>
                      </div>
                    </label>

                    {/* 16:9 Live Preview */}
                    {formData.imagePreview && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-brand-foreground/60 font-semibold px-1">
                          <span className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-brand-gold" />
                            16:9 Homepage Banner Preview:
                          </span>
                          <span className="text-[10px] text-brand-foreground/40 font-mono">aspect-ratio: 16/9</span>
                        </div>
                        <div className="w-full aspect-video relative rounded-2xl overflow-hidden border-2 border-brand-green/30 shadow-md bg-slate-900 group">
                          <img 
                            src={formData.imagePreview} 
                            alt="Banner Preview" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                          />
                          {/* 16:9 Badge & Status */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                            {!formData.isActive && (
                              <span className="bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                                Deactive (Hidden)
                              </span>
                            )}
                            <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                              <Layers className="h-3 w-3 text-brand-gold" />
                              <span>16:9 Aspect</span>
                            </div>
                          </div>
                          {/* Title simulation overlay matching HeroCarousel */}
                          {formData.title && (
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white pointer-events-none">
                              <p className="text-xs font-bold line-clamp-1 drop-shadow-sm">{formData.title}</p>
                              {formData.link && (
                                <p className="text-[10px] text-white/70 font-mono truncate">{formData.link}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active / Deactive Toggle Card */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-2">
                    Carousel Status
                  </label>
                  <div
                    onClick={() => setFormData(f => ({ ...f, isActive: !f.isActive }))}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.isActive
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-colors ${
                        formData.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {formData.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-extrabold ${formData.isActive ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                            {formData.isActive ? 'Active' : 'Deactive'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            formData.isActive 
                              ? 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200' 
                              : 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                          }`}>
                            {formData.isActive ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/60 mt-0.5">
                          {formData.isActive 
                            ? 'Carousel is active and will be visible on the homepage.' 
                            : 'Carousel is deactivated and will not be visible on the homepage.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Toggle status"
                      className="p-1 focus:outline-none"
                    >
                      {formData.isActive ? (
                        <ToggleRight className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Actions Row */}
              <div className="p-4 sm:p-5 bg-card/95 border-t border-border flex gap-3 flex-shrink-0 backdrop-blur-xs">
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
