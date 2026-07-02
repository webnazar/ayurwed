import React, { Suspense } from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Star, ShieldCheck, HeartHandshake, Award, Languages, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import ConsultantFilterSidebarClient from '@/components/consultants/ConsultantFilterSidebarClient';
import AyuriTriggerButton from '@/components/layout/AyuriTriggerButton';

export const revalidate = 0; // Fresh updates

interface ConsultantsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ConsultantsPage(props: ConsultantsPageProps) {
  const searchParams = await props.searchParams;
  const getSingleParam = (param: string | string[] | undefined) => Array.isArray(param) ? param[0] : (param || '');

  const searchKeyword = getSingleParam(searchParams.search);
  const expParam = getSingleParam(searchParams.experience);
  const selectedExperience = expParam ? expParam.split(',') : [];

  const priceParam = getSingleParam(searchParams.price);
  const selectedPrice = priceParam ? priceParam.split(',') : [];

  const typesParam = getSingleParam(searchParams.types);
  const selectedTypes = typesParam ? typesParam.split(',') : [];

  const fulfillmentsParam = getSingleParam(searchParams.fulfillments);
  const selectedFulfillments = fulfillmentsParam ? fulfillmentsParam.split(',') : [];

  const sortOption = getSingleParam(searchParams.sort);

  const whereConditions: any = {
    isCaiCertified: true,
    isAcfp: true
  };
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

  // 3. Price Filter
  if (selectedPrice.length > 0) {
    const priceOr: any[] = [];
    selectedPrice.forEach((price) => {
      if (price === '0') priceOr.push({ consultationFee: 0 });
      if (price === '1-100') priceOr.push({ consultationFee: { gte: 1, lte: 100 } });
      if (price === '100-500') priceOr.push({ consultationFee: { gte: 100, lte: 500 } });
      if (price === '500-1000') priceOr.push({ consultationFee: { gte: 500, lte: 1000 } });
      if (price === '1000+') priceOr.push({ consultationFee: { gte: 1000 } });
    });
    if (priceOr.length > 0) {
      andConditions.push({ OR: priceOr });
    }
  }

  // 4. Consultation Type Filter
  if (selectedTypes.length > 0) {
    const typeConditions: any[] = [];
    selectedTypes.forEach((t) => {
      if (t === 'online') typeConditions.push({ hasOnline: true });
      if (t === 'offline') typeConditions.push({ hasOffline: true });
    });
    if (typeConditions.length > 0) {
      andConditions.push({ OR: typeConditions });
    }
  }

  // 5. Fulfillment Method Filter
  if (selectedFulfillments.length > 0) {
    const fulfillmentConditions: any[] = [];
    selectedFulfillments.forEach((f) => {
      if (f === 'courier') fulfillmentConditions.push({ fulfillmentMethod: 'COURIER' });
      if (f === 'pickup') fulfillmentConditions.push({ fulfillmentMethod: 'PICKUP' });
    });
    if (fulfillmentConditions.length > 0) {
      andConditions.push({ OR: fulfillmentConditions });
    }
  }

  if (andConditions.length > 0) {
    whereConditions.AND = andConditions;
  }

  const orderBy: any[] = [];
  if (sortOption === 'price_asc') {
    orderBy.push({ consultationFee: 'asc' });
  } else if (sortOption === 'price_desc') {
    orderBy.push({ consultationFee: 'desc' });
  }

  // Default sorting
  orderBy.push({ isVerified: 'desc' });
  orderBy.push({ rating: 'desc' });

  const consultants = await db.consultantProfile.findMany({
    where: whereConditions,
    include: {
      user: true,
    },
    orderBy,
  });

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal py-10">
      {/* Header (border-b removed as requested) */}
      <div className="text-center sm:text-left pb-8 space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-title-primary tracking-tight">
              Certified Ayurveda Doctors
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Book virtual diagnostic audits, Prakriti evaluations, and chronic symptom consultation guides.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-end w-full sm:w-auto mt-4 sm:mt-0">
            <AyuriTriggerButton />
            <Link 
              href="/doctors?price=0" 
              className="btn-secondary text-sm sm:text-base w-full sm:w-[260px] shadow-sm hover:shadow-lg"
            >
              <HeartHandshake className="h-5 w-5 flex-shrink-0" />
              <span>Free Consultation</span>
            </Link>
          </div>
        </div>

