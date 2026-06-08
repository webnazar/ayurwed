import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AppointmentScheduleClient from '@/components/consultant/AppointmentScheduleClient';

export const revalidate = 0;

export default async function ConsultantSchedulePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CONSULTANT') redirect('/login');

  const profile = await db.consultantProfile.findUnique({ where: { userId: Number((session.user as any).id) } });
  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm">
        <h2 className="text-xl font-bold text-brand-green">Profile Not Set Up</h2>
        <p className="text-brand-foreground/60 text-sm mt-2">Contact admin to initialize your consultant profile.</p>
      </div>
    );
  }

  const appointments = await db.appointment.findMany({
    where: { consultantId: profile.id },
    orderBy: { scheduledAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Appointments Schedule</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Manage patient consultations, confirm sessions, and set meeting links.
        </p>
      </div>
      <AppointmentScheduleClient initialAppointments={appointments as any} />
    </div>
  );
}
