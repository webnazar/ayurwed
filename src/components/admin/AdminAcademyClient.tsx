'use client';

import React, { useState } from 'react';
import { Award, Save, CheckCircle2, DollarSign, Tag, Sparkles, BookOpen, ShieldCheck, Users, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  couponCode?: string | null;
  couponDiscountPrice?: number | null;
  isPublished: boolean;
  enrollmentsCount?: number;
}

export default function AdminAcademyClient({ initialCourse }: { initialCourse: Course }) {
  const [course, setCourse] = useState<Course>(initialCourse);
  const [form, setForm] = useState<{
    title: string;
    price: number;
    discountPrice: number | null;
    couponCode: string;
    couponDiscountPrice: number | null;
    description: string;
    isPublished: boolean;
  }>({
    title: initialCourse.title,
    price: initialCourse.price || 9999,
    discountPrice: initialCourse.discountPrice ?? 4999,
    couponCode: initialCourse.couponCode || '',
    couponDiscountPrice: initialCourse.couponDiscountPrice ?? 1999,
    description: initialCourse.description,
    isPublished: initialCourse.isPublished,
  });

  const [saving, setSaving] = useState(false);

  const calculateDiscountPercent = (price: number, discountPrice: number | null) => {
    if (!discountPrice || discountPrice >= price || price <= 0) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/academy/course', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: course.id,
          title: form.title,
          price: Number(form.price),
          discountPrice: form.discountPrice !== null && form.discountPrice !== undefined ? Number(form.discountPrice) : null,
          couponCode: form.couponCode.trim().toUpperCase() || null,
          couponDiscountPrice: form.couponDiscountPrice !== null && form.couponDiscountPrice !== undefined ? Number(form.couponDiscountPrice) : null,
          description: form.description,
          isPublished: form.isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update course settings');

      toast.success('CAI Program Fee & Settings updated successfully!');
      
      const updatedCourse = data.course;
      setCourse(updatedCourse);
    } catch (err: any) {
      toast.error(err.message || 'Error updating course settings');
    } finally {
      setSaving(false);
    }
  };

  const currentPayable = form.discountPrice !== null && form.discountPrice !== undefined ? Number(form.discountPrice) : Number(form.price);
  const discountPercent = calculateDiscountPercent(Number(form.price), Number(form.discountPrice));
  const savingsAmount = Number(form.price) - currentPayable;

  return (
    <div className="space-y-3.5">
      {/* ── Header Banner (Minimal Margins, No Subtitle) ── */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">CAI Flagship Program</h1>
            </div>
          </div>

          <Link
            href="/academy"
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95"
          >
            <Eye className="h-3.5 w-3.5 text-brand-green" />
            <span>View Public Academy Page</span>
          </Link>
        </div>
      </div>

      {/* Flagship Program Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Flagship Program</span>
            <span className="text-sm font-black text-brand-green line-clamp-1">CAI Certificate</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Payable Student Fee</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-brand-green">{formatPrice(currentPayable)}</span>
              {form.discountPrice && form.discountPrice < form.price && (
                <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(form.price))}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-brand-gold/10 text-brand-gold-dark rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Active Offer Discount</span>
            <span className="text-lg font-black text-brand-gold-dark">
              {discountPercent > 0 ? `${discountPercent}% OFF (${formatPrice(savingsAmount)} Save)` : 'Standard Price'}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Enrolled Candidates</span>
            <span className="text-lg font-black text-foreground">{course.enrollmentsCount || 0} Enrolled</span>
          </div>
        </div>
      </div>

      {/* Main Single Course Configuration Form */}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-brand-green">Certificate in Ancient Intelligence (CAI) Settings</h2>
              <p className="text-xs text-muted-foreground">Manage program title, regular registration fee, and promotional offer price.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-muted/40 px-3.5 py-2 rounded-2xl border border-border">
            <label className="text-xs font-bold text-foreground cursor-pointer select-none" htmlFor="published-check">
              Published Status:
            </label>
            <input
              id="published-check"
              type="checkbox"
              checked={form.isPublished}
              onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
              className="w-4 h-4 text-brand-green focus:ring-brand-green rounded cursor-pointer"
            />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${form.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
              {form.isPublished ? 'Active' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Program Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:border-brand-green transition-colors"
            />
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Standard Course Fee (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-extrabold text-foreground focus:outline-none focus:border-brand-green transition-colors"
                  placeholder="e.g. 9999"
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1.5 block">Full standard registration fee before offer discount</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-gold-dark uppercase tracking-wider mb-1.5">
                Promotional Offer / Discount Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold-dark font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.discountPrice ?? ''}
                  onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full pl-9 pr-4 py-3 bg-background border border-brand-gold/40 rounded-2xl text-sm font-extrabold text-brand-green focus:outline-none focus:border-brand-gold transition-colors"
                  placeholder="e.g. 4999"
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1.5 block">Special offer price charged during student checkout</span>
            </div>
          </div>

          {/* Coupon Code Configuration Grid */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Special Promo Coupon Code (Extra Instant Discount)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Coupon Code (e.g. CAI2026)
                </label>
                <input
                  type="text"
                  value={form.couponCode}
                  onChange={e => setForm(f => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 bg-background border border-emerald-500/40 rounded-2xl text-sm font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g. CAI2026"
                />
                <span className="text-[10px] text-muted-foreground mt-1.5 block">Define a custom code (e.g. CAI2026, SPECIAL1999) for extra discount</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                  Fee with Coupon Code (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.couponDiscountPrice ?? ''}
                    onChange={e => setForm(f => ({ ...f, couponDiscountPrice: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full pl-9 pr-4 py-3 bg-background border border-emerald-500/40 rounded-2xl text-sm font-extrabold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. 1999"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1.5 block">Payable fee when student applies coupon at checkout</span>
              </div>
            </div>

            {form.couponCode && form.couponDiscountPrice && (
              <div className="bg-emerald-600 text-white rounded-xl p-3 text-xs font-extrabold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                <span>🎫 Active Coupon Code: <code className="bg-white/20 px-2 py-0.5 rounded font-black tracking-wider text-amber-200">{form.couponCode}</code></span>
                <span>Unlocks Special Fee: {formatPrice(Number(form.couponDiscountPrice))} (Extra Save {formatPrice(currentPayable - Number(form.couponDiscountPrice))})</span>
              </div>
            )}
          </div>

          {/* Student Checkout Pricing Live Preview Box */}
          <div className="bg-gradient-to-r from-brand-green/10 via-brand-gold/15 to-brand-green/10 border-2 border-brand-gold/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-brand-green">Live Student Checkout Pricing Preview</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-brand-green">
                  {formatPrice(currentPayable)}
                </span>
                {form.discountPrice && form.discountPrice < form.price && (
                  <span className="text-base font-semibold text-muted-foreground line-through">
                    {formatPrice(Number(form.price))}
                  </span>
                )}
              </div>
            </div>

            {discountPercent > 0 ? (
              <div className="px-4 py-2 bg-amber-500 text-white rounded-2xl text-xs font-extrabold shadow-sm flex items-center gap-2 border border-amber-400/40">
                <Sparkles className="h-4 w-4 text-amber-100" />
                <span>Special Offer: {discountPercent}% OFF (Save {formatPrice(savingsAmount)})</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground font-semibold italic">No active discount (Standard Fee Charged)</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Program Overview & Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-xs text-foreground focus:outline-none focus:border-brand-green resize-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Changes saved here update public pricing on <code className="font-bold text-brand-green">/academy</code> instantly.
          </span>

          <button
            type="submit"
            disabled={saving}
            className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Settings...' : 'Save CAI Program Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
