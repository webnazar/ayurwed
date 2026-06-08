import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ConsultantProfileForm from '@/components/consultant/ConsultantProfileForm';

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
      <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
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
      specialization: profile.specialization,
      experience: profile.experience,
      bio: profile.bio,
      languages: profile.languages,
      consultationFee: Number(profile.consultationFee),
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">My Profile</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Manage your public consultant identity on AYURWED. A complete profile builds trust with patients.
        </p>
      </div>
      <ConsultantProfileForm data={formData as any} />
    </div>
  );
}
