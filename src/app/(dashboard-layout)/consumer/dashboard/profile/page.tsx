import React from 'react';
import ConsumerProfileForm from '@/components/consumer/ConsumerProfileForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile | AYURWED',
};

export default function ConsumerProfilePage() {
  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-gold">My Profile</h1>
          <p className="text-brand-green/70 max-w-2xl text-sm sm:text-base leading-relaxed">
            Manage your personal information and delivery address for your prescribed medicines.
          </p>
        </div>
      </div>

      <div className="pt-4 max-w-4xl mx-auto">
        <ConsumerProfileForm />
      </div>
    </div>
  );
}
