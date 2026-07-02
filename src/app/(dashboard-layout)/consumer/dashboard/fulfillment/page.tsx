import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ConsumerFulfillmentClient from '@/components/consumer/ConsumerFulfillmentClient';

export const revalidate = 0;

export default async function ConsumerFulfillmentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const fulfillments = await db.fulfillment.findMany({
    where: { patientId: Number((session.user as any).id) },
    orderBy: { createdAt: 'desc' },
    include: {
      prescription: {
        include: {
          items: {
            include: {
              preparation: true
            }
          }
        }
      },
      consultant: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true
            }
          }
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">My Medicine Orders</h1>
        <p className="dashboard-header-subtitle">Track the preparation and delivery of your prescribed Ayurvedic medicines.</p>
      </div>
      <ConsumerFulfillmentClient initialFulfillments={fulfillments as any} />
    </div>
  );
}
