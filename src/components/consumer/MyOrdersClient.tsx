'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, X, ShoppingBag, Clock, CheckCircle2, XCircle, Truck, Package, DollarSign, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
  id: number; quantity: number; price: number;
  product: { id: number; name: string; images: string[]; slug: string };
}
interface Order {
  id: number; orderNumber: string; status: OrderStatus; paymentStatus: string;
  subtotal: number; shipping: number; total: number; shippingAddress: any;
  createdAt: string; items: OrderItem[];
}

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/30',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300/30',
  PROCESSING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-300/30',
  SHIPPED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-300/30',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/30',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300/30',
};

export default function MyOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  // Cancellation Modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake / wrong items');
  const [userConfirmedConsent, setUserConfirmedConsent] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    spent: orders.filter(o => o.status !== 'CANCELLED').reduce((a, o) => a + Number(o.total), 0),
  }), [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (search) list = list.filter(o => o.orderNumber.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) list = list.filter(o => o.status === filterStatus);
    return list;
  }, [orders, search, filterStatus]);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    if (!userConfirmedConsent) {
      toast.error('Please check the confirmation box to confirm cancellation');
      return;
    }
    setIsCancelling(true);

    try {
      const res = await fetch('/api/shop/orders/cancel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cancelModalOrder.id,
          reason: cancelReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');

      toast.success('Order cancelled successfully');
      setOrders(prev => prev.map(o => o.id === cancelModalOrder.id ? { ...o, status: 'CANCELLED' as OrderStatus } : o));
      
      if (selected?.id === cancelModalOrder.id) {
        setSelected(prev => prev ? { ...prev, status: 'CANCELLED' as OrderStatus } : null);
      }
      setCancelModalOrder(null);
      setUserConfirmedConsent(false);
    } catch (err: any) {
      toast.error(err.message || 'Error cancelling order');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-brand-green bg-brand-green/10 border border-brand-green/20' },
          { label: 'In Progress', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' },
          { label: 'Total Spent', value: formatPrice(stats.spent), icon: DollarSign, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-xs flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-foreground">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Panel */}
      <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search order number..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-card text-foreground border border-border rounded-2xl py-2.5 px-4 text-xs font-semibold focus:outline-none w-full sm:w-56 placeholder:text-muted-foreground/60" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-9 bg-card text-foreground border border-border rounded-2xl py-2.5 pr-8 text-xs font-bold focus:outline-none appearance-none cursor-pointer">
                <option value="">All Statuses</option>
                {(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag className="h-14 w-14 text-brand-gold mx-auto animate-pulse-slow" />
            <h3 className="text-xl font-bold text-brand-green">No Orders Found</h3>
            <p className="text-sm text-muted-foreground">Explore our Ayurvedic preparations and place your first order.</p>
            <Link href="/shop" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xs">Shop Now</Link>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map(o => (
              <div key={o.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-grow space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-extrabold text-brand-green text-sm">#{o.orderNumber}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[o.status]}`}>{o.status}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>{o.paymentStatus}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {o.items.slice(0, 3).map(item => (
                      <span key={item.id} className="text-xs bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-semibold border border-brand-green/20">
                        {item.product.name} ×{item.quantity}
                      </span>
                    ))}
                    {o.items.length > 3 && <span className="text-xs text-muted-foreground self-center">+{o.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span className="font-extrabold text-foreground">{formatPrice(Number(o.total))}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 w-full sm:w-auto justify-end">
                  {['PENDING', 'CONFIRMED'].includes(o.status) && (
                    <button
                      onClick={() => setCancelModalOrder(o)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button onClick={() => setSelected(o)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-foreground border border-border hover:border-brand-green hover:text-brand-green text-xs font-bold transition-all shadow-xs">
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <Link href="/shop"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green text-xs font-bold transition-all shadow-xs">
                    Reorder
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-card w-full max-w-md h-full overflow-y-auto shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-lg">Order #{selected.orderNumber}</h3>
                <p className="text-xs text-brand-gold mt-0.5">{new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full ${statusStyles[selected.status]}`}>{selected.status}</span>
                {['PENDING', 'CONFIRMED'].includes(selected.status) && (
                  <button
                    onClick={() => setCancelModalOrder(selected)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Order Items</p>
                <div className="space-y-3">
                  {selected.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-muted/40 rounded-2xl p-3 border border-border/50">
                      {item.product.images?.[0] && <img src={(item.product.images as string[])[0]} className="h-12 w-12 rounded-xl object-cover" alt={item.product.name} />}
                      <div className="flex-grow min-w-0">
                        <p className="font-extrabold text-foreground text-sm line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(Number(item.price))}</p>
                      </div>
                      <span className="font-extrabold text-brand-green text-sm">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/40 rounded-2xl p-4 space-y-2 text-xs border border-border">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(Number(selected.subtotal))}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{Number(selected.shipping) === 0 ? 'Free' : formatPrice(Number(selected.shipping))}</span></div>
                <div className="flex justify-between font-extrabold text-foreground text-sm border-t border-border pt-2">
                  <span>Total</span><span className="text-brand-green">{formatPrice(Number(selected.total))}</span>
                </div>
              </div>

              {selected.shippingAddress && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Delivery Address</p>
                  <div className="bg-card border border-border rounded-2xl p-4 text-xs text-foreground space-y-1.5">
                    {Object.entries(selected.shippingAddress).map(([k, v]) => v ? (
                      <div key={k} className="flex gap-2">
                        <span className="font-bold text-muted-foreground capitalize min-w-20">{k}:</span>
                        <span>{String(v)}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Consent & Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => { setCancelModalOrder(null); setUserConfirmedConsent(false); }} />
          <div className="relative bg-card w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-border space-y-5 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => { setCancelModalOrder(null); setUserConfirmedConsent(false); }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 rounded-2xl">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground">Cancel Order #{cancelModalOrder.orderNumber}?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please select a reason and confirm your cancellation request.
              </p>
            </div>

            <div className="space-y-2.5 bg-muted/40 p-4 rounded-2xl border border-border">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Reason for Cancellation *
              </label>
              {[
                'Ordered by mistake / wrong items',
                'Decided to buy different products',
                'Changed mind / no longer needed',
                'Expected faster delivery',
                'Other reason'
              ].map((r) => (
                <label key={r} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:text-brand-green transition-colors">
                  <input
                    type="radio"
                    name="cancel-reason"
                    checked={cancelReason === r}
                    onChange={() => setCancelReason(r)}
                    className="text-brand-green focus:ring-brand-green cursor-pointer"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200/50">
              <input
                type="checkbox"
                id="cancel-consent-check"
                checked={userConfirmedConsent}
                onChange={(e) => setUserConfirmedConsent(e.target.checked)}
                className="mt-0.5 text-rose-600 focus:ring-rose-500 rounded cursor-pointer"
              />
              <label htmlFor="cancel-consent-check" className="text-xs text-foreground font-semibold cursor-pointer select-none">
                I explicitly confirm that I want to cancel Order #{cancelModalOrder.orderNumber}.
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setCancelModalOrder(null); setUserConfirmedConsent(false); }}
                disabled={isCancelling}
                className="flex-1 py-3 px-4 bg-card border border-border rounded-2xl font-bold text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling || !userConfirmedConsent}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <span>Cancelling...</span>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
