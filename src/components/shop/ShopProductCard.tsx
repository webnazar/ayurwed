'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, Tag, Building2, Eye } from 'lucide-react';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: number; name: string; slug: string; shortDesc: string | null;
  category: string | null; mrp: number; sellingPrice: number;
  stock: number; unit: string | null; images: string[];
  isFeatured: boolean;
  manufacturer?: { id: number; companyName: string } | null;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const discount = (mrp: number, sp: number) =>
  mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;

export default function ShopProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const inCart = items.find(i => i.productId === product.id);
  const disc = discount(product.mrp, product.sellingPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '',
      price: product.sellingPrice,
      mrp: product.mrp,
      unit: product.unit,
      stock: product.stock,
    });
    toast.success('Added to cart!', { icon: '🛒' });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    if (!inCart) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || '',
        price: product.sellingPrice,
        mrp: product.mrp,
        unit: product.unit,
        stock: product.stock,
      });
    }
    router.push('/shop/checkout');
  };

  return (
    <div className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-brand-green/30 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/shop/${product.slug}`}>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <img src="/icon.webp" alt={product.name}
              className="w-full h-full object-contain p-8 bg-emerald-50/50 group-hover:scale-105 transition-transform duration-500" />
          )}
        </Link>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-row flex-wrap gap-1.5 items-center max-w-[calc(100%-24px)]">
          {disc > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {disc}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-brand-gold text-brand-green dark:text-brand-green-light text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-current" /> Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-foreground/80 text-background text-[10px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link href={`/shop/${product.slug}`}
            className="bg-white text-brand-green text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-brand-gold transition-colors">
            <Eye className="h-3.5 w-3.5" /> View Details
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        {/* Category & Manufacturer */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.category && (
            <span className="text-[10px] font-bold text-brand-green bg-brand-green-light/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Tag className="h-2.5 w-2.5" /> {product.category}
            </span>
          )}
          {product.manufacturer && (
            <span className="text-[10px] font-bold text-foreground/50 flex items-center gap-1">
              <Building2 className="h-2.5 w-2.5" /> {product.manufacturer.companyName}
            </span>
          )}
        </div>

        {/* Name */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-bold text-brand-green leading-tight text-sm line-clamp-2 hover:text-brand-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Short desc */}
        {product.shortDesc && (
          <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">{product.shortDesc}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        {/* Pricing & Actions */}
        <div className="mt-auto pt-2 border-t border-border space-y-2.5">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-brand-green text-base">{formatPrice(product.sellingPrice)}</span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-foreground/40 line-through">{formatPrice(product.mrp)}</span>
            )}
            {product.unit && <span className="text-[10px] text-foreground/50">({product.unit})</span>}
          </div>

          <div className="flex gap-2">
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                inCart
                  ? 'bg-brand-gold text-brand-green hover:bg-brand-gold/80'
                  : product.stock === 0
                    ? 'bg-muted text-foreground/40 cursor-not-allowed'
                    : 'bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white border border-brand-green/20'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {inCart ? `${inCart.quantity} in Cart` : 'Add'}
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                product.stock === 0
                  ? 'bg-muted text-foreground/40 cursor-not-allowed'
                  : 'bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green shadow-sm'
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
