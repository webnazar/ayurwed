import React from 'react';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EnquiriesListClient from '@/components/admin/EnquiriesListClient';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const enquiries = await db.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      manufacturer: { select: { companyName: true, slug: true } },
      preparation: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">All Enquiries</h1>
        <p className="dashboard-header-subtitle">{enquiries.length} total consumer enquiries across all manufacturers.</p>
      </div>

      <EnquiriesListClient initialEnquiries={JSON.parse(JSON.stringify(enquiries))} />
    </div>
  );
}
