import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import PreparationMasterClient from '@/components/admin/PreparationMasterClient';

export const revalidate = 0;

export default async function AdminExtractsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [preparations, indications] = await Promise.all([
    db.preparation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {

        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    }),

    db.indication.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Preparation Master</h1>
        <p className="dashboard-header-subtitle">
          Create, edit, and manage all Ayurvedic preparations listed on the platform.
        </p>
      </div>
      <PreparationMasterClient
        initialExtracts={preparations.map(p => {
          let parsedImages: string[] = [];
          try {
            parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
          } catch {
            parsedImages = [];
          }
          return {
            ...p,
            images: parsedImages,
            rating: p.rating ? Number(p.rating) : 0,
            mrp: p.mrp ? Number(p.mrp) : 0
          };
        }) as any}
        indications={indications}
      />
    </div>
  );
}
