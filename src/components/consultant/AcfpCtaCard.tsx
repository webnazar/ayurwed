'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Award, ShieldCheck, CheckCircle2, BookOpen, Sparkles, 
  Loader2, ArrowRight, Lock, ShieldAlert, Check 
} from 'lucide-react';
import Link from 'next/link';

interface AcfpCtaCardProps {
  isCaiCertified: boolean;
  isAcfp: boolean;
  isPending?: boolean;
}

export default function AcfpCtaCard({ isCaiCertified, isAcfp, isPending }: AcfpCtaCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    const toastId = toast.loading('Submitting ACFP verification...');
    try {
      const res = await fetch('/api/consultant/acfp', {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Congratulations! You are now an AYURWED Certified Consultant & Fulfillment Partner!', { id: toastId });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to submit application.', { id: toastId });
      }
    } catch {
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-extrabold text-brand-green dark:text-foreground">Professional Credentials & Status</h2>
        <p className="text-xs text-brand-foreground/50 dark:text-muted-foreground mt-1">
          Manage your educational standing and verified network membership options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CARD 1: Certificate in Ancient Intelligence (CAI) */}
        <div className={`relative overflow-hidden rounded-3xl border p-8 flex flex-col justify-between h-full transition-all duration-300 shadow-sm ${
          isCaiCertified 
            ? 'bg-brand-green-light/20 border-brand-green/20 dark:bg-brand-green-light/5 dark:border-brand-green/20' 
            : 'bg-brand-gold-light/30 border-brand-gold/30 dark:bg-brand-gold-light/5 dark:border-brand-gold/20'
        }`}>
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${
                isCaiCertified 
                  ? 'bg-brand-green/15 text-brand-green dark:text-brand-green-light' 
                  : 'bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold'
              }`}>
                <BookOpen className="h-6 w-6" />
              </div>
              {isCaiCertified ? (
                <span className="inline-flex items-center gap-1 bg-brand-green text-white dark:bg-brand-green dark:text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-green/35 shadow-sm">
                  <Check className="h-3 w-3" /> Certified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-brand-gold/20 text-brand-gold-dark dark:text-brand-gold text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-gold/30">
                  Required Foundation
                </span>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-foreground/40 dark:text-muted-foreground">Option 01: Education</span>
              <h3 className="text-xl font-bold text-brand-green dark:text-foreground">
                Certificate in Ancient Intelligence (CAI)
              </h3>
              <p className="text-sm text-brand-foreground/70 dark:text-muted-foreground leading-relaxed">
                The flagship educational certification of AYURWED Academy. Learn to integrate Ancient Intelligence, Artificial Intelligence, and the Ancient Intelligence Prescription Platform into your clinical practice.
              </p>
            </div>
          </div>

          <div className="pt-8">
            {isCaiCertified ? (
              <Link
                href="/academy"
                className="w-full bg-transparent hover:bg-brand-green-light dark:hover:bg-brand-green-light/10 text-brand-green dark:text-brand-green border border-brand-green/30 font-bold px-5 py-3 rounded-full transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>View Academy Curriculum</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/academy"
                className="w-full bg-brand-green text-white dark:bg-brand-gold dark:text-black font-black px-5 py-3 rounded-full hover:bg-brand-gold hover:text-brand-green dark:hover:bg-white dark:hover:text-black transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Enroll in CAI Certification</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* CARD 2: AYURWED Certified Consultant & Fulfillment Partner (ACFP) */}
        <div className={`relative overflow-hidden rounded-3xl border p-8 flex flex-col justify-between h-full transition-all duration-300 shadow-sm ${
          isAcfp 
            ? 'bg-brand-green-light/20 border-brand-green/20 dark:bg-brand-green-light/5 dark:border-brand-green/20' 
            : isPending 
              ? 'bg-brand-gold-light/20 border-brand-gold/30 dark:bg-brand-gold-light/5 dark:border-brand-gold/20'
              : isCaiCertified
                ? 'bg-gradient-to-br from-brand-green to-[#0e3a1b] text-white dark:from-card dark:to-brand-green-light/30 dark:text-foreground border-2 border-brand-gold/20'
                : 'bg-muted/50 border-border dark:bg-muted/10 opacity-75'
        }`}>
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${
                isAcfp 
                  ? 'bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold' 
                  : isPending
                    ? 'bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold animate-pulse'
                    : isCaiCertified
                      ? 'bg-brand-gold/20 text-brand-gold'
                      : 'bg-foreground/5 text-foreground/40'
              }`}>
                {isCaiCertified ? <Award className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
              </div>
              {isAcfp ? (
                <span className="inline-flex items-center gap-1 bg-brand-gold text-brand-green dark:bg-brand-gold/20 dark:text-brand-gold text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-brand-gold shadow-sm">
                  <Sparkles className="h-3 w-3" /> Verified Partner
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1 bg-brand-gold/20 text-brand-gold-dark dark:text-brand-gold text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-gold/30 animate-pulse">
                  Pending Audit
                </span>
              ) : isCaiCertified ? (
                <span className="inline-flex items-center gap-1 bg-brand-gold/20 text-brand-gold text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-gold/30">
                  Eligible to Apply
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-foreground/5 text-foreground/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-border">
                  Locked
                </span>
              )}
            </div>

            <div className="space-y-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isCaiCertified && !isAcfp && !isPending ? 'text-brand-gold/80' : 'text-brand-foreground/40 dark:text-muted-foreground'}`}>
                Option 02: Verified Network
              </span>
              <h3 className={`text-xl font-bold ${isCaiCertified && !isAcfp && !isPending ? 'text-white dark:text-foreground' : 'text-brand-green dark:text-foreground'}`}>
                AYURWED Certified Partner (ACFP)
              </h3>
              <p className={`text-sm ${isCaiCertified && !isAcfp && !isPending ? 'text-brand-green-light dark:text-muted-foreground' : 'text-brand-foreground/70 dark:text-muted-foreground'} leading-relaxed`}>
                Professional recognition and verified membership. Join a curated network of trusted Ayurvedic practitioners using Ancient Intelligence to deliver personalized patient care and medicine fulfillment.
              </p>
            </div>
          </div>

          <div className="pt-8">
            {isAcfp ? (
              <button
                disabled
                className="w-full bg-brand-green/10 text-brand-green dark:bg-brand-green/20 dark:text-brand-green-light border border-brand-green/20 font-bold px-5 py-3 rounded-full text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <ShieldCheck className="h-4 w-4 text-brand-gold" />
                <span>Verified & Active Partner</span>
              </button>
            ) : isPending ? (
              <button
                disabled
                className="w-full bg-brand-gold/10 text-brand-gold-dark dark:bg-brand-gold/10 dark:text-brand-gold border border-brand-gold/20 font-bold px-5 py-3 rounded-full text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Under Administrative Review</span>
              </button>
            ) : isCaiCertified ? (
              <button
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-brand-gold text-brand-green dark:bg-brand-green dark:text-white dark:hover:bg-brand-gold dark:hover:text-black hover:bg-white hover:text-brand-green font-black px-5 py-3 rounded-full shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Apply for ACFP Verification</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-foreground/5 text-foreground/35 dark:bg-foreground/5 dark:text-foreground/30 border border-border font-bold px-5 py-3 rounded-full text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                <span>Complete CAI to Unlock</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
