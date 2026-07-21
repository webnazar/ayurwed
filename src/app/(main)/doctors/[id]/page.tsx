import React from 'react';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import BookingForm from '@/components/consultants/BookingForm';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ShieldCheck, Languages, Award, BookOpen, Stethoscope, Briefcase, FileText, CheckCircle, XCircle } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { format } from 'date-fns';
import AcfpInfoCard from '@/components/consultants/AcfpInfoCard';

export const revalidate = 0; // Dynamic rendering

interface ConsultantDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    type?: string;
  }>;
}

export default async function ConsultantDetailPage(props: ConsultantDetailPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) notFound();

  const consultant = await db.consultantProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!consultant) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/doctors/${userId}`)}`);
  }

  let initialUserPhone = '';
  if (session?.user && (session.user as any).id) {
    const user = await db.user.findUnique({
      where: { id: parseInt((session.user as any).id, 10) },
      select: { phone: true }
    });
    if (user?.phone) {
      initialUserPhone = user.phone;
    }
  }

  let parsedAvailability: Record<string, string[]> = {};
  try {
    parsedAvailability = JSON.parse((consultant.availability as string) || '{}');
  } catch (e) {
    console.error('Failed to parse availability:', e);
  }

  let parsedLanguages: string[] = ['English'];
  try {
    parsedLanguages = JSON.parse((consultant.languages as string) || '[]');
  } catch (e) {
    console.error('Failed to parse languages:', e);
  }

  // Format data for BookingForm
  const consultantData = {
    id: consultant.id,
    userId: consultant.userId,
    name: consultant.user?.name || 'Doctor',
    specialization: consultant.specialization,
    consultationFee: Number(consultant.consultationFee),
    followUpFee: Number(consultant.followUpFee),
    availability: parsedAvailability,
    isAcfp: consultant.isAcfp,
    fulfillmentMethod: consultant.fulfillmentMethod,
    hasClinicPickup: consultant.hasClinicPickup,
    hasSelfDispatch: consultant.hasSelfDispatch,
    hasAyurwedDelivery: consultant.hasAyurwedDelivery,
  };

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal py-10 space-y-8">
      {/* Navigation Row (Breadcrumbs & Back Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
          <Link href="/" className="hover:text-brand-green">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/doctors" className="hover:text-brand-green">Doctors</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-brand-green font-semibold line-clamp-1">{consultant.user?.name}</span>
        </div>

        <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Doctors</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Doctor Bio & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Doctor Header Card */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left relative overflow-hidden">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-brand-green-light flex-shrink-0">
              <SafeImage
                src={consultant.user?.avatar}
                fallbackSrc={consultant.id % 2 === 0 ? '/female-doctor.webp' : '/male-doctor.webp'}
                alt={consultant.user?.name || 'Doctor'}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4 flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-green">{consultant.user?.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {consultant.isCaiCertified && (
                    <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-brand-green/20">
                      <Award className="h-3.5 w-3.5 text-brand-gold-dark" />
                      <span>ACP Certified</span>
                    </span>
                  )}

                </div>
              </div>
              
              <p className="text-sm font-bold text-brand-gold-dark uppercase tracking-wider">{consultant.specialization}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm text-brand-foreground/70">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-brand-green" />
                  <span>{consultant.experience} Years Experience</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-brand-green" />
                  <span>{parsedLanguages.join(', ')}</span>
                </div>
              </div>

              {consultant.isCaiCertified && (
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-brand-green bg-brand-green/10 px-4 py-2 rounded-full border border-brand-green/20 shadow-sm">
                    <Award className="h-4 w-4 text-brand-gold-dark animate-pulse-slow flex-shrink-0" />
                    <span>✓ AYURWED Certified Practitioner (ACP)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Three Redesigned Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Professional Information */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-brand-green flex items-center gap-2 border-b border-border pb-3">
                  <Stethoscope className="h-5 w-5 text-brand-gold-dark" />
                  <span>Professional Info</span>
                </h3>
                <div className="divide-y divide-border/40">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Full Name</span>
                    <span className="text-sm font-semibold text-brand-green">{consultant.user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Qualification</span>
                    <span className="text-sm font-semibold text-brand-foreground">{consultant.degree || 'BAMS'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Experience</span>
                    <span className="text-sm font-semibold text-brand-foreground">{consultant.experience} Years</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Registration No.</span>
                    <span className="text-sm font-mono font-bold bg-brand-green-light/20 text-brand-green px-2.5 py-1 rounded-lg border border-brand-green/20">
                      {consultant.registrationNumber || 'AYUR-90248-IND'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Credentials */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-brand-green flex items-center gap-2 border-b border-border pb-3">
                  <Award className="h-5 w-5 text-brand-gold-dark" />
                  <span>Credentials</span>
                </h3>
                <div className="divide-y divide-border/40">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">ACP Title</span>
                    {consultant.isCaiCertified ? (
                      <span className="bg-brand-green/10 text-brand-green font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-brand-green/20">
                        <CheckCircle className="h-3.5 w-3.5" /> Certified ACP
                      </span>
                    ) : (
                      <span className="bg-brand-foreground/5 text-brand-foreground/40 font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Not Certified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Platform Status</span>
                    {consultant.isAcfp ? (
                      <span className="bg-brand-gold/20 text-brand-gold-dark font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-brand-gold/30">
                        <CheckCircle className="h-3.5 w-3.5" /> Active Access
                      </span>
                    ) : (
                      <span className="bg-brand-foreground/5 text-brand-foreground/40 font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Inactive
                      </span>
                    )}
                  </div>
                  {consultant.isAcfp && (
                    <>
                      {consultant.acfpVerifiedAt && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-brand-foreground/60 font-medium">Activation Date</span>
                          <span className="text-sm font-semibold text-brand-green">
                            {format(new Date(consultant.acfpVerifiedAt), 'dd MMMM yyyy')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-brand-foreground/60 font-medium">Access Tier</span>
                        <span className="text-sm font-extrabold text-brand-gold-dark flex items-center gap-1">
                          Full Platform <Award className="h-4 w-4 text-brand-gold-dark" />
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Practice Information */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4 md:col-span-2">
              <h3 className="text-base font-extrabold text-brand-green flex items-center gap-2 border-b border-border pb-3">
                <Briefcase className="h-5 w-5 text-brand-gold-dark" />
                <span>Practice Info & Settings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-0 md:gap-x-12 divide-y md:divide-y-0 divide-border/40">
                {/* Column 1 */}
                <div className="space-y-0 divide-y divide-border/40">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Online Consultation</span>
                    <span className={`text-sm font-bold ${consultant.hasOnline ? 'text-emerald-700' : 'text-brand-foreground/40'}`}>
                      {consultant.hasOnline ? 'Enabled' : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Offline Clinic Practice</span>
                    <span className={`text-sm font-bold ${consultant.hasOffline ? 'text-emerald-700' : 'text-brand-foreground/40'}`}>
                      {consultant.hasOffline ? 'Enabled' : '—'}
                    </span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-0 divide-y divide-border/40 md:border-l md:border-border/30 md:pl-12">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Dispensing Model</span>
                    <span className="text-sm font-extrabold text-brand-green">
                      {consultant.hasClinicPickup || consultant.hasSelfDispatch || consultant.hasAyurwedDelivery
                        ? 'Prescription & Fulfillment'
                        : 'Prescription Only'}
                    </span>
                  </div>
                  {consultant.hasClinicPickup || consultant.hasSelfDispatch || consultant.hasAyurwedDelivery ? (
                    <div className="flex items-start justify-between py-3 gap-4">
                      <span className="text-sm text-brand-foreground/60 font-medium flex-shrink-0">Fulfillment Channels</span>
                      <span className="text-xs font-bold text-brand-gold-dark text-right leading-tight">
                        {[
                          consultant.hasClinicPickup && 'Clinic Pickup',
                          consultant.hasSelfDispatch && 'Doctor Self-Dispatch',
                          consultant.hasAyurwedDelivery && 'Doctor Logistics Delivery'
                        ].filter(Boolean).join(', ') || 'None'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-brand-foreground/60 font-medium">Fulfillment Support</span>
                      <span className="text-sm font-semibold text-brand-foreground/40">None (Prescription Only)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACP Info Card */}
          {consultant.isCaiCertified && <AcfpInfoCard />}

          {/* Biography */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-brand-green border-b border-brand-green-light pb-2">Biography</h3>
            <p className="text-sm sm:text-base text-brand-foreground/75 leading-relaxed">{consultant.bio}</p>
          </div>

          {/* Treatment Approach */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-brand-green border-b border-brand-green-light pb-2">Treatment Approach</h3>
            <p className="text-sm text-brand-foreground/75 leading-relaxed">
              Dr. {consultant.user?.name?.split(' ').pop()} follows pure, classical Ayurvedic diagnostic procedures focusing on Prakriti evaluation (body constitution) and Vikriti diagnosis (imbalance assessment). Treatments involve custom herbs, lifestyle changes, and Panchakarma therapies designed to treat root causes rather than symptoms.
            </p>
          </div>
        </div>

        {/* Right Column: Appointment Booking Form */}
        <div className="lg:col-span-1">
          <BookingForm 
            consultant={consultantData} 
            initialUserPhone={initialUserPhone} 
            initialVisitType={searchParams?.type === 'FOLLOW_UP' ? 'FOLLOW_UP' : 'INITIAL'}
          />
        </div>
      </div>
    </div>
  );
}
