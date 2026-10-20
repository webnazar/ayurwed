import React from 'react';
import UserProfileForm from '@/components/user/UserProfileForm';
import { Metadata } from 'next';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'My Profile | AYURWED Portal',
  description: 'Manage your profile credentials, personal details, and shipping address on AYURWED.',
  keywords: ['AYURWED Profile', 'User Portal', 'Ayurveda Account Management'],
};

export default async function UserProfilePage() {
  const session = await getServerSession(authOptions);
  const isDoctor = (session?.user as any)?.role === 'CONSULTANT';

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-gold">
            {isDoctor ? 'Doctor Profile' : 'My Profile'}
          </h1>
          <p className="text-brand-green/70 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isDoctor
              ? 'Manage your professional credentials, practice details, and clinic shipping address.'
              : 'Manage your personal details, contact information, and shipping address for your store orders.'}
          </p>
        </div>
      </div>

      <div className="pt-2 max-w-4xl mx-auto">
        <UserProfileForm />
      </div>
    </div>
  );
}
