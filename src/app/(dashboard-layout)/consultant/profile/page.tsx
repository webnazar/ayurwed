import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ConsultantProfileForm from '@/components/consultant/ConsultantProfileForm';
import AcfpCtaCard from '@/components/consultant/AcfpCtaCard';

export const revalidate = 0;

export default async function ConsultantProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CONSULTANT') redirect('/login');

  const userId = Number((session.user as any).id);

  // Fetch the consultant profile AND the user data (for name and avatar)
  const profile = await db.consultantProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, avatar: true }
      }
    }
  });

  if (!profile) {
    return (
      <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-brand-green">Profile Not Set Up</h2>
        <p className="text-brand-foreground/60 text-sm">Contact admin to set up your consultant profile.</p>
      </div>
    );
  }

  // Format data for the form
  const formData = {
    user: {
      name: profile.user.name,
      avatar: profile.user.avatar,
    },
    profile: {
      degree: profile.degree,
      specialization: profile.specialization,
      experience: profile.experience,
      bio: profile.bio,
      languages: profile.languages,
      consultationFee: Number(profile.consultationFee),
      followUpFee: Number(profile.followUpFee),
      fulfillmentMethod: profile.fulfillmentMethod,
      hasClinicPickup: profile.hasClinicPickup,
      hasSelfDispatch: profile.hasSelfDispatch,
      hasAyurwedDelivery: profile.hasAyurwedDelivery,
    }
  };

  const isPendingAcfp = !!profile.acfpVerifiedAt && !profile.isAcfp;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">My Profile</h1>
        <p className="dashboard-header-subtitle">
          Manage your public consultant identity on AYURWED. A complete profile builds trust with patients.
        </p>
      </div>

      <AcfpCtaCard isCaiCertified={!!profile.isCaiCertified} isAcfp={!!profile.isAcfp} isPending={isPendingAcfp} />

      <ConsultantProfileForm data={formData as any} />
    </div>
  );
}
