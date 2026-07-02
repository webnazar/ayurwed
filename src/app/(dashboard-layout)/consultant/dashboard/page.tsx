import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Calendar, UserCheck, Star, Users, ShieldAlert, Award } from 'lucide-react';
import AcfpCtaCard from '@/components/consultant/AcfpCtaCard';

export const revalidate = 0;

export default async function ConsultantDashboard() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  // Fetch doctor details
  const profile = await db.consultantProfile.findUnique({
    where: { userId },
  });

  const completedConsultations = profile 
    ? await db.appointment.count({
        where: {
          consultantId: profile.id,
          status: 'COMPLETED'
        }
      })
    : 0;

  const displayRating = Number(profile?.rating || 0) > 0 ? Number(profile?.rating).toFixed(1) : 'New';
  const displayTotalReviews = profile?.totalReviews || 0;

  const isPendingAcfp = !!profile?.acfpVerifiedAt && !profile?.isAcfp;

  // Determine Verified Status Text and Style
  let verifiedText = 'Pending Audit';
  let verifiedColor = 'text-amber-700 bg-amber-100 dark:bg-amber-950/30';
  let verifiedIcon = <ShieldAlert className="h-6 w-6" />;

  if (profile?.isVerified) {
    verifiedText = 'Active Profile';
    verifiedColor = 'text-emerald-800 bg-emerald-100 dark:bg-emerald-950/30';
    verifiedIcon = <UserCheck className="h-6 w-6" />;
  }

  if (isPendingAcfp) {
    verifiedText = 'ACFP Pending Approval';
    verifiedColor = 'text-amber-700 bg-amber-100 dark:bg-amber-950/30 border border-amber-300/35';
    verifiedIcon = <ShieldAlert className="h-6 w-6 text-brand-gold-dark animate-pulse" />;
  }

  if (profile?.isAcfp) {
    verifiedText = 'Verified ACFP Partner';
    verifiedColor = 'text-brand-green bg-brand-gold/20 border border-brand-gold/30';
    verifiedIcon = <Award className="h-6 w-6 text-brand-gold-dark animate-pulse-slow" />;
  }

  return (
    <div className="space-y-8">
      <div className="dashboard-header-card relative overflow-hidden">
        {profile?.isAcfp && (
          <div className="absolute top-4 right-4 bg-brand-gold/25 border border-brand-gold text-brand-gold-dark text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Award className="h-4 w-4" />
            <span>ACFP Verified</span>
          </div>
        )}
        <h1 className="dashboard-header-title">Namaste, {session?.user?.name}!</h1>
        <p className="dashboard-header-subtitle">
          Workspace for managing virtual diagnostic routines, Prakriti balance charts, and video logs.
        </p>
      </div>

      {/* Profile Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center gap-4">
          <div className="bg-brand-green/15 p-3 rounded-2xl text-brand-green">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Doctor Rating</span>
            <span className="text-xl font-extrabold text-brand-green">{displayRating} / 5.0</span>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center gap-4">
          <div className="bg-brand-gold/15 p-3 rounded-2xl text-brand-gold-dark">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Total Audits</span>
            <span className="text-xl font-extrabold text-brand-green">{completedConsultations} consultations</span>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${verifiedColor}`}>
            {verifiedIcon}
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Verified Status</span>
            <span className={`text-sm font-bold uppercase block tracking-wider ${profile?.isAcfp ? 'text-brand-gold-dark' : ''}`}>
              {verifiedText}
            </span>
          </div>
        </div>
      </div>

      {/* ACFP / CAI Verification Section */}
      <AcfpCtaCard isCaiCertified={!!profile?.isCaiCertified} isAcfp={!!profile?.isAcfp} isPending={isPendingAcfp} />
    </div>
  );
}
