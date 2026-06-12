'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ShieldCheck, MapPin, Loader2, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  // State Dropdown Logic
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [filteredStates, setFilteredStates] = useState(INDIAN_STATES);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const stateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      toast.error('Please login to checkout');
      router.push('/login?callbackUrl=/checkout');
    } else if (status === 'authenticated') {
      fetchAddress();
    }
  }, [status, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setIsStateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAddress = async () => {
    try {
      const res = await fetch('/api/consumer/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setAddress({
            street: data.profile.address || '',
            landmark: '', // Not in profile currently
            city: data.profile.city || '',
            state: data.profile.state || '',
            pincode: data.profile.pincode || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress({ ...address, state: val });
    setIsStateOpen(true);
    const filtered = INDIAN_STATES.filter(s => s.toLowerCase().includes(val.toLowerCase()));
    setFilteredStates(filtered);
    setHighlightedIndex(0);
  };

  const handleStateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isStateOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsStateOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => (prev < filteredStates.length - 1 ? prev + 1 : prev));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (filteredStates[highlightedIndex]) {
        setAddress({ ...address, state: filteredStates[highlightedIndex] });
        setIsStateOpen(false);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsStateOpen(false);
    }
  };

  const selectState = (stateName: string) => {
    setAddress({ ...address, state: stateName });
    setIsStateOpen(false);
  };

  if (!mounted || status === 'loading') return null;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-3xl font-extrabold text-brand-green">Checkout Unavailable</h1>
        <p className="text-brand-foreground/60 max-w-sm mx-auto">Your cart is empty.</p>
        <Link href="/shop" className="inline-block bg-brand-green text-white px-8 py-3.5 rounded-full font-bold">Return to Shop</Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 50;
  const totalAmount = subtotal + shipping;

  const handlePayment = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill in all required address fields.');
    }

    setProcessing(true);
    try {
      const createRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: address })
      });
      
      const orderData = await createRes.json();
      if (!createRes.ok) {
        console.error("SERVER ERROR PAYLOAD:", orderData);
        throw new Error(orderData.details || orderData.error || 'Failed to create order');
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

      // Bypass Razorpay script if using placeholder keys (Development mode)
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || razorpayKey === 'rzp_test_placeholder' || razorpayKey === 'rzp_test_dummykey' || razorpayKey.trim() === '') {
        toast.success('Test Environment: Mocking successful payment...');
        
        // Mock the verification API call
        const verifyRes = await fetch('/api/orders/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.razorpayOrder.id,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            razorpay_signature: 'mock_signature',
            dbOrderId: orderData.dbOrderId,
            isMock: true // We'll add this flag to bypass crypto in the backend
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          toast.success('Payment Successful!');
          clearCart();
          router.push('/dashboard/consumer?payment=success'); 
        } else {
          toast.error('Payment verification failed.');
        }
        return;
      }

      // Actual Razorpay Integration
      const options = {
        key: razorpayKey,
        amount: orderData.razorpayOrder.amount,
        currency: orderData.razorpayOrder.currency,
        name: 'AYURWED Marketplace',
        description: `Order ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrder.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: orderData.dbOrderId
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            toast.success('Payment Successful!');
            clearCart();
            router.push('/dashboard/consumer?payment=success'); 
          } else {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#1a4f3b'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment Failed: ' + response.error.description);
        setProcessing(false);
      });
      
      rzp.open();

    } catch (error: any) {
      toast.error(error.message);
      setProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-slate-50 min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <div className="mb-8">
            <Link href="/cart" className="inline-flex items-center text-sm font-semibold text-brand-green hover:text-brand-gold transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight mt-4">Secure Checkout</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Delivery Address */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-green-border/10 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-brand-green-light mb-6">
                  <div className="bg-brand-gold/10 p-2.5 rounded-xl">
                    <MapPin className="h-6 w-6 text-brand-gold-dark" />
                  </div>
                  <h2 className="text-xl font-bold text-brand-green">Delivery Details</h2>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-brand-foreground/80">Street Address *</label>
                      <input 
                        type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})}
                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
                        placeholder="House/Flat No., Building Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-brand-foreground/80">Landmark (Optional)</label>
                      <input 
                        type="text" value={address.landmark} onChange={(e) => setAddress({...address, landmark: e.target.value})}
                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
                        placeholder="e.g. Near Apollo Hospital"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-brand-foreground/80">City *</label>
                        <input 
                          type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})}
                          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
                        />
                      </div>
                      <div className="space-y-1 relative" ref={stateRef}>
                        <label className="text-sm font-semibold text-brand-foreground/80">State *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={address.state} 
                            onChange={handleStateChange}
                            onKeyDown={handleStateKeyDown}
                            onFocus={() => {
                              setFilteredStates(INDIAN_STATES);
                              setIsStateOpen(true);
                              setHighlightedIndex(0);
                            }}
                            className="w-full border rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
                            placeholder="Type or select..."
                          />
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-foreground/40 pointer-events-none" />
                        </div>
                        
                        {isStateOpen && filteredStates.length > 0 && (
                          <ul className="absolute z-10 w-full mt-1 bg-white border border-brand-green-border/20 rounded-xl shadow-lg max-h-60 overflow-auto py-1">
                            {filteredStates.map((stateName, index) => (
                              <li 
                                key={stateName}
                                onClick={() => selectState(stateName)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                                  highlightedIndex === index ? 'bg-brand-green-light/20 text-brand-green font-semibold' : 'text-brand-foreground/80 hover:bg-slate-50'
                                }`}
                              >
                                {stateName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 sm:w-1/2">
                      <label className="text-sm font-semibold text-brand-foreground/80">Pincode *</label>
                      <input 
                        type="text" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})}
                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
                        placeholder="6 Digits"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary & Payment */}
            <div className="w-full lg:w-[450px]">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-green-border/10 shadow-md sticky top-28">
                <h2 className="text-xl font-bold text-brand-green mb-6 pb-4 border-b border-slate-100">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-brand-green">
                          {item.quantity}x
                        </div>
                        <span className="font-semibold text-brand-foreground/80 line-clamp-1 max-w-[200px]">{item.name}</span>
                      </div>
                      <span className="font-bold text-brand-foreground">{formatPrice(item.mrp * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm mb-6 pb-6 border-b border-slate-100">
                  <div className="flex justify-between text-brand-foreground/70">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-brand-foreground/70">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-brand-green font-bold" : ""}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-lg font-bold text-brand-foreground">Total</span>
                  <span className="text-3xl font-extrabold text-brand-green">{formatPrice(totalAmount)}</span>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={processing || loading}
                  className="w-full bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green font-extrabold py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-70"
                >
                  {processing ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    <><ShieldCheck className="h-5 w-5" /> Pay Securely</>
                  )}
                </button>

                <p className="text-[10px] text-center text-brand-foreground/50 mt-4 leading-relaxed">
                  By placing your order, you agree to our Terms of Service and Privacy Policy. Payments are securely processed by Razorpay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
