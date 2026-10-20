'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  X,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  IndianRupee,
  Printer,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Layers,
  Tag,
  Calendar,
  ShoppingBag,
  LayoutGrid,
  List,
  Sparkles,
  Copy,
  Check,
  Loader2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

type ShopOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

interface ShopOrderItem {
  id: number;
  quantity: number;
  price: number;
  total: number;
  product: { id: number; name: string; images: string[]; unit: string | null };
}

interface ShopOrder {
  id: number;
  orderNumber: string;
  status: ShopOrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  discount?: number;
  couponCode?: string | null;
  shipping: number;
  total: number;
  shippingAddress: any;
  notes: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string; phone: string | null };
  items: ShopOrderItem[];
}

const STATUS_FLOW: ShopOrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const BATCH_SIZE = 15;

const statusStyles: Record<ShopOrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  SHIPPED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

const statusAccentGradients: Record<ShopOrderStatus, string> = {
  PENDING: 'from-amber-400 to-amber-600',
  CONFIRMED: 'from-blue-400 to-blue-600',
  PROCESSING: 'from-indigo-400 to-indigo-600',
  SHIPPED: 'from-cyan-400 to-cyan-600',
  DELIVERED: 'from-emerald-400 to-emerald-600',
  CANCELLED: 'from-rose-400 to-rose-600',
};

