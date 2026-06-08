import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Star, ShieldCheck, HeartHandshake, Eye, Award, Languages } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

export const revalidate = 0; // Fresh updates

export default async function ConsultantsPage() {
  const consultants = await db.consultantProfile.findMany({
    include: {
      user: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center sm:text-left border-b border-brand-green-border/10 pb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">
          Certified Ayurveda Consultants
        </h1>
        <p className="text-sm sm:text-base text-brand-foreground/70">
          Book virtual diagnostic audits, Prakriti evaluations, and chronic symptom consultation guides.
        </p>
      </div>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {consultants.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6 group"
          >
            {/* Avatar block */}
            <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-brand-green-light flex-shrink-0 mx-auto">
              <Image
                src={c.user?.avatar || 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80'}
                alt={c.user?.name}
                fill
                sizes="(max-width: 768px) 96px, 144px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info details block */}
            <div className="flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-brand-green">{c.user?.name}</h3>
                  {c.isVerified && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Practitioner</span>
                    </span>
                  )}
                </div>
                
                <p className="text-xs font-bold text-brand-gold-dark uppercase tracking-wide">
                  {c.specialization}
                </p>

                <p className="text-sm text-brand-foreground/75 line-clamp-3 leading-relaxed">
                  {c.bio}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-brand-foreground/60">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-brand-green/75" />
                    <span>{c.experience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Languages className="h-4 w-4 text-brand-green/75" />
                    <span>{Array.isArray(c.languages) ? (c.languages as string[]).join(', ') : 'English'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-brand-gold pt-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold text-brand-green">{Number(c.rating).toFixed(1)}</span>
                  <span className="text-xs text-brand-foreground/40 font-medium">({c.totalReviews} reviews)</span>
                </div>
              </div>

              {/* Consultation Fee and CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-brand-green-light">
                <div>
                  <span className="text-[10px] text-brand-foreground/50 block font-semibold">Consultation Fee</span>
                  <span className="text-xl font-extrabold text-brand-green">{formatPrice(Number(c.consultationFee))}</span>
                </div>
                <Link
                  href={`/consultants/${c.userId}`}
                  className="bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 shadow hover:shadow-md flex items-center gap-1.5"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
