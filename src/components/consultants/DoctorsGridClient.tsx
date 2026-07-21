'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, HeartHandshake, Award, Languages } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
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

interface Consultant {
  id: number;
  userId: number;
  specialization: string;
  isCaiCertified: boolean;
  isAcfp: boolean;
  bio: string | null;
  experience: number;
  languages: string | null;
  rating: any;
  totalReviews: number;
  hasOnline: boolean;
  hasOffline: boolean;
  hasClinicPickup: boolean;
  hasSelfDispatch: boolean;
  hasAyurwedDelivery: boolean;
  consultationFee: any;
  user: {
    name: string | null;
    avatar: string | null;
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
        {visibleConsultants.map((c) => (
          <div
            key={c.id}
            className="card-premium p-6 flex flex-col sm:flex-row gap-6 group"
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
                  <h3 className="text-lg font-bold text-title-primary">{c.user?.name}</h3>
                  <p className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-wide mt-0.5">
                    {c.specialization}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {c.isCaiCertified && (
                    <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="h-2.5 w-2.5 text-brand-gold-dark" />
                      <span>ACP Certified</span>
                    </span>
                  )}
                  {c.isAcfp && (
                    <span className="bg-brand-gold/20 text-brand-gold-dark border border-brand-gold/30 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      <span>Platform Active</span>
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

              {/* Consultation Fee and CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-brand-green-light">
                <div>
                  <span className="text-[9px] text-muted-foreground block font-semibold">Consultation Fee</span>
                  <span className="text-lg font-extrabold text-title-primary">{formatPrice(Number(c.consultationFee))}</span>
                </div>
                <Link
                  href={`/doctors/${c.userId}`}
                  className="btn-book"
                >
                  <HeartHandshake className="h-3.5 w-3.5" />
                  <span>Book</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < consultants.length && (
        <div ref={loaderRef} className="py-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-brand-green font-bold bg-card border border-border px-5 py-2.5 rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-green border-t-transparent"></div>
            <span>Loading more consultants...</span>
          </div>
        </div>
      )}
    </div>
  );
}
