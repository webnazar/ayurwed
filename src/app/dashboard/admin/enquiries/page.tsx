import React from 'react';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Inbox, Package, User, Building2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const enquiries = await db.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      manufacturer: { select: { companyName: true, slug: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">All Enquiries</h1>
        <p className="dashboard-header-subtitle">{enquiries.length} total consumer enquiries across all manufacturers.</p>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm">
          <Inbox className="h-12 w-12 text-brand-foreground/30 mx-auto mb-3" />
          <p className="text-brand-foreground/60 text-sm">No enquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className={`bg-white rounded-3xl p-6 border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 ${
              !enq.isRead ? 'border-brand-gold/40' : 'border-brand-green-border/10'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-green" />
                  <p className="font-bold text-brand-green text-sm">{enq.name}</p>
                  {!enq.isRead && <span className="bg-brand-gold text-brand-green text-[9px] font-bold px-2 py-0.5 rounded-full">New</span>}
                </div>
                <p className="text-xs text-brand-foreground/60">{enq.email}</p>
                {enq.phone && <p className="text-xs text-brand-foreground/60">{enq.phone}</p>}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-brand-foreground/60">
                  <Building2 className="h-3.5 w-3.5 text-brand-green" />
                  <span className="font-semibold text-brand-green">{enq.manufacturer.companyName}</span>
                </div>
                {enq.product && (
                  <div className="flex items-center gap-1.5 text-xs text-brand-foreground/60">
                    <Package className="h-3.5 w-3.5 text-brand-green" />
                    <span>{enq.product.name}</span>
                  </div>
                )}
                <p className="text-[10px] text-brand-foreground/40">{new Date(enq.createdAt).toLocaleString()}</p>
              </div>
              <div className="dashboard-header-card">
                {enq.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
