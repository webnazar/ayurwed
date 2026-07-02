import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminFulfillmentClient from '@/components/admin/AdminFulfillmentClient';

export const revalidate = 0;

export default async function AdminFulfillmentPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const fulfillments = await db.fulfillment.findMany({
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
              name: true
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
        <h1 className="dashboard-header-title">Ecosystem Fulfillments</h1>
        <p className="dashboard-header-subtitle">Platform-wide overview of all Ayurvedic medicine fulfillments and tracking.</p>
      </div>
      <AdminFulfillmentClient initialFulfillments={fulfillments as any} />
    </div>
  );
}
