'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Sparkles, BadgeCheck } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product & { manufacturer?: { companyName: string; slug: string } };
}

export default function ProductCard({ product }: ProductCardProps) {
  const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-brand-green-border/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group h-full relative">
      {/* Sponsored / Featured badges */}
      {(product as any).isSponsored && (
        <span className="absolute top-4 left-4 z-10 bg-brand-gold text-brand-green font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
          Sponsored
        </span>
      )}
      {(product as any).isFeatured && !(product as any).isSponsored && (
        <span className="absolute top-4 left-4 z-10 bg-brand-green text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" /> Featured
        </span>
      )}

      {/* Product Image */}
      <div className="relative h-56 bg-slate-50 overflow-hidden flex-shrink-0">
        <Image
          src={thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-widest">
            {product.category?.name || 'Ayurveda'}
          </span>
          <h3 className="text-sm font-bold text-brand-green group-hover:text-brand-gold transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-brand-foreground/60 line-clamp-2 mt-1">
            {product.description}
          </p>
          {/* Manufacturer */}
          {product.manufacturer && (
            <p className="text-[10px] text-brand-foreground/50 flex items-center gap-1 pt-1">
              <BadgeCheck className="h-3 w-3 text-brand-green" />
              by {product.manufacturer.companyName}
            </p>
          )}
          {/* Rating */}
          <div className="flex items-center gap-1 text-brand-gold pt-1">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold text-brand-green">{Number(product.rating || 0).toFixed(1)}</span>
            <span className="text-[10px] text-brand-foreground/40 font-medium">({product.totalReviews || 0} reviews)</span>
          </div>
        </div>

        {/* MRP reference + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-green-light">
          <div>
            {(product as any).mrp ? (
              <span className="text-xs text-brand-foreground/50 font-medium">
                MRP <span className="font-bold text-brand-foreground/70">₹{Number((product as any).mrp).toFixed(0)}</span>
              </span>
            ) : (
              <span className="text-[10px] text-brand-foreground/40 italic">Info only — not for sale</span>
            )}
          </div>
          <Link
            href={`/preparations/${product.slug}`}
            className="bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors duration-200"
          >
            {(product as any).isShopProduct ? 'Buy Now' : 'Explore'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
