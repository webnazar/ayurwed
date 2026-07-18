'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from './CartContext';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function CartDrawer() {
  const { items, removeItem, updateQty, totalItems, subtotal, isOpen, closeCart } = useCart();
  const shipping = subtotal >= 500 ? 0 : subtotal > 0 ? 60 : 0;
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-gold" />
            <h2 className="font-extrabold text-lg">My Cart</h2>
            {totalItems > 0 && (
              <span className="bg-brand-gold text-brand-green text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 bg-card/10 hover:bg-card/20 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-foreground/20" />
              </div>
              <p className="font-bold text-foreground/50">Your cart is empty</p>
              <p className="text-sm text-foreground/40">Add some Ayurvedic products to get started</p>
              <button onClick={closeCart}
                className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-gold hover:text-brand-green transition-colors">
                Browse Shop
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover flex-shrink-0 border border-border" />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                    <ShoppingBag className="h-7 w-7 text-foreground/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-bold text-brand-green text-sm line-clamp-2 leading-tight">{item.name}</p>
                  {item.unit && <p className="text-[10px] text-foreground/50">{item.unit}</p>}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-green text-sm">{formatPrice(item.price)}</span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-foreground/40 line-through">{formatPrice(item.mrp)}</span>
                    )}
                  </div>
                  {/* Qty Controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-brand-green-light hover:border-brand-green hover:text-brand-green transition-colors disabled:opacity-40">
                      <Plus className="h-3 w-3" />
                    </button>
                    <button onClick={() => removeItem(item.productId)} className="ml-auto p-1 text-foreground/30 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals */}
        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-4 flex-shrink-0 bg-card">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-foreground/70">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {subtotal < 500 && subtotal > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Add {formatPrice(500 - subtotal)} more for free shipping!
                </p>
              )}
              <div className="flex justify-between font-bold text-base text-brand-green border-t border-border pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/shop/checkout" onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={closeCart}
              className="w-full text-center text-sm text-brand-green hover:underline font-medium">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
