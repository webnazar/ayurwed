'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import { Preparation } from '@prisma/client';

interface ExtractCardProps {
  preparation: Preparation;
}

export default function ExtractCard({ preparation }: ExtractCardProps) {
  let imagesList: string[] = [];
  try {
    imagesList = typeof preparation.images === 'string' ? JSON.parse(preparation.images) : (preparation.images || []);
  } catch {
    if (typeof preparation.images === 'string') imagesList = [preparation.images];
  }

  const thumbnail = imagesList?.[0] || '/icon.webp';
  const isPlaceholder = !imagesList?.[0];

  return (
    <div className="card-premium overflow-hidden flex flex-col group h-full relative">
      {/* Sponsored / Featured badges */}
      {(preparation as any).isSponsored && (
        <span className="absolute top-4 left-4 z-10 badge-gold text-[9px] px-2.5 py-1 rounded-full tracking-wider">
          Sponsored
        </span>
      )}
      {(preparation as any).isFeatured && !(preparation as any).isSponsored && (
        <span className="absolute top-4 left-4 z-10 bg-brand-green text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" /> Featured
        </span>
      )}

      {/* Preparation Image */}
      <div className="relative h-56 bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:bg-muted/80 transition-colors duration-300">
        <Image
          src={thumbnail}
          alt={preparation.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className={`group-hover:scale-105 transition-transform duration-500 ${
            isPlaceholder ? 'object-contain p-8 bg-emerald-50/50' : 'object-cover mix-blend-multiply dark:mix-blend-normal'
          }`}
        />
      </div>

      {/* Preparation Info */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-widest">
            {preparation.type.replace('_', ' ')}
          </span>
          <h3 className="text-sm font-bold text-title-primary group-hover:text-brand-gold transition-colors duration-200 line-clamp-2">
            {preparation.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {preparation.description}
          </p>
          {/* Rating */}
          <div className="flex items-center gap-1 text-brand-gold pt-1">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold text-title-primary">{Number(preparation.rating || 0).toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground/80 font-medium">({preparation.totalReviews || 0} reviews)</span>
          </div>
        </div>

        {/* MRP reference + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-green-light">
          <div>
            {(preparation as any).mrp ? (
              <span className="text-xs text-muted-foreground font-medium">
                MRP <span className="font-bold text-foreground">₹{Number((preparation as any).mrp).toFixed(0)}</span>
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground/80 italic">Info only — not for sale</span>
            )}
          </div>
          <Link
            href={`/preparations/${preparation.slug}`}
            className="btn-primary text-xs px-4 py-2 rounded-full flex items-center gap-1.5"
          >
            {(preparation as any).isShopExtract ? 'Buy Now' : 'Explore'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
