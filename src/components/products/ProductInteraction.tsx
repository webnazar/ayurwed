'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Globe, Mail, Phone, Leaf, CheckCircle2, MessageSquare, Calendar, ShieldAlert, Sparkles, ShoppingCart, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

interface ProductInteractionProps {
  product: {
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
    isShopProduct?: boolean;
    manufacturer?: {
      id: number;
      companyName: string;
      slug: string;
      website?: string | null;
      contactEmail?: string | null;
      contactPhone?: string | null;
      isVerified: boolean;
    } | null;
  };
}

type TabType = 'overview' | 'ingredients' | 'benefits' | 'usage';

export default function ProductInteraction({ product }: ProductInteractionProps) {
  const [activeImage, setActiveImage] = useState(product.images[0] || '');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...enquiryForm,
          productId: product.id,
          manufacturerId: product.manufacturer?.id,
        }),
      });
      if (res.ok) {
        toast.success('Enquiry sent! The manufacturer will be notified.');
        setShowEnquiry(false);
        setEnquiryForm({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error('Failed to send enquiry. Please try again.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative h-96 sm:h-[450px] bg-white rounded-3xl overflow-hidden border border-brand-green-border/10">
            {activeImage ? (
              <Image src={activeImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Leaf className="h-24 w-24 text-brand-green-light" />
              </div>
            )}
            {product.isSponsored && (
              <span className="absolute top-4 left-4 bg-brand-gold text-brand-green font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sponsored
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 flex-shrink-0 transition-all ${
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
          {/* Name & MRP */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-brand-green leading-tight">{product.name}</h1>
            {product.mrp && (
              <p className="text-sm text-brand-foreground/60">
                Reference MRP: <span className="font-bold text-brand-foreground/80">₹{Number(product.mrp).toFixed(0)}</span>
                <span className="ml-2 text-[10px] italic">(Contact manufacturer or authorised retailers to purchase)</span>
              </p>
            )}
          </div>

          {/* Ayuri Neutral Note */}
          <div className="bg-gradient-to-r from-brand-green-light to-emerald-50 border border-brand-green-border/20 rounded-2xl p-4 flex gap-3">
            <Sparkles className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-brand-green">Ayuri's Note</p>
              <p className="text-xs text-brand-foreground/70 leading-relaxed">
                Here are products that may be relevant to your wellness journey. I recommend consulting a certified Ayurvedic practitioner before use — they can guide you based on your unique Prakriti (body constitution).
              </p>
            </div>
          </div>

          {/* CTAs */}
          {product.isShopProduct ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  useCartStore.getState().addItem({
                    id: product.id,
                    name: product.name,
                    mrp: product.mrp || 0,
                    image: product.images[0] || ''
                  });
                  toast.success('Added to Cart!');
                }}
                className="flex-1 bg-white border-2 border-brand-green text-brand-green hover:bg-brand-green-light font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow hover:shadow-lg text-sm"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button
                onClick={() => {
                  useCartStore.getState().addItem({
                    id: product.id,
                    name: product.name,
                    mrp: product.mrp || 0,
                    image: product.images[0] || ''
                  });
                  toast.success('Added to Cart! Redirecting...');
                  window.location.href = '/cart';
                }}
                className="flex-1 bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow hover:shadow-lg text-sm"
              >
                <CreditCard className="h-4 w-4" /> Buy Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setShowEnquiry(!showEnquiry)}
                className="flex-1 bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow hover:shadow-lg text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Manufacturer
              </button>
              <Link
                href="/consultants"
                className="flex-1 bg-white border border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 text-sm"
              >
                <Calendar className="h-4 w-4" />
                Book Consultation
              </Link>
            </div>
          )}

          {/* Enquiry Form */}
          {showEnquiry && (
            <form onSubmit={handleEnquirySubmit} className="bg-brand-gold-light/40 border border-brand-green-border/15 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-brand-green">Send Enquiry to Manufacturer</h3>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Your Name" value={enquiryForm.name} onChange={e => setEnquiryForm(f => ({ ...f, name: e.target.value }))}
                  className="col-span-2 sm:col-span-1 w-full text-xs bg-white border border-brand-green-border/20 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-gold" />
                <input required type="email" placeholder="Email" value={enquiryForm.email} onChange={e => setEnquiryForm(f => ({ ...f, email: e.target.value }))}
                  className="col-span-2 sm:col-span-1 w-full text-xs bg-white border border-brand-green-border/20 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-gold" />
                <input placeholder="Phone (optional)" value={enquiryForm.phone} onChange={e => setEnquiryForm(f => ({ ...f, phone: e.target.value }))}
                  className="col-span-2 w-full text-xs bg-white border border-brand-green-border/20 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-gold" />
                <textarea required rows={3} placeholder="Your message..." value={enquiryForm.message} onChange={e => setEnquiryForm(f => ({ ...f, message: e.target.value }))}
                  className="col-span-2 w-full text-xs bg-white border border-brand-green-border/20 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-gold resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-brand-green text-white text-xs font-bold py-2.5 rounded-full hover:bg-brand-gold hover:text-brand-green transition-colors disabled:opacity-50">
                {submitting ? 'Sending...' : 'Send Enquiry'}
              </button>
            </form>
          )}

          {/* Manufacturer Card */}
          {product.manufacturer && (
            <div className="bg-white border border-brand-green-border/10 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-green-light p-2 rounded-xl">
                    <Building2 className="h-4 w-4 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-green">{product.manufacturer.companyName}</p>
                    {product.manufacturer.isVerified && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> AYUSH Verified
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/manufacturers/${product.manufacturer.slug}`}
                  className="text-xs font-bold text-brand-gold hover:text-brand-green transition-colors">
                  View Profile →
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-brand-foreground/60">
                {product.manufacturer.website && (
                  <a href={product.manufacturer.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-brand-green">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                {product.manufacturer.contactEmail && (
                  <a href={`mailto:${product.manufacturer.contactEmail}`}
                    className="flex items-center gap-1 hover:text-brand-green">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                )}
                {product.manufacturer.contactPhone && (
                  <a href={`tel:${product.manufacturer.contactPhone}`}
                    className="flex items-center gap-1 hover:text-brand-green">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Info Tabs */}
          <div className="pt-4 border-t border-brand-green-light space-y-4">
            <div className="flex border-b border-brand-green-light overflow-x-auto">
              {([
                { key: 'overview', label: 'Overview' },
                { key: 'ingredients', label: 'Ingredients' },
                { key: 'benefits', label: 'Benefits' },
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
              {activeTab === 'overview' && <p>{product.description}</p>}
              {activeTab === 'ingredients' && (
                <ul className="space-y-1.5">
                  {(product.ingredients as string[]).map((ing, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Leaf className="h-3.5 w-3.5 text-brand-green mt-0.5 flex-shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'benefits' && (
                <ul className="space-y-1.5">
                  {(product.benefits as string[]).map((ben, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'usage' && <p>{product.usage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
