'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Globe, Mail, Phone, Leaf, CheckCircle2, MessageSquare, Calendar, ShieldAlert, Sparkles, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ExtractInteractionProps {
  preparation: {
    id: number;
    name: string;
    description: string;
    mrp?: number | null;
    images: string[];
    ingredients: string[];
    benefits: string[];
    usage: string;
    isSponsored?: boolean;
    isFeatured?: boolean;
    isShopExtract?: boolean;
    type?: string;
    volume?: number | null;
    volumeUnit?: string | null;
    weight?: number | null;
    weightUnit?: string | null;
    count?: number | null;
    countUnit?: string | null;
    indications?: string[];
  };
}

type TabType = 'overview' | 'ingredients' | 'benefits' | 'indications' | 'usage';

export default function ExtractInteraction({ preparation }: ExtractInteractionProps) {
  const [activeImage, setActiveImage] = useState(preparation.images[0] || '/icon.webp');
  const [activeTab, setActiveTab] = useState<TabType>('overview');


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative h-96 sm:h-[450px] bg-card rounded-3xl overflow-hidden border border-border">
            <Image
              src={activeImage}
              alt={preparation.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={activeImage === '/icon.webp' ? 'object-contain p-16 bg-emerald-50/50' : 'object-cover'}
            />
            {preparation.isSponsored && (
              <span className="absolute top-4 left-4 bg-brand-gold text-brand-green font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sponsored
              </span>
            )}
          </div>
          {preparation.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {preparation.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-card border-2 flex-shrink-0 transition-all ${
                    activeImage === img ? 'border-brand-gold scale-95 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex flex-col space-y-6">
          {/* Name & Badges */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-brand-green leading-tight">{preparation.name}</h1>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {preparation.type && (
                <span className="bg-brand-gold/15 text-brand-gold-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {preparation.type.replace('_', ' ')}
                </span>
              )}
              {preparation.volume && preparation.volumeUnit && (
                <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Volume: {preparation.volume} {preparation.volumeUnit}
                </span>
              )}
              {preparation.weight && preparation.weightUnit && (
                <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Weight: {preparation.weight} {preparation.weightUnit}
                </span>
              )}
              {preparation.count && preparation.countUnit && (
                <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Quantity: {preparation.count} {preparation.countUnit}
                </span>
              )}
            </div>
            
            {preparation.mrp && (
              <p className="text-sm text-brand-foreground/60">
                Reference MRP: <span className="font-bold text-brand-foreground/80">₹{Number(preparation.mrp).toFixed(0)}</span>
                <span className="ml-2 text-[10px] italic">(For educational reference; consult a certified practitioner for guidance)</span>
              </p>
            )}
          </div>

          {/* Ayuri Neutral Note */}
          <div className="bg-gradient-to-r from-brand-green-light to-emerald-50 border border-border rounded-2xl p-4 flex gap-3">
            <Sparkles className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-brand-green">Ayuri's Note</p>
              <p className="text-xs text-brand-foreground/70 leading-relaxed">
                Here are preparations that may be relevant to your wellness journey. I recommend consulting a certified Ayurvedic practitioner before use — they can guide you based on your unique Prakriti (body constitution).
              </p>
              <p className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-200 px-2.5 py-1 rounded-lg mt-1 inline-block">
                *Disclaimer: Educational guidance only — not a substitute for professional medical advice or clinical diagnosis.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/doctors"
              className="btn-secondary text-sm sm:text-base w-full sm:w-[260px] shadow-sm hover:shadow-lg flex items-center justify-center gap-2"
            >
              <HeartHandshake className="h-5 w-5 flex-shrink-0" />
              <span>Browse Doctors Directory</span>
            </Link>
          </div>



          {/* Info Tabs */}
          <div className="pt-4 border-t border-brand-green-light space-y-4">
            <div className="flex border-b border-brand-green-light overflow-x-auto">
              {([
                { key: 'overview', label: 'Overview' },
                { key: 'ingredients', label: 'Ingredients' },
                { key: 'benefits', label: 'Benefits' },
                { key: 'indications', label: 'Indications' },
                { key: 'usage', label: 'How to Use' },
              ] as const).map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`py-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key ? 'border-brand-gold text-brand-gold' : 'border-transparent text-brand-foreground/60 hover:text-brand-green'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-sm text-brand-foreground/75 leading-relaxed min-h-[80px]">
              {activeTab === 'overview' && <p>{preparation.description}</p>}
              {activeTab === 'ingredients' && (
                <ul className="space-y-1.5">
                  {(preparation.ingredients as string[]).map((ing, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Leaf className="h-3.5 w-3.5 text-brand-green mt-0.5 flex-shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'benefits' && (
                <ul className="space-y-1.5">
                  {(preparation.benefits as string[]).map((ben, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'indications' && (
                <ul className="space-y-1.5">
                  {(preparation.indications || []).map((ind, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-brand-gold-dark mt-0.5 flex-shrink-0" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'usage' && <p>{preparation.usage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
