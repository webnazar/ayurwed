import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Calendar, UserCheck, Star, Users, ShieldAlert, Award, ShoppingBag, Package, UserCircle } from 'lucide-react';
import AcfpCtaCard from '@/components/consultant/AcfpCtaCard';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Portal & Clinical Workspace | AYURWED',
  description: 'Manage doctor profile, credentials, and order authentic Ayurvedic medicines and supplies on Ayurwed.',
  keywords: ['Doctor Dashboard', 'Ayurveda Doctor Portal', 'AIPE', 'AYURWED Doctor Workspace'],
};

export const revalidate = 0;

export default async function ConsultantDashboard() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  // Fetch doctor details and orders count in parallel
  const [profile, ordersCount] = await Promise.all([
    db.consultantProfile.findUnique({
      where: { userId },
    }),
    db.shopOrder.count({
      where: { userId },
    }),
  ]);

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
    verifiedText = 'Profile Verified';
    verifiedColor = 'text-emerald-800 bg-emerald-100 dark:bg-emerald-950/30';
    verifiedIcon = <UserCheck className="h-6 w-6" />;
  }

  if (isPendingAcfp) {
    verifiedText = 'Platform Pending Activation';
    verifiedColor = 'text-amber-700 bg-amber-100 dark:bg-amber-950/30 border border-amber-300/35';
    verifiedIcon = <ShieldAlert className="h-6 w-6 text-brand-gold-dark animate-pulse" />;
  }

  if (profile?.isAcfp) {
    verifiedText = 'Platform Access Active';
    verifiedColor = 'text-brand-green bg-brand-gold/20 border border-brand-gold/30';
    verifiedIcon = <Award className="h-6 w-6 text-brand-gold-dark animate-pulse-slow" />;
  }

  return (
    <div className="space-y-8">
      <div className="dashboard-header-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 relative z-10">
          {profile?.isCaiCertified && (
            <div className="inline-flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-black px-3 py-1 rounded-full shadow-xs mb-1">
              <Award className="h-3.5 w-3.5 text-brand-gold-dark" />
              <span>CAI Certified Doctor</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-brand-green tracking-tight">Namaste, {session?.user?.name}! 🌿</h1>
          <p className="text-xs sm:text-sm text-brand-green/80 max-w-xl leading-relaxed">
            Welcome to your certified Ayurvedic practitioner workspace. Order clinic remedies, manage your professional credentials, and track your store orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
          <Link
            href="/shop"
            className="btn-gold px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:shadow"
          >
            <ShoppingBag className="h-4 w-4" /> Shop Store
          </Link>
          <Link
            href="/user/myorders"
            className="btn-green px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:shadow"
          >
            <Package className="h-4 w-4" /> My Orders ({ordersCount})
          </Link>
          <Link
            href="/user/profile"
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-card border border-border hover:border-brand-green text-foreground transition-all flex items-center gap-1.5 shadow-xs"
          >
            <UserCircle className="h-4 w-4 text-brand-green" /> Profile
          </Link>
        </div>
      </div>

      {/* Profile & eCommerce Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

        {/* Card 4: Store Orders (Doctors can order too!) */}
        <Link
          href="/user/myorders"
          className="bg-card rounded-3xl p-6 border border-border hover:border-brand-green/40 shadow-sm transition-all hover:shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl group-hover:bg-brand-green group-hover:text-white transition-colors">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-semibold">My Store Orders</span>
              <span className="text-xl font-extrabold text-brand-green">{ordersCount}</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-brand-green/10 text-muted-foreground group-hover:text-brand-green transition-colors">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* ACFP / CAI Verification Section */}
      <AcfpCtaCard isCaiCertified={!!profile?.isCaiCertified} isAcfp={!!profile?.isAcfp} isPending={isPendingAcfp} />
    </div>
  );
}
