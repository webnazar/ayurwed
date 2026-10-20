'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, ArrowRight, Loader2, CreditCard, ShieldCheck, CheckCircle2, Lock, Sparkles, X, Smartphone, Globe, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, cn } from '@/lib/utils';

interface EnrollButtonProps {
  isLoggedIn: boolean;
  initialEnrolled: boolean;
  coursePrice?: number;
  courseDiscountPrice?: number | null;
  couponCode?: string | null;
  couponDiscountPrice?: number | null;
  variant?: 'default' | 'hero';
  className?: string;
}

export default function EnrollButton({
  isLoggedIn,
  initialEnrolled,
  coursePrice = 9999,
  courseDiscountPrice = 4999,
  couponCode = null,
  couponDiscountPrice = null,
  variant = 'default',
  className,
}: EnrollButtonProps) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStage, setPaymentStage] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentProgressMsg, setPaymentProgressMsg] = useState('');
  
  const [inputCoupon, setInputCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  const router = useRouter();

  let standardPayable = courseDiscountPrice !== null && courseDiscountPrice !== undefined ? courseDiscountPrice : coursePrice;
  
  const isCouponValid = appliedCoupon && couponCode && appliedCoupon.trim().toUpperCase() === couponCode.trim().toUpperCase();
  const payableFee = isCouponValid && couponDiscountPrice !== null && couponDiscountPrice !== undefined ? couponDiscountPrice : standardPayable;
  
  const totalSavings = coursePrice > payableFee ? coursePrice - payableFee : 0;
  const discountPercent = coursePrice > 0 && totalSavings > 0 ? Math.round((totalSavings / coursePrice) * 100) : 0;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');
    const cleanedInput = inputCoupon.trim().toUpperCase();

    if (!cleanedInput) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (couponCode && cleanedInput === couponCode.trim().toUpperCase() && couponDiscountPrice !== null && couponDiscountPrice !== undefined) {
      setAppliedCoupon(cleanedInput);
      toast.success(`Coupon code "${cleanedInput}" applied! Payable fee updated to ${formatPrice(couponDiscountPrice)}.`);
    } else {
      setCouponError('Invalid or expired coupon code');
      toast.error('Invalid or expired coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setInputCoupon('');
    setCouponError('');
    toast.success('Coupon removed');
  };

  const whatsappButton = (
    <a
      href="https://wa.me/919271711722?text=Hello%20AYURWED,%20I%20have%20an%20enquiry%20regarding%20the%20Certificate%20in%20Ancient%20Intelligence%20(CAI)%20program."
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba56] text-white px-8 py-4 rounded-full text-base shadow-lg hover:shadow-xl transition-all font-bold whitespace-nowrap"
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span>WhatsApp Enquiry</span>
    </a>
  );

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      router.push('/login?callbackUrl=/academy');
      return;
    }
    setShowPaymentModal(true);
    setPaymentStage('idle');
  };

  const handleSimulatedPayment = async () => {
    setPaymentStage('processing');
    setLoading(true);

    try {
      setPaymentProgressMsg('Connecting to secure payment gateway...');
      await new Promise((r) => setTimeout(r, 900));

      setPaymentProgressMsg('Authorizing course fee transaction...');
      await new Promise((r) => setTimeout(r, 900));

      setPaymentProgressMsg('Verifying enrollment credentials...');
      await new Promise((r) => setTimeout(r, 800));

      const res = await fetch('/api/academy/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payableFee,
          paymentMethod: selectedPaymentMode.toUpperCase(),
          appliedCoupon: appliedCoupon || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete enrollment');
      }

      setPaymentStage('success');
      toast.success('Payment Received! Enrollment Successful! 🎉');
      
      await new Promise((r) => setTimeout(r, 1200));

      setEnrolled(true);
      setShowPaymentModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error processing enrollment payment');
      setPaymentStage('idle');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && setShowPaymentModal(false)}
      />

      <div className="relative bg-card w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-border space-y-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-green text-lg leading-tight">AYURWED Demo Gateway</h3>
              <p className="text-xs text-muted-foreground">Test Enrollment Payment Processing</p>
            </div>
          </div>

          {!loading && (
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-1.5 text-muted-foreground hover:text-foreground bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {paymentStage === 'processing' ? (
          <div className="py-10 flex flex-col items-center text-center space-y-4">
            <Loader2 className="h-12 w-12 text-brand-green animate-spin" />
            <h4 className="font-extrabold text-base text-foreground">Processing Payment...</h4>
            <p className="text-xs text-brand-gold-dark font-bold font-mono animate-pulse">{paymentProgressMsg}</p>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Do not refresh or close this window</span>
          </div>
        ) : paymentStage === 'success' ? (
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce-slow">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="font-black text-xl text-brand-green">Payment Successful! 🎉</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Your enrollment in the Certificate in Ancient Intelligence (CAI) program is confirmed.
            </p>
          </div>
        ) : (
          <>
            {/* Order Fee Summary */}
            <div className="bg-muted/40 rounded-2xl p-4 space-y-2 border border-border text-xs">
              <div className="flex justify-between font-bold text-foreground">
                <span>Program</span>
                <span className="text-brand-green">Certificate in Ancient Intelligence (CAI)</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Standard Fee</span>
                <span className="line-through">{formatPrice(coursePrice)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{appliedCoupon ? `Coupon (${appliedCoupon}) Savings` : 'Promotional Offer Savings'}</span>
                  <span>-{formatPrice(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-foreground border-t border-border pt-2">
                <span>Total Amount Payable</span>
                <span className="text-brand-green">{formatPrice(payableFee)}</span>
              </div>
            </div>

            {/* Coupon Code Input in Modal */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-grow">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={e => {
                      setInputCoupon(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter Promo / Coupon Code"
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-brand-green"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shrink-0"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="bg-emerald-600/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-2.5 px-3 text-xs font-bold flex items-center justify-between">
                <span>🎫 Coupon <code className="bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono text-[11px]">{appliedCoupon}</code> Applied</span>
                <button type="button" onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-red-500 text-[11px] font-bold">Remove</button>
              </div>
            )}

            {couponError && (
              <p className="text-[11px] font-bold text-red-500 -mt-1 pl-1">{couponError}</p>
            )}

            {/* Payment Mode Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select Payment Method (Demo):
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Globe },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedPaymentMode(mode.id as any)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedPaymentMode === mode.id
                        ? 'border-brand-green bg-brand-green/10 font-bold text-brand-green'
                        : 'border-border text-muted-foreground hover:border-brand-green/40'
                    }`}
                  >
                    <mode.icon className="h-5 w-5" />
                    <span className="text-xs">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulatedPayment}
                className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Pay {formatPrice(payableFee)} & Complete Enrollment</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (variant === 'hero') {
    if (enrolled) {
      return (
        <Link
          href="/user/cai"
          className={cn(
            "w-full sm:w-80 px-6 py-4 btn-gold rounded-full text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 font-black whitespace-nowrap transition-all",
            className
          )}
        >
          <Award className="h-5 w-5" />
          <span>Go to My Courses</span>
        </Link>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={handleEnrollClick}
          className={cn(
            "w-full sm:w-80 px-6 py-4 btn-gold rounded-full text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 font-black whitespace-nowrap transition-all cursor-pointer",
            className
          )}
        >
          <Award className="h-5 w-5" />
          <span>{isLoggedIn ? `Enroll Now — ${formatPrice(payableFee)}` : 'Enroll Now'}</span>
        </button>

        {showPaymentModal && renderPaymentModal()}
      </>
    );
  }

  if (enrolled) {
    return (
      <div className="pt-8 border-t border-border space-y-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200">You are Enrolled in CAI Program!</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-1">
              Your enrollment is active. Access your courses, lessons, and AI tutors in your dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          <Link
            href="/user/cai"
            className="inline-flex items-center justify-center gap-2 btn-green px-8 py-4 rounded-full text-base shadow-lg hover:shadow-xl transition-all font-bold whitespace-nowrap"
          >
            Go to My Courses <ArrowRight className="h-5 w-5" />
          </Link>
          {whatsappButton}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 border-t border-border space-y-6">
      {/* Fee & Coupon Banner */}
      <div className="bg-gradient-to-r from-brand-green/10 via-brand-gold/15 to-brand-green/10 border-2 border-brand-gold/30 rounded-3xl p-6 space-y-4 max-w-3xl mx-auto text-left shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold-dark block">
              Flagship Certification & Practice Suite
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-brand-green">
                {formatPrice(payableFee)}
              </span>
              {coursePrice > payableFee && (
                <span className="text-base font-bold text-muted-foreground line-through">
                  {formatPrice(coursePrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-brand-green flex items-center gap-1 pt-0.5">
              <Sparkles className="h-3 w-3 text-brand-gold" />
              Includes Complimentary AI Digital Prescription Software during subscription period
            </p>
          </div>

          {discountPercent > 0 && (
            <div className="bg-amber-500 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm border border-amber-400/40 flex items-center gap-1.5 shrink-0">
              <Sparkles className="h-4 w-4 text-amber-100" />
              <span>Special Offer: {discountPercent}% OFF (Save {formatPrice(totalSavings)})</span>
            </div>
          )}
        </div>

        {/* Promo Coupon Code Input Box */}
        <div className="pt-3 border-t border-brand-green/15">
          {appliedCoupon ? (
            <div className="bg-emerald-600 text-white rounded-2xl p-3 px-4 text-xs font-extrabold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-200" />
                <span>Coupon <code className="bg-white/20 px-2 py-0.5 rounded font-black tracking-widest text-amber-200">{appliedCoupon}</code> Applied — Fee reduced to {formatPrice(payableFee)}!</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-white/80 hover:text-white underline text-[11px] font-bold"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-grow">
                <Tag className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={e => {
                    setInputCoupon(e.target.value);
                    setCouponError('');
                  }}
                  placeholder="Have a Promo / Coupon Code? (e.g. CAI2026)"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all shadow-xs shrink-0"
              >
                Apply Coupon
              </button>
            </form>
          )}

          {couponError && (
            <p className="text-[11px] font-bold text-red-500 mt-1.5 pl-1">{couponError}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={handleEnrollClick}
          className="inline-flex items-center justify-center gap-2.5 btn-gold px-8 py-4 rounded-full text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all font-black whitespace-nowrap transform hover:-translate-y-0.5"
        >
          <Award className="h-6 w-6" />
          <span>{isLoggedIn ? `Enroll Now — ${formatPrice(payableFee)}` : 'Login to Enroll'}</span>
        </button>
        {whatsappButton}
      </div>

      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold text-center">
        Secure Enrollment via Demo Payment Gateway • Instant Access
      </p>

      {/* Demo Payment Gateway Modal */}
      {showPaymentModal && renderPaymentModal()}
    </div>
  );
}
