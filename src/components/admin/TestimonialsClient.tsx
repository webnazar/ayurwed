'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Trash2,
  Star,
  MessageSquare,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  User,
  LayoutGrid,
  List,
  Sparkles,
  Quote,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ShieldCheck,
  Calendar,
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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function TestimonialsClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Testimonial | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Keyboard shortcut: Esc to close modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirmTarget) {
        setDeleteConfirmTarget(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteConfirmTarget]);

  const approvedCount = items.filter(t => t.isActive).length;
  const pendingCount = items.filter(t => !t.isActive).length;
  const avgRating = items.length
    ? (items.reduce((a, t) => a + t.rating, 0) / items.length).toFixed(1)
    : '5.0';

  const filtered = useMemo(() => {
    return items.filter(t => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'APPROVED' && t.isActive) ||
        (statusFilter === 'PENDING' && !t.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const toggleApproval = async (t: Testimonial) => {
    const newStatus = !t.isActive;
    setTogglingId(t.id);

    // Optimistic update
    setItems(prev => prev.map(x => (x.id === t.id ? { ...x, isActive: newStatus } : x)));

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, isActive: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      const saved: Testimonial = await res.json();
      setItems(prev => prev.map(x => (x.id === saved.id ? saved : x)));
      toast.success(
        newStatus
          ? `Review from ${t.name} is now APPROVED and visible on homepage!`
          : `Review from ${t.name} is now UNAPPROVED (hidden).`
      );
    } catch {
      // Revert on error
      setItems(prev => prev.map(x => (x.id === t.id ? { ...x, isActive: !newStatus } : x)));
      toast.error('Failed to update review status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete');
      }
      setItems(prev => prev.filter(t => t.id !== id));
      toast.success('Review permanently deleted');
      setDeleteConfirmTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner with Merged Search (No Add Button) */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">User Reviews & Testimonials</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                type="text"
                placeholder="Search user reviews..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-foreground placeholder:text-foreground/40 shadow-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Metrics Bar */}
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
            All Reviews ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-card text-amber-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            <span>Pending Approval ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'APPROVED'
                ? 'bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filtered.length}</strong> of{' '}
              <strong className="text-foreground">{items.length}</strong>
            </span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-1 rounded-xl">
            <Star className="h-3 w-3 fill-current" />
            <span>Avg {avgRating}</span>
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
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">
            {search || statusFilter !== 'ALL'
              ? 'No user reviews match your search or filter.'
              : 'No received user reviews in moderation queue.'}
          </p>
          {(search || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-brand-green underline"
            >
              Reset search & filters
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`relative bg-card rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                t.isActive
                  ? 'border-border hover:border-brand-green/40 dark:hover:border-brand-gold/40'
                  : 'border-amber-300/60 dark:border-amber-900/60 bg-amber-500/5'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`h-1.5 w-full ${
                  t.isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-brand-green'
                    : 'bg-gradient-to-r from-amber-400 to-amber-600'
                }`}
              />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* Person Header + Status Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={t.avatar && t.avatar.trim().length > 0 ? t.avatar : '/avatar.webp'}
                      alt={t.name}
                      className="h-11 w-11 rounded-full object-cover border-2 border-brand-green/20 dark:border-brand-gold/20 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/avatar.webp';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base text-foreground truncate" title={t.name}>
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate" title={t.subtitle}>
                        {t.subtitle}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>Submitted {formatDate(t.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & 1-Click Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleApproval(t)}
                    disabled={togglingId === t.id}
                    title={`Click to ${t.isActive ? 'Unapprove' : 'Approve'}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                      t.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {t.isActive ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Approved</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Pending</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quote Box (Direct user submission) */}
                <div className="bg-muted/40 dark:bg-muted/20 border border-border rounded-2xl p-4 relative group">
                  <Quote className="h-5 w-5 text-brand-green/20 absolute right-3 top-3" />
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed italic line-clamp-4">
                    "{t.quote}"
                  </p>
                </div>

                {/* Rating & Moderation Notice */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                    <span className="ml-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                      {t.rating}.0 Rating
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                      t.isActive
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                    }`}
                  >
                    {t.isActive ? 'Live on Homepage' : 'Awaiting Approval'}
                  </span>
                </div>
              </div>

              {/* Card Footer: Admin Actions (Approve/Unapprove + Delete) */}
              <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleApproval(t)}
                    disabled={togglingId === t.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      t.isActive
                        ? 'bg-card border border-border text-muted-foreground hover:text-amber-600 hover:border-amber-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={t.isActive ? 'Unapprove (hide from homepage)' : 'Approve (publish on homepage)'}
                  >
                    {t.isActive ? (
                      <>
                        <ToggleRight className="h-4 w-4 text-emerald-600" />
                        <span>Unapprove</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>Approve Review</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmTarget(t)}
                    title="Delete Review"
                    className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
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
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">User Review Quote</th>
                  <th className="py-3 px-5 text-center">Rating</th>
                  <th className="py-3 px-5 text-center">Submitted Date</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className={`transition-colors ${
                      !t.isActive ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={t.avatar && t.avatar.trim().length > 0 ? t.avatar : '/avatar.webp'}
                          alt={t.name}
                          className="h-8 w-8 rounded-full object-cover border border-brand-green/20 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/avatar.webp';
                          }}
                        />
                        <div>
                          <div className="font-bold text-foreground">{t.name}</div>
                          <div className="text-[11px] text-muted-foreground">{t.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 max-w-sm">
                      <p className="text-foreground/90 italic line-clamp-2">"{t.quote}"</p>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className="inline-flex items-center gap-0.5 text-amber-500">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center text-muted-foreground">
                      <div className="inline-flex items-center gap-1.5 text-[11px]">
                        <Calendar className="h-3 w-3 text-muted-foreground/60" />
                        <span>{formatDate(t.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleApproval(t)}
                        disabled={togglingId === t.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                          t.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {t.isActive ? (
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        <span>{t.isActive ? 'Approved' : 'Pending'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleApproval(t)}
                        disabled={togglingId === t.id}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1 ${
                          t.isActive
                            ? 'bg-card border border-border text-muted-foreground hover:text-amber-600 hover:border-amber-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={t.isActive ? 'Unapprove' : 'Approve'}
                      >
                        {t.isActive ? 'Unapprove' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTarget(t)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors inline-flex"
                        title="Delete Review"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !deleting && setDeleteConfirmTarget(null)}
          />

          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 border border-red-500/30">
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center text-red-600">
                <Trash2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground">Delete User Review?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to permanently delete the review from{' '}
                <strong className="text-foreground">{deleteConfirmTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmTarget.id)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
