import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import SymptomsMasterClient from '@/components/admin/SymptomsMasterClient';

export const revalidate = 0;

export default async function AdminSymptomsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const symptoms = await db.indication.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return <SymptomsMasterClient initialSymptoms={symptoms} />;
}
