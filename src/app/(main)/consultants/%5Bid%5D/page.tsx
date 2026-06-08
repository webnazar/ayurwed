import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/consultants/BookingForm';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ShieldCheck, Languages, Award, BookOpen } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 0; // Dynamic rendering

interface ConsultantDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ConsultantDetailPage({ params }: ConsultantDetailPageProps) {
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) notFound();

  const consultant = await db.consultantProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!consultant) {
    notFound();
  }

  // Format data for BookingForm
  const consultantData = {
    id: consultant.id,
    userId: consultant.userId,
    name: consultant.user?.name || 'Doctor',
    specialization: consultant.specialization,
    consultationFee: Number(consultant.consultationFee),
    availability: consultant.availability as Record<string, string[]>,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
        <Link href="/" className="hover:text-brand-green">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/consultants" className="hover:text-brand-green">Consultants</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-brand-green font-semibold line-clamp-1">{consultant.user?.name}</span>
      </div>

      {/* Back Button */}
      <Link href="/consultants" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Consultants</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Doctor Bio & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-brand-green-border/10 shadow-sm flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-brand-green-light flex-shrink-0">
              <Image
                src={consultant.user?.avatar || 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80'}
                alt={consultant.user?.name || 'Doctor'}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-green">{consultant.user?.name}</h1>
                {consultant.isVerified && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-brand-gold-dark uppercase tracking-wider">{consultant.specialization}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm text-brand-foreground/70">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-brand-green" />
                  <span>{consultant.experience} Years Experience</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-brand-green" />
                  <span>{Array.isArray(consultant.languages) ? (consultant.languages as string[]).join(', ') : 'English'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-brand-green-border/10 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-brand-green border-b border-brand-green-light pb-2">Biography</h3>
            <p className="text-sm sm:text-base text-brand-foreground/75 leading-relaxed">{consultant.bio}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-brand-green-border/10 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-brand-green border-b border-brand-green-light pb-2">Treatment Approach</h3>
            <p className="text-sm text-brand-foreground/75 leading-relaxed">
              Dr. {consultant.user?.name?.split(' ').pop()} follows pure, classical Ayurvedic diagnostic procedures focusing on Prakriti evaluation (body constitution) and Vikriti diagnosis (imbalance assessment). Treatments involve custom herbs, lifestyle changes, and Panchakarma therapies designed to treat root causes rather than symptoms.
            </p>
          </div>
        </div>

        {/* Right Column: Appointment Form */}
        <div className="lg:col-span-1">
          <BookingForm consultant={consultantData} />
        </div>
      </div>
    </div>
  );
}
