'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Calendar, Clock, CheckCircle2, XCircle, Video, Phone, MessageSquare, Link as LinkIcon, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

type ApptStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Appointment {
  id: number; scheduledAt: string; duration: number;
  status: ApptStatus; type: string; concern: string;
  fee: number; meetingLink: string | null;
  consultant: {
    id: number; specialization: string;
    user: { name: string; avatar: string | null };
  };
}

const statusStyles: Record<ApptStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

const typeIcon: Record<string, React.ReactNode> = {
  VIDEO: <Video className="h-3.5 w-3.5" />,
  AUDIO: <Phone className="h-3.5 w-3.5" />,
  CHAT: <MessageSquare className="h-3.5 w-3.5" />,
};

export default function MyAppointmentsClient({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [cancelling, setCancelling] = useState<number | null>(null);

  const stats = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  }), [appointments]);

  const filtered = useMemo(() => {
    let list = appointments;
    if (search) list = list.filter(a => a.consultant.user.name.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) list = list.filter(a => a.status === filterStatus);
    return list;
  }, [appointments, search, filterStatus]);

  const cancelAppointment = async (id: number) => {
    setCancelling(id);
    try {
      const res = await fetch('/api/consumer/appointments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'CANCELLED' }) });
      if (!res.ok) throw new Error('Failed');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
      toast.success('Appointment cancelled');
    } catch { toast.error('Cancel failed'); }
    finally { setCancelling(null); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Booked', value: stats.total, icon: Calendar, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-rose-600 bg-rose-50' },
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

      {/* Panel */}
      <div className="bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-brand-green-border/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input type="text" placeholder="Search doctor name..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-60" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
              <option value="">All Statuses</option>
              {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as ApptStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <HeartHandshake className="h-14 w-14 text-brand-gold mx-auto animate-pulse-slow" />
            <h3 className="text-xl font-bold text-brand-green">No Appointments Yet</h3>
            <p className="text-sm text-brand-foreground/60">Book a consultation with a certified Ayurvedic doctor.</p>
            <Link href="/consultants" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold">Browse Doctors</Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-green-border/10">
            {filtered.map(a => (
              <div key={a.id} className="p-6 hover:bg-brand-gold-light/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-brand-green">{a.consultant.user.name}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[a.status]}`}>{a.status}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-brand-green bg-brand-green-light px-2 py-0.5 rounded-full">
                      {typeIcon[a.type]} {a.type}
                    </span>
                  </div>
                  <p className="text-xs text-brand-foreground/60">{a.consultant.specialization}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-brand-foreground/60">
                    <span>{new Date(a.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>{new Date(a.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{a.duration} min</span>
                    <span className="font-bold text-brand-green">{formatPrice(Number(a.fee))}</span>
                  </div>
                  {a.meetingLink && a.status === 'CONFIRMED' && (
                    <a href={a.meetingLink} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:text-brand-gold bg-brand-green-light px-3 py-1.5 rounded-full transition-colors">
                      <LinkIcon className="h-3 w-3" /> Join Meeting
                    </a>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href="/consultants" className="px-4 py-2 rounded-xl text-brand-green border border-brand-green/20 hover:bg-brand-green-light text-sm font-bold transition-colors">Book Again</Link>
                  {a.status === 'PENDING' && (
                    <button onClick={() => cancelAppointment(a.id)} disabled={cancelling === a.id}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-sm font-bold transition-colors disabled:opacity-60">
                      {cancelling === a.id ? '...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
