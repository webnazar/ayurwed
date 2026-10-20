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

  let safeEnquiries: any[] = [];

  try {
    const rawRows: any[] = await db.$queryRawUnsafe(`
      SELECT 
        e.id, e.name, e.email, e.phone, e.message, e.isRead, e.createdAt,
        p.name as prepName, p.slug as prepSlug,
        m.companyName as mfgName, m.slug as mfgSlug
      FROM enquiries e
      LEFT JOIN products p ON e.productId = p.id
      LEFT JOIN manufacturers m ON p.manufacturerId = m.id
      ORDER BY e.createdAt DESC
    `);

    safeEnquiries = rawRows.map((e: any) => ({
      id: e.id,
      name: e.name || 'Anonymous User',
      email: e.email || '',
      phone: e.phone || null,
      message: e.message || '',
      isRead: Boolean(e.isRead),
      createdAt: new Date(e.createdAt).toISOString(),
      manufacturer: e.mfgName ? { companyName: e.mfgName, slug: e.mfgSlug || '#' } : { companyName: 'Contact Form', slug: '/contact' },
      preparation: e.prepName ? { name: e.prepName, slug: e.prepSlug || '#' } : null,
    }));
  } catch (err) {
    console.error('Error fetching enquiries via raw SQL:', err);
  }

  return <EnquiriesListClient initialEnquiries={safeEnquiries} />;
}
