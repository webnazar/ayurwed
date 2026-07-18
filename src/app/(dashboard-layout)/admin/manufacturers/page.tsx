import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ManufacturerMasterClient from '@/components/admin/ManufacturerMasterClient';

export const revalidate = 0;

export default async function AdminManufacturersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const manufacturers = await db.manufacturer.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const safeManufacturers = manufacturers.map((m) => ({
    ...m,
    certifications: (() => { try { return JSON.parse(m.certifications || '[]'); } catch { return []; } })(),
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Manufacturer Master</h1>
        <p className="dashboard-header-subtitle">
          Manage pharmaceutical and herbal product manufacturers linked to shop products.
        </p>
      </div>
      <ManufacturerMasterClient initialManufacturers={safeManufacturers} />
    </div>
  );
}
