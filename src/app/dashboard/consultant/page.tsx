import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Calendar, UserCheck, Star, Users } from 'lucide-react';

export const revalidate = 0;

export default async function ConsultantDashboard() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  // Fetch doctor details
  const profile = await db.consultantProfile.findUnique({
    where: { userId },
  });

  return (
    <div className="space-y-8">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Namaste, {session?.user?.name}!</h1>
        <p className="dashboard-header-subtitle">
          Workspace for managing virtual diagnostic routines, Prakriti balance charts, and video logs.
        </p>
      </div>

      {/* Profile Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="dashboard-header-card">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Doctor Rating</span>
            <span className="text-xl font-extrabold text-brand-green">{Number(profile?.rating || 4.8).toFixed(1)} / 5.0</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-brand-gold/15 p-3 rounded-2xl text-brand-gold-dark">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Total Audits</span>
            <span className="text-xl font-extrabold text-brand-green">{profile?.totalReviews || 24} consultations</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-800">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Verified Status</span>
            <span className="text-sm font-bold text-emerald-800 uppercase block tracking-wider">
              {profile?.isVerified ? 'Active Profile' : 'Pending Audit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