        {/* Global Search */}
        <form method="GET" action="/doctors" className="relative mt-8 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-foreground/40" />
          <input
            type="text"
            name="search"
            defaultValue={searchKeyword}
            placeholder="Search doctors by name or specialization..."
            className="w-full bg-card text-brand-foreground text-sm sm:text-base border border-border rounded-full py-4 pl-12 pr-6 shadow-sm focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all"
          />
          {selectedExperience.length > 0 && (
            <input type="hidden" name="experience" value={selectedExperience.join(',')} />
          )}
          {selectedPrice.length > 0 && (
            <input type="hidden" name="price" value={selectedPrice.join(',')} />
          )}
          {selectedTypes.length > 0 && (
            <input type="hidden" name="types" value={selectedTypes.join(',')} />
          )}
          {selectedFulfillments.length > 0 && (
            <input type="hidden" name="fulfillments" value={selectedFulfillments.join(',')} />
          )}
          {sortOption && (
            <input type="hidden" name="sort" value={sortOption} />
          )}
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-search">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
        {/* Sidebar Filters (Desktop) */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<div className="bg-card rounded-3xl p-6 h-64 border border-border animate-pulse"></div>}>
            <ConsultantFilterSidebarClient
              initialSearch={searchKeyword}
              initialExperience={selectedExperience}
              initialPrice={selectedPrice}
              initialSort={sortOption}
              initialTypes={selectedTypes}
              initialFulfillments={selectedFulfillments}
            />
          </Suspense>
        </aside>

        {/* Consultants Grid */}
        <main className="lg:col-span-3">
          {consultants.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {consultants.map((c) => (
                <div
                  key={c.id}
                  className="card-premium p-6 flex flex-col sm:flex-row gap-6 group"
                >
                  {/* Avatar block */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-brand-green-light flex-shrink-0 mx-auto">
                    <Image
                      src={c.user?.avatar || (c.id % 2 === 0 ? '/female-doctor.webp' : '/male-doctor.webp')}
                      alt={c.user?.name || 'Doctor'}
                      fill
                      sizes="112px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info details block */}
                  <div className="flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-title-primary">{c.user?.name}</h3>
                        {c.isCaiCertified && (
                          <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Award className="h-2.5 w-2.5 text-brand-gold-dark" />
                            <span>CAI Certified</span>
                          </span>
                        )}
                        {c.isAcfp && (
                          <span className="bg-brand-gold/20 text-brand-gold-dark border border-brand-gold/30 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            <span>ACFP Verified</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-wide">
                        {c.specialization}
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {c.bio}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-muted-foreground">
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
                        <span className="text-xs font-bold text-title-primary">{Number(c.rating).toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground/80 font-medium">({c.totalReviews} reviews)</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1.5 text-[9px]">
                        {c.hasOnline && (
                          <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-bold">✓ Online</span>
                        )}
                        {c.hasOffline && (
                          <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-bold">✓ Offline</span>
                        )}
                        {c.isAcfp && (
                          <span className="bg-brand-gold/15 text-brand-gold-dark px-2 py-0.5 rounded-full font-extrabold shadow-sm border border-brand-gold/20">
                            ✓ {c.fulfillmentMethod === 'COURIER' ? 'Courier Delivery' : 'Clinic Pickup'}
                          </span>
                        )}
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
          ) : (
            <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm space-y-4">
              <HeartHandshake className="h-12 w-12 text-brand-foreground/30 mx-auto" />
              <h3 className="text-xl font-bold text-title-primary">No Doctors Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                We couldn't find any doctors matching your criteria. Try adjusting your search or experience filter.
              </p>
              <Link href="/doctors" className="btn-primary text-sm px-6 py-2.5 inline-flex">
                Clear Filters
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
