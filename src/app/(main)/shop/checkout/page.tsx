'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShoppingBag, MapPin, Phone, User, Home, Building2, ChevronRight, Package, Trash2, Plus, Minus, ArrowRight, CheckCircle, X } from 'lucide-react';
import { useCart } from '@/components/shop/CartContext';
import toast from 'react-hot-toast';
import StateSelect from '@/components/ui/StateSelect';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, subtotal, clearCart, removeItem, updateQty } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Simulated Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStage, setPaymentStage] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentProgressMsg, setPaymentProgressMsg] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; calculatedDiscount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const shipping = subtotal >= 500 ? 0 : subtotal > 0 ? 60 : 0;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');

      setAppliedCoupon({
        code: data.coupon.code,
        calculatedDiscount: data.coupon.calculatedDiscount,
      });
      toast.success(`Coupon ${data.coupon.code} applied! Saved ₹${data.coupon.calculatedDiscount}`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  useEffect(() => {
    if (session?.user) {
      setForm(f => ({ ...f, name: session.user.name || f.name }));

      fetch('/api/consumer/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.profile) {
            setForm(f => ({
              ...f,
              name: data.profile.user?.name || f.name || session.user.name || '',
              phone: data.profile.user?.phone || f.phone,
              address: data.profile.address || f.address,
              landmark: data.profile.landmark || f.landmark || '',
              city: data.profile.city || f.city,
              state: data.profile.state || f.state,
              pincode: data.profile.pincode || f.pincode,
            }));
          }
        })
        .catch(err => console.error('Error fetching consumer profile:', err));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) { router.push('/login'); return; }
    if (items.length === 0) return toast.error('Your cart is empty');
    if (!form.address || !form.city || !form.pincode) return toast.error('Please fill shipping address');
    if (!form.phone || form.phone.trim().length < 10) return toast.error('Please enter a valid 10-digit phone number');

    // Open simulated payment modal
    setShowPaymentModal(true);
    setPaymentStage('idle');
  };

  const handleSimulatedPayment = async () => {
    setPaymentStage('processing');
    setLoading(true);

    try {
      setPaymentProgressMsg('Connecting to secure payment gateway...');
      await new Promise((r) => setTimeout(r, 900));

      setPaymentProgressMsg('Authorizing transaction with bank...');
      await new Promise((r) => setTimeout(r, 900));

      setPaymentProgressMsg('Verifying secure signature...');
      await new Promise((r) => setTimeout(r, 800));

      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            landmark: form.landmark || null,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          paymentMethod: 'PREPAID',
          paymentStatus: 'PAID',
          notes: form.notes || null,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Order placement failed');
      }

      const order = await res.json();
      setPaymentStage('success');
      toast.success('Payment Received!');
      
      // Let success transition show briefly
      await new Promise((r) => setTimeout(r, 1000));
      
      clearCart();
      setShowPaymentModal(false);
      setSuccess(order.orderNumber);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete payment');
      setPaymentStage('idle');
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
            <p>✓ Payment Verified — Prepaid Order</p>
            <p>✓ Delivery within 5-7 business days</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/shop" className="bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors">
              Continue Shopping
            </Link>
            <Link href="/user/myorders" className="bg-card border border-border py-3 rounded-xl font-bold text-brand-green hover:bg-muted transition-colors">
              View My Shop Orders
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
                    <textarea required rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={`${inp} resize-none`} placeholder="House no., Street, Flat/Apartment, Area" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}><Building2 className="h-3 w-3 inline mr-1" />Landmark (Optional)</label>
                    <input type="text" value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} className={inp} placeholder="Near Hospital, School, Metro Station, Mall, etc." />
                  </div>
                  <div>
                    <label className={lbl}>City *</label>
                    <input required type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inp} placeholder="City" />
                  </div>
                  <div>
                    <label className={lbl}>State *</label>
                    <StateSelect
                      value={form.state}
                      onChange={val => setForm(f => ({ ...f, state: val }))}
                      placeholder="Type or select state..."
                      required
                    />
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
                    <p className="font-bold text-brand-green">Online Payment (Prepaid)</p>
                    <p className="text-xs text-foreground/60">Secure payment via UPI, Cards, or Netbanking</p>
                  </div>
                  <span className="ml-auto text-2xl">💳</span>
                </div>
                <div className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl">
                  ⚠️ Cash on Delivery (COD) is disabled for this store. Only prepaid orders are accepted.
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

                {/* Promo Coupon Code Box */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="bg-emerald-600 text-white rounded-2xl p-3 px-4 text-xs font-extrabold flex items-center justify-between shadow-xs">
                      <span>🎫 Coupon <code className="bg-white/20 px-2 py-0.5 rounded font-black tracking-widest text-amber-200">{appliedCoupon.code}</code> Applied (-{formatPrice(discountAmount)})</span>
                      <button type="button" onClick={handleRemoveCoupon} className="text-white/80 hover:text-white underline text-[11px] font-bold">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Promo Code (e.g. WELCOME10)"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-brand-green"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs shrink-0 disabled:opacity-50"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between text-foreground/70"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-extrabold">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
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
                  {loading ? 'Processing...' : <>Proceed to Pay <ArrowRight className="h-5 w-5" /></>}
                </button>

                <p className="text-center text-xs text-foreground/50">
                  By placing order you agree to our <Link href="/terms" className="text-brand-green hover:underline">Terms</Link>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Simulated Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200 text-foreground">
            {paymentStage === 'idle' && (
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground/50 hover:text-foreground" />
              </button>
            )}

            <div className="text-center border-b border-border pb-4">
              <h3 className="font-extrabold text-brand-green text-lg">🔒 Ayurwed Payment Gateway</h3>
              <p className="text-xs text-foreground/50 mt-1">128-bit SSL Secure Simulated Transaction</p>
            </div>

            {paymentStage === 'idle' ? (
              <div className="space-y-5">
                <div className="bg-muted/50 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-foreground/50 font-bold uppercase">Amount to Pay</p>
                    <p className="text-xl font-extrabold text-brand-green">{formatPrice(total)}</p>
                  </div>
                  <span className="text-2xl">🛡️</span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wide">Select Demo Method</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: '📱' },
                      { id: 'card', label: 'Card', icon: '💳' },
                      { id: 'netbanking', label: 'NetBanking', icon: '🏦' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedPaymentType(m.id as any)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                          selectedPaymentType === m.id
                            ? 'border-brand-green bg-brand-green-light/20 text-brand-green'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <span className="text-lg">{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatedPayment}
                  className="w-full bg-brand-green text-white py-3.5 rounded-2xl font-extrabold hover:bg-brand-gold hover:text-brand-green transition-all shadow-lg"
                >
                  Pay {formatPrice(total)} (Simulated)
                </button>
              </div>
            ) : paymentStage === 'processing' ? (
              <div className="py-8 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-green-light/30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-brand-green animate-spin"></div>
                </div>
                <p className="font-bold text-brand-green text-sm animate-pulse">{paymentProgressMsg}</p>
                <p className="text-[10px] text-foreground/40">Please do not close this window or hit refresh.</p>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-500 text-3xl animate-bounce">
                  ✓
                </div>
                <p className="font-extrabold text-brand-green text-lg">Payment Successful!</p>
                <p className="text-xs text-foreground/50">Redirecting to order confirmation...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
