import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import MyAppointmentsClient from '@/components/consumer/MyAppointmentsClient';

export const revalidate = 0;

export default async function ConsumerAppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const appointments = await db.appointment.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { scheduledAt: 'desc' },
    include: {
      consultant: { include: { user: { select: { name: true, avatar: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">My Appointments</h1>
        <p className="text-sm text-brand-green-light mt-2">Track your consultations with certified Ayurvedic doctors.</p>
      </div>
      <MyAppointmentsClient initialAppointments={appointments as any} />
    </div>
  );
}
