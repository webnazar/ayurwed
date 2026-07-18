'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Eye, X, Clock, Truck, CheckCircle2, XCircle,
  Package, IndianRupee, Printer, MapPin, Phone, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

type ShopOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

interface ShopOrderItem {
  id: number; quantity: number; price: number; total: number;
  product: { id: number; name: string; images: string[]; unit: string | null };
}
interface ShopOrder {
  id: number; orderNumber: string; status: ShopOrderStatus; paymentStatus: PaymentStatus;
  paymentMethod: string; subtotal: number; shipping: number; total: number;
  shippingAddress: any; notes: string | null; createdAt: string;
  user: { id: number; name: string; email: string; phone: string | null };
  items: ShopOrderItem[];
}

const STATUS_FLOW: ShopOrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusStyles: Record<ShopOrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  SHIPPED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const statusIcons: Record<ShopOrderStatus, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  CONFIRMED: <CheckCircle2 className="h-3 w-3" />,
  PROCESSING: <Package className="h-3 w-3" />,
  SHIPPED: <Truck className="h-3 w-3" />,
  DELIVERED: <CheckCircle2 className="h-3 w-3" />,
  CANCELLED: <XCircle className="h-3 w-3" />,
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ShopOrdersListClient({ initialOrders }: { initialOrders: ShopOrder[] }) {
  const [orders, setOrders] = useState<ShopOrder[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    revenue: orders.filter(o => o.status !== 'CANCELLED').reduce((a, o) => a + Number(o.total), 0),
  }), [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (search) list = list.filter(o =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus) list = list.filter(o => o.status === filterStatus);
    return list;
  }, [orders, search, filterStatus]);

  const updateStatus = async (id: number, status: ShopOrderStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/shop-orders', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      toast.success('Order status updated');
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  const updatePayment = async (id: number, paymentStatus: PaymentStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/shop-orders', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, paymentStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      toast.success('Payment status updated');
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: Package, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' },
          { label: 'Revenue', value: formatPrice(stats.revenue), icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input type="text" placeholder="Search order # or customer..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-full" />
          </div>
          <div className="relative flex-shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
              <option value="">All Statuses</option>
              {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/50">
            <thead className="bg-brand-gold-light/30">
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${h === 'Items' ? 'text-center' : h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-brand-foreground/40 font-medium">No orders found.</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-brand-green text-xs">#{o.orderNumber}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-brand-green">{o.user.name}</div>
                    <div className="text-xs text-brand-foreground/50">{o.user.email}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="bg-brand-green-light text-brand-green text-xs font-bold px-2.5 py-1 rounded-full">{o.items.length}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-brand-green">{formatPrice(Number(o.total))}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${statusStyles[o.status]}`}>
                      {statusIcons[o.status]} {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-brand-foreground/60">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    <button onClick={() => window.open(`/shop/invoice/${o.id}`, '_blank')}
                      className="p-2 text-brand-gold-dark hover:bg-brand-gold-light/40 rounded-lg transition-colors" title="Print Invoice">
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setSelectedOrder(o)}
                      className="p-2 text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors" title="View Order">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-card w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-lg">#{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{selectedOrder.user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.open(`/shop/invoice/${selectedOrder.id}`, '_blank')}
                  className="flex items-center gap-1.5 text-xs font-bold bg-brand-gold text-brand-green px-3 py-1.5 rounded-full hover:bg-brand-gold/90 transition-colors">
                  <Printer className="h-3.5 w-3.5" /> Invoice
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 bg-card/10 hover:bg-card/20 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map(s => (
                    <button key={s} disabled={selectedOrder.status === s || updatingId === selectedOrder.id}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${selectedOrder.status === s ? `${statusStyles[s]} border-transparent` : 'border-border text-foreground/60 hover:bg-muted'}`}>
                      {statusIcons[s]} {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-3">Payment Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as PaymentStatus[]).map(ps => (
                    <button key={ps} disabled={selectedOrder.paymentStatus === ps}
                      onClick={() => updatePayment(selectedOrder.id, ps)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${selectedOrder.paymentStatus === ps
                        ? ps === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent'
                        : 'bg-amber-100 text-amber-700 border-transparent'
                        : 'border-border text-foreground/60 hover:bg-muted'}`}>
                      {ps}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="space-y-3">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-brand-gold-light/20 rounded-2xl p-3">
                      {item.product.images?.[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-brand-green text-sm line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-brand-foreground/60">
                          {item.quantity} × {formatPrice(Number(item.price))}
                          {item.product.unit && ` (${item.product.unit})`}
                        </p>
                      </div>
                      <span className="font-bold text-brand-green text-sm flex-shrink-0">{formatPrice(Number(item.total))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-brand-green-light/40 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-foreground/70">Subtotal</span><span className="font-semibold">{formatPrice(Number(selectedOrder.subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-foreground/70">Shipping</span><span className="font-semibold">{Number(selectedOrder.shipping) === 0 ? 'Free' : formatPrice(Number(selectedOrder.shipping))}</span></div>
                <div className="flex justify-between font-bold text-brand-green text-base border-t border-border pt-2">
                  <span>Total</span><span>{formatPrice(Number(selectedOrder.total))}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Shipping Address</p>
                  <div className="bg-card border border-border rounded-2xl p-4 text-sm text-brand-foreground/80 space-y-1">
                    {typeof selectedOrder.shippingAddress === 'object' &&
                      Object.entries(selectedOrder.shippingAddress).map(([k, v]) => (
                        <div key={k}><span className="font-semibold capitalize text-foreground/60">{k}: </span>{String(v)}</div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Customer</p>
                <div className="bg-card border border-border rounded-2xl p-4 text-sm space-y-1.5">
                  <div className="font-bold text-brand-green">{selectedOrder.user.name}</div>
                  <div className="flex items-center gap-1.5 text-foreground/60"><Mail className="h-3.5 w-3.5" />{selectedOrder.user.email}</div>
                  {selectedOrder.user.phone && <div className="flex items-center gap-1.5 text-foreground/60"><Phone className="h-3.5 w-3.5" />{selectedOrder.user.phone}</div>}
                  <div className="text-foreground/60">Payment: <span className="font-semibold text-foreground">{selectedOrder.paymentMethod}</span></div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Order Notes</p>
                  <p className="text-sm text-foreground/70 bg-card border border-border rounded-2xl p-4 italic">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
