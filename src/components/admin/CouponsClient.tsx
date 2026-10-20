'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Percent,
  DollarSign,
  Copy,
  Check,
  Search,
  X,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';

interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  isPublished: boolean;
  usageCount: number;
  createdAt: string;
}

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: 10,
    minOrderAmount: '',
    maxDiscountAmount: '',
    isPublished: true,
  });

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || c.code.toLowerCase().includes(q) || String(c.discountValue).includes(q);
      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && c.isPublished) ||
        (statusFilter === 'DISABLED' && !c.isPublished);
      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: '',
      maxDiscountAmount: '',
      isPublished: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : '',
      isPublished: c.isPublished,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      isPublished: form.isPublished,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/coupons/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update coupon');
        
        toast.success(`Coupon ${payload.code} updated successfully!`);
        setCoupons(prev => prev.map(c => c.id === editingId ? data.coupon : c));
      } else {
        const res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

        toast.success(`Coupon ${payload.code} created successfully!`);
        setCoupons(prev => [data.coupon, ...prev]);
      }

      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (c: Coupon) => {
    const newStatus = !c.isPublished;
    setTogglingId(c.id);
    // Optimistic update
    setCoupons(prev => prev.map(item => item.id === c.id ? { ...item, isPublished: newStatus } : item));

    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Coupon ${c.code} is now ${newStatus ? 'Active' : 'Disabled'}`);
    } catch (err: any) {
      // Revert on error
      setCoupons(prev => prev.map(item => item.id === c.id ? { ...item, isPublished: !newStatus } : item));
      toast.error(err.message || 'Could not update coupon status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => {
      setCopiedCode(prev => (prev === code ? null : prev));
    }, 2000);
  };

  const promptDelete = (c: Coupon) => {
    setDeleteTarget(c);
    setDeleteConsent(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteConsent) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete coupon');

      toast.success(`Coupon ${deleteTarget.code} deleted successfully!`);
      setCoupons(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting coupon');
    } finally {
      setDeleting(false);
    }
  };

  // Global keyboard shortcuts (Alt+N = new, Alt+S = save, Esc = close)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt + N: New Coupon
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!showModal && !deleteTarget) handleOpenAdd();
      }
      // Alt + S: Save Coupon
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (showModal && formRef.current) {
          formRef.current.requestSubmit();
        }
      }
      // Esc: Close active modal
      if (e.key === 'Escape') {
        if (showModal) {
          e.preventDefault();
          setShowModal(false);
        } else if (deleteTarget) {
          e.preventDefault();
          setDeleteTarget(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showModal, deleteTarget]);

  return (
    <div className="space-y-4">
      {/* Header Banner with Merged Search & Create Action */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Shop Coupons & Discounts</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-52 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                type="text"
                placeholder="Search coupons..."
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

            {/* Create Coupon Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              title="Create New Coupon (Alt+N)"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Coupon</span>
              <kbd className="text-[10px] bg-white/20 px-1 py-0.5 rounded font-mono ml-0.5 hidden sm:inline">Alt+N</kbd>
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
            All ({coupons.length})
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
            Active ({coupons.filter(c => c.isPublished).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DISABLED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'DISABLED'
                ? 'bg-card text-amber-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Disabled ({coupons.filter(c => !c.isPublished).length})
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filteredCoupons.length}</strong> {filteredCoupons.length === 1 ? 'coupon' : 'coupons'}
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

      {/* Coupons Responsive Cards Display */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-3 shadow-sm">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">
            {searchTerm || statusFilter !== 'ALL' ? 'No coupons match your filter.' : 'No shop coupons found.'}
          </p>
          <button
            type="button"
            onClick={searchTerm || statusFilter !== 'ALL' ? () => { setSearchTerm(''); setStatusFilter('ALL'); } : handleOpenAdd}
            className="text-xs font-bold text-brand-green underline"
          >
            {searchTerm || statusFilter !== 'ALL' ? 'Reset search & filters' : 'Create your first coupon code'}
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredCoupons.map((c) => {
            const isPercentage = c.discountType === 'PERCENTAGE';
            const isCopied = copiedCode === c.code;

            return (
              <div
                key={c.id}
                className={`relative bg-card rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  c.isPublished
                    ? 'border-border hover:border-brand-green/40 dark:hover:border-brand-gold/40'
                    : 'border-border/60 opacity-85 hover:opacity-100 bg-card/60'
                }`}
              >
                {/* Top Accent Strip (voucher ticket accent) */}
                <div
                  className={`h-1.5 w-full ${
                    isPercentage
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                      : 'bg-gradient-to-r from-emerald-500 to-brand-green'
                  }`}
                />

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  {/* Top Row: Coupon Code + Status Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.code)}
                          title="Click to copy coupon code"
                          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-dashed border-brand-green/30 dark:border-brand-gold/40 bg-brand-green/5 dark:bg-brand-green/10 hover:bg-brand-green/10 hover:border-brand-green transition-all"
                        >
                          <span className="font-mono font-black text-base sm:text-lg tracking-widest text-brand-green dark:text-brand-gold">
                            {c.code}
                          </span>
                          {isCopied ? (
                            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-brand-green shrink-0 transition-colors" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    {/* Status Badge & Quick Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      disabled={togglingId === c.id}
                      title={`Click to ${c.isPublished ? 'Deactivate' : 'Activate'}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                        c.isPublished
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                          : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                      }`}
                    >
                      {c.isPublished ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Discount Value Display */}
                  <div className="bg-muted/40 dark:bg-muted/20 border border-border rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Discount Value</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                          {isPercentage ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                        </span>
                        <span className="text-xs font-extrabold uppercase text-muted-foreground">
                          {isPercentage ? 'OFF Subtotal' : 'FLAT OFF'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-2xl ${
                        isPercentage
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isPercentage ? <Percent className="h-6 w-6" /> : <DollarSign className="h-6 w-6" />}
                    </div>
                  </div>

                  {/* Rules & Redemptions Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Min Order</span>
                      <span className="font-extrabold text-foreground truncate block">
                        {c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'No Minimum'}
                      </span>
                    </div>

                    <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Max Cap</span>
                      <span className="font-extrabold text-foreground truncate block">
                        {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'No Cap'}
                      </span>
                    </div>

                    <div className="col-span-2 bg-background border border-border rounded-xl px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ShoppingBag className="h-3.5 w-3.5 text-brand-green" />
                        <span className="text-[11px] font-medium">Times Redeemed</span>
                      </div>
                      <span className="font-black text-brand-green text-xs">
                        {c.usageCount} {c.usageCount === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      disabled={togglingId === c.id}
                      className="text-xs font-bold text-muted-foreground hover:text-brand-green flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-card transition-colors"
                      title={c.isPublished ? 'Deactivate coupon' : 'Activate coupon'}
                    >
                      {c.isPublished ? (
                        <ToggleRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="hidden sm:inline">{c.isPublished ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      title="Edit Coupon"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-brand-green hover:text-white hover:border-brand-green transition-all shadow-sm"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => promptDelete(c)}
                      title="Delete Coupon"
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
                  <th className="py-3 px-5">Coupon Code</th>
                  <th className="py-3 px-5">Discount Value</th>
                  <th className="py-3 px-5">Min Order</th>
                  <th className="py-3 px-5">Max Cap</th>
                  <th className="py-3 px-5 text-center">Uses</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredCoupons.map((c) => {
                  const isCopied = copiedCode === c.code;
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-5">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.code)}
                          title="Click to copy code"
                          className="font-mono font-black text-xs tracking-wider text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 hover:bg-brand-green/20 transition-all"
                        >
                          <span>{c.code}</span>
                          {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                        </button>
                      </td>
                      <td className="py-3 px-5 font-bold text-foreground">
                        {c.discountType === 'PERCENTAGE' ? (
                          <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md text-[11px]">
                            {c.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md text-[11px]">
                            {formatPrice(c.discountValue)} FLAT OFF
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-muted-foreground font-semibold">
                        {c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'No Minimum'}
                      </td>
                      <td className="py-3 px-5 text-muted-foreground font-semibold">
                        {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'No Cap'}
                      </td>
                      <td className="py-3 px-5 text-center text-muted-foreground font-semibold">
                        {c.usageCount}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          disabled={togglingId === c.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                            c.isPublished
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {c.isPublished ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>{c.isPublished ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => promptDelete(c)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add / Edit Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !saving && setShowModal(false)}
          />

          <div className="relative bg-card w-full max-w-lg rounded-3xl space-y-6 shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-brand-green to-[#0f381b] text-white">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-brand-gold" />
                {editingId ? 'Edit Shop Coupon' : 'Create New Shop Coupon'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2 py-1 rounded-lg">
                  <span>Save</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold text-brand-gold">Alt+S</kbd>
                </span>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  title="Close (Esc)"
                  aria-label="Close"
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full flex items-center gap-1 transition-colors"
                >
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold text-white/80">Esc</kbd>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form ref={formRef} id="coupon-form" onSubmit={handleSave} className="px-6 sm:px-8 space-y-4 text-xs">
              <div>
                <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. WELCOME10, AYURWED500"
                  className="w-full px-4 py-3 bg-background border border-border rounded-2xl font-mono font-black text-sm uppercase tracking-widest text-brand-green focus:outline-none focus:border-brand-green shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl font-bold text-foreground focus:outline-none focus:border-brand-green shadow-sm"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
                    placeholder="e.g. 10 or 500"
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl font-black text-foreground focus:outline-none focus:border-brand-green shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">Min Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="e.g. 499 (Optional)"
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl font-bold text-foreground focus:outline-none focus:border-brand-green shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.maxDiscountAmount}
                    onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                    placeholder="e.g. 1000 (Optional)"
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl font-bold text-foreground focus:outline-none focus:border-brand-green shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="coupon-published"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 text-brand-green rounded focus:ring-brand-green cursor-pointer"
                />
                <label htmlFor="coupon-published" className="font-bold text-foreground cursor-pointer select-none">
                  Active & Available for Checkout
                </label>
              </div>
            </form>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                title="Cancel (Esc)"
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <span>Cancel</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/80 border border-border rounded font-mono text-foreground/60 hidden sm:inline">Esc</kbd>
              </button>
              <button
                type="submit"
                form="coupon-form"
                disabled={saving}
                title="Save (Alt+S)"
                className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>{saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold hidden sm:inline">Alt+S</kbd>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Coupon Deletion Consent Modal */}
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
                <h3 className="font-extrabold text-red-600 text-lg">Confirm Coupon Deletion</h3>
                <p className="text-xs text-muted-foreground">Admin User Consent Required</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-foreground">
                  Are you sure you want to permanently delete coupon code{' '}
                  <code className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                    {deleteTarget.code}
                  </code>
                  ?
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Discount Type:{' '}
                  <span className="font-bold text-foreground">
                    {deleteTarget.discountType === 'PERCENTAGE'
                      ? `${deleteTarget.discountValue}% OFF`
                      : `${formatPrice(deleteTarget.discountValue)} FLAT OFF`}
                  </span>
                </p>
              </div>

              {/* Explicit User Consent Checkbox */}
              <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-2xl border border-border">
                <input
                  id="delete-consent-check"
                  type="checkbox"
                  checked={deleteConsent}
                  onChange={e => setDeleteConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-red-600 focus:ring-red-500 rounded cursor-pointer shrink-0"
                />
                <label
                  htmlFor="delete-consent-check"
                  className="text-xs font-bold text-foreground cursor-pointer select-none"
                >
                  I explicitly confirm that I want to delete coupon{' '}
                  <span className="font-black text-red-600">{deleteTarget.code}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                title="Cancel (Esc)"
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted flex items-center gap-1.5"
              >
                <span>Cancel</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-card border border-border rounded font-mono text-foreground/60">Esc</kbd>
              </button>
              <button
                type="button"
                disabled={!deleteConsent || deleting}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : 'Confirm & Delete Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
