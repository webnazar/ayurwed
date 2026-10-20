import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Users, Package, ShoppingBag, Calendar, TrendingUp, Star, Award, Activity, BarChart3 } from 'lucide-react';
import PendingAcfpList from '@/components/admin/PendingAcfpList';

import AdminBookOnBehalfTrigger from '@/components/admin/AdminBookOnBehalfTrigger';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Control Center & Ecosystem Analytics | AYURWED',
  description: 'AYURWED administrative dashboard for ecosystem analytics, doctor verifications, order fulfillment, and user management.',
  keywords: ['Admin Dashboard', 'AYURWED Admin', 'System Management'],
};

export const revalidate = 0;

export default async function AdminStatsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [
    usersCount, productsCount, enquiriesCount, appointmentsCount,
    activeProducts, pendingEnquiries,
    topProducts, topConsultants, recentUsers,
    pendingAcfpConsultants,
    certifiedConsultants,
    registeredUsers,
  ] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.enquiry.count(),
    db.appointment.count(),
    db.product.count({ where: { isActive: true } }),
    db.enquiry.count({ where: { isRead: false } }),
    db.product.findMany({
      where: { isActive: true },
      orderBy: { totalReviews: 'desc' },
      take: 5,
      include: { indications: { select: { name: true } } },
    }),
    db.consultantProfile.findMany({
      orderBy: { totalReviews: 'desc' },
      take: 5,
      include: { user: { select: { name: true } }, _count: { select: { appointments: true } } },
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    db.consultantProfile.findMany({
      where: {
        isAcfp: false,
        acfpVerifiedAt: { not: null }
      },
      include: {
        user: { select: { name: true, email: true, avatar: true } }
      }
    }),
    db.consultantProfile.findMany({
      where: { isCaiCertified: true },
      include: { user: { select: { name: true } } }
    }),
    db.user.findMany({
      select: { id: true, name: true, email: true, phone: true },
      take: 200,
      orderBy: { createdAt: 'desc' }
    }),
  ]);

  const serializedConsultants = certifiedConsultants.map(c => {
    let parsedAvailability = {};
    try { parsedAvailability = JSON.parse((c.availability as string) || '{}'); } catch {}
    return {
      id: c.id,
      name: c.user?.name || 'Doctor',
      specialization: c.specialization,
      consultationFee: Number(c.consultationFee),
      followUpFee: Number(c.followUpFee),
      availability: parsedAvailability,
    };
  });

  const serializedPendingConsultants = pendingAcfpConsultants.map(c => ({
    id: c.id,
    specialization: c.specialization,
    experience: c.experience,
    acfpVerifiedAt: c.acfpVerifiedAt ? c.acfpVerifiedAt.toISOString() : null,
    user: {
      name: c.user.name,
      email: c.user.email,
      avatar: c.user.avatar
    }
  }));

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-rose-100 text-rose-700',
    CONSULTANT: 'bg-indigo-100 text-indigo-700',
    MANUFACTURER: 'bg-amber-100 text-amber-700',
    CONSUMER: 'bg-emerald-100 text-emerald-700',
  };

  const stats = [
    { label: 'Total Enquiries', value: enquiriesCount, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { label: 'Registered Users', value: usersCount, icon: Users, color: 'text-brand-green bg-brand-green-light dark:bg-brand-green-light/20' },
    { label: 'Active Products', value: `${activeProducts} / ${productsCount}`, icon: Package, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
    { label: 'Consultations', value: appointmentsCount, icon: Calendar, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
    { label: 'New Enquiries', value: pendingEnquiries, icon: Activity, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
    { label: 'Featured Products', value: topProducts.length, icon: Star, color: 'text-brand-gold-dark bg-brand-gold/15 dark:text-brand-gold' },
    { label: 'Top Consultants', value: topConsultants.length, icon: Award, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-3.5">
      {/* Header Banner - Minimal Margins, Merged Action */}
      <div className="dashboard-header-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h1 className="dashboard-header-title text-lg sm:text-xl">Global Statistics</h1>
        </div>
        <AdminBookOnBehalfTrigger consultants={serializedConsultants} users={registeredUsers} />
      </div>

      {/* KPI Stats Grid - Equal & Minimal Margin */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-3.5 border border-border shadow-sm flex items-center gap-3 hover:border-brand-green/30 transition-colors">
            <div className={`p-2.5 rounded-xl shrink-0 ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider truncate" title={s.label}>
                {s.label}
              </span>
              <span className="text-lg font-extrabold text-foreground truncate block">
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pending ACFP Approvals */}
      <PendingAcfpList initialList={serializedPendingConsultants} />

      {/* Analytics Lists Grid - Equal & Minimal Margin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Top Products */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-border flex items-center gap-2 bg-muted/20">
            <Package className="h-4 w-4 text-brand-green shrink-0" />
            <h2 className="font-bold text-brand-green text-sm">Top Reviewed Products</h2>
          </div>
          <div className="divide-y divide-border flex-1">
            {topProducts.length === 0 ? (
              <p className="p-4 text-center text-foreground/40 text-xs">No products yet.</p>
            ) : topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-brand-gold-light/10 transition-colors">
                <span className="h-6 w-6 rounded-full bg-brand-green-light text-brand-green text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-foreground text-xs line-clamp-1">{p.name}</p>
                  <p className="text-[11px] text-foreground/50">{p.indications?.[0]?.name || 'Wellness'} · {p.totalReviews} reviews</p>
                </div>
                <div className="flex items-center gap-0.5 text-brand-gold flex-shrink-0">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold text-foreground">{Number(p.rating).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Consultants */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-border flex items-center gap-2 bg-muted/20">
            <Award className="h-4 w-4 text-brand-green shrink-0" />
            <h2 className="font-bold text-brand-green text-sm">Top Consultants</h2>
          </div>
          <div className="divide-y divide-border flex-1">
            {topConsultants.length === 0 ? (
              <p className="p-4 text-center text-foreground/40 text-xs">No consultants yet.</p>
            ) : topConsultants.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-brand-gold-light/10 transition-colors">
                <span className="h-6 w-6 rounded-full bg-brand-green-light text-brand-green text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-foreground text-xs line-clamp-1">{c.user?.name}</p>
                  <p className="text-[11px] text-foreground/50">{c._count.appointments} appointments</p>
                </div>
                <div className="flex items-center gap-0.5 text-brand-gold flex-shrink-0">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold text-foreground">{Number(c.rating).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-border flex items-center gap-2 bg-muted/20">
            <Users className="h-4 w-4 text-brand-green shrink-0" />
            <h2 className="font-bold text-brand-green text-sm">Recent Registrations</h2>
          </div>
          <div className="divide-y divide-border flex-1">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-brand-gold-light/10 transition-colors">
                <div className="h-7 w-7 bg-brand-gold text-brand-green font-bold rounded-full flex items-center justify-center text-xs flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-foreground text-xs line-clamp-1">{u.name}</p>
                  <p className="text-[11px] text-foreground/50 line-clamp-1">{u.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${roleBadge[u.role] || 'bg-muted text-muted-foreground'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
