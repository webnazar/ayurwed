import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import IndicationMasterClient from '@/components/admin/IndicationMasterClient';

export const revalidate = 0;

export default async function AdminIndicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const indications = await db.indication.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { preparations: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Indication Master</h1>
        <p className="dashboard-header-subtitle">
          Manage ailments, conditions, and health goals to help users discover relevant preparations.
        </p>
      </div>
      <IndicationMasterClient initialIndications={indications} />
    </div>
  );
}
