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
    where: { userId: Number((session.user as any).id) },
    orderBy: { scheduledAt: 'desc' },
    include: {
      consultant: { include: { user: { select: { name: true, avatar: true } } } },
      prescription: {
        include: {
          items: { include: { preparation: true, product: true } },
          fulfillment: true,
        },
      },
    },
  });

  const serializedAppointments = appointments.map((app) => ({
    ...app,
    fee: Number(app.fee),
    consultant: app.consultant
      ? {
          ...app.consultant,
          consultationFee: Number(app.consultant.consultationFee),
          followUpFee: Number(app.consultant.followUpFee),
          rating: Number(app.consultant.rating),
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">My Appointments</h1>
        <p className="dashboard-header-subtitle">Track your consultations with certified Ayurvedic doctors.</p>
      </div>
      <MyAppointmentsClient initialAppointments={serializedAppointments as any} />
    </div>
  );
}
