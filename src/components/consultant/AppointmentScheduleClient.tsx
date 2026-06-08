'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, X, Clock, CheckCircle2, XCircle, Calendar, DollarSign, Video, MessageSquare, Phone, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

type ApptStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Appointment {
  id: number; scheduledAt: string; duration: number;
  status: ApptStatus; type: string; concern: string;
  notes: string | null; fee: number; meetingLink: string | null;
  user: { id: number; name: string; email: string; avatar: string | null };
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

export default function AppointmentScheduleClient({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    earnings: appointments.filter(a => a.status === 'COMPLETED').reduce((s, a) => s + Number(a.fee), 0),
  }), [appointments]);

  const filtered = useMemo(() => {
    let list = appointments;
    if (search) list = list.filter(a => a.user.name.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) list = list.filter(a => a.status === filterStatus);
    return list;
  }, [appointments, search, filterStatus]);

  const updateAppointment = async (id: number, status?: ApptStatus) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/consultant/appointments', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...(status && { status }), meetingLink, notes }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated: Appointment = await res.json();
      setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
      if (selected?.id === updated.id) setSelected(updated);
      toast.success('Appointment updated');
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  const openDetail = (a: Appointment) => {
    setSelected(a);
    setMeetingLink(a.meetingLink || '');
    setNotes(a.notes || '');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Booked', value: stats.total, icon: Calendar, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Earnings', value: formatPrice(stats.earnings), icon: DollarSign, color: 'text-indigo-600 bg-indigo-50' },
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
            <input type="text" placeholder="Search patient name..." value={search} onChange={e => setSearch(e.target.value)}
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                {['Patient', 'Date & Time', 'Type', 'Status', 'Fee', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${h === 'Actions' || h === 'Fee' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-brand-foreground/40 font-medium">No appointments found.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden bg-brand-green-light flex-shrink-0">
                        {a.user.avatar ? (
                          <Image src={a.user.avatar} alt={a.user.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-brand-green text-sm">
                            {a.user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-brand-green">{a.user.name}</p>
                        <p className="text-xs text-brand-foreground/50">{a.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-brand-green">{new Date(a.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-xs text-brand-foreground/50">{new Date(a.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {a.duration}min</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-brand-green bg-brand-green-light px-2.5 py-1 rounded-full w-fit">
                      {typeIcon[a.type]} {a.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-brand-green">{formatPrice(Number(a.fee))}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => openDetail(a)}
                      className="p-2 rounded-xl text-brand-green hover:bg-brand-green-light transition-colors border border-brand-green/20">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-lg">Appointment Detail</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{selected.user.name} · {selected.type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Actions */}
              {selected.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => updateAppointment(selected.id, 'CONFIRMED')} disabled={updating}
                    className="flex-1 py-2.5 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 disabled:opacity-60 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Confirm
                  </button>
                  <button onClick={() => updateAppointment(selected.id, 'CANCELLED')} disabled={updating}
                    className="flex-1 py-2.5 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-60 flex items-center justify-center gap-1">
                    <XCircle className="h-4 w-4" /> Cancel
                  </button>
                </div>
              )}
              {selected.status === 'CONFIRMED' && (
                <button onClick={() => updateAppointment(selected.id, 'COMPLETED')} disabled={updating}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60">
                  Mark as Completed
                </button>
              )}

              {/* Concern */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Patient Concern</p>
                <div className="bg-brand-gold-light/30 rounded-2xl p-4 text-sm text-brand-foreground/80 leading-relaxed">{selected.concern}</div>
              </div>

              {/* Meeting Link */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Meeting Link</p>
                <div className="flex gap-2">
                  <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..." className="flex-1 border border-brand-green-border/20 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20" />
                  <button onClick={() => updateAppointment(selected.id)} disabled={updating}
                    className="px-4 py-2.5 rounded-2xl bg-brand-green text-white text-xs font-bold hover:bg-brand-green/90 flex items-center gap-1 disabled:opacity-60">
                    <LinkIcon className="h-3.5 w-3.5" /> Set
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Internal Notes</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add notes about this appointment..."
                  className="w-full border border-brand-green-border/20 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20 resize-none" />
                <button onClick={() => updateAppointment(selected.id)} disabled={updating}
                  className="mt-2 w-full py-2.5 rounded-2xl border border-brand-green/20 text-brand-green text-sm font-bold hover:bg-brand-green-light transition-colors disabled:opacity-60">
                  Save Notes
                </button>
              </div>

              {/* Info */}
              <div className="bg-brand-green-light/30 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-brand-foreground/60">Date</span><span className="font-semibold">{new Date(selected.scheduledAt).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-brand-foreground/60">Duration</span><span className="font-semibold">{selected.duration} minutes</span></div>
                <div className="flex justify-between"><span className="text-brand-foreground/60">Fee</span><span className="font-bold text-brand-green">{formatPrice(Number(selected.fee))}</span></div>
                <div className="flex justify-between"><span className="text-brand-foreground/60">Status</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
