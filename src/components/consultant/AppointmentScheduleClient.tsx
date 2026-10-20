'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, Eye, X, Clock, CheckCircle2, XCircle, Calendar, IndianRupee, Video, MessageSquare, Phone, Link as LinkIcon, Copy, Check, RefreshCw, ExternalLink, Printer, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

type ApptStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Appointment {
  id: number; scheduledAt: string; duration: number;
  status: ApptStatus; type: string; concern: string;
  notes: string | null; fee: number; meetingLink: string | null;
  patientName: string | null; patientAge: number | null;
  patientGender: string | null; patientRelation: string | null;
  patientPhone: string | null;
  chronicDiseases: string | null; allergies: string | null;
  user: { id: number; name: string; email: string; avatar: string | null };
  prescription?: { id: number; status: string } | null;
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
  const [dateInputText, setDateInputText] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [generatingMeet, setGeneratingMeet] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newlyGenerated, setNewlyGenerated] = useState(false);

  // Pagination & Infinite Scroll State (Bandwidth & Performance Friendly)
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hiddenDateRef = useRef<HTMLInputElement | null>(null);

  // Custom Theme-Adaptive Status Dropdown State
  const [statusOpen, setStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Convert "28/07/2026", "28-07-2026", or "2026-07-28" text into "YYYY-MM-DD" for appointment matching
  const filterDateIso = useMemo(() => {
    if (!dateInputText.trim()) return '';
    const text = dateInputText.trim();
    const parts = text.split(/[\/\.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        if (year.length === 4) {
          return `${year}-${month}-${day}`;
        }
      }
    }
    return '';
  }, [dateInputText]);

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const [y, m, d] = val.split('-');
      setDateInputText(`${d}/${m}/${y}`);
    } else {
      setDateInputText('');
    }
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [search, filterStatus, dateInputText]);

  const formatDateDDMMYYYY = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    earnings: appointments.filter(a => a.status === 'COMPLETED').reduce((s, a) => s + Number(a.fee), 0),
  }), [appointments]);

  const filtered = useMemo(() => {
    let list = appointments;
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(a => {
        const userName = a.user?.name?.toLowerCase() || '';
        const patientName = a.patientName?.toLowerCase() || '';
        const userEmail = a.user?.email?.toLowerCase() || '';
        const patientPhone = a.patientPhone?.toLowerCase() || '';
        const patientRelation = a.patientRelation?.toLowerCase() || '';
        const concern = a.concern?.toLowerCase() || '';
        const apptId = `#${a.id}`.toLowerCase();

        return (
          userName.includes(q) ||
          patientName.includes(q) ||
          userEmail.includes(q) ||
          patientPhone.includes(q) ||
          patientRelation.includes(q) ||
          concern.includes(q) ||
          apptId.includes(q) ||
          String(a.id) === q
        );
      });
    }
    if (filterStatus) list = list.filter(a => a.status === filterStatus);
    if (filterDateIso) {
      list = list.filter(a => {
        const d = new Date(a.scheduledAt);
        const apptDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return apptDateStr === filterDateIso;
      });
    }
    return list;
  }, [appointments, search, filterStatus, filterDateIso]);

  const displayedAppointments = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filtered.length) {
        setVisibleCount(prev => prev + 12);
      }
    }, { threshold: 0.1 });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const updateAppointment = async (id: number, status?: ApptStatus, customMeetingLink?: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/consultant/appointments', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...(status && { status }),
          meetingLink: customMeetingLink !== undefined ? customMeetingLink : meetingLink,
          notes,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed');
      }
      const data = await res.json();
      const updated: Appointment = data;
      setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
      if (selected?.id === updated.id) {
        setSelected(updated);
        setMeetingLink(updated.meetingLink || '');
      }
      if (data.meetAutoGenerated) {
        toast.success('✅ Google Meet link auto-created & calendar invite sent!', { duration: 5000 });
      } else {
        toast.success('Appointment updated');
      }
    } catch (err: any) { toast.error(err.message || 'Update failed'); }
    finally { setUpdating(false); }
  };

  const generateMeetManually = async () => {
    if (!selected) return;
    setGeneratingMeet(true);
    try {
      const res = await fetch('/api/consultant/appointments', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, meetingLink: undefined, notes }),
      });
      if (!res.ok) throw new Error('Failed to generate Meet link');
      const data = await res.json();
      const updated: Appointment = data;
      setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
      if (selected?.id === updated.id) {
        setSelected(updated);
        setMeetingLink(updated.meetingLink || '');
      }
      if (data.meetAutoGenerated) {
        setNewlyGenerated(true);
        toast.success('Google Meet link created & calendar invite sent!', { duration: 5000 });
      } else if (data.meetError) {
        toast.error(`Meet generation failed: ${data.meetError}`, { duration: 8000 });
      } else {
        toast('Meet link not generated — appointment may not be VIDEO type', { icon: '⚠️' });
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setGeneratingMeet(false); }
  };

  const openDetail = (a: Appointment) => {
    setSelected(a);
    setMeetingLink(a.meetingLink || '');
    setNotes(a.notes || '');
    setNewlyGenerated(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Booked', value: stats.total, icon: Calendar, color: 'text-brand-green bg-brand-green/15 dark:bg-brand-green/20' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-500/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-500/20' },
          { label: 'Total Earnings', value: formatPrice(stats.earnings), icon: IndianRupee, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 dark:bg-indigo-500/20' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-foreground">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input type="text" placeholder="Search patient name, phone, email, #ID..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={dateInputText}
                onChange={e => setDateInputText(e.target.value)}
                className="pl-3.5 pr-9 bg-card text-foreground border border-border rounded-2xl py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green w-36 placeholder:text-muted-foreground/60 transition-all shadow-xs"
                title="Type date as dd/mm/yyyy or click calendar icon"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    hiddenDateRef.current?.showPicker();
                  } catch {
                    hiddenDateRef.current?.focus();
                  }
                }}
                className="absolute right-2.5 p-1 text-muted-foreground hover:text-brand-green rounded-lg transition-colors"
                title="Open calendar picker"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <input
                ref={hiddenDateRef}
                type="date"
                onChange={handleNativeDateChange}
                className="sr-only"
              />
            </div>

            <div ref={statusDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen(!statusOpen)}
                className="flex items-center gap-2 bg-card text-foreground border border-border rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green hover:bg-muted/50 transition-all shadow-xs"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span>{filterStatus ? filterStatus : 'All Statuses'}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`} />
              </button>

              {statusOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setFilterStatus(''); setStatusOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                      filterStatus === '' ? 'bg-brand-green/10 text-brand-green' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>All Statuses</span>
                    {filterStatus === '' && <Check className="h-3.5 w-3.5 text-brand-green" />}
                  </button>

                  {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as ApptStatus[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setFilterStatus(s); setStatusOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                        filterStatus === s ? 'bg-brand-green/10 text-brand-green' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{s}</span>
                      {filterStatus === s && <Check className="h-3.5 w-3.5 text-brand-green" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(dateInputText || filterStatus || search) && (
              <button
                onClick={() => { setDateInputText(''); setFilterStatus(''); setSearch(''); }}
                className="text-xs font-extrabold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-2xl border border-rose-200 transition-all flex items-center gap-1 active:scale-95"
                title="Reset all filters"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                {['ID', 'Patient', 'Date & Time', 'Type', 'Status', 'Fee', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-bold text-brand-green uppercase tracking-wider ${h === 'Actions' ? 'text-right' : h === 'Fee' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-brand-foreground/40 font-medium">No appointments found matching search.</td></tr>
              ) : displayedAppointments.map(a => (
                <tr key={a.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-5 py-4 font-bold text-brand-green/70">#{a.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden bg-brand-green-light flex-shrink-0">
                        {a.user.avatar ? (
                          <Image src={a.user.avatar} alt={a.user.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-brand-green text-sm">
                            {(a.patientName || a.user.name).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-brand-green">
                            {a.patientName || a.user.name}
                          </p>
                          {a.patientRelation && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-brand-green/10 text-brand-green rounded-md border border-brand-green/20">
                              {a.patientRelation}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-foreground/50">
                          {a.patientPhone ? `Mob: ${a.patientPhone} • ` : ''}{a.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-brand-green">{formatDateDDMMYYYY(a.scheduledAt)}</p>
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
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openDetail(a)}
                        className="px-2.5 py-1.5 rounded-xl text-brand-green hover:bg-brand-green-light transition-colors border border-brand-green/20 flex items-center gap-1 text-xs font-semibold" title="View Details">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      {(a.status === 'CONFIRMED' || a.status === 'COMPLETED') && (
                        <Link href={`/consultant/aipe/${a.id}`}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0f381b] to-brand-green hover:brightness-110 text-brand-gold text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                          title="Open Prescription Engine">
                          <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                          <span>Prescription</span>
                        </Link>
                      )}

                      {a.prescription && (
                        <a href={`/prescriptions/print/${a.id}`} target="_blank" rel="noreferrer"
                          className="p-2 rounded-xl text-brand-gold hover:bg-brand-gold/10 transition-colors border border-brand-gold/20" title="Print Prescription">
                          <Printer className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bandwidth & Performance Friendly Load More Footer / Scroll Sentinel */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-border bg-brand-gold-light/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-bold text-brand-green">{displayedAppointments.length}</span> of <span className="font-bold text-brand-green">{filtered.length}</span> appointments
            </div>
            {visibleCount < filtered.length ? (
              <div ref={sentinelRef} className="flex items-center gap-2">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-4 py-2 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 border border-brand-green/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground/70 italic">All matching appointments loaded</span>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelected(null)}>
          <div 
            className="bg-card w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-lg">Appointment Detail</h3>
                <p className="text-xs text-brand-green-light mt-0.5">{selected.patientName || selected.user.name} · {selected.type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 bg-card/10 hover:bg-card/20 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Patient Info Details */}
              {selected.patientName && (
                <div>
                  <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Patient Details</p>
                  <div className="bg-brand-gold-light/30 rounded-2xl p-4 text-sm text-brand-foreground/80 flex flex-wrap gap-x-6 gap-y-2">
                    <p><span className="font-bold">Name:</span> {selected.patientName}</p>
                    {selected.patientAge && <p><span className="font-bold">Age:</span> {selected.patientAge} yrs</p>}
                    {selected.patientGender && <p><span className="font-bold">Gender:</span> {selected.patientGender}</p>}
                    {selected.patientPhone && <p><span className="font-bold">Phone:</span> {selected.patientPhone}</p>}
                  </div>
                </div>
              )}

              {/* Medical History */}
              {(selected.chronicDiseases || selected.allergies) && (
                <div>
                  <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Medical History</p>
                  <div className="bg-brand-gold-light/20 rounded-2xl p-4 text-sm text-brand-foreground/80 space-y-2 border border-brand-gold/20">
                    {selected.chronicDiseases && (
                      <p><span className="font-bold text-brand-green">Chronic Diseases:</span> {selected.chronicDiseases}</p>
                    )}
                    {selected.allergies && (
                      <p><span className="font-bold text-brand-green">Allergies:</span> {selected.allergies}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Concern */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Patient Concern</p>
                <div className="bg-brand-gold-light/30 rounded-2xl p-4 text-sm text-brand-foreground/80 leading-relaxed">{selected.concern}</div>
              </div>

              {/* Meeting Link */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Meeting Link</p>

                {/* Newly auto-generated — prominent banner */}
                {selected.meetingLink && newlyGenerated && (
                  <div className="mb-3 rounded-2xl overflow-hidden border-2 border-[#1a73e8] shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-[#1a73e8] px-4 py-2.5 flex items-center gap-2">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4 bg-white rounded-full p-0.5" />
                      <span className="text-white text-xs font-extrabold tracking-wide uppercase">✅ Google Meet Link Generated!</span>
                      <span className="ml-auto text-[10px] text-blue-100 font-medium">Calendar invite sent to patient</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-3 flex items-center gap-3">
                      <Video className="h-5 w-5 text-[#1a73e8] flex-shrink-0" />
                      <a
                        href={selected.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-[#1a73e8] font-bold truncate hover:underline"
                      >
                        {selected.meetingLink}
                      </a>
                      <button
                        onClick={() => copyLink(selected.meetingLink!)}
                        className="flex items-center gap-1 bg-[#1a73e8] hover:bg-[#1558c0] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                        title="Copy link"
                      >
                        {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedLink ? 'Copied!' : 'Copy'}
                      </button>
                      <a
                        href={selected.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 border border-[#1a73e8] text-[#1a73e8] hover:bg-[#1a73e8] hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                        title="Open Meet"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </a>
                    </div>
                  </div>
                )}

                {/* Existing link display (not newly generated) */}
                {selected.meetingLink && !newlyGenerated && (
                  <div className="mb-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-3.5 py-2.5">
                    <Video className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <a
                      href={selected.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate hover:underline"
                    >
                      {selected.meetingLink}
                    </a>
                    <button
                      onClick={() => copyLink(selected.meetingLink!)}
                      className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-emerald-600"
                      title="Copy link"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={selected.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-emerald-600"
                      title="Open Meet"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                {/* Auto-generate button (VIDEO only) */}
                {selected.type === 'VIDEO' && (
                  <button
                    onClick={generateMeetManually}
                    disabled={generatingMeet || updating}
                    className="w-full mb-3 py-2.5 rounded-2xl bg-[#1a73e8] hover:bg-[#1558c0] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60"
                  >
                    {generatingMeet ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-3.5 w-3.5" />
                    )}
                    {selected.meetingLink ? 'Re-generate Google Meet Link' : 'Auto-Generate Google Meet Link'}
                  </button>
                )}

                {/* Manual override */}
                <p className="text-[10px] text-brand-foreground/40 mb-1.5 font-semibold uppercase tracking-wider">
                  {selected.type === 'VIDEO' ? 'Or set link manually:' : 'Meeting / Session Link:'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={e => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="flex-1 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20"
                  />
                  <button
                    onClick={() => updateAppointment(selected.id, undefined, meetingLink)}
                    disabled={updating || !meetingLink}
                    className="px-4 py-2.5 rounded-2xl bg-brand-green text-white text-xs font-bold hover:bg-brand-green/90 flex items-center gap-1 disabled:opacity-60"
                  >
                    <LinkIcon className="h-3.5 w-3.5" /> Set
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Internal Notes</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add notes about this appointment..."
                  className="w-full border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 bg-brand-gold-light/20 resize-none" />
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

            {/* Sticky Actions Footer */}
            {(selected.status !== 'CANCELLED') && (
              <div className="p-4 sm:p-6 border-t border-border bg-card/80 backdrop-blur-sm shrink-0 space-y-3">
                {selected.status === 'PENDING' && (
                  <div className="space-y-2">
                    {selected.type === 'VIDEO' && (
                      <p className="text-[10px] text-center text-[#1a73e8] font-semibold flex items-center justify-center gap-1">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-3 w-3" />
                        Confirming will auto-create a Google Meet link & send calendar invites
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => updateAppointment(selected.id, 'CONFIRMED')} disabled={updating}
                        className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md">
                        {updating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Confirm
                      </button>
                      <button onClick={() => updateAppointment(selected.id, 'CANCELLED')} disabled={updating}
                        className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md">
                        <XCircle className="h-5 w-5" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
                {selected.status === 'CONFIRMED' && (
                  <button onClick={() => setCompletingId(selected.id)} disabled={updating}
                    className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md">
                    <CheckCircle2 className="h-5 w-5" /> Mark as Completed
                  </button>
                )}
                <Link href={`/consultant/aipe/${selected.id}`} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0f381b] to-brand-green text-brand-gold text-sm font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-md transition-all hover:shadow-lg">
                  <Sparkles className="h-5 w-5" /> Open Ancient Intelligence Prescription Engine
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setCompletingId(null)} />
          <div className="relative bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <button onClick={() => setCompletingId(null)} className="absolute right-4 top-4 text-brand-foreground/50 hover:text-brand-foreground bg-muted hover:bg-muted/80 p-1.5 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-brand-foreground">Mark Appointment as Completed?</h3>
              <p className="text-sm text-brand-foreground/70">
                Are you sure you want to mark this appointment as completed? Please ensure that the consultation has finished and the prescription (if any) is finalized.
              </p>
              <div className="flex w-full gap-3 pt-4">
                <button
                  onClick={() => setCompletingId(null)}
                  disabled={updating}
                  className="flex-1 px-4 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateAppointment(completingId, 'COMPLETED');
                    setCompletingId(null);
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow disabled:opacity-50"
                >
                  Yes, Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
