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
    const toastId = toast.loading('Initializing Platform Access activation...');
    try {
      const res = await fetch('/api/consultant/acfp', {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Congratulations! Your Yearly Platform Access is now Active!', { id: toastId });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to activate Platform Access.', { id: toastId });
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
          Manage your educational credentials and active platform subscription details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
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
                  ? 'bg-brand-green/15 text-brand-green dark:text-brand-green' 
                  : 'bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold'
              }`}>
                <BookOpen className="h-6 w-6" />
              </div>
              {isCaiCertified ? (
                <span className="inline-flex items-center gap-1 bg-brand-green text-white dark:bg-brand-green dark:text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-green/35 shadow-sm">
                  <Check className="h-3 w-3" /> ACP Certified
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
                Earn the title of **AYURWED Certified Practitioner (ACP)** upon completing our flagship educational program. Learn to integrate Ancient Intelligence, Artificial Intelligence, and the Ancient Intelligence Prescription Platform into your clinical practice.
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

        {/* CARD 2: Yearly Platform Subscription (Platform Fee) */}
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
                  <Sparkles className="h-3 w-3" /> Platform Active
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1 bg-brand-gold/20 text-brand-gold-dark dark:text-brand-gold text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-gold/30 animate-pulse">
                  Activation Pending
                </span>
              ) : isCaiCertified ? (
                <span className="inline-flex items-center gap-1 bg-brand-gold/20 text-brand-gold text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-gold/30">
                  Ready to Activate
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-foreground/5 text-foreground/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-border">
                  Locked
                </span>
              )}
            </div>

            <div className="space-y-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isCaiCertified && !isAcfp && !isPending ? 'text-brand-gold/80' : 'text-brand-foreground/40 dark:text-muted-foreground'}`}>
                Option 02: Yearly Subscription
              </span>
              <h3 className={`text-xl font-bold ${isCaiCertified && !isAcfp && !isPending ? 'text-white dark:text-foreground' : 'text-brand-green dark:text-foreground'}`}>
                Yearly Platform Access
              </h3>
              <p className={`text-sm ${isCaiCertified && !isAcfp && !isPending ? 'text-brand-green-light dark:text-muted-foreground' : 'text-brand-foreground/70 dark:text-muted-foreground'} leading-relaxed`}>
                Access to clinical practice tools. Keep your professional profile, scheduling systems, digital prescription writer, and patient tracking tools active on the platform with our simple yearly subscription.
              </p>
            </div>
          </div>

          <div className="pt-8">
            {isAcfp ? (
              <button
                disabled
                className="w-full bg-brand-green/10 text-brand-green dark:bg-brand-green/20 dark:text-brand-green border border-brand-green/20 font-bold px-5 py-3 rounded-full text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <ShieldCheck className="h-4 w-4 text-brand-gold" />
                <span>Subscription Active & Paid</span>
              </button>
            ) : isPending ? (
              <button
                disabled
                className="w-full bg-brand-gold/10 text-brand-gold-dark dark:bg-brand-gold/10 dark:text-brand-gold border border-brand-gold/20 font-bold px-5 py-3 rounded-full text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Activation Under Review</span>
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
                    <span>Activating platform access...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Pay Platform Fee & Activate</span>
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
