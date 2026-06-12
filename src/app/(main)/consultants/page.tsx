import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Star, ShieldCheck, HeartHandshake, Award, Languages, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import ConsultantFilterSidebarClient from '@/components/consultants/ConsultantFilterSidebarClient';

export const revalidate = 0; // Fresh updates

interface ConsultantsPageProps {
  searchParams: { search?: string; experience?: string };
}

export default async function ConsultantsPage({ searchParams }: ConsultantsPageProps) {
  const searchKeyword = searchParams.search || '';
  const selectedExperience = searchParams.experience ? searchParams.experience.split(',') : [];

  const whereConditions: any = {};
  const andConditions: any[] = [];

  // 1. Search Filter
  if (searchKeyword) {
    andConditions.push({
      OR: [
        { user: { name: { contains: searchKeyword } } },
        { specialization: { contains: searchKeyword } }
      ]
    });
  }

  // 2. Experience Filter
  if (selectedExperience.length > 0) {
    const expOr: any[] = [];
    selectedExperience.forEach((exp) => {
      if (exp === '0-5') expOr.push({ experience: { gte: 0, lte: 5 } });
      if (exp === '6-10') expOr.push({ experience: { gte: 6, lte: 10 } });
      if (exp === '11-15') expOr.push({ experience: { gte: 11, lte: 15 } });
      if (exp === '16-20') expOr.push({ experience: { gte: 16, lte: 20 } });
      if (exp === '20+') expOr.push({ experience: { gte: 21 } });
    });
    if (expOr.length > 0) {
      andConditions.push({ OR: expOr });
    }
  }

  if (andConditions.length > 0) {
    whereConditions.AND = andConditions;
  }

  const consultants = await db.consultantProfile.findMany({
    where: whereConditions,
    include: {
      user: true,
    },
    orderBy: [
      { isFeatured: 'desc' },
      { isVerified: 'desc' },
      { rating: 'desc' },
    ]
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header (border-b removed as requested) */}
      <div className="text-center sm:text-left pb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">
          Certified Ayurveda Consultants
        </h1>
        <p className="text-sm sm:text-base text-brand-foreground/70">
          Book virtual diagnostic audits, Prakriti evaluations, and chronic symptom consultation guides.
        </p>

        {/* Global Search */}
        <form method="GET" action="/consultants" className="relative mt-8 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-foreground/40" />
          <input
            type="text"
            name="search"
            defaultValue={searchKeyword}
            placeholder="Search consultants by name or specialization..."
            className="w-full bg-white text-brand-foreground text-sm sm:text-base border border-brand-green-border/20 rounded-full py-4 pl-12 pr-6 shadow-sm focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all"
          />
          {selectedExperience.length > 0 && (
            <input type="hidden" name="experience" value={selectedExperience.join(',')} />
          )}
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold hover:text-brand-green transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
        {/* Sidebar Filters (Desktop) */}
        <aside className="lg:col-span-1">
          <ConsultantFilterSidebarClient
            initialSearch={searchKeyword}
            initialExperience={selectedExperience}
          />
        </aside>

        {/* Consultants Grid */}
        <main className="lg:col-span-3">
          {consultants.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {consultants.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6 group"
                >
                  {/* Avatar block */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-brand-green-light flex-shrink-0 mx-auto">
                    <Image
                      src={c.user?.avatar || 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80'}
                      alt={c.user?.name || 'Consultant'}
                      fill
                      sizes="112px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info details block */}
                  <div className="flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-brand-green">{c.user?.name}</h3>
                        {c.isVerified && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-wide">
                        {c.specialization}
                      </p>

                      <p className="text-xs text-brand-foreground/75 line-clamp-2 leading-relaxed">
                        {c.bio}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-brand-foreground/60">
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-brand-green/75" />
                          <span>{c.experience} Years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Languages className="h-3 w-3 text-brand-green/75" />
                          <span>{Array.isArray(c.languages) ? (c.languages as string[]).join(', ') : 'English'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-brand-gold pt-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-bold text-brand-green">{Number(c.rating).toFixed(1)}</span>
                        <span className="text-[10px] text-brand-foreground/40 font-medium">({c.totalReviews} reviews)</span>
                      </div>
                    </div>

                    {/* Consultation Fee and CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-brand-green-light">
                      <div>
                        <span className="text-[9px] text-brand-foreground/50 block font-semibold">Consultation Fee</span>
                        <span className="text-lg font-extrabold text-brand-green">{formatPrice(Number(c.consultationFee))}</span>
                      </div>
                      <Link
                        href={`/consultants/${c.userId}`}
                        className="bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow flex items-center gap-1"
                      >
                        <HeartHandshake className="h-3.5 w-3.5" />
                        <span>Book</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
              <HeartHandshake className="h-12 w-12 text-brand-foreground/30 mx-auto" />
              <h3 className="text-xl font-bold text-brand-green">No Consultants Found</h3>
              <p className="text-brand-foreground/60 text-sm max-w-sm mx-auto">
                We couldn't find any consultants matching your criteria. Try adjusting your search or experience filter.
              </p>
              <Link href="/consultants" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold hover:text-brand-green transition-colors">
                Clear Filters
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
