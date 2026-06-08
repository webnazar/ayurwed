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
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Indication Master</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Manage ailments, conditions, and health goals to help users discover relevant products.
        </p>
      </div>
      <IndicationMasterClient initialIndications={indications} />
    </div>
  );
}
