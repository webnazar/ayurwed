import React, { Suspense } from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Search, UserRoundCheck } from 'lucide-react';
import ConsultantFilterSidebarClient from '@/components/consultants/ConsultantFilterSidebarClient';
import DoctorsGridClient from '@/components/consultants/DoctorsGridClient';
import AyuriTriggerButton from '@/components/layout/AyuriTriggerButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certified Ayurvedic Doctors Directory & Practitioner List | AYURWED',
  description: 'Connect directly with certified Ayurvedic doctors and clinical practitioners for holistic treatments, wellness guidance, and classical remedies across India.',
  keywords: ['Ayurvedic Doctors Directory', 'Ayurveda Practitioners', 'Connect with Ayurvedic Doctors', 'AYURWED Doctors', 'Ayurvedic Consultant Phone WhatsApp', 'Ayurvedic Doctor List'],
  alternates: {
    canonical: 'https://www.ayurwed.com/doctors',
  },
  openGraph: {
    title: 'Certified Ayurvedic Doctors Directory | AYURWED',
    description: 'Connect directly with certified Ayurvedic doctors and clinical practitioners for holistic wellness guidance and consultations.',
    url: 'https://www.ayurwed.com/doctors',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.ayurwed.com/icon.png',
        width: 512,
        height: 512,
        alt: 'AYURWED Doctors Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Certified Ayurvedic Doctors Directory | AYURWED',
    description: 'Connect directly with certified Ayurvedic doctors and clinical practitioners across India.',
    images: ['https://www.ayurwed.com/icon.png'],
  },
};

export const revalidate = 0; // Fresh updates

interface ConsultantsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ConsultantsPage(props: ConsultantsPageProps) {
  const searchParams = await props.searchParams;
  const getSingleParam = (param: string | string[] | undefined) => Array.isArray(param) ? param[0] : (param || '');

  const searchKeyword = getSingleParam(searchParams.search);
  const expParam = getSingleParam(searchParams.experience);
  const selectedExperience = expParam ? expParam.split(',').filter(Boolean) : [];

  const langParam = getSingleParam(searchParams.languages);
  const selectedLanguages = langParam ? langParam.split(',').filter(Boolean) : [];

  const verifiedParam = getSingleParam(searchParams.verified);
  const verifiedOnly = verifiedParam === 'true';

  const certifiedParam = getSingleParam(searchParams.certified);
  const certifiedOnly = certifiedParam === 'true';

  const sortOption = getSingleParam(searchParams.sort);

  const whereConditions: any = {
    user: {
      isActive: true,
    },
  };
  const andConditions: any[] = [];

  if (verifiedOnly) {
    andConditions.push({ isVerified: true });
  }

  if (certifiedOnly) {
    andConditions.push({ isCaiCertified: true });
  }

  // 1. Search Filter
  if (searchKeyword) {
    andConditions.push({
      OR: [
        { user: { name: { contains: searchKeyword } } },
        { specialization: { contains: searchKeyword } },
        { degree: { contains: searchKeyword } },
        { bio: { contains: searchKeyword } },
      ],
    });
  }


  // 3. Languages Filter
  if (selectedLanguages.length > 0) {
    andConditions.push({
      OR: selectedLanguages.map((lang) => ({
        languages: { contains: lang },
      })),
    });
  }

  // 4. Experience Filter
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

  const orderBy: any[] = [];
  if (sortOption === 'experience_desc') {
    orderBy.push({ experience: 'desc' });
    orderBy.push({ rating: 'desc' });
  } else if (sortOption === 'rating_desc') {
    orderBy.push({ rating: 'desc' });
    orderBy.push({ totalReviews: 'desc' });
  } else {
    // Default: Recommended (Verified doctors first, then highest rating, then experience)
    orderBy.push({ isVerified: 'desc' });
    orderBy.push({ rating: 'desc' });
    orderBy.push({ experience: 'desc' });
  }

  const consultants = await db.consultantProfile.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
    },
    orderBy,
  });

  const safeConsultants = consultants.map((c) => ({
    ...c,
    rating: Number(c.rating),
  }));

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal py-10">
      {/* Header */}
      <div className="text-center sm:text-left pb-0 space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-title-primary tracking-tight">
              Ayurvedic Doctors Directory
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
              Connect directly with verified Ayurvedic doctors via Phone or WhatsApp.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-end w-full sm:w-auto mt-4 sm:mt-0">
            <AyuriTriggerButton />
          </div>
        </div>

        {/* Global Search */}
        <form method="GET" action="/doctors" className="relative mt-8 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-foreground/40" />
          <input
            type="text"
            name="search"
            defaultValue={searchKeyword}
            placeholder="Search doctors by name, degree, or specialization..."
            className="w-full bg-card text-brand-foreground text-sm sm:text-base border border-border rounded-full py-4 pl-12 pr-6 shadow-sm focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all"
          />
          {selectedExperience.length > 0 && (
            <input type="hidden" name="experience" value={selectedExperience.join(',')} />
          )}
          {selectedLanguages.length > 0 && (
            <input type="hidden" name="languages" value={selectedLanguages.join(',')} />
          )}
          {verifiedOnly && (
            <input type="hidden" name="verified" value="true" />
          )}
          {certifiedOnly && (
            <input type="hidden" name="certified" value="true" />
          )}
          {sortOption && (
            <input type="hidden" name="sort" value={sortOption} />
          )}
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-search">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<div className="bg-card rounded-3xl p-6 h-64 border border-border animate-pulse"></div>}>
            <ConsultantFilterSidebarClient
              initialSearch={searchKeyword}
              initialExperience={selectedExperience}
              initialLanguages={selectedLanguages}
              initialVerifiedOnly={verifiedOnly}
              initialCertifiedOnly={certifiedOnly}
              initialSort={sortOption}
            />
          </Suspense>
        </aside>

        {/* Doctors Grid */}
        <main className="lg:col-span-3">
          {safeConsultants.length > 0 ? (
            <DoctorsGridClient consultants={safeConsultants} />
          ) : (
            <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm space-y-4">
              <UserRoundCheck className="h-12 w-12 text-brand-foreground/30 mx-auto" />
              <h3 className="text-xl font-bold text-title-primary">No Doctors Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                We couldn&apos;t find any doctors matching your criteria. Try adjusting your search keyword or filters.
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

