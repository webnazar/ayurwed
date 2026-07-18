'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Printer, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function MyShopOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      fetch('/api/shop/orders')
        .then(r => r.json())
        .then(d => { setOrders(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-brand-green border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] text-white py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/shop" className="hover:text-white">Shop</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-bold">My Orders</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold">My Shop Orders</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Package className="h-10 w-10 text-foreground/20" />
            </div>
            <h2 className="text-xl font-bold text-foreground/50">No orders yet</h2>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : orders.map((order: any) => (
          <div key={order.id} className="bg-card border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-brand-green/30 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono font-bold text-brand-green text-sm">#{order.orderNumber}</p>
                <p className="text-xs text-foreground/50 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <button onClick={() => window.open(`/shop/invoice/${order.id}`, '_blank')}
                  className="flex items-center gap-1.5 text-xs font-bold bg-brand-gold/20 text-brand-gold-dark px-3 py-1.5 rounded-full hover:bg-brand-gold/30 transition-colors">
                  <Printer className="h-3 w-3" /> Invoice
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 bg-muted/40 rounded-xl p-2.5">
                  {item.product.images?.[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-green text-sm line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-foreground/50">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-brand-green text-sm">{formatPrice(Number(item.total))}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-foreground/50 pl-2">+{order.items.length - 3} more item(s)</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-sm">
                <span className="text-foreground/60">Total: </span>
                <span className="font-extrabold text-brand-green text-base">{formatPrice(Number(order.total))}</span>
                <span className="text-xs text-foreground/40 ml-2">({order.paymentMethod})</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
