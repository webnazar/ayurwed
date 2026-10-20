'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  Sparkles,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Send,
  Download,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

const BATCH_SIZE = 15;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function NewsletterSubsClient({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

  // Interactive Delete Consent state
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sentinel ref for infinite scroll
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard Esc shortcut to close modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteTarget) {
        setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteTarget]);

  // Reset displayCount whenever search or filter changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE);
  }, [searchTerm, statusFilter]);

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    let list = subscribers;

    if (statusFilter === 'ACTIVE') list = list.filter(s => s.isActive);
    if (statusFilter === 'INACTIVE') list = list.filter(s => !s.isActive);

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(s => s.email.toLowerCase().includes(q));
    }

    return list;
  }, [subscribers, searchTerm, statusFilter]);

  // Slice list for performance
  const visibleSubscribers = useMemo(() => {
    return filteredSubscribers.slice(0, displayCount);
  }, [filteredSubscribers, displayCount]);

  const hasMore = displayCount < filteredSubscribers.length;
  const remainingCount = filteredSubscribers.length - displayCount;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount(prev => prev + BATCH_SIZE);
    }
  }, [hasMore]);

  // Intersection Observer for Scroll Down Loading
  useEffect(() => {
    const sentinel = observerRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success(`Copied ${email} to clipboard!`);
    setTimeout(() => {
      setCopiedEmail(prev => (prev === email ? null : prev));
    }, 2000);
  };

  const handleExportEmails = () => {
    const activeEmails = subscribers.filter(s => s.isActive).map(s => s.email);
    if (activeEmails.length === 0) {
      toast.error('No active subscribers to export');
      return;
    }
    const blob = new Blob([activeEmails.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-active-subscribers-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${activeEmails.length} active subscriber emails!`);
  };

  const handleToggleActive = async (sub: Subscriber) => {
    setTogglingId(sub.id);
    const newStatus = !sub.isActive;

    // Optimistic update
    setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, isActive: newStatus } : s));

    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, isActive: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update subscription status');
      toast.success(`${sub.email} is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (err: any) {
      // Revert optimistic update
      setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, isActive: !newStatus } : s));
      toast.error(err.message || 'Error updating status');
    } finally {
      setTogglingId(null);
    }
  };

  const promptDelete = (sub: Subscriber) => {
    setDeleteTarget(sub);
    setDeleteConsent(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteConsent) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/newsletter?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subscriber');

      setSubscribers(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success(`Subscriber ${deleteTarget.email} removed`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Error removing subscriber');
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = subscribers.filter(s => s.isActive).length;
  const inactiveCount = subscribers.filter(s => !s.isActive).length;

  return (
    <div className="space-y-4">
      {/* Header Banner with Merged Search & Quick Export */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Newsletter Subscriptions</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                type="text"
                placeholder="Search email address..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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

            {/* Quick Export Active Button */}
            <button
              type="button"
              onClick={handleExportEmails}
              title="Export Active Subscribers List"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Active</span>
            </button>
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
            All ({subscribers.length})
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
              Showing <strong className="text-foreground">{visibleSubscribers.length}</strong> of{' '}
              <strong className="text-foreground">{filteredSubscribers.length}</strong>
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
      {filteredSubscribers.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-3 shadow-sm">
          <Mail className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No subscribers match your search or filter.'
              : 'No newsletter subscribers found.'}
          </p>
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
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
          {visibleSubscribers.map((sub) => {
            const isCopied = copiedEmail === sub.email;

            return (
              <div
                key={sub.id}
                className={`relative bg-card rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  sub.isActive
                    ? 'border-border hover:border-brand-green/40 dark:hover:border-brand-gold/40'
                    : 'border-border/60 opacity-85 hover:opacity-100 bg-card/60'
                }`}
              >
                {/* Top Accent Strip */}
                <div
                  className={`h-1.5 w-full ${
                    sub.isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-brand-green'
                      : 'bg-gradient-to-r from-amber-400 to-amber-600'
                  }`}
                />

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  {/* Top Row: Email Display + Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(sub.email)}
                          title="Click to copy email address"
                          className="group flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed border-brand-green/30 dark:border-brand-gold/40 bg-brand-green/5 dark:bg-brand-green/10 hover:bg-brand-green/10 hover:border-brand-green transition-all max-w-full"
                        >
                          <Mail className="h-4 w-4 text-brand-green dark:text-brand-gold shrink-0" />
                          <span className="font-mono font-bold text-xs sm:text-sm text-foreground truncate">
                            {sub.email}
                          </span>
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand-green shrink-0 transition-colors" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
                        <span>Subscribed {formatDate(sub.createdAt)}</span>
                      </p>
                    </div>

                    {/* Status Badge & 1-Click Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(sub)}
                      disabled={togglingId === sub.id}
                      title={`Click to ${sub.isActive ? 'Deactivate' : 'Activate'}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                        sub.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                          : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                      }`}
                    >
                      {sub.isActive ? (
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

                  {/* Quick Email Action Box */}
                  <div className="bg-muted/40 dark:bg-muted/20 border border-border rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Subscription Channel
                      </span>
                      <span className="font-extrabold text-foreground text-xs truncate block mt-0.5">
                        Ayurwed Wellness Circle
                      </span>
                    </div>
                    <a
                      href={`mailto:${sub.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-brand-green hover:bg-brand-green hover:text-white transition-all shadow-sm shrink-0"
                      title="Send direct email"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send Mail</span>
                    </a>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(sub)}
                      disabled={togglingId === sub.id}
                      className="text-xs font-bold text-muted-foreground hover:text-brand-green flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-card transition-colors"
                      title={sub.isActive ? 'Deactivate subscription' : 'Activate subscription'}
                    >
                      {sub.isActive ? (
                        <ToggleRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="hidden sm:inline">{sub.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => promptDelete(sub)}
                      title="Delete Subscriber"
                      className="p-1.5 rounded-xl bg-card border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / Grid View */
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border uppercase font-extrabold text-[10px] tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-5">Subscriber Email</th>
                  <th className="py-3 px-5 text-center">Subscribed Date</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {visibleSubscribers.map((sub) => {
                  const isCopied = copiedEmail === sub.email;

                  return (
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-5 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(sub.email)}
                            title="Click to copy email"
                            className="inline-flex items-center gap-1.5 hover:text-brand-green group text-xs font-mono"
                          >
                            <Mail className="h-3.5 w-3.5 text-brand-green shrink-0" />
                            <span>{sub.email}</span>
                            {isCopied ? (
                              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-center text-muted-foreground font-semibold">
                        <div className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-muted-foreground/60" />
                          <span>{formatDate(sub.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(sub)}
                          disabled={togglingId === sub.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                            sub.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {sub.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>{sub.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right space-x-1.5 whitespace-nowrap">
                        <a
                          href={`mailto:${sub.email}`}
                          className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors inline-flex"
                          title="Compose Email"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(sub)}
                          disabled={togglingId === sub.id}
                          className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors inline-flex"
                          title={sub.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {sub.isActive ? (
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete(sub)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors inline-flex"
                          title="Delete Subscriber"
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

      {/* Infinite Scroll / Load More Sentinel */}
      {hasMore && (
        <div ref={observerRef} className="p-4 border border-border rounded-2xl bg-muted/20 text-center space-y-2">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center gap-2 bg-card hover:bg-brand-green hover:text-white border border-border text-brand-green font-extrabold px-6 py-2.5 rounded-2xl text-xs transition-all shadow-sm"
          >
            <span>Load More Subscribers ({remainingCount} remaining)</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <p className="text-[10px] text-muted-foreground">Auto-loads as you scroll down</p>
        </div>
      )}

      {/* Interactive Delete Consent Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          <div className="relative bg-card w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-red-500/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-2xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-red-600 text-lg">Confirm Subscriber Removal</h3>
                <p className="text-xs text-muted-foreground">Admin User Consent Required</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-foreground">
                  Are you sure you want to remove <span className="font-black text-red-600">{deleteTarget.email}</span> from newsletter subscriptions?
                </p>
                <p className="text-[11px] text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>

              {/* Explicit User Consent Checkbox */}
              <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-2xl border border-border">
                <input
                  id="delete-sub-consent-check"
                  type="checkbox"
                  checked={deleteConsent}
                  onChange={e => setDeleteConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-red-600 focus:ring-red-500 rounded cursor-pointer shrink-0"
                />
                <label htmlFor="delete-sub-consent-check" className="text-xs font-bold text-foreground cursor-pointer select-none">
                  I explicitly confirm that I want to remove <span className="font-black text-red-600">{deleteTarget.email}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deleteConsent || deleting}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : 'Confirm & Remove Subscriber'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
