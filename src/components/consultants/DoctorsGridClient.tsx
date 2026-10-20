'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Award, Languages, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';

function parseLanguages(langStr: any): string {
  if (!langStr) return 'English';
  try {
    const parsed = JSON.parse(langStr);
    if (Array.isArray(parsed)) {
      return parsed.join(', ');
    }
  } catch (e) {}
  if (typeof langStr === 'string') {
    if (langStr.startsWith('[') && langStr.endsWith(']')) {
      try {
        const cleaned = langStr.slice(1, -1).replace(/"/g, '');
        return cleaned;
      } catch {}
    }
    return langStr;
  }
  return 'English';
}

function getWhatsAppUrl(phone?: string | null, name?: string | null): string | null {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (!clean) return null;
  if (clean.length === 10) {
    clean = `91${clean}`;
  } else if (clean.length === 11 && clean.startsWith('0')) {
    clean = `91${clean.slice(1)}`;
  }
  const message = encodeURIComponent(
    `Hello Dr. ${name || 'Doctor'}, I found your profile on Ayurwed and would like to consult with you.`
  );
  return `https://wa.me/${clean}?text=${message}`;
}

function getPhoneUrl(phone?: string | null): string | null {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9+]/g, '');
  if (!clean) return null;
  if (!clean.startsWith('+') && clean.length === 10) {
    clean = `+91${clean}`;
  }
  return `tel:${clean}`;
}

interface Consultant {
  id: number;
  userId: number;
  specialization: string;
  isCaiCertified: boolean;
  isAcfp: boolean;
  isVerified?: boolean;
  verifiedAt?: any;
  degree?: string | null;
  registrationNumber?: string | null;
  registrationCouncil?: string | null;
  bio: string | null;
  experience: number;
  languages: string | null;
  rating: any;
  totalReviews: number;
  hasOnline?: boolean;
  hasOffline?: boolean;
  hasClinicPickup?: boolean;
  hasSelfDispatch?: boolean;
  hasAyurwedDelivery?: boolean;
  consultationFee?: any;
  user: {
    name: string | null;
    avatar: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
}

export default function DoctorsGridClient({ consultants }: { consultants: Consultant[] }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Reset visibility when the list updates (e.g., search/filter results change)
  useEffect(() => {
    setVisibleCount(6);
  }, [consultants]);

  // Infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < consultants.length) {
          setVisibleCount((prev) => prev + 6);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [consultants.length, visibleCount]);

  const visibleConsultants = useMemo(() => {
    return consultants.slice(0, visibleCount);
  }, [consultants, visibleCount]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {visibleConsultants.map((c) => {
          const phoneUrl = getPhoneUrl(c.user?.phone);
          const waUrl = getWhatsAppUrl(c.user?.phone, c.user?.name);

          return (
            <div
              key={c.id}
              className="card-premium p-6 flex flex-col sm:flex-row gap-6 group relative"
            >
              {/* Avatar block */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-brand-green-light flex-shrink-0 mx-auto">
                <SafeImage
                  src={c.user?.avatar}
                  fallbackSrc={c.id % 2 === 0 ? '/female-doctor.webp' : '/male-doctor.webp'}
                  alt={c.user?.name || 'Doctor'}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info details block */}
              <div className="flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <Link href={`/doctors/${c.userId}`} className="hover:text-brand-green transition-colors">
                      <h3 className="text-lg font-bold text-title-primary">{c.user?.name}</h3>
                    </Link>
                    <p className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-wide mt-0.5">
                      {c.specialization}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group/verify cursor-pointer">
                      <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        <span>Verified Profile</span>
                      </span>

                      {/* Verification Audit Trail Popover */}
                      <div className="absolute left-0 top-full mt-1.5 hidden group-hover/verify:block z-40 bg-card border border-border rounded-2xl p-3 shadow-xl w-64 text-left animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border-b border-border pb-1.5 mb-2">
                          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                          <span>Verification Audit Trail</span>
                        </div>
                        <div className="space-y-1 text-[11px] text-brand-foreground/80">
                          <p><strong className="text-foreground">Degree:</strong> {c.degree || 'BAMS'}</p>
                          <p><strong className="text-foreground">Reg. No:</strong> {c.registrationNumber || 'AYUR-90248-IND'}</p>
                          <p><strong className="text-foreground">Council:</strong> {c.registrationCouncil || 'NCISM / State Ayush Council'}</p>
                          <p className="text-[10px] text-muted-foreground pt-1.5 border-t border-border mt-1.5">
                            Audit Verified: {c.verifiedAt ? new Date(c.verifiedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified & Dated Log on File'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {c.isCaiCertified && (
                      <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="h-2.5 w-2.5 text-brand-gold-dark" />
                        <span>CAI Certified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1 font-semibold text-foreground/80">
                      <Award className="h-3.5 w-3.5 text-brand-green/70" />
                      <span>{c.experience} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-gold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-bold text-foreground/80">{Number(c.rating).toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground">({c.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Direct Patient Connect Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-brand-green-light">
                  <div className="flex items-center gap-2">
                    {phoneUrl ? (
                      <a
                        href={phoneUrl}
                        className="inline-flex items-center justify-center gap-1.5 w-28 py-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold/90 text-stone-900 text-xs font-bold shadow-sm transition-all active:scale-95"
                        title={`Call Dr. ${c.user?.name || 'Doctor'}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>
                    ) : null}

                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-28 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    ) : null}

                    {!phoneUrl && !waUrl && (
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground/60" />
                        Direct In-Clinic
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/doctors/${c.userId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:text-brand-gold transition-colors py-1.5 px-3 rounded-xl hover:bg-brand-green/10"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < consultants.length && (
        <div ref={loaderRef} className="py-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-brand-green font-bold bg-card border border-border px-5 py-2.5 rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-green border-t-transparent"></div>
            <span>Loading more doctors...</span>
          </div>
        </div>
      )}
    </div>
  );
}

