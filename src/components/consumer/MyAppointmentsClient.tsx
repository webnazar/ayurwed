'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Calendar, Clock, CheckCircle2, XCircle, Video, Phone, MessageSquare, Link as LinkIcon, HeartHandshake, MapPin, Printer, Truck, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';

type ApptStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Appointment {
  id: number; scheduledAt: string; duration: number;
  status: ApptStatus; type: string; concern: string;
  fee: number; meetingLink: string | null;
  patientName: string | null; patientAge: number | null;
  patientGender: string | null; patientPhone: string | null; patientRelation: string | null;
  chronicDiseases: string | null; allergies: string | null;
  consultant: {
    id: number; specialization: string;
    userId: number;
    hasClinicPickup?: boolean;
    hasSelfDispatch?: boolean;
    hasAyurwedDelivery?: boolean;
    user?: { name: string; avatar: string | null };
  } | null;
  prescription?: any;
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
  OFFLINE: <MapPin className="h-3.5 w-3.5" />,
};

export default function MyAppointmentsClient({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelModalId, setCancelModalId] = useState<number | null>(null);

  // Track selected method for each appointment's pending fulfillment
  const [selectedMethods, setSelectedMethods] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    initialAppointments.forEach(a => {
      if (a.prescription?.fulfillment?.status === 'PENDING') {
        const f = a.prescription.fulfillment;
        const c = a.consultant;
        if (c) {
          if (c.hasSelfDispatch) {
            initial[f.id] = 'SELF_DISPATCH';
          } else if (c.hasClinicPickup) {
            initial[f.id] = 'CLINIC_PICKUP';
          } else if (c.hasAyurwedDelivery) {
            initial[f.id] = 'AYURWED_DELIVERY';
          } else {
            initial[f.id] = 'SELF_DISPATCH';
          }
        }
      }
    });
    return initial;
  });

  const stats = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  }), [appointments]);

  const filtered = useMemo(() => {
    let list = appointments;
    if (search) list = list.filter(a => a.consultant?.user?.name?.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) list = list.filter(a => a.status === filterStatus);
    if (filterDate) list = list.filter(a => new Date(a.scheduledAt).toISOString().split('T')[0] === filterDate);
    return list;
  }, [appointments, search, filterStatus, filterDate]);

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

  const handleConfirmOrder = async (fulfillmentId: number, appointmentId: number) => {
    const selectedMethod = selectedMethods[fulfillmentId] || 'SELF_DISPATCH';
    toast.loading('Confirming medicine order...', { id: 'order' });
    try {
      const res = await fetch('/api/consumer/fulfillment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentId, method: selectedMethod })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      toast.dismiss('order');
      toast.success('Medicine order placed successfully!');

      setAppointments(prev =>
        prev.map(a => {
          if (a.id === appointmentId && a.prescription) {
            return {
              ...a,
              prescription: {
                ...a.prescription,
                fulfillment: {
                  ...a.prescription.fulfillment,
                  status: 'CONFIRMED',
                  method: selectedMethod
                }
              }
            };
          }
          return a;
        })
      );
    } catch (err: any) {
      toast.dismiss('order');
      toast.error(err.message || 'Something went wrong');
    }
  };

  const isShippingMethod = (method: string) => {
    return ['COURIER', 'SELF_DISPATCH', 'AYURWED_DELIVERY'].includes(method);
  };

  const getMethodDetails = (method: string) => {
    switch (method) {
      case 'CLINIC_PICKUP':
      case 'PICKUP':
        return {
          label: 'Clinic Pickup',
          icon: <MapPin className="h-3.5 w-3.5" />,
          badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200'
        };
      case 'SELF_DISPATCH':
      case 'COURIER':
        return {
          label: 'Doctor Self-Dispatch',
          icon: <Truck className="h-3.5 w-3.5" />,
          badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200'
        };
      case 'AYURWED_DELIVERY':
        return {
          label: 'AYURWED Delivery',
          icon: <Truck className="h-3.5 w-3.5 text-brand-gold-dark" />,
          badgeClass: 'bg-brand-gold/25 text-brand-gold-dark border border-brand-gold/30'
        };
      case 'PENDING':
      default:
        return {
          label: 'Fulfillment Pending Selection',
          icon: <Info className="h-3.5 w-3.5" />,
          badgeClass: 'bg-gray-100 text-gray-800 border border-gray-200'
        };
    }
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
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Book New Appointment Card */}
      <div className="bg-brand-gold-light/40 border border-brand-gold/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green text-white rounded-full flex-shrink-0">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-brand-green">Need another consultation?</h3>
            <p className="text-sm text-brand-foreground/70">Browse our directory of certified Ayurvedic doctors and book a session today.</p>
          </div>
        </div>
        <Link href="/doctors" className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold px-8 py-3 rounded-xl transition-colors whitespace-nowrap shadow-sm flex-shrink-0">
          Browse Doctors
        </Link>
      </div>

      {/* Panel */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input type="text" placeholder="Search doctor name..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-full" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-full sm:w-auto" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 pr-4 text-sm focus:outline-none appearance-none">
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
            <Link href="/doctors" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold">Browse Doctors</Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-green-border/10">
            {filtered.map(a => (
              <div key={a.id} className="p-5 hover:bg-brand-gold-light/10 transition-colors flex flex-col gap-5">
                {/* Top Row: Avatar, Info & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-brand-green-light border border-brand-green/20">
                      <SafeImage 
                        src={a.consultant?.user?.avatar} 
                        fallbackSrc="/avatar.webp"
                        alt={a.consultant?.user?.name || 'Doctor'} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    {/* Doctor Info */}
                    <div>
                      <h3 className="font-extrabold text-lg text-brand-green leading-tight">{a.consultant?.user?.name || 'Doctor'}</h3>
                      <p className="text-xs text-brand-gold-dark font-bold uppercase tracking-wider mt-0.5">{a.consultant?.specialization || 'Consultant'}</p>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-2 pl-14 sm:pl-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusStyles[a.status]}`}>{a.status}</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-brand-green bg-brand-green-light px-3 py-1.5 rounded-full">
                        {typeIcon[a.type]} {a.type}
                      </span>
                    </div>
                    {a.patientName && (
                      <span className="text-[10px] bg-brand-gold/20 text-brand-gold-dark px-2.5 py-1 rounded-full font-bold">
                        For: {a.patientName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid (Full Width) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/50 rounded-2xl p-4 sm:px-6 border border-border">
                  <div>
                    <span className="block text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider mb-1">Date</span>
                    <span className="text-sm font-semibold text-brand-foreground">{new Date(a.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider mb-1">Time</span>
                    <span className="text-sm font-semibold text-brand-foreground">{new Date(a.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider mb-1">Duration</span>
                    <span className="text-sm font-semibold text-brand-foreground">{a.duration} min</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider mb-1">Fee</span>
                    <span className="text-sm font-bold text-brand-green">{formatPrice(Number(a.fee))}</span>
                  </div>
                </div>

                {/* Patient Details (Full Width) */}
                {a.patientName && (
                  <div className="bg-brand-gold-light/30 rounded-2xl p-4 sm:px-6 border border-border text-sm text-brand-foreground/80">
                    <span className="text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider mb-2 block">Patient Details</span>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <p><span className="font-bold">Name:</span> {a.patientName}</p>
                      {a.patientAge && <p><span className="font-bold">Age:</span> {a.patientAge} yrs</p>}
                      {a.patientGender && <p><span className="font-bold">Gender:</span> {a.patientGender}</p>}
                      {a.patientPhone && <p><span className="font-bold">Phone:</span> {a.patientPhone}</p>}
                    </div>
                  </div>
                )}

                {/* Medical History */}
                {(a.chronicDiseases || a.allergies) && (
                  <div className="bg-brand-gold-light/20 rounded-2xl p-4 sm:px-6 border border-brand-gold/20 text-sm text-brand-foreground/80 space-y-2">
                    <span className="text-[10px] text-brand-gold-dark uppercase font-bold tracking-wider mb-2 block">Medical History</span>
                    {a.chronicDiseases && (
                      <p><span className="font-bold text-brand-green">Chronic Diseases:</span> {a.chronicDiseases}</p>
                    )}
                    {a.allergies && (
                      <p><span className="font-bold text-brand-green">Allergies:</span> {a.allergies}</p>
                    )}
                  </div>
                )}

                {/* Concern (Full Width) */}
                {a.concern && (
                  <div className="text-sm text-brand-foreground/75 bg-brand-green-light/20 p-4 sm:px-6 rounded-2xl border border-brand-green-light/50">
                    <span className="text-[10px] text-brand-green uppercase font-bold tracking-wider mb-2 block">Health Concern</span>
                    {a.concern}
                  </div>
                )}

                {/* Prescription Info */}
                {a.prescription && a.prescription.status !== 'DRAFT' && (
                  <div className="bg-brand-gold-light/10 rounded-2xl p-4 sm:px-6 border border-brand-gold/30">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-green" />
                        <h4 className="font-extrabold text-brand-green">Consultation Prescription</h4>
                      </div>
                      <a
                        href={`/prescriptions/print/${a.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-white bg-brand-gold hover:bg-brand-green px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Printer className="h-3.5 w-3.5" /> Print A4
                      </a>
                    </div>
                    {a.prescription.consultantJudgment && (
                      <div className="mb-4">
                        <span className="text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider block mb-1">Clinical Judgment</span>
                        <p className="text-sm font-medium text-brand-foreground/80">{a.prescription.consultantJudgment}</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <span className="text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider block mb-1">Prescribed Preparations</span>
                      {a.prescription.items?.map((item: any) => (
                        <div key={item.id} className="bg-white rounded-xl p-3 border border-border shadow-sm text-sm">
                          <p className="font-bold text-brand-green mb-1">{item.preparation?.name || 'Preparation'}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-brand-foreground/70">
                            <p><span className="font-bold uppercase block text-[9px] text-brand-foreground/40">Dosage</span>{item.dosage}</p>
                            <p><span className="font-bold uppercase block text-[9px] text-brand-foreground/40">Frequency</span>{item.frequency}</p>
                            <p><span className="font-bold uppercase block text-[9px] text-brand-foreground/40">Duration</span>{item.duration}</p>
                            <p><span className="font-bold uppercase block text-[9px] text-brand-foreground/40">Instructions</span>{item.instructions || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {a.prescription.dosageInstructions && (
                      <div className="mt-4">
                        <span className="text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider block mb-1">General Instructions</span>
                        <p className="text-sm font-medium text-brand-foreground/80">{a.prescription.dosageInstructions}</p>
                      </div>
                    )}
                    {a.prescription.followUpAdvice && (
                      <div className="mt-4 p-4 bg-brand-green-light/40 border border-brand-green-border/15 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-brand-green uppercase font-bold tracking-wider block">Recommended Follow-up</span>
                          <p className="text-sm font-extrabold text-brand-green">In {a.prescription.followUpAdvice}</p>
                        </div>
                        {a.consultant && (
                          <Link 
                            href={`/doctors/${a.consultant.userId}?type=FOLLOW_UP`}
                            className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                          >
                            Book Follow-Up Now
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Visual Fulfillment Tracking */}
                    {a.prescription.fulfillment && (() => {
                      const methodDetails = getMethodDetails(a.prescription.fulfillment.method);
                      const isShipping = isShippingMethod(a.prescription.fulfillment.method);

                      return (
                        <div className="mt-6 border-t border-brand-green-light/20 pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider">Medicine Fulfillment Status</h5>
                              <p className="text-[10px] text-brand-foreground/60 mt-0.5">
                                Fulfillment Method:{' '}
                                <strong className="text-brand-green">
                                  {methodDetails.label}
                                </strong>
                              </p>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                              a.prescription.fulfillment.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.prescription.fulfillment.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-brand-gold/20 text-brand-gold-dark'
                            }`}>
                              {a.prescription.fulfillment.status}
                            </span>
                          </div>

                          {/* Progress Stepper */}
                          {a.prescription.fulfillment.status !== 'CANCELLED' && a.prescription.fulfillment.status !== 'PENDING' && (
                            <div className="relative pt-4 pb-2">
                              {isShipping ? (
                                <div className="flex items-center justify-between relative">
                                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border z-0" />
                                  <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green transition-all duration-500 z-0"
                                    style={{
                                      width: 
                                        a.prescription.fulfillment.status === 'CONFIRMED' ? '0%' :
                                        a.prescription.fulfillment.status === 'PACKED' ? '33%' :
                                        a.prescription.fulfillment.status === 'DISPATCHED' ? '66%' : '100%'
                                    }}
                                  />

                                  {[
                                    { label: 'Confirmed', status: 'CONFIRMED' },
                                    { label: 'Packed', status: 'PACKED' },
                                    { label: 'Dispatched', status: 'DISPATCHED' },
                                    { label: 'Received', status: 'COMPLETED' }
                                  ].map((step, idx) => {
                                    const statuses = ['CONFIRMED', 'PACKED', 'DISPATCHED', 'COMPLETED'];
                                    const currentIdx = statuses.indexOf(a.prescription.fulfillment.status);
                                    const stepIdx = statuses.indexOf(step.status);
                                    const isCompleted = stepIdx < currentIdx;
                                    const isActive = stepIdx === currentIdx;

                                    return (
                                      <div key={step.label} className="flex flex-col items-center z-10 relative">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-300 ${
                                          isCompleted
                                            ? 'bg-brand-green border-brand-green text-white'
                                            : isActive
                                            ? 'bg-brand-gold border-brand-gold text-brand-green font-black animate-pulse-slow'
                                            : 'bg-white border-border text-brand-foreground/45'
                                        }`}>
                                          {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[9px] font-bold mt-1.5 transition-colors ${
                                          isActive ? 'text-brand-green font-black' : 'text-brand-foreground/60'
                                        }`}>
                                          {step.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between relative">
                                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border z-0" />
                                  <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green transition-all duration-500 z-0"
                                    style={{
                                      width: 
                                        a.prescription.fulfillment.status === 'CONFIRMED' ? '0%' :
                                        a.prescription.fulfillment.status === 'PACKED' ? '50%' : '100%'
                                    }}
                                  />

                                  {[
                                    { label: 'Preparing', status: 'CONFIRMED' },
                                    { label: 'Ready for Pickup', status: 'PACKED' },
                                    { label: 'Collected', status: 'COMPLETED' }
                                  ].map((step, idx) => {
                                    const statuses = ['CONFIRMED', 'PACKED', 'COMPLETED'];
                                    const currentIdx = statuses.indexOf(a.prescription.fulfillment.status);
                                    const stepIdx = statuses.indexOf(step.status);
                                    const isCompleted = stepIdx < currentIdx;
                                    const isActive = stepIdx === currentIdx;

                                    return (
                                      <div key={step.label} className="flex flex-col items-center z-10 relative">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-300 ${
                                          isCompleted
                                            ? 'bg-brand-green border-brand-green text-white'
                                            : isActive
                                            ? 'bg-brand-gold border-brand-gold text-brand-green font-black animate-pulse-slow'
                                            : 'bg-white border-border text-brand-foreground/45'
                                        }`}>
                                          {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[9px] font-bold mt-1.5 transition-colors ${
                                          isActive ? 'text-brand-green font-black' : 'text-brand-foreground/60'
                                        }`}>
                                          {step.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Tracking Details / Actions */}
                          {a.prescription.fulfillment.status !== 'CANCELLED' && (
                            <div className="bg-brand-gold-light/20 border border-brand-gold/25 rounded-2xl p-4 space-y-3">
                              {a.prescription.fulfillment.status === 'PENDING' ? (
                                <div className="space-y-3">
                                  <p className="font-extrabold text-brand-green text-xs">Choose Fulfillment Method:</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {a.consultant?.hasClinicPickup && (
                                      <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedMethods[a.prescription.fulfillment.id] === 'CLINIC_PICKUP'
                                          ? 'border-brand-gold bg-brand-gold-light/40 font-bold'
                                          : 'border-border hover:border-brand-green text-brand-foreground/75'
                                      }`}>
                                        <input
                                          type="radio"
                                          name={`appt-fulfillment-method-${a.prescription.fulfillment.id}`}
                                          checked={selectedMethods[a.prescription.fulfillment.id] === 'CLINIC_PICKUP'}
                                          onChange={() => setSelectedMethods(prev => ({ ...prev, [a.prescription.fulfillment.id]: 'CLINIC_PICKUP' }))}
                                          className="text-brand-green focus:ring-brand-green cursor-pointer"
                                        />
                                        <span className="text-xs font-bold">Clinic Pickup</span>
                                      </label>
                                    )}
                                    {a.consultant?.hasSelfDispatch && (
                                      <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedMethods[a.prescription.fulfillment.id] === 'SELF_DISPATCH'
                                          ? 'border-brand-gold bg-brand-gold-light/40 font-bold'
                                          : 'border-border hover:border-brand-green text-brand-foreground/75'
                                      }`}>
                                        <input
                                          type="radio"
                                          name={`appt-fulfillment-method-${a.prescription.fulfillment.id}`}
                                          checked={selectedMethods[a.prescription.fulfillment.id] === 'SELF_DISPATCH'}
                                          onChange={() => setSelectedMethods(prev => ({ ...prev, [a.prescription.fulfillment.id]: 'SELF_DISPATCH' }))}
                                          className="text-brand-green focus:ring-brand-green cursor-pointer"
                                        />
                                        <span className="text-xs font-bold">Self-Dispatch</span>
                                      </label>
                                    )}
                                    {a.consultant?.hasAyurwedDelivery && (
                                      <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedMethods[a.prescription.fulfillment.id] === 'AYURWED_DELIVERY'
                                          ? 'border-brand-gold bg-brand-gold-light/40 font-bold'
                                          : 'border-border hover:border-brand-green text-brand-foreground/75'
                                      }`}>
                                        <input
                                          type="radio"
                                          name={`appt-fulfillment-method-${a.prescription.fulfillment.id}`}
                                          checked={selectedMethods[a.prescription.fulfillment.id] === 'AYURWED_DELIVERY'}
                                          onChange={() => setSelectedMethods(prev => ({ ...prev, [a.prescription.fulfillment.id]: 'AYURWED_DELIVERY' }))}
                                          className="text-brand-green focus:ring-brand-green cursor-pointer"
                                        />
                                        <span className="text-xs font-bold">AYURWED Delivery</span>
                                      </label>
                                    )}
                                    {!a.consultant?.hasClinicPickup && !a.consultant?.hasSelfDispatch && !a.consultant?.hasAyurwedDelivery && (
                                      <div className="col-span-3 text-xs italic text-brand-foreground/50">
                                        No specific fulfillment configuration set by doctor.
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleConfirmOrder(a.prescription.fulfillment.id, a.id)}
                                    className="w-full bg-brand-gold hover:bg-brand-green hover:text-white text-brand-green font-bold text-xs py-2.5 rounded-xl transition-all border border-brand-gold/30 shadow-sm uppercase tracking-wider"
                                  >
                                    Confirm & Order Medicines
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-brand-foreground/80">
                                  {isShipping ? (
                                    <>
                                      <p className="font-bold text-brand-green">Courier Dispatch details</p>
                                      <p>
                                        Your consultant will pack and dispatch your Ayurvedic medicines.
                                      </p>
                                      {a.prescription.fulfillment.trackingNumber && (
                                        <p className="pt-1.5">
                                          Tracking ID:{' '}
                                          <span className="font-mono font-bold text-brand-gold-dark bg-white px-2 py-0.5 rounded border border-brand-gold/30">
                                            {a.prescription.fulfillment.trackingNumber}
                                          </span>
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <p className="font-bold text-brand-green">Clinic Pickup location</p>
                                      <p>
                                        Please collect your medicine pack directly from the consultant's clinic once status is "Ready for Pickup".
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Actions Row (Full Width) */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    {a.meetingLink && a.status === 'CONFIRMED' && (
                      <a href={a.meetingLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-brand-green hover:bg-brand-gold hover:text-brand-green px-5 py-2.5 rounded-full transition-colors shadow">
                        <LinkIcon className="h-4 w-4" /> Join Meeting
                      </a>
                    )}
                    {a.prescription && a.prescription.status !== 'DRAFT' && (
                      <a href={`/prescriptions/print/${a.id}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-brand-gold hover:bg-brand-green px-5 py-2.5 rounded-full transition-colors shadow">
                        <Printer className="h-4 w-4" /> Print Prescription
                      </a>
                    )}
                    {a.status === 'COMPLETED' && a.consultant && (
                      <Link href={`/doctors/${a.consultant.userId}?type=FOLLOW_UP`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-green bg-brand-green-light hover:bg-brand-green hover:text-white px-5 py-2.5 rounded-full transition-all border border-brand-green/25 shadow-sm">
                        <Calendar className="h-4 w-4" /> Book Follow-Up
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {a.status === 'PENDING' && (
                      <button onClick={() => setCancelModalId(a.id)}
                        className="px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100 text-sm font-bold transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setCancelModalId(null)} />
          <div className="relative bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <button onClick={() => setCancelModalId(null)} className="absolute right-4 top-4 text-brand-foreground/50 hover:text-brand-foreground bg-muted hover:bg-muted/80 p-1.5 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-rose-100 text-rose-600 p-4 rounded-full">
                <XCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-brand-foreground">Cancel Appointment?</h3>
              <p className="text-sm text-brand-foreground/70">
                Are you sure you want to cancel this appointment? This action cannot be undone, and cancellation fees may apply depending on the consultant's policy.
              </p>
              <div className="flex w-full gap-3 pt-4">
                <button
                  onClick={() => setCancelModalId(null)}
                  disabled={cancelling !== null}
                  className="flex-1 px-4 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Keep It
                </button>
                <button
                  onClick={() => {
                    cancelAppointment(cancelModalId);
                    setCancelModalId(null);
                  }}
                  disabled={cancelling !== null}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow disabled:opacity-50"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
