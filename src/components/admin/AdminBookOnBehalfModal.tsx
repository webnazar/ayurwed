'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Stethoscope, ShieldAlert, CheckCircle2, UserPlus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';

interface ConsultantOption {
  id: number;
  name: string;
  specialization: string;
  consultationFee: number;
  followUpFee: number;
  availability: any;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface AdminBookOnBehalfModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultants: ConsultantOption[];
  users: UserOption[];
  onSuccess?: () => void;
}

export default function AdminBookOnBehalfModal({
  isOpen,
  onClose,
  consultants,
  users,
  onSuccess
}: AdminBookOnBehalfModalProps) {
  const [patientMode, setPatientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState('');

  // New Patient Details
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');

  // Consultation Details
  const [consultantId, setConsultantId] = useState<string>(consultants[0]?.id?.toString() || '');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [type, setType] = useState<'VIDEO' | 'OFFLINE'>('VIDEO');
  const [visitType, setVisitType] = useState<'INITIAL' | 'FOLLOW_UP'>('INITIAL');
  const [concern, setConcern] = useState('Booked via Admin Desk Call');
  const [bypassLimits, setBypassLimits] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'COMPLIMENTARY'>('PAID');

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(patientSearch))
  );

  const selectedDoctor = consultants.find(c => c.id.toString() === consultantId);

  const getAvailableSlots = (dateStr: string): string[] => {
    if (!dateStr || !selectedDoctor?.availability) return ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    const val = selectedDoctor.availability[dayName];
    if (Array.isArray(val) && val.length > 0) return val;
    if (val && typeof val === 'object' && val.enabled && Array.isArray(val.slots) && val.slots.length > 0) {
      return val.slots;
    }
    // Fallback default admin slots
    return ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
  };

  const availableSlots = getAvailableSlots(date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (patientMode === 'EXISTING' && !selectedPatientId) {
      toast.error('Please select an existing patient');
      return;
    }

    if (patientMode === 'NEW' && !newPatientName) {
      toast.error('Please enter patient name');
      return;
    }

    if (!consultantId) {
      toast.error('Please select a doctor');
      return;
    }

    if (!date || !slot) {
      toast.error('Please select date and time slot');
      return;
    }

    setLoading(true);
    toast.loading('Booking appointment on behalf of patient...', { id: 'admin-booking' });

    try {
      const res = await fetch('/api/admin/appointments/book-on-behalf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientMode === 'EXISTING' ? selectedPatientId : undefined,
          newPatientName: patientMode === 'NEW' ? newPatientName : undefined,
          newPatientPhone: patientMode === 'NEW' ? newPatientPhone : undefined,
          newPatientEmail: patientMode === 'NEW' ? newPatientEmail : undefined,
          newPatientAge: patientMode === 'NEW' ? newPatientAge : undefined,
          newPatientGender: patientMode === 'NEW' ? newPatientGender : undefined,
          consultantId,
          date,
          slot,
          type,
          concern,
          visitType,
          bypassLimits,
          paymentStatus,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      toast.dismiss('admin-booking');
      toast.success(data.message || 'Appointment booked successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.dismiss('admin-booking');
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-green">Book Appointment (Phone / Desk Service)</h2>
              <p className="text-xs text-muted-foreground">Schedule a consultation on behalf of an existing or new caller patient.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">1. Patient Identification</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPatientMode('EXISTING')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  patientMode === 'EXISTING'
                    ? 'border-brand-green bg-brand-green/10 text-brand-green shadow-xs'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <User className="h-4 w-4" /> Existing Registered Patient
              </button>
              <button
                type="button"
                onClick={() => setPatientMode('NEW')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  patientMode === 'NEW'
                    ? 'border-brand-green bg-brand-green/10 text-brand-green shadow-xs'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <UserPlus className="h-4 w-4" /> New Calling Patient
              </button>
            </div>

            {patientMode === 'EXISTING' ? (
              <div className="space-y-3 pt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search registered patient name, email, phone..."
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    className="w-full bg-card text-foreground border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full bg-card text-foreground border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-green font-medium"
                >
                  <option value="">-- Select Patient ({filteredUsers.length} available) --</option>
                  {filteredUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.phone || u.email || `#${u.id}`})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={newPatientName}
                    onChange={e => setNewPatientName(e.target.value)}
                    required
                    className="w-full bg-card text-foreground border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Mobile Phone Number *"
                    value={newPatientPhone}
                    onChange={e => setNewPatientPhone(e.target.value)}
                    required
                    className="w-full bg-card text-foreground border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={newPatientEmail}
                    onChange={e => setNewPatientEmail(e.target.value)}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Age (Years)"
                    value={newPatientAge}
                    onChange={e => setNewPatientAge(e.target.value)}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <select
                    value={newPatientGender}
                    onChange={e => setNewPatientGender(e.target.value)}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-green"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">2. Select Ayurvedic Doctor</label>
            <select
              value={consultantId}
              onChange={e => setConsultantId(e.target.value)}
              className="w-full bg-card text-foreground border border-border rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-brand-green"
            >
              {consultants.map(c => (
                <option key={c.id} value={c.id}>
                  Dr. {c.name} — {c.specialization} (Fee: ₹{c.consultationFee})
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">3. Date</label>
              <input
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setSlot(''); }}
                required
                className="w-full bg-card text-foreground border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">4. Consultation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('VIDEO')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    type === 'VIDEO' ? 'bg-brand-green text-white border-brand-green' : 'bg-card text-foreground border-border'
                  }`}
                >
                  Online Video
                </button>
                <button
                  type="button"
                  onClick={() => setType('OFFLINE')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    type === 'OFFLINE' ? 'bg-brand-green text-white border-brand-green' : 'bg-card text-foreground border-border'
                  }`}
                >
                  In-Clinic
                </button>
              </div>
            </div>
          </div>

          {/* Slot Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">5. Select Time Slot</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {availableSlots.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all ${
                    slot === s
                      ? 'bg-brand-gold text-brand-green border-brand-gold shadow-xs'
                      : 'bg-card text-foreground border-border hover:border-brand-green'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Concern */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">6. Primary Health Concern / Phone Call Summary</label>
            <textarea
              rows={2}
              value={concern}
              onChange={e => setConcern(e.target.value)}
              placeholder="e.g. Caller reported chronic Vata imbalance, digestive issues..."
              className="w-full bg-card text-foreground border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-green"
            />
          </div>

          {/* Admin Override Toggles */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Admin Override Protection Limits
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bypassLimits}
                  onChange={e => setBypassLimits(e.target.checked)}
                  className="rounded border-border text-brand-green focus:ring-brand-green"
                />
                <span className="font-semibold text-foreground">Bypass Limits</span>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-amber-500/20 pt-2">
              <span className="font-semibold text-muted-foreground">Payment Status:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="PAID"
                    checked={paymentStatus === 'PAID'}
                    onChange={() => setPaymentStatus('PAID')}
                  />
                  <span>Standard Fee (₹{selectedDoctor?.consultationFee || 0})</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="COMPLIMENTARY"
                    checked={paymentStatus === 'COMPLIMENTARY'}
                    onChange={() => setPaymentStatus('COMPLIMENTARY')}
                  />
                  <span>Complimentary / Waiver (₹0)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 rounded-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white text-xs font-extrabold transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Confirm & Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
