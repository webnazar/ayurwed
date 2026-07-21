import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Calendar, Sparkles, ShieldCheck, BookOpen, Leaf, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function ConsumerDashboard() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  const [appointments, enrollments] = await Promise.all([
    db.appointment.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'desc' },
      include: { consultant: { include: { user: true } } },
      take: 5,
    }),
    db.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { course: { select: { title: true, thumbnail: true } } },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className={`dashboard-header-card flex items-center justify-between`}>
        <div className="space-y-2">
          <h1 className="dashboard-header-title">Welcome, {session?.user?.name}!</h1>
          <p className="dashboard-header-subtitle">
            Your Ayurveda wellness hub — manage consultations and track courses.
          </p>
        </div>
        <div className="hidden md:block bg-brand-gold/15 p-3 rounded-full text-brand-gold">
          <Sparkles className="h-8 w-8 animate-pulse-slow" />
        </div>
      </div>

      {/* Quick Explore Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Browse Academy', href: '/academy', icon: BookOpen, desc: 'Learn Ayurvedic wisdom' },
          { label: 'Find Doctors', href: '/doctors', icon: Calendar, desc: 'Book an expert consultation' },
          { label: 'Knowledge Hub', href: '/knowledge', icon: Leaf, desc: 'Read health articles & guides' },
        ].map(({ label, href, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="bg-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className="dashboard-header-card">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-brand-green text-sm">{label}</p>
              <p className="text-xs text-brand-foreground/50">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-gold ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments */}
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-brand-green-light pb-4">
            <div className="flex items-center gap-2 text-brand-green">
              <Calendar className="h-6 w-6" />
              <h2 className="text-xl font-bold">Upcoming Consultations</h2>
            </div>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-brand-gold-light/40 rounded-2xl border border-brand-green-border/5 text-sm">
                  <div className="space-y-1">
                    <p className="font-bold text-brand-green">{app.consultant?.user?.name}</p>
                    <p className="text-xs text-brand-foreground/50">
                      {new Date(app.scheduledAt).toLocaleDateString()} at {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ml-auto w-fit ${
                      app.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      app.status === 'CONFIRMED' ? 'bg-brand-green-light text-brand-green' :
                      app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <ShieldCheck className="h-3 w-3" /> {app.status}
                    </span>
                    <span className="text-[10px] text-brand-foreground/50 block font-semibold">{app.type} call</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Calendar className="h-10 w-10 text-brand-foreground/35 mx-auto" />
              <p className="text-sm text-brand-foreground/60">No consultations booked yet.</p>
              <Link href="/doctors" className="inline-block text-xs font-bold text-brand-gold hover:text-brand-green">
                Book a doctor →
              </Link>
            </div>
          )}
        </div>

        {/* My Courses */}
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-brand-green border-b border-brand-green-light pb-4">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-xl font-bold">My Courses</h2>
          </div>
          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enr) => (
                <div key={enr.id} className="flex items-center gap-4 p-4 bg-brand-gold-light/40 rounded-2xl border border-brand-green-border/5">
                  <div className="dashboard-header-card">
                    <BookOpen className="h-5 w-5 text-brand-green" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-brand-green text-sm line-clamp-1">{enr.course.title}</p>
                    <div className="mt-1.5 bg-muted rounded-full h-1.5 w-full">
                      <div className="bg-brand-green rounded-full h-1.5 transition-all" style={{ width: `${enr.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-brand-foreground/50 mt-1">{enr.progress}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <BookOpen className="h-10 w-10 text-brand-foreground/35 mx-auto" />
              <p className="text-sm text-brand-foreground/60">No courses enrolled yet.</p>
              <Link href="/academy" className="inline-block text-xs font-bold text-brand-gold hover:text-brand-green">
                Browse Academy →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
