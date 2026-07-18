import React, { Suspense } from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Star, ShieldCheck, HeartHandshake, Award, Languages, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import SafeImage from '@/components/ui/SafeImage';
import ConsultantFilterSidebarClient from '@/components/consultants/ConsultantFilterSidebarClient';
import DoctorsGridClient from '@/components/consultants/DoctorsGridClient';

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
      if (f === 'clinic_pickup') fulfillmentConditions.push({ hasClinicPickup: true });
      if (f === 'self_dispatch') fulfillmentConditions.push({ hasSelfDispatch: true });
      if (f === 'ayurwed_delivery') fulfillmentConditions.push({ hasAyurwedDelivery: true });
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

  const safeConsultants = consultants.map((c) => ({
    ...c,
    consultationFee: Number(c.consultationFee),
    followUpFee: Number(c.followUpFee),
    rating: Number(c.rating),
  }));

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
          {safeConsultants.length > 0 ? (
            <DoctorsGridClient consultants={safeConsultants} />
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
