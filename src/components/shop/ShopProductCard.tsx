'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, Tag, Building2, Eye, Plus, Minus, FileText, Check } from 'lucide-react';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  slug: string;
  shortDesc: string | null;
  botanicalName?: string | null;
  type?: string | null;
  category: string | null;
  mrp: number;
  sellingPrice: number;
  stock: number;
  unit: string | null;
  images: string[];
  isFeatured: boolean;
  tags?: string | null;
  manufacturer?: { id: number; companyName: string } | null;
  indications?: { id: number; name: string }[];
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const discount = (mrp: number, sp: number) =>
  mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;

export default function ShopProductCard({
  product,
  onSelectSymptom,
  mode = 'B2C',
  onB2bQuote,
}: {
  product: Product;
  onSelectSymptom?: (symptom: string) => void;
  mode?: 'B2C' | 'B2B';
  onB2bQuote?: (product: Product) => void;
}) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const inCart = items.find(i => i.productId === product.id);
  const disc = discount(product.mrp, product.sellingPrice);

  const [b2bQty, setB2bQty] = useState(mode === 'B2B' ? 5 : 1);

  // Extract explicit health symptoms from tags or indications relation
  const matchedSymptoms = React.useMemo(() => {
    const list: string[] = [];
    if (product.indications && product.indications.length > 0) {
      list.push(...product.indications.map(i => i.name));
    }
    if (product.tags) {
      const rawTags = product.tags.split(',').map(t => t.trim());
      const filtered = rawTags.filter(
        t => t.length > 3 && /[A-Z]/.test(t) &&
        !['Syrup', 'Powder', 'Capsule', 'Tablet', 'Oil', 'Ghee', 'Formula', 'Blend'].some(x => t.includes(x))
      );
      list.push(...filtered);
    }
    return Array.from(new Set(list));
  }, [product.tags, product.indications]);

  const handleAddToCart = (e: React.MouseEvent, count: number = 1) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    for (let i = 0; i < count; i++) {
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
    toast.success(`Added ${count} unit(s) to cart!`, { icon: '🛒' });
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

  const formattedType = (product.type || 'READY_PRODUCT').replace('_', ' ');

  return (
    <div className={`group bg-card border rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${
      mode === 'B2B' ? 'border-brand-green/30 bg-gradient-to-b from-card to-brand-green-light/10' : 'border-border hover:border-brand-green/30'
    }`}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/shop/${product.slug}`}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/icon.webp';
                target.className = 'w-full h-full object-contain p-8 bg-emerald-50/50 group-hover:scale-105 transition-transform duration-500';
              }}
            />
          ) : (
            <img
              src="/icon.webp"
              alt={product.name}
              className="w-full h-full object-contain p-8 bg-emerald-50/50 group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-row flex-wrap gap-1.5 items-center max-w-[calc(100%-24px)]">
          {mode === 'B2B' ? (
            <span className="bg-brand-green text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              B2B Bulk ({formattedType})
            </span>
          ) : (
            <span className="bg-brand-gold text-brand-green dark:text-brand-green-light font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {formattedType}
            </span>
          )}

          {disc > 0 && mode === 'B2C' && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {disc}% OFF
            </span>
          )}

          {product.isFeatured && (
            <span className="bg-brand-gold text-brand-green dark:text-brand-green-light text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-current" /> Featured
            </span>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
              Only {product.stock} Left!
            </span>
          )}

          {product.stock === 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            href={`/shop/${product.slug}`}
            className="bg-white text-brand-green text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-brand-gold transition-colors"
          >
            <Eye className="h-3.5 w-3.5" /> View Details
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        {/* Category & Manufacturer */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.category && (
              <span className="font-bold text-brand-green bg-brand-green-light/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" /> {product.category}
              </span>
            )}
            {product.manufacturer && (
              <span className="font-bold text-foreground/50 flex items-center gap-1">
                <Building2 className="h-2.5 w-2.5" /> {product.manufacturer.companyName}
              </span>
            )}
          </div>
        </div>

        {/* Name & Botanical Name */}
        <div>
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-bold text-brand-green leading-tight text-sm line-clamp-2 hover:text-brand-gold transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.botanicalName && (
            <p className="text-[11px] text-foreground/50 italic font-serif">
              {product.botanicalName}
            </p>
          )}
        </div>

        {/* Indication / Symptom Badges */}
        {matchedSymptoms.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {matchedSymptoms.slice(0, 3).map(sym => (
              <button
                key={sym}
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectSymptom) onSelectSymptom(sym);
                }}
                className="text-[9px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md hover:bg-amber-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                title={`Filter by indication: ${sym}`}
              >
                <span>🩺</span>
                <span className="truncate max-w-[120px]">{sym}</span>
              </button>
            ))}
            {matchedSymptoms.length > 3 && (
              <span className="text-[9px] text-muted-foreground font-semibold py-0.5 px-1">
                +{matchedSymptoms.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Short desc */}
        {product.shortDesc && (
          <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">{product.shortDesc}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* B2B vs B2C Specific Controls */}
        {mode === 'B2B' ? (
          <div className="mt-auto pt-2 border-t border-brand-green/20 space-y-3 bg-brand-green-light/20 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-foreground/50 uppercase font-bold block">Wholesale Unit Price</span>
                <span className="font-extrabold text-brand-green text-base">{formatPrice(product.sellingPrice)}</span>
                {product.unit && <span className="text-[10px] text-foreground/50 ml-1">/{product.unit}</span>}
              </div>
              <div className="text-right">
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                  Bulk Tier: 5+ Units
                </span>
                <span className="text-[10px] text-foreground/50 block font-semibold mt-0.5">Stock: {product.stock}</span>
              </div>
            </div>

            {/* B2B Bulk Quantity Selector & Cart */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setB2bQty(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted font-bold text-xs"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock || 999}
                  value={b2bQty}
                  onChange={e => setB2bQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 text-center font-bold text-xs bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setB2bQty(q => q + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted font-bold text-xs"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => handleAddToCart(e, b2bQty)}
                disabled={product.stock === 0}
                className="flex-1 bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Bulk Add ({b2bQty})
              </button>
            </div>

            {/* Inquiry Trigger */}
            {onB2bQuote && (
              <button
                type="button"
                onClick={() => onB2bQuote(product)}
                className="w-full text-center text-[10px] font-bold text-brand-green hover:underline flex items-center justify-center gap-1 pt-1"
              >
                <FileText className="h-3 w-3" /> Request Custom Wholesale Quote
              </button>
            )}
          </div>
        ) : (
          /* B2C Standard Retail Controls */
          <div className="mt-auto pt-2 border-t border-border space-y-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-brand-green text-base">{formatPrice(product.sellingPrice)}</span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs text-foreground/40 line-through">{formatPrice(product.mrp)}</span>
              )}
              {product.unit && <span className="text-[10px] text-foreground/50">({product.unit})</span>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => handleAddToCart(e, 1)}
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
        )}
      </div>
    </div>
  );
}
