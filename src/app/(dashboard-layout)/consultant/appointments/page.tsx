import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { serialize } from '@/lib/utils';
import AppointmentScheduleClient from '@/components/consultant/AppointmentScheduleClient';

export const revalidate = 0;

export default async function ConsultantSchedulePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CONSULTANT') redirect('/login');

  const profile = await db.consultantProfile.findUnique({ where: { userId: Number((session.user as any).id) } });
  if (!profile) {
    return (
      <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm">
        <h2 className="text-xl font-bold text-brand-green">Profile Not Set Up</h2>
        <p className="text-brand-foreground/60 text-sm mt-2">Contact admin to initialize your consultant profile.</p>
      </div>
    );
  }

  const appointments = await db.appointment.findMany({
    where: { consultantId: profile.id },
    orderBy: { scheduledAt: 'desc' },
    include: { 
      user: { select: { id: true, name: true, email: true, avatar: true } },
      prescription: { select: { id: true, status: true } }
    },
  });

  const serializedAppointments = serialize(appointments);

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Appointments Schedule</h1>
        <p className="dashboard-header-subtitle">
          Manage patient consultations, confirm sessions, and set meeting links.
        </p>
      </div>
      <AppointmentScheduleClient initialAppointments={serializedAppointments as any} />
    </div>
  );
}
