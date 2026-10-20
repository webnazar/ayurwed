import React from 'react';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewsletterSubsClient from '@/components/admin/NewsletterSubsClient';

export const revalidate = 0;

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  let safeSubscribers: any[] = [];

  try {
    const rawRows: any[] = await db.$queryRawUnsafe(`
      SELECT id, email, isActive, createdAt FROM newsletter_subscribers ORDER BY createdAt DESC
    `);
    safeSubscribers = rawRows.map((s: any) => ({
      id: String(s.id),
      email: String(s.email),
      isActive: Boolean(s.isActive),
      createdAt: new Date(s.createdAt).toISOString(),
    }));
  } catch (err) {
    try {
      const subscribers = await db.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
      });
      safeSubscribers = subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
      }));
    } catch (e) {
      console.error('Error fetching subscribers:', e);
    }
  }

  return <NewsletterSubsClient initialSubscribers={safeSubscribers} />;
}
