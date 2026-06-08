'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, X, ShoppingBag, Clock, CheckCircle2, XCircle, Truck, Package, DollarSign } from 'lucide-react';
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
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function MyOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-brand-green bg-brand-green-light' },
          { label: 'In Progress', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Spent', value: formatPrice(stats.spent), icon: DollarSign, color: 'text-indigo-600 bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Panel */}
      <div className="bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-brand-green-border/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input type="text" placeholder="Search order number..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-56" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
              <option value="">All Statuses</option>
              {(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag className="h-14 w-14 text-brand-gold mx-auto animate-pulse-slow" />
            <h3 className="text-xl font-bold text-brand-green">No Orders Yet</h3>
            <p className="text-sm text-brand-foreground/60">Explore our Ayurvedic formulations and place your first order.</p>
            <Link href="/products" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold">Shop Now</Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-green-border/10">
            {filtered.map(o => (
              <div key={o.id} className="p-6 hover:bg-brand-gold-light/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-brand-green text-sm">#{o.orderNumber}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[o.status]}`}>{o.status}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.paymentStatus}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {o.items.slice(0, 3).map(item => (
                      <span key={item.id} className="text-xs bg-brand-green-light text-brand-green px-2.5 py-1 rounded-full font-medium">
                        {item.product.name} ×{item.quantity}
                      </span>
                    ))}
                    {o.items.length > 3 && <span className="text-xs text-brand-foreground/50">+{o.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-brand-foreground/50">
                    <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span className="font-bold text-brand-green">{formatPrice(Number(o.total))}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setSelected(o)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-brand-green border border-brand-green/20 hover:bg-brand-green-light text-sm font-bold transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <Link href="/products"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green text-sm font-bold transition-colors">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-lg">Order #{selected.orderNumber}</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${statusStyles[selected.status]}`}>{selected.status}</span>
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-3">Items</p>
                <div className="space-y-3">
                  {selected.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-brand-gold-light/20 rounded-2xl p-3">
                      {item.product.images?.[0] && <img src={(item.product.images as string[])[0]} className="h-12 w-12 rounded-xl object-cover" alt={item.product.name} />}
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-brand-green text-sm line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-brand-foreground/60">Qty: {item.quantity} × {formatPrice(Number(item.price))}</p>
                      </div>
                      <span className="font-bold text-brand-green text-sm">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-brand-green-light/40 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-brand-foreground/70">Subtotal</span><span>{formatPrice(Number(selected.subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-brand-foreground/70">Shipping</span><span>{Number(selected.shipping) === 0 ? 'Free' : formatPrice(Number(selected.shipping))}</span></div>
                <div className="flex justify-between font-bold text-brand-green border-t border-brand-green-border/20 pt-2">
                  <span>Total</span><span>{formatPrice(Number(selected.total))}</span>
                </div>
              </div>
              {selected.shippingAddress && (
                <div>
                  <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Delivery Address</p>
                  <div className="bg-white border border-brand-green-border/10 rounded-2xl p-4 text-sm text-brand-foreground/70 space-y-1">
                    {Object.entries(selected.shippingAddress).map(([k, v]) => <div key={k}><span className="font-semibold capitalize">{k}:</span> {String(v)}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
