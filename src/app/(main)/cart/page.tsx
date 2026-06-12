'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  // Free shipping for orders above ₹999, else ₹50 flat rate
  const shipping = items.length === 0 ? 0 : subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-brand-green/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-brand-green/40" />
        </div>
        <h1 className="text-3xl font-extrabold text-brand-green">Your Cart is Empty</h1>
        <p className="text-brand-foreground/60 max-w-sm mx-auto">
          Looks like you haven't added anything to your cart yet. Discover authentic Ayurvedic preparations.
        </p>
        <div className="pt-4">
          <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-gold hover:text-brand-green transition-colors shadow-md">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Cart Items List */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-green-border/10 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-green-light">
              <span className="font-semibold text-brand-foreground/80">{items.length} Items</span>
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors">
                Clear Cart
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 sm:gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-brand-green-border/10">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <Link href={`/preparations/${item.id}`} className="font-bold text-lg text-brand-green hover:text-brand-gold transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Remove Item">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Control */}
                      <div className="flex items-center bg-slate-50 rounded-full border border-slate-200">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-brand-green transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-brand-foreground">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-brand-green transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="block font-extrabold text-brand-green text-lg">{formatPrice(item.mrp * item.quantity)}</span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-brand-foreground/50">{formatPrice(item.mrp)} each</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-gradient-to-br from-brand-green to-brand-green-dark rounded-3xl p-8 text-white sticky top-28 shadow-xl">
            <h2 className="text-xl font-bold text-brand-gold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-brand-green-light/20">
              <div className="flex justify-between">
                <span className="text-brand-green-light">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-green-light">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? <span className="text-brand-gold">Free</span> : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-lg font-bold">Total</span>
              <span className="text-3xl font-extrabold text-brand-gold">{formatPrice(total)}</span>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-brand-gold text-brand-green hover:bg-white hover:text-brand-green font-extrabold py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-lg mb-4"
            >
              Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-xs text-brand-green-light">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Secure, encrypted checkout.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
