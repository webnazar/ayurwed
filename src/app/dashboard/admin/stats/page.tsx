import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Users, Package, ShoppingBag, Calendar, TrendingUp, Star, Award, Activity } from 'lucide-react';

export const revalidate = 0;

export default async function AdminStatsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [
    usersCount, productsCount, enquiriesCount, appointmentsCount,
    activeProducts, pendingEnquiries,
    topProducts, topConsultants, recentUsers,
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
      include: { category: { select: { name: true } } },
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
  ]);


  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-rose-100 text-rose-700',
    CONSULTANT: 'bg-indigo-100 text-indigo-700',
    MANUFACTURER: 'bg-amber-100 text-amber-700',
    CONSUMER: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-8">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Global Statistics</h1>
        <p className="dashboard-header-subtitle">Platform-wide performance overview and insights.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enquiries', value: enquiriesCount, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Registered Users', value: usersCount, icon: Users, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Active Products', value: `${activeProducts} / ${productsCount}`, icon: Package, color: 'text-amber-600 bg-amber-50' },
          { label: 'Consultations', value: appointmentsCount, icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New Enquiries', value: pendingEnquiries, icon: Activity, color: 'text-orange-600 bg-orange-50' },
          { label: 'Featured Products', value: topProducts.length, icon: Star, color: 'text-brand-gold-dark bg-brand-gold/15' },
          { label: 'Top Consultants', value: topConsultants.length, icon: Award, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-brand-green-border/10 flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-green" />
            <h2 className="font-bold text-brand-green">Top Reviewed Products</h2>
          </div>
          <div className="divide-y divide-brand-green-border/10">
            {topProducts.length === 0 ? (
              <p className="p-6 text-center text-brand-foreground/40 text-sm">No products yet.</p>
            ) : topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-brand-gold-light/10 transition-colors">
                <span className="h-7 w-7 rounded-full bg-brand-green-light text-brand-green text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-brand-green text-sm line-clamp-1">{p.name}</p>
                  <p className="text-xs text-brand-foreground/50">{p.category?.name} · {p.totalReviews} reviews</p>
                </div>
                <div className="flex items-center gap-0.5 text-brand-gold flex-shrink-0">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold text-brand-green">{Number(p.rating).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Consultants */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-brand-green-border/10 flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-green" />
            <h2 className="font-bold text-brand-green">Top Consultants</h2>
          </div>
          <div className="divide-y divide-brand-green-border/10">
            {topConsultants.length === 0 ? (
              <p className="p-6 text-center text-brand-foreground/40 text-sm">No consultants yet.</p>
            ) : topConsultants.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-4 hover:bg-brand-gold-light/10 transition-colors">
                <span className="h-7 w-7 rounded-full bg-brand-green-light text-brand-green text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-brand-green text-sm line-clamp-1">{c.user?.name}</p>
                  <p className="text-xs text-brand-foreground/50">{c._count.appointments} appointments</p>
                </div>
                <div className="flex items-center gap-0.5 text-brand-gold flex-shrink-0">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold text-brand-green">{Number(c.rating).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-brand-green-border/10 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-green" />
            <h2 className="font-bold text-brand-green">Recent Registrations</h2>
          </div>
          <div className="divide-y divide-brand-green-border/10">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-4 hover:bg-brand-gold-light/10 transition-colors">
                <div className="h-9 w-9 bg-brand-gold text-brand-green font-bold rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-brand-green text-sm line-clamp-1">{u.name}</p>
                  <p className="text-xs text-brand-foreground/50 line-clamp-1">{u.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${roleBadge[u.role] || 'bg-gray-100 text-gray-600'}`}>
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
