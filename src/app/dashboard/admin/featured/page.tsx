import React from 'react';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Star } from 'lucide-react';
import FeaturedManagementClient from '@/components/admin/FeaturedManagementClient';

export const revalidate = 0;

export default async function AdminFeaturedPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [manufacturers, products, consultants] = await Promise.all([
    db.manufacturerProfile.findMany({
      orderBy: { companyName: 'asc' },
      select: { id: true, companyName: true, isFeatured: true, isPremium: true, listingTier: true },
    }),
    db.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isFeatured: true, isSponsored: true },
    }),
    db.consultantProfile.findMany({
      orderBy: { id: 'asc' },
      include: { user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">
          <Star className="h-7 w-7 text-brand-gold" /> Featured & Sponsored Management
        </h1>
        <p className="dashboard-header-subtitle">
          Control which manufacturers, products, and consultants are featured or sponsored on AYURWED.
        </p>
      </div>

      <FeaturedManagementClient
        manufacturers={manufacturers.map(m => ({ id: m.id, name: m.companyName, isFeatured: m.isFeatured, isPremium: m.isPremium, listingTier: m.listingTier }))}
        products={products.map(p => ({ id: p.id, name: p.name, isFeatured: p.isFeatured, isSponsored: p.isSponsored }))}
        consultants={consultants.map(c => ({ id: c.id, name: c.user.name, isFeatured: c.isFeatured }))}
      />
    </div>
  );
}
