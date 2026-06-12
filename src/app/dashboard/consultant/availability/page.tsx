import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AvailabilityClient from '@/components/consultant/AvailabilityClient';

export const revalidate = 0;

export default async function ConsultantAvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CONSULTANT') redirect('/login');

  const profile = await db.consultantProfile.findUnique({
    where: { userId: Number((session.user as any).id) },
    include: { _count: { select: { appointments: true } } },
  });
  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm">
        <h2 className="text-xl font-bold text-brand-green">Profile Not Set Up</h2>
      </div>
    );
  }

  const bookedCount = await db.appointment.count({ where: { consultantId: profile.id, status: { in: ['PENDING', 'CONFIRMED'] } } });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Availability Slots</h1>
        <p className="dashboard-header-subtitle">
          Set your weekly working days, time slots, and consultation fee.
        </p>
      </div>
      <AvailabilityClient
        initialAvailability={profile.availability}
        totalAppointments={profile._count.appointments}
        bookedCount={bookedCount}
      />
    </div>
  );
}
