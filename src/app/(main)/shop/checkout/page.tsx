'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShoppingBag, MapPin, Phone, User, Home, ChevronRight, Package, Trash2, Plus, Minus, ArrowRight, CheckCircle } from 'lucide-react';
import { useCart } from '@/components/shop/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, subtotal, clearCart, removeItem, updateQty } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const shipping = subtotal >= 500 ? 0 : subtotal > 0 ? 60 : 0;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    name: session?.user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) { router.push('/login'); return; }
    if (items.length === 0) return toast.error('Your cart is empty');
    if (!form.address || !form.city || !form.pincode) return toast.error('Please fill shipping address');

    setLoading(true);
    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          paymentMethod: 'COD',
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Order placement failed');
      }

      const order = await res.json();
      clearCart();
      setSuccess(order.orderNumber);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-green mb-2">Order Placed! 🎉</h1>
            <p className="text-foreground/60">Your order has been successfully placed.</p>
            <p className="font-mono font-bold text-brand-green mt-2 text-lg">#{success}</p>
          </div>
          <div className="bg-muted rounded-2xl p-4 text-sm text-foreground/70 space-y-1 text-left">
            <p>✓ Order confirmation received</p>
            <p>✓ Cash on Delivery — pay when received</p>
            <p>✓ Delivery within 5-7 business days</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/shop" className="bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors">
              Continue Shopping
            </Link>
            <Link href="/shop/orders" className="bg-card border border-border py-3 rounded-xl font-bold text-brand-green hover:bg-muted transition-colors">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inp = 'w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold transition-colors';
  const lbl = 'block text-xs font-bold text-foreground/60 mb-1.5 uppercase tracking-wide';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] text-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/shop" className="hover:text-white">Shop</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-bold">Checkout</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!session?.user ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="h-12 w-12 text-foreground/20 mx-auto" />
            <h2 className="text-xl font-bold text-foreground/60">Login to continue checkout</h2>
            <Link href="/login" className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors">
              Login / Register <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="h-12 w-12 text-foreground/20 mx-auto" />
            <h2 className="text-xl font-bold text-foreground/60">Your cart is empty</h2>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors">
              Go to Shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Shipping Form */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
                <h2 className="font-extrabold text-brand-green flex items-center gap-2 text-lg border-b border-border pb-3">
                  <MapPin className="h-5 w-5 text-brand-gold" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}><User className="h-3 w-3 inline mr-1" />Full Name *</label>
                    <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="Recipient's name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}><Phone className="h-3 w-3 inline mr-1" />Phone Number *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} placeholder="10-digit mobile number" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}><Home className="h-3 w-3 inline mr-1" />Address *</label>
                    <textarea required rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={`${inp} resize-none`} placeholder="House no., Street, Area, Landmark" />
                  </div>
                  <div>
                    <label className={lbl}>City *</label>
                    <input required type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inp} placeholder="City" />
                  </div>
                  <div>
                    <label className={lbl}>State</label>
                    <input type="text" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className={inp} placeholder="State" />
                  </div>
                  <div>
                    <label className={lbl}>Pincode *</label>
                    <input required type="text" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className={inp} placeholder="6-digit pincode" maxLength={6} />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                <h2 className="font-extrabold text-brand-green flex items-center gap-2 text-lg border-b border-border pb-3">
                  💳 Payment Method
                </h2>
                <div className="flex items-center gap-3 bg-brand-green-light/30 border-2 border-brand-green rounded-2xl p-4">
                  <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-green">Cash on Delivery (COD)</p>
                    <p className="text-xs text-foreground/60">Pay when your order arrives</p>
                  </div>
                  <span className="ml-auto text-2xl">🏠</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
                <h2 className="font-bold text-foreground/70 text-sm">Order Notes (optional)</h2>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inp} resize-none`} placeholder="Any special instructions for delivery..." />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-3xl p-6 space-y-4 sticky top-24">
                <h2 className="font-extrabold text-brand-green flex items-center gap-2 text-lg border-b border-border pb-3">
                  <Package className="h-5 w-5 text-brand-gold" /> Order Summary ({items.length} item{items.length > 1 ? 's' : ''})
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 bg-muted/40 rounded-2xl p-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-muted flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-green text-xs line-clamp-2">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-red-50 text-xs">
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-brand-green-light text-xs disabled:opacity-40">
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-brand-green text-sm">{formatPrice(item.price * item.quantity)}</p>
                        <button type="button" onClick={() => removeItem(item.productId)} className="text-foreground/30 hover:text-red-500 transition-colors mt-1">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between text-foreground/70"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {subtotal < 500 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Add {formatPrice(500 - subtotal)} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between font-extrabold text-brand-green text-lg border-t border-border pt-2">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-green text-white py-4 rounded-2xl font-extrabold text-base hover:bg-brand-gold hover:text-brand-green transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50">
                  {loading ? 'Placing Order...' : <>Place Order <ArrowRight className="h-5 w-5" /></>}
                </button>

                <p className="text-center text-xs text-foreground/50">
                  By placing order you agree to our <Link href="/terms" className="text-brand-green hover:underline">Terms</Link>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
