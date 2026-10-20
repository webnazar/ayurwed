'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  Building2,
  Package,
  User,
  X,
  CheckCircle2,
  Phone,
  Mail,
  Inbox,
  Clock,
  Send,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface EnquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  manufacturer: { companyName: string; slug: string };
  preparation: { name: string; slug: string } | null;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function EnquiriesListClient({ initialEnquiries }: { initialEnquiries: EnquiryItem[] }) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, LAST_7, LAST_30
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Interactive Deletion Consent State
  const [deleteTarget, setDeleteTarget] = useState<EnquiryItem | null>(null);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keyboard shortcut Esc to close modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedEnquiry) setSelectedEnquiry(null);
        if (deleteTarget) setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedEnquiry, deleteTarget]);

  // Filter Logic
  const filteredEnquiries = useMemo(() => {
    let filtered = enquiries;

    // Status Filter
    if (statusFilter === 'UNREAD') filtered = filtered.filter(e => !e.isRead);
    if (statusFilter === 'READ') filtered = filtered.filter(e => e.isRead);

    // Date Filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === 'LAST_7') cutoff.setDate(now.getDate() - 7);
      if (dateFilter === 'LAST_30') cutoff.setDate(now.getDate() - 30);

      filtered = filtered.filter(e => new Date(e.createdAt) >= cutoff);
    }

    // Search Filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.phone && e.phone.toLowerCase().includes(q)) ||
        e.manufacturer.companyName.toLowerCase().includes(q) ||
        (e.preparation && e.preparation.name.toLowerCase().includes(q)) ||
        e.message.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [enquiries, searchTerm, dateFilter, statusFilter]);

  const handleOpenModal = async (enquiry: EnquiryItem) => {
    setSelectedEnquiry(enquiry);
    // Mark as read automatically if not read
    if (!enquiry.isRead) {
      try {
        const res = await fetch('/api/admin/enquiries', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: enquiry.id, isRead: true }),
        });
        if (res.ok) {
          setEnquiries(prev => prev.map(e => e.id === enquiry.id ? { ...e, isRead: true } : e));
          router.refresh();
        }
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
  };

  const handleToggleRead = async (enquiry: EnquiryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = !enquiry.isRead;
    setTogglingId(enquiry.id);
    setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, isRead: newStatus } : item));
    if (selectedEnquiry && selectedEnquiry.id === enquiry.id) {
      setSelectedEnquiry(prev => prev ? { ...prev, isRead: newStatus } : null);
    }

    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enquiry.id, isRead: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(newStatus ? 'Marked as read' : 'Marked as unread');
      router.refresh();
    } catch (err: any) {
      setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, isRead: !newStatus } : item));
      toast.error(err.message || 'Could not update status');
    } finally {
      setTogglingId(null);
    }
  };

  const promptDelete = (e: EnquiryItem, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setDeleteTarget(e);
    setDeleteConsent(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteConsent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/enquiries?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setEnquiries(prev => prev.filter(e => e.id !== deleteTarget.id));
        if (selectedEnquiry && selectedEnquiry.id === deleteTarget.id) {
          setSelectedEnquiry(null);
        }
        toast.success(`Enquiry from ${deleteTarget.name} deleted successfully`);
        setDeleteTarget(null);
        router.refresh();
      } else {
        throw new Error('Failed to delete enquiry');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting enquiry');
    } finally {
      setIsDeleting(false);
    }
  };

  const unreadCount = enquiries.filter(e => !e.isRead).length;
  const readCount = enquiries.filter(e => e.isRead).length;

  return (
    <div className="space-y-4">
      {/* Header Banner with Merged Search & Filters in Main Header */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Consumer & Doctor Enquiries</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                type="text"
                placeholder="Search name, email, product..."
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

            {/* Date Filter Dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full sm:w-auto bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/30 shadow-sm cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="LAST_7">Last 7 Days</option>
                <option value="LAST_30">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
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
            All ({enquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'UNREAD'
                ? 'bg-card text-amber-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('READ')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'READ'
                ? 'bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filteredEnquiries.length}</strong> {filteredEnquiries.length === 1 ? 'enquiry' : 'enquiries'}
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

      {/* Pure Card-Based Layout (Matching Coupons Page) */}
      {filteredEnquiries.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-3 shadow-sm">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">
            {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL'
              ? 'No enquiries match your search or filters.'
              : 'No consumer or doctor enquiries found.'}
          </p>
          {(searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setDateFilter('ALL');
              }}
              className="text-xs font-bold text-brand-green underline"
            >
              Reset search & filters
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className={`relative bg-card rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                !enq.isRead
                  ? 'border-border hover:border-amber-500/40 bg-amber-50/10'
                  : 'border-border hover:border-brand-green/40 opacity-90 hover:opacity-100 bg-card/60'
              }`}
            >
              {/* Top Accent Strip (voucher ticket accent) */}
              <div
                className={`h-1.5 w-full ${
                  !enq.isRead
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                    : 'bg-gradient-to-r from-emerald-500 to-brand-green'
                }`}
              />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* Top Row: Sender Badge + Status Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-dashed border-brand-green/30 dark:border-brand-gold/40 bg-brand-green/5 dark:bg-brand-green/10">
                        <User className="h-4 w-4 text-brand-green dark:text-brand-gold shrink-0" />
                        <span
                          className="font-mono font-black text-sm sm:text-base tracking-wide text-brand-green dark:text-brand-gold truncate max-w-[150px] sm:max-w-[190px]"
                          title={enq.name}
                        >
                          {enq.name}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Received {formatDate(enq.createdAt)}</span>
                    </p>
                  </div>

                  {/* Status Badge & Quick Toggle */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(enq, e)}
                    disabled={togglingId === enq.id}
                    title={`Click to mark as ${enq.isRead ? 'Unread' : 'Read'}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                      enq.isRead
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {enq.isRead ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Read</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Unread</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Message Highlight Box (Matching coupon value display) */}
                <div
                  onClick={() => handleOpenModal(enq)}
                  className="bg-muted/40 dark:bg-muted/20 border border-border rounded-2xl p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-muted/60 transition-colors group"
                  title="Click to view full message"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <span>Enquiry Message</span>
                      <span className="text-[9px] text-brand-green font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        · Click to expand
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 mt-1 leading-relaxed">
                      {enq.message}
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      !enq.isRead
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                {/* Rules & Contact Info Grid (Matching coupon 2x2 grid) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Email</span>
                    <a
                      href={`mailto:${enq.email}`}
                      className="font-extrabold text-foreground truncate block hover:text-brand-green hover:underline"
                      title={enq.email}
                    >
                      {enq.email}
                    </a>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Phone</span>
                    {enq.phone ? (
                      <a
                        href={`tel:${enq.phone}`}
                        className="font-extrabold text-foreground truncate block hover:text-brand-green hover:underline"
                        title={enq.phone}
                      >
                        {enq.phone}
                      </a>
                    ) : (
                      <span className="font-semibold text-muted-foreground/60 italic truncate block">Not provided</span>
                    )}
                  </div>

                  <div className="col-span-2 bg-background border border-border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-foreground font-bold min-w-0">
                      <Building2 className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                      <span className="truncate text-xs">{enq.manufacturer.companyName}</span>
                    </div>
                    {enq.preparation ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md truncate shrink-0 max-w-[130px] sm:max-w-[160px]">
                        <Package className="h-3 w-3 text-brand-green shrink-0" />
                        <span className="truncate">{enq.preparation.name}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-brand-gold-dark bg-brand-gold/15 px-2 py-0.5 rounded-md">Contact Form Enquiry</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions (Matching coupon footer) */}
              <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(enq, e)}
                    disabled={togglingId === enq.id}
                    className="text-xs font-bold text-muted-foreground hover:text-brand-green flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-card transition-colors"
                    title={enq.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    {enq.isRead ? (
                      <ToggleRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="hidden sm:inline">{enq.isRead ? 'Read' : 'Unread'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(enq)}
                    title="View Full Enquiry"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-brand-green hover:text-white hover:border-brand-green transition-all shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => promptDelete(enq, e)}
                    title="Delete Enquiry"
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
                  <th className="py-3 px-5">Sender</th>
                  <th className="py-3 px-5">Contact Details</th>
                  <th className="py-3 px-5">Regarding</th>
                  <th className="py-3 px-5">Message Preview</th>
                  <th className="py-3 px-5 text-center">Date</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredEnquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    className={`transition-colors ${
                      !enq.isRead ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-foreground">{enq.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-muted-foreground">
                      <div className="space-y-0.5">
                        <a
                          href={`mailto:${enq.email}`}
                          className="hover:text-brand-green hover:underline flex items-center gap-1 truncate max-w-[180px]"
                        >
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{enq.email}</span>
                        </a>
                        {enq.phone && (
                          <a
                            href={`tel:${enq.phone}`}
                            className="hover:text-brand-green hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{enq.phone}</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-brand-gold shrink-0" />
                          <span className="truncate max-w-[150px]">{enq.manufacturer.companyName}</span>
                        </div>
                        {enq.preparation ? (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Package className="h-3 w-3 text-brand-green shrink-0" />
                            <span className="truncate max-w-[150px]">{enq.preparation.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 italic">General Enquiry</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(enq)}
                        className="text-left group block max-w-xs"
                        title="Click to view full message"
                      >
                        <p className="line-clamp-2 text-foreground/80 group-hover:text-brand-green group-hover:underline text-xs">
                          {enq.message}
                        </p>
                      </button>
                    </td>
                    <td className="py-3 px-5 text-center text-muted-foreground whitespace-nowrap text-[11px]">
                      {formatDate(enq.createdAt)}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleToggleRead(enq, e)}
                        disabled={togglingId === enq.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                          enq.isRead
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {enq.isRead ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3 animate-pulse" />}
                        <span>{enq.isRead ? 'Read' : 'Unread'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenModal(enq)}
                        className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors inline-flex"
                        title="View Enquiry"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => promptDelete(enq, e)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors inline-flex"
                        title="Delete Enquiry"
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

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedEnquiry(null)}
          />
          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-5 sm:p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl">Enquiry Details</h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Received on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                title="Close (Esc)"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-1 text-xs"
              >
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold text-white/80">Esc</kbd>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-2">
                  <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Sender Information
                  </h4>
                  <p className="font-extrabold text-brand-green text-sm flex items-center gap-1.5">
                    <User className="h-4 w-4 shrink-0" /> {selectedEnquiry.name}
                  </p>
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a href={`mailto:${selectedEnquiry.email}`} className="hover:underline text-brand-green">
                      {selectedEnquiry.email}
                    </a>
                  </p>
                  {selectedEnquiry.phone ? (
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <a href={`tel:${selectedEnquiry.phone}`} className="hover:underline">
                        {selectedEnquiry.phone}
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 opacity-40 shrink-0" /> No mobile number provided
                    </p>
                  )}
                </div>

                <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-2">
                  <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Targeted Entity
                  </h4>
                  <p className="font-extrabold text-brand-green text-sm flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-brand-gold shrink-0" /> {selectedEnquiry.manufacturer.companyName}
                  </p>
                  {selectedEnquiry.preparation && (
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {selectedEnquiry.preparation.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-brand-green uppercase tracking-wider mb-2">
                  Message Content
                </h4>
                <div className="bg-background p-4 sm:p-5 rounded-2xl border border-border text-xs sm:text-sm text-foreground leading-relaxed font-medium whitespace-pre-wrap max-h-60 overflow-y-auto shadow-inner">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleRead(selectedEnquiry)}
                  className="px-3.5 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  {selectedEnquiry.isRead ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4" />}
                  <span>{selectedEnquiry.isRead ? 'Mark as Unread' : 'Mark as Read'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=Regarding your enquiry on Ayurwed`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white text-xs font-extrabold transition-all shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Reply via Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => promptDelete(selectedEnquiry)}
                    className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                    title="Delete Enquiry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Delete Consent Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />

          <div className="relative bg-card w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-red-500/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-2xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-red-600 text-lg">Confirm Enquiry Deletion</h3>
                <p className="text-xs text-muted-foreground">Admin User Consent Required</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-foreground">
                  Are you sure you want to delete the enquiry from{' '}
                  <span className="font-black text-red-600">{deleteTarget.name}</span> ({deleteTarget.email})?
                </p>
                <p className="text-[11px] text-muted-foreground">This action cannot be undone.</p>
              </div>

              {/* Explicit User Consent Checkbox */}
              <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-2xl border border-border">
                <input
                  id="delete-enquiry-consent-check"
                  type="checkbox"
                  checked={deleteConsent}
                  onChange={e => setDeleteConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-red-600 focus:ring-red-500 rounded cursor-pointer shrink-0"
                />
                <label
                  htmlFor="delete-enquiry-consent-check"
                  className="text-xs font-bold text-foreground cursor-pointer select-none"
                >
                  I explicitly confirm that I want to delete this enquiry from{' '}
                  <span className="font-black text-red-600">{deleteTarget.name}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                title="Cancel (Esc)"
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted flex items-center gap-1.5"
              >
                <span>Cancel</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-card border border-border rounded font-mono text-foreground/60">Esc</kbd>
              </button>
              <button
                type="button"
                disabled={!deleteConsent || isDeleting}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Confirm & Delete Enquiry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
