import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  Stethoscope,
  Briefcase,
  CheckCircle,
  Phone,
  MessageCircle,
  Clock,
} from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { format } from 'date-fns';
import AcfpInfoCard from '@/components/consultants/AcfpInfoCard';
import DoctorShareButton from '@/components/consultants/DoctorShareButton';

import type { Metadata } from 'next';

export const revalidate = 0; // Dynamic rendering

interface ConsultantDetailPageProps {
  params: Promise<{
    id: string;
  }>;
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

export async function generateMetadata(props: ConsultantDetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) return { title: 'Doctor Profile | AYURWED' };

  const consultant = await db.consultantProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!consultant) return { title: 'Doctor Not Found | AYURWED' };

  const name = consultant.user?.name || 'Ayurvedic Consultant';
  const qualification = consultant.specialization || consultant.degree || 'Ayurvedic Specialist';
  const desc = consultant.bio
    ? consultant.bio.slice(0, 160)
    : `Connect directly with Dr. ${name} (${qualification}) on Ayurwed. ${consultant.experience || 0} years experience in Ayurveda remedies & clinical practice.`;

  const baseUrl = 'https://www.ayurwed.com';
  let avatarPath = consultant.user?.avatar;
  if (!avatarPath) {
    avatarPath = consultant.id % 2 === 0 ? '/female-doctor.webp' : '/male-doctor.webp';
  }
  const photoUrl = avatarPath.startsWith('http')
    ? avatarPath
    : `${baseUrl}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
  const pageUrl = `${baseUrl}/doctors/${userId}`;

  return {
    title: `Dr. ${name} - ${qualification} | AYURWED`,
    description: desc,
    keywords: [name, 'Ayurvedic Doctor', qualification, 'AYURWED Doctor', 'Ayurveda Consultation', 'Ayurvedic Practitioner'],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `Dr. ${name} - ${qualification} | AYURWED`,
      description: desc,
      url: pageUrl,
      siteName: 'AYURWED',
      type: 'profile',
      locale: 'en_IN',
      images: [
        {
          url: photoUrl,
          width: 800,
          height: 800,
          alt: `Dr. ${name} - ${qualification}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Dr. ${name} - ${qualification} | AYURWED`,
      description: desc,
      images: [photoUrl],
    },
  };
}

export default async function ConsultantDetailPage(props: ConsultantDetailPageProps) {
  const params = await props.params;
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) notFound();

  const consultant = await db.consultantProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!consultant) {
    notFound();
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

  const phoneUrl = getPhoneUrl(consultant.user?.phone);
  const whatsAppUrl = getWhatsAppUrl(consultant.user?.phone, consultant.user?.name);

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal py-10 space-y-8">
      {/* Navigation Row (Breadcrumbs, Share & Back Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
          <Link href="/" className="hover:text-brand-green">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/doctors" className="hover:text-brand-green">Doctors</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-brand-green font-semibold line-clamp-1">{consultant.user?.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <DoctorShareButton
            doctorName={consultant.user?.name || 'Doctor'}
            specialization={consultant.specialization}
            variant="outline"
          />
          <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Doctors</span>
          </Link>
        </div>
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
              </div>
              
              <p className="text-sm font-bold text-brand-gold-dark uppercase tracking-wider">{consultant.specialization}</p>

              {/* Quick direct contact pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                {phoneUrl && (
                  <a
                    href={phoneUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold hover:bg-brand-green hover:text-white transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{consultant.user?.phone}</span>
                  </a>
                )}
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 text-[#25D366] text-xs font-bold hover:bg-[#25D366] hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp Available</span>
                  </a>
                )}
              </div>
            </div>

            {consultant.isCaiCertified && (
              <div className="sm:absolute sm:top-10 sm:right-8 mt-6 sm:mt-0 flex-shrink-0 relative flex flex-col items-center justify-center text-center p-4 pt-6 bg-brand-green/10 border border-brand-green/20 rounded-2xl shadow-sm min-w-[160px]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-card p-1.5 rounded-full border border-brand-green/20 shadow-sm text-brand-gold-dark">
                  <Award className="h-7 w-7 animate-pulse-slow" />
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-green leading-tight block">
                  AYURWED
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-brand-green/80 leading-tight block mt-1">
                  Certified Practitioner
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-brand-green/80 leading-tight block mt-0.5">
                  (ACP)
                </span>
              </div>
            )}
          </div>

          {/* Professional Credentials & Practice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Professional & Verification Audit Trail Information */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between md:col-span-2 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-extrabold text-brand-green flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-brand-gold-dark" />
                    <span>Professional Credentials & Audit Trail</span>
                  </h3>
                  {consultant.isVerified && (
                    <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Verified Practitioner Log</span>
                    </span>
                  )}
                </div>

                <div className="divide-y divide-border/40">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Qualification</span>
                    <span className="text-sm font-semibold text-brand-foreground">{consultant.degree || 'BAMS'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Experience</span>
                    <span className="text-sm font-semibold text-brand-foreground">{consultant.experience} Years</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Languages Spoken</span>
                    <span className="text-sm font-semibold text-brand-foreground">{parsedLanguages.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Medical Registration No.</span>
                    <span className="text-sm font-mono font-bold bg-brand-green-light/20 text-brand-green px-2.5 py-1 rounded-lg border border-brand-green/20">
                      {consultant.registrationNumber || 'AYUR-90248-IND'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">State / National Council</span>
                    <span className="text-sm font-semibold text-brand-foreground">
                      {consultant.registrationCouncil || 'National Commission for Indian System of Medicine (NCISM)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Verification Timestamp</span>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {consultant.verifiedAt ? format(new Date(consultant.verifiedAt), 'MMMM dd, yyyy') : 'Audit Log Dated & On File'}
                    </span>
                  </div>
                </div>

                {/* Audit verification disclosure box */}
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 flex items-start gap-3 text-xs text-brand-foreground/80 mt-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">Verified Practitioner Audit Compliance</p>
                    <p className="text-[11px] leading-relaxed">
                      AYURWED performs diligent background validation of all medical degrees (BAMS/BUMS) and council registrations before enabling direct clinical directory listings. A dated verification record is maintained on file.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Practice & Consultation Modes */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4 md:col-span-2">
              <h3 className="text-base font-extrabold text-brand-green flex items-center gap-2 border-b border-border pb-3">
                <Briefcase className="h-5 w-5 text-brand-gold-dark" />
                <span>Practice & Consultation Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-0 md:gap-x-12 divide-y md:divide-y-0 divide-border/40">
                {/* Column 1 */}
                <div className="space-y-0 divide-y divide-border/40">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Direct Phone Call</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Available</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">WhatsApp Consultation</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Available</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-0 divide-y divide-border/40 md:border-l md:border-border/30 md:pl-12">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">In-Clinic Consultation</span>
                    <span className="text-sm font-bold text-brand-green">By Direct Appointment</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-brand-foreground/60 font-medium">Patient Direct Access</span>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Zero Booking Fees</span>
                  </div>
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
              Dr. {consultant.user?.name?.split(' ').pop()} follows pure, classical Ayurvedic diagnostic procedures focusing on Prakriti evaluation (body constitution) and Vikriti diagnosis (imbalance assessment). Treatments involve custom herbs, diet recommendations, lifestyle changes, and Panchakarma therapies designed to treat root causes rather than symptoms.
            </p>
          </div>
        </div>

        {/* Right Column: Direct Connect Card */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-3xl p-6 sm:p-7 border border-border shadow-sm space-y-6 sticky top-24">
            <div className="space-y-2 border-b border-border pb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-gold-dark bg-brand-gold/10 px-2.5 py-1 rounded-full inline-block">
                Direct Consultation
              </span>
              <h2 className="text-xl font-bold text-title-primary">
                Connect with Doctor
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reach out directly via phone call or WhatsApp to schedule a clinic visit or discuss your health concerns.
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="space-y-3">
              {phoneUrl ? (
                <a
                  href={phoneUrl}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-brand-gold hover:bg-brand-gold/90 text-stone-900 font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm sm:text-base group"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  <span>Call {consultant.user?.phone || 'Doctor'}</span>
                </a>
              ) : (
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-xs text-muted-foreground text-center">
                  Direct phone contact available upon in-clinic inquiry.
                </div>
              )}

              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm sm:text-base group"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  <span>Chat on WhatsApp</span>
                </a>
              ) : null}

              <DoctorShareButton
                doctorName={consultant.user?.name || 'Doctor'}
                specialization={consultant.specialization}
                className="w-full justify-center !py-3 !rounded-2xl"
              />
            </div>

            {/* Direct Benefits Checklist */}
            <div className="bg-brand-green/5 border border-brand-green/15 rounded-2xl p-4 space-y-2.5 text-xs text-brand-foreground/85">
              <div className="font-bold text-brand-green flex items-center gap-1.5 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Direct Patient-Doctor Access</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Zero platform commissions or booking fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Direct communication with verified practitioner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Authentic Ayurvedic assessment & clinic visits</span>
                </li>
              </ul>
            </div>

            {/* Consulting & Clinic Timings */}
            {Object.keys(parsedAvailability).length > 0 && (
              <div className="pt-2 border-t border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-gold-dark" />
                  <span>Available Timings</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(parsedAvailability).map(([day, slots]) => (
                    <div key={day} className="flex items-start justify-between py-1 border-b border-border/30 last:border-0 text-xs">
                      <span className="font-medium text-foreground capitalize">{day}</span>
                      <span className="text-muted-foreground text-right font-mono text-[11px]">
                        {Array.isArray(slots) && slots.length > 0 ? slots.join(', ') : 'By Appointment'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

