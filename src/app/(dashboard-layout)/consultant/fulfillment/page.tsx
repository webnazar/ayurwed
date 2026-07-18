import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ConsultantFulfillmentClient from '@/components/consultant/ConsultantFulfillmentClient';

export const revalidate = 0;

export default async function ConsultantFulfillmentPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'CONSULTANT') redirect('/login');

  const consultant = await db.consultantProfile.findUnique({
    where: { userId: Number(session.user.id) }
  });

  if (!consultant) redirect('/consultant/profile');

  const fulfillments = await db.fulfillment.findMany({
    where: { consultantId: consultant.id },
    orderBy: { createdAt: 'desc' },
    include: {
      prescription: {
        include: {
          items: {
            include: {
              preparation: true,
              product: true
            }
          }
        }
      },
      patient: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Medicine Fulfillments</h1>
        <p className="dashboard-header-subtitle">Manage patient medicine orders, update order status, and track shipments.</p>
      </div>
      <ConsultantFulfillmentClient initialFulfillments={fulfillments as any} />
    </div>
  );
}
