'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CarouselsClient({ initialCarousels }: { initialCarousels: any[] }) {
  const router = useRouter();
  const [carousels, setCarousels] = useState(initialCarousels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!editingId && !formData.imageFile) {
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this carousel?')) return;
    
    try {
      const res = await fetch(`/api/admin/carousels/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Deleted successfully');
      setCarousels(carousels.filter(c => c.id !== id));
      router.refresh();
    } catch (err) {
      toast.error('Error deleting carousel');
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
      toast.success('Status updated');
      router.refresh();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-green-border/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-brand-green">Manage Carousels ({carousels.length}/5)</h2>
        <button
          onClick={() => handleOpenModal()}
          disabled={carousels.length >= 5}
          className="flex items-center gap-2 bg-brand-gold text-brand-green px-4 py-2.5 rounded-xl font-bold hover:bg-brand-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          Add Carousel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-green-light/30 text-brand-green border-b border-brand-green-border/10">
              <th className="p-4 font-semibold w-16">#</th>
              <th className="p-4 font-semibold">Image</th>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {carousels.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-brand-foreground/50">
                  No carousels found. Add your first banner!
                </td>
              </tr>
            ) : (
              carousels.map((carousel, index) => (
                <tr key={carousel.id} className="border-b border-brand-green-border/5 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-brand-foreground/70">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300 cursor-move" />
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-4">
                    <img src={carousel.image} alt={carousel.title} className="h-16 w-32 object-cover rounded-lg border border-slate-200" />
                  </td>
                  <td className="p-4 font-medium text-brand-green">{carousel.title}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(carousel)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        carousel.isActive
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {carousel.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {carousel.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(carousel)}
                      className="p-2 text-brand-gold-dark hover:bg-brand-gold/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(carousel.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-brand-green-border/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-green">
                {editingId ? 'Edit Carousel' : 'Add Carousel'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-green">Banner Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-green-border/20 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="e.g. Winter Wellness Sale"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-green">Banner Link (Optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-green-border/20 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="e.g. /products/chyawanprash"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-green">Banner Image (.webp only, Width > 1200px)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-grow flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-brand-green-border/30 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="file" accept="image/webp" className="hidden" onChange={handleImageUpload} />
                    <ImageIcon className="h-6 w-6 text-brand-gold" />
                    <span className="text-sm text-brand-foreground/70 font-medium">Click to upload .webp</span>
                  </label>
                  {formData.imagePreview && (
                    <div className="w-32 h-24 flex-shrink-0 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-brand-gold focus:ring-brand-gold h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-brand-green cursor-pointer">
                  Active (Visible on homepage)
                </label>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-green text-white font-bold hover:bg-brand-green/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Carousel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
