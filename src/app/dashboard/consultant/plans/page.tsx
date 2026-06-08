import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ConsultantSubscriptionClient from '@/components/consultant/ConsultantSubscriptionClient';

export const revalidate = 0;

export default async function ConsultantPlansPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CONSULTANT') redirect('/login');

  const profile = await db.consultantProfile.findUnique({
    where: { userId: Number((session.user as any).id) },
    select: { subscriptionTier: true, isVerified: true },
  });

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-brand-green">Profile Not Set Up</h2>
        <p className="text-brand-foreground/60 text-sm">Contact admin to set up your consultant profile before viewing plans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Subscription Plans</h1>
          <p className="text-sm text-brand-green-light mt-2 max-w-2xl">
            Choose the right plan to boost your visibility on AYURWED. Premium tiers help you rank higher in the consultant directory and attract more patients.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>
      <ConsultantSubscriptionClient profile={profile} />
    </div>
  );
}
