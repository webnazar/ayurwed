import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Inbox, Package, User, CheckCheck } from 'lucide-react';

export const revalidate = 0;

export default async function ManufacturerEnquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'MANUFACTURER') redirect('/login');

  const profile = await db.manufacturerProfile.findUnique({
    where: { userId: Number((session.user as any).id) },
  });
  if (!profile) redirect('/dashboard/manufacturer');

  const enquiries = await db.enquiry.findMany({
    where: { manufacturerId: profile.id },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true, slug: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Enquiries Received</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Consumer enquiries sent to your company through AYURWED.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
          <Inbox className="h-12 w-12 text-brand-foreground/30 mx-auto" />
          <p className="text-brand-foreground/60 text-sm">No enquiries yet. Complete your profile to attract more leads.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className={`bg-white rounded-3xl p-6 border shadow-sm space-y-3 ${
              !enq.isRead ? 'border-brand-gold/40 bg-brand-gold-light/20' : 'border-brand-green-border/10'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-green-light flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-green text-sm">{enq.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-brand-foreground/60 mt-0.5">
                      <a href={`mailto:${enq.email}`} className="hover:text-brand-green">{enq.email}</a>
                      {enq.phone && <a href={`tel:${enq.phone}`} className="hover:text-brand-green">{enq.phone}</a>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="text-xs text-brand-foreground/40">{new Date(enq.createdAt).toLocaleDateString()}</p>
                  {!enq.isRead && (
                    <span className="bg-brand-gold text-brand-green text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                  )}
                </div>
              </div>
              {enq.product && (
                <div className="flex items-center gap-1.5 text-xs text-brand-foreground/60">
                  <Package className="h-3.5 w-3.5 text-brand-green" />
                  <span>About: <span className="font-semibold text-brand-green">{enq.product.name}</span></span>
                </div>
              )}
              <div className="bg-brand-green-light/30 rounded-2xl p-4 text-sm text-brand-foreground/80 leading-relaxed">
                {enq.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
