import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { 
  Package, Award, Stethoscope, BookOpen, ShoppingBag, 
  ArrowRight, Clock, CheckCircle2, ChevronRight, UserCircle, 
  Sparkles, ShieldCheck
} from 'lucide-react';

export const revalidate = 0;

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = Number((session.user as any).id);

  // Fetch in parallel: User, Recent Orders, Total Orders Count, CAI Enrollment
  const [user, orders, totalOrdersCount, enrollment] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, createdAt: true },
    }),
    db.shopOrder.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    }),
    db.shopOrder.count({
      where: { userId },
    }),
    db.enrollment.findFirst({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const userName = user?.name || session.user?.name || 'Member';
  const isEnrolled = Boolean(enrollment);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">DELIVERED</span>;
      case 'SHIPPED':
        return <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">SHIPPED</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">CANCELLED</span>;
      default:
        return <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">PROCESSING</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Header Banner */}
      <div className="dashboard-header-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Wellness Member Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-green">
              Namaste, {userName}! 🌿
            </h1>
            <p className="text-xs sm:text-sm text-brand-green/80 max-w-2xl leading-relaxed">
              Welcome to your personal AYURWED portal. Track your orders, access your learning modules, and connect with certified Ayurvedic practitioners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/shop"
              className="btn-gold px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:shadow"
            >
              <ShoppingBag className="h-4 w-4" /> Shop Store
            </Link>
            <Link
              href="/doctors"
              className="btn-green px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:shadow"
            >
              <Stethoscope className="h-4 w-4" /> Find Doctors
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (4 Overview Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Shop Orders */}
        <Link
          href="/user/myorders"
          className="bg-card border border-border hover:border-brand-green/40 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl group-hover:bg-brand-green group-hover:text-white transition-colors">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-brand-green">
              {totalOrdersCount}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-sm text-foreground group-hover:text-brand-green transition-colors">
              My Shop Orders
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {totalOrdersCount === 0 ? 'No orders placed yet' : `${totalOrdersCount} orders placed`}
            </p>
          </div>
        </Link>

        {/* Card 2: CAI Academy */}
        <Link
          href={isEnrolled ? '/user/cai' : '/academy'}
          className="bg-card border border-border hover:border-brand-gold/50 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-brand-gold/15 text-brand-gold-dark rounded-2xl group-hover:bg-brand-gold group-hover:text-brand-green transition-colors">
              <Award className="h-6 w-6" />
            </div>
            {isEnrolled ? (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                Active
              </span>
            ) : (
              <span className="bg-brand-gold/20 text-brand-gold-dark text-[10px] font-black px-2 py-0.5 rounded-full">
                Available
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-sm text-foreground group-hover:text-brand-gold-dark transition-colors">
              CAI Academy
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isEnrolled ? `${enrollment?.progress || 0}% Completed · Go to Course` : 'Certificate in Ancient Intelligence'}
            </p>
          </div>
        </Link>

        {/* Card 3: Doctor Consultations */}
        <Link
          href="/doctors"
          className="bg-card border border-border hover:border-brand-green/40 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl group-hover:bg-brand-green group-hover:text-white transition-colors">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="bg-brand-green/10 text-brand-green text-[10px] font-black px-2 py-0.5 rounded-full">
              Zero Fee
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-sm text-foreground group-hover:text-brand-green transition-colors">
              Verified Doctors
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Direct consultations without middleman fees
            </p>
          </div>
        </Link>

        {/* Card 4: Knowledge Hub */}
        <Link
          href="/knowledge"
          className="bg-card border border-border hover:border-brand-gold/50 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-brand-gold/15 text-brand-gold-dark rounded-2xl group-hover:bg-brand-gold group-hover:text-brand-green transition-colors">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground">
              Open Access
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-sm text-foreground group-hover:text-brand-gold-dark transition-colors">
              Ayurveda Articles
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Read classical herb & dosha wellness guides
            </p>
          </div>
        </Link>

      </div>

      {/* 3. Middle Section: Recent Orders & CAI Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-green" />
              <h2 className="font-extrabold text-base sm:text-lg text-brand-green">Recent Shop Orders</h2>
            </div>
            <Link
              href="/user/myorders"
              className="text-xs font-bold text-brand-gold-dark hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">You haven&apos;t placed any orders yet.</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Explore our curated catalog of authentic classical Ayurvedic medicines, oils, and remedies.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 btn-gold px-5 py-2.5 rounded-full text-xs font-extrabold shadow-sm"
              >
                <ShoppingBag className="h-4 w-4" /> Browse Store Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xs text-foreground">
                        #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                    <span className="font-black text-sm text-brand-green">
                      {formatPrice(Number(order.total))}
                    </span>
                    <Link
                      href="/user/myorders"
                      className="px-3 py-1.5 rounded-xl bg-card border border-border hover:border-brand-green text-xs font-bold text-foreground transition-colors shadow-xs"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CAI Certification & Profile Shortcuts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CAI Academy Card */}
          <div className="bg-gradient-to-br from-brand-green to-[#0e3b1c] text-white rounded-3xl p-6 shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/15 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="p-2.5 bg-white/10 text-brand-gold rounded-xl">
                <Award className="h-5 w-5" />
              </div>
              <span className="bg-brand-gold text-brand-green text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                Certification
              </span>
            </div>

            <div className="relative z-10 space-y-1.5">
              <h3 className="text-lg font-black text-white">
                Certificate in Ancient Intelligence
              </h3>
              <p className="text-xs text-brand-green-light leading-relaxed">
                {isEnrolled 
                  ? 'Your enrollment in the CAI program is active. Access your video curriculum and AI learning tutor.' 
                  : 'Explore authentic Ayurvedic wisdom fused with cutting-edge Ancient Intelligence learning modules.'}
              </p>
            </div>

            {isEnrolled ? (
              <div className="relative z-10 space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-brand-gold font-bold">
                  <span>Course Progress</span>
                  <span>{enrollment?.progress || 0}%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-gold h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(enrollment?.progress || 0, 100)}%` }}
                  ></div>
                </div>
                <Link
                  href="/user/cai"
                  className="btn-gold w-full mt-2 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow"
                >
                  Continue Learning <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="relative z-10 pt-2 border-t border-white/10">
                <Link
                  href="/academy"
                  className="btn-gold w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow"
                >
                  Explore Curriculum & Enroll <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Profile Shortcut Card */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground">Profile & Addresses</h4>
                  <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <Link
                href="/user/profile"
                className="text-xs font-bold text-brand-green hover:underline flex items-center gap-0.5"
              >
                <span>Edit</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