const statusIcons: Record<ShopOrderStatus, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  CONFIRMED: <CheckCircle2 className="h-3 w-3" />,
  PROCESSING: <Package className="h-3 w-3" />,
  SHIPPED: <Truck className="h-3 w-3" />,
  DELIVERED: <CheckCircle2 className="h-3 w-3" />,
  CANCELLED: <XCircle className="h-3 w-3" />,
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ShopOrdersListClient({ initialOrders }: { initialOrders: ShopOrder[] }) {
  const [orders, setOrders] = useState<ShopOrder[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'LAST_30'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

  const searchRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Global Keyboard Shortcuts (Esc: Close drawer, Alt+S: Focus search)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedOrder) {
        e.preventDefault();
        setSelectedOrder(null);
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedOrder]);

  // Reset displayCount whenever search, filterStatus, or dateFilter changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE);
  }, [search, filterStatus, dateFilter]);

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    toast.success(`Copied #${num} to clipboard!`);
    setTimeout(() => {
      setCopiedNumber((prev) => (prev === num ? null : prev));
    }, 2000);
  };

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === 'PENDING').length,
      shipped: orders.filter((o) => o.status === 'SHIPPED').length,
      revenue: orders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((a, o) => a + Number(o.total), 0),
    }),
    [orders]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: orders.length,
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];

    // Date Wise Filter Logic
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === 'TODAY') {
        list = list.filter((o) => new Date(o.createdAt) >= todayStart);
      } else if (dateFilter === 'YESTERDAY') {
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        list = list.filter((o) => {
          const d = new Date(o.createdAt);
          return d >= yesterdayStart && d < todayStart;
        });
      } else if (dateFilter === 'LAST_7') {
        const d7 = new Date(todayStart);
        d7.setDate(d7.getDate() - 7);
        list = list.filter((o) => new Date(o.createdAt) >= d7);
      } else if (dateFilter === 'LAST_30') {
        const d30 = new Date(todayStart);
        d30.setDate(d30.getDate() - 30);
        list = list.filter((o) => new Date(o.createdAt) >= d30);
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.user.name.toLowerCase().includes(q) ||
          o.user.email.toLowerCase().includes(q) ||
          (o.user.phone && o.user.phone.toLowerCase().includes(q)) ||
          (o.couponCode && o.couponCode.toLowerCase().includes(q))
      );
    }

    if (filterStatus && filterStatus !== 'ALL') {
      list = list.filter((o) => o.status === filterStatus);
    }

    // Newest orders first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, filterStatus, dateFilter]);

  const visibleOrders = useMemo(() => {
    return filtered.slice(0, displayCount);
  }, [filtered, displayCount]);

  const hasMore = displayCount < filtered.length;
  const remainingCount = filtered.length - displayCount;

  const loadMore = useCallback(() => {
    if (hasMore) setDisplayCount((prev) => prev + BATCH_SIZE);
  }, [hasMore]);

  // Infinite Scroll Observer Sentinel
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

  const updateStatus = async (id: number, status: ShopOrderStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/shop-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      toast.success(`Order #${updated.orderNumber || id} marked as ${status}`);
    } catch {
      toast.error('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePayment = async (id: number, paymentStatus: PaymentStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/shop-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, paymentStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      toast.success(`Payment status updated to ${paymentStatus}`);
    } catch {
      toast.error('Payment update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* ── Header Banner with Merged Search & Filters (Minimal Margins, No Subtitle) ── */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Shop Orders</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search order #, customer, coupon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

            {/* Date Filter Dropdown */}
            <div className="relative flex-shrink-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="pl-8 pr-7 py-2 bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer shadow-sm"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="LAST_7">Last 7 Days</option>
                <option value="LAST_30">Last 30 Days</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-foreground/40 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid (Equal & Minimal Margins) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Total Orders',
            value: stats.total,
            icon: Package,
            color: 'text-brand-green bg-brand-green-light dark:bg-brand-green-light/20',
          },
          {
            label: 'Pending Fulfillment',
            value: stats.pending,
            icon: Clock,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
          },
          {
            label: 'Shipped & Out',
            value: stats.shipped,
            icon: Truck,
            color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400',
          },
          {
            label: 'Total Net Revenue',
            value: formatPrice(stats.revenue),
            icon: IndianRupee,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-3.5 border border-border shadow-sm flex items-center gap-3 hover:border-brand-green/30 transition-colors"
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider truncate">
                {s.label}
              </span>
              <span className="text-lg font-extrabold text-foreground truncate block">
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs & View Mode Switcher Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-muted/60 border border-border rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
              filterStatus === 'ALL'
                ? 'bg-card text-brand-green shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({statusCounts.ALL})
          </button>
          {STATUS_FLOW.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap flex items-center gap-1 ${
                filterStatus === st
                  ? 'bg-card text-brand-green shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="capitalize">{st.toLowerCase()}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === st ? 'bg-brand-green/10 text-brand-green' : 'bg-muted text-foreground/50'
                }`}
              >
                {statusCounts[st] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Counter & View Mode Switcher */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{visibleOrders.length}</strong> of{' '}
              <strong className="text-foreground">{filtered.length}</strong>
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

      {/* ── Main Orders Content ── */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-extrabold text-base text-foreground">No orders match your criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or date filters to find what you're looking for.
          </p>
          {(search || filterStatus !== 'ALL' || dateFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilterStatus('ALL');
                setDateFilter('ALL');
              }}
              className="text-xs font-bold text-brand-green hover:underline inline-block pt-1"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        /* ── Cards View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {visibleOrders.map((o) => (
            <div
              key={o.id}
              className="relative bg-card rounded-2xl border border-border hover:border-brand-green/40 dark:hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Top Accent Strip */}
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${
                  statusAccentGradients[o.status] || 'from-brand-green to-emerald-500'
                }`}
              />

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {/* Header: Order Number + Copy + Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-sm text-foreground">
                        #{o.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyOrderNumber(o.orderNumber)}
                        title="Copy Order #"
                        className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                      >
                        {copiedNumber === o.orderNumber ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      {formatDate(o.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusStyles[o.status]}`}
                    >
                      {statusIcons[o.status]}
                      <span>{o.status}</span>
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        o.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Customer Information Box */}
                <div className="bg-muted/30 border border-border rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground truncate">
                    <User className="h-3.5 w-3.5 text-brand-green shrink-0" />
                    <span className="truncate">{o.user.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                    <Mail className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">{o.user.email}</span>
                  </div>
                  {o.user.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                      <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                      <span className="truncate">{o.user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Products Thumbnails Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span>Items ({o.items.length})</span>
                    {o.couponCode && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        🎫 {o.couponCode}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 overflow-hidden py-1">
                    {o.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="relative h-10 w-10 rounded-xl overflow-hidden border border-border bg-muted/40 shrink-0"
                        title={`${item.product.name} (x${item.quantity})`}
                      >
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-brand-green bg-brand-green/10">
                            {item.product.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 bg-brand-green text-white text-[9px] font-black px-1 rounded-tl">
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                    {o.items.length > 3 && (
                      <div className="h-10 w-10 rounded-xl border border-dashed border-border bg-muted/60 flex items-center justify-center text-[10px] font-extrabold text-muted-foreground shrink-0">
                        +{o.items.length - 3}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 pl-1">
                      <p className="text-[11px] text-foreground font-semibold truncate">
                        {o.items[0]?.product.name || 'Order Items'}
                      </p>
                      {o.items.length > 1 && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          and {o.items.length - 1} other {o.items.length - 1 === 1 ? 'item' : 'items'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Method Row */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Total Amount
                    </span>
                    <span className="text-base font-extrabold text-brand-green">
                      {formatPrice(Number(o.total))}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Method
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {o.paymentMethod || 'COD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                {/* Inline Quick Status Change */}
                <div className="relative flex-1">
                  <select
                    disabled={updatingId === o.id}
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as ShopOrderStatus)}
                    className="w-full bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-brand-green cursor-pointer disabled:opacity-50 appearance-none pr-6"
                  >
                    {STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {updatingId === o.id ? (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-brand-green pointer-events-none" />
                  ) : (
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                  )}
                </div>

                {/* Print Invoice */}
                <button
                  type="button"
                  onClick={() => window.open(`/shop/invoice/${o.id}`, '_blank')}
                  title="Print Invoice"
                  className="p-2 text-muted-foreground hover:text-brand-green hover:bg-card border border-border rounded-xl transition-colors shadow-2xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>

                {/* View Details Drawer */}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(o)}
                  title="View Details"
                  className="inline-flex items-center gap-1 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-2xs shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Table / Grid View ── */
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border uppercase font-extrabold text-[10px] tracking-wider text-muted-foreground">
                <tr>
                  {[
                    'Order #',
                    'Customer',
                    'Items',
                    'Total',
                    'Payment',
                    'Status',
                    'Date',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3.5 ${
                        h === 'Items' ? 'text-center' : h === 'Actions' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {visibleOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-brand-green text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>#{o.orderNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderNumber(o.orderNumber)}
                          title="Copy Order #"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copiedNumber === o.orderNumber ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-foreground text-xs">{o.user.name}</div>
                      <div className="text-[11px] text-muted-foreground">{o.user.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="bg-brand-green/10 text-brand-green text-xs font-bold px-2 py-0.5 rounded-full">
                        {o.items.length}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-brand-green text-xs">
                      {formatPrice(Number(o.total))}
                      {o.couponCode && (
                        <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                          🎫 {o.couponCode}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusStyles[o.status]}`}
                      >
                        {statusIcons[o.status]} {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground font-semibold">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => window.open(`/shop/invoice/${o.id}`, '_blank')}
                        className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Load More / Infinite Scroll Sentinel ── */}
      {hasMore && (
        <div ref={observerRef} className="p-4 text-center space-y-2">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center gap-2 bg-card hover:bg-brand-green hover:text-white border border-border text-brand-green font-extrabold px-6 py-2 rounded-2xl text-xs transition-all shadow-sm"
          >
            <span>Load More Orders ({remainingCount} remaining)</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <p className="text-[10px] text-muted-foreground">Auto-loads as you scroll down</p>
        </div>
      )}

      {/* ── Order Detail Drawer ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-card w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 border-l border-border">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-5 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-base">#{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-white/70 mt-0.5">{selectedOrder.user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(`/shop/invoice/${selectedOrder.id}`, '_blank')}
                  className="flex items-center gap-1.5 text-xs font-extrabold bg-brand-gold text-brand-green px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" /> Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Order Status */}
              <div>
                <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      disabled={selectedOrder.status === s || updatingId === selectedOrder.id}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${
                        selectedOrder.status === s
                          ? `${statusStyles[s]} border-transparent`
                          : 'border-border text-foreground/60 hover:bg-muted'
                      }`}
                    >
                      {statusIcons[s]} {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Payment Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as PaymentStatus[]).map((ps) => (
                    <button
                      key={ps}
                      disabled={selectedOrder.paymentStatus === ps}
                      onClick={() => updatePayment(selectedOrder.id, ps)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${
                        selectedOrder.paymentStatus === ps
                          ? ps === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent'
                            : 'bg-amber-100 text-amber-700 border-transparent'
                          : 'border-border text-foreground/60 hover:bg-muted'
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Items Ordered
                </p>
                <div className="space-y-2.5">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-muted/30 rounded-2xl p-3 border border-border"
                    >
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-11 w-11 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-brand-green text-xs line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.quantity} × {formatPrice(Number(item.price))}
                          {item.product.unit && ` (${item.product.unit})`}
                        </p>
                      </div>
                      <span className="font-extrabold text-brand-green text-xs flex-shrink-0">
                        {formatPrice(Number(item.total))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/40 rounded-2xl p-4 space-y-2 text-xs border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(Number(selectedOrder.subtotal))}</span>
                </div>
                {selectedOrder.discount && Number(selectedOrder.discount) > 0 ? (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span>Coupon Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                    <span>-{formatPrice(Number(selectedOrder.discount))}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {Number(selectedOrder.shipping) === 0
                      ? 'Free'
                      : formatPrice(Number(selectedOrder.shipping))}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-brand-green text-sm border-t border-border pt-2">
                  <span>Total</span>
                  <span>{formatPrice(Number(selectedOrder.total))}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-gold" /> Shipping Address
                  </p>
                  <div className="bg-card border border-border rounded-2xl p-3.5 text-xs text-foreground/80 space-y-1">
                    {typeof selectedOrder.shippingAddress === 'object' &&
                      Object.entries(selectedOrder.shippingAddress).map(([k, v]) => (
                        <div key={k}>
                          <span className="font-bold capitalize text-muted-foreground">{k}: </span>
                          {String(v)}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2">
                  Customer Info
                </p>
                <div className="bg-card border border-border rounded-2xl p-3.5 text-xs space-y-1.5">
                  <div className="font-extrabold text-brand-green text-sm">
                    {selectedOrder.user.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedOrder.user.email}
                  </div>
                  {selectedOrder.user.phone && (
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedOrder.user.phone}
                    </div>
                  )}
                  <div className="text-muted-foreground font-semibold">
                    Payment Method:{' '}
                    <span className="font-bold text-foreground">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2">
                    Order Notes
                  </p>
                  <p className="text-xs text-foreground/80 bg-card border border-border rounded-2xl p-3.5 italic">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
