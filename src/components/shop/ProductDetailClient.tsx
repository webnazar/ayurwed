'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Building2, Tag, Package, ShieldCheck, Star, Plus, Minus, ArrowLeft, Leaf } from 'lucide-react';
import { useCart } from '@/components/shop/CartContext';
import CartDrawer from '@/components/shop/CartDrawer';
import ShopProductCard from '@/components/shop/ShopProductCard';
import toast from 'react-hot-toast';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ProductDetailClient({ product, related }: { product: any; related: any[] }) {
  const { addItem, items, openCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const inCart = items.find(i => i.productId === product.id);
  const disc = product.mrp > product.sellingPrice
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0;

  const handleAddToCart = () => {
    if (product.stock === 0) return toast.error('Out of stock');
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id, name: product.name, slug: product.slug,
        image: product.images?.[0] || '', price: product.sellingPrice,
        mrp: product.mrp, unit: product.unit, stock: product.stock,
      });
    }
    toast.success(`${qty} item(s) added to cart!`, { icon: '🛒' });
    openCart();
  };

  return (
    <>
      <CartDrawer />
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-foreground/50">
            <Link href="/" className="hover:text-brand-green">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/shop" className="hover:text-brand-green">Shop</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {product.category && (
              <>
                <span className="hover:text-brand-green cursor-pointer">{product.category}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
            <span className="text-brand-green font-semibold line-clamp-1">{product.name}</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border shadow-sm">
                {product.images?.[activeImg] ? (
                  <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="h-24 w-24 text-brand-green/10" />
                  </div>
                )}
                {disc > 0 && (
                  <div className="absolute top-4 left-4 bg-rose-500 text-white text-sm font-extrabold px-3 py-1 rounded-full">
                    {disc}% OFF
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-brand-green shadow-md' : 'border-border hover:border-brand-green/50'}`}>
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.category && (
                    <span className="bg-brand-green-light/60 text-brand-green text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {product.category}
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-brand-gold/20 text-brand-gold-dark text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" /> Featured
                    </span>
                  )}
                  {product.sku && (
                    <span className="bg-muted text-foreground/60 text-xs font-mono px-3 py-1 rounded-full">SKU: {product.sku}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-green leading-tight mb-3">{product.name}</h1>
                {product.shortDesc && (
                  <p className="text-foreground/70 text-base leading-relaxed">{product.shortDesc}</p>
                )}
              </div>

              {/* Manufacturer */}
              {product.manufacturer && (
                <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3">
                  {product.manufacturer.logo ? (
                    <img src={product.manufacturer.logo} alt={product.manufacturer.companyName} className="h-10 w-10 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-brand-green-light flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-brand-green" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wide">Manufactured By</p>
                    <p className="font-bold text-brand-green text-sm">{product.manufacturer.companyName}</p>
                  </div>
                  {product.manufacturer.isVerified && (
                    <ShieldCheck className="h-5 w-5 text-emerald-500 ml-auto" />
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gradient-to-br from-brand-green-light/30 to-brand-gold-light/20 rounded-3xl p-5 border border-border space-y-1">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-extrabold text-brand-green">{formatPrice(product.sellingPrice)}</span>
                  {product.unit && <span className="text-foreground/60 text-sm mb-1">/ {product.unit}</span>}
                </div>
                {product.mrp > product.sellingPrice && (
                  <div className="flex items-center gap-3">
                    <span className="text-base text-foreground/40 line-through">MRP {formatPrice(product.mrp)}</span>
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm font-bold px-2.5 py-0.5 rounded-full">
                      Save {disc}%
                    </span>
                  </div>
                )}
                <p className="text-xs text-foreground/50 pt-1">
                  {product.stock > 0
                    ? <span className="text-emerald-600 font-semibold">✓ In Stock ({product.stock} available)</span>
                    : <span className="text-rose-500 font-semibold">✗ Out of Stock</span>}
                </p>
              </div>

              {/* Qty Selector + Add to Cart */}
              {product.stock > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-brand-green w-8 text-center text-base">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-white py-3 px-6 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-all duration-200 shadow-sm hover:shadow-lg">
                    <ShoppingCart className="h-4 w-4" />
                    {inCart ? 'Add More to Cart' : 'Add to Cart'}
                  </button>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: Package, text: 'Free shipping above ₹500' },
                  { icon: ShieldCheck, text: '100% Authentic Products' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-foreground/60 bg-muted/50 rounded-xl p-3">
                    <Icon className="h-4 w-4 text-brand-green flex-shrink-0" />
                    <span className="text-xs font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-10 space-y-3">
            <h2 className="font-extrabold text-lg text-brand-green border-b border-border pb-3">About this Product</h2>
            <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-brand-green">You May Also Like</h2>
                <Link href="/shop" className="text-sm text-brand-green hover:underline flex items-center gap-1 font-semibold">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map(p => <ShopProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {/* Back to Shop */}
          <div className="mt-10 text-center">
            <Link href="/shop"
              className="inline-flex items-center gap-2 text-brand-green hover:text-brand-gold transition-colors font-semibold">
              <ArrowLeft className="h-4 w-4" /> Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
