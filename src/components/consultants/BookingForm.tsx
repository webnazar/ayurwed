'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, PhoneCall, CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingFormProps {
  consultant: {
    id: number;
    userId: number;
    name: string;
    specialization: string;
    consultationFee: number;
    followUpFee: number;
    availability: any;
    isAcfp?: boolean;
    fulfillmentMethod?: string | null;
    hasClinicPickup?: boolean;
    hasSelfDispatch?: boolean;
    hasAyurwedDelivery?: boolean;
  };
  initialUserPhone?: string;
  initialVisitType?: 'INITIAL' | 'FOLLOW_UP';
}

export default function BookingForm({ consultant, initialUserPhone = '', initialVisitType = 'INITIAL' }: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [type, setType] = useState<'VIDEO' | 'OFFLINE'>('VIDEO');
  const [visitType, setVisitType] = useState<'INITIAL' | 'FOLLOW_UP'>(initialVisitType);

  const getDayName = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dateObj.getDay()];
  };

  const getAvailableSlots = (dateString: string): string[] => {
    const dayName = getDayName(dateString);
    if (!dayName || !consultant.availability) return [];
    const val = consultant.availability[dayName];
    if (Array.isArray(val)) {
      return val;
    }
    if (val && typeof val === 'object' && 'enabled' in val && val.enabled) {
      return val.slots || [];
    }
    return [];
  };

  const formatTimeSlot = (slotStr: string): string => {
    if (slotStr.includes('AM') || slotStr.includes('PM')) {
      return slotStr;
    }
    const [hoursStr, minutesStr] = slotStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, '0');
    return `${formattedHours}:${minutesStr} ${ampm}`;
  };

  const availableSlots = getAvailableSlots(date);

  const selectedFee = visitType === 'INITIAL' ? consultant.consultationFee : consultant.followUpFee;
  
  // Patient details
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState(initialUserPhone);
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [allergies, setAllergies] = useState('');
  const [acknowledgedFulfillment, setAcknowledgedFulfillment] = useState(false);

  useEffect(() => {
    if (session?.user?.name && !patientName) {
      setPatientName(session.user.name);
    }
  }, [session]);
  
  const [concern, setConcern] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('Please login to book a consultation');
      router.push('/login');
      return;
    }

    if (!date || !slot) {
      toast.error('Please select a date and time slot');
      return;
    }

    if (consultant.isAcfp && !acknowledgedFulfillment) {
      toast.error('Please acknowledge the medicine fulfillment policy');
      return;
    }

    setLoading(true);
    // Simulate payment gateway only if fee is greater than 0
    if (selectedFee > 0) {
      toast.loading('Initializing secure payment gateway...', { id: 'payment' });
    } else {
      toast.loading('Scheduling your appointment...', { id: 'payment' });
    }
    
    try {
      const res = await fetch('/api/consumer/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId: consultant.id,
          date,
          slot,
          type,
          concern,
          visitType,
          patientName,
          patientAge,
          patientGender,
          patientPhone,
          patientRelation: null,
          chronicDiseases,
          allergies
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to book appointment');
      }

      setTimeout(() => {
        toast.dismiss('payment');
        toast.success(selectedFee > 0 ? 'Payment & Booking Successful!' : 'Booking Successful!');
        setBookingSuccess(true);
        setLoading(false);
      }, 2000);
    } catch (err: any) {
      toast.dismiss('payment');
      toast.error(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-brand-green-border/15 shadow text-center space-y-6">
        <div className="bg-emerald-100 text-emerald-800 p-4 rounded-full inline-flex mx-auto">
          <CheckCircle className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-brand-green">Consultation Scheduled!</h3>
          <p className="text-sm text-brand-foreground/75 leading-relaxed">
            Your appointment with <strong>{consultant.name}</strong> is confirmed. You can access the meeting details in your dashboard.
          </p>
        </div>
        <div className="bg-brand-green-light/40 rounded-2xl p-4 text-left text-xs space-y-2 text-brand-green">
          <p><strong>Consultant:</strong> {consultant.name}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Time:</strong> {slot}</p>
          <p><strong>Type:</strong> {type === 'VIDEO' ? 'Online' : 'In-Person'} ({visitType === 'INITIAL' ? 'First Consultation' : 'Follow-up'})</p>
          <p><strong>Fee Paid:</strong> {formatPrice(selectedFee)}</p>
        </div>
        <button
          onClick={() => router.push('/consumer/dashboard/appointments')}
          className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold py-3 rounded-full transition-colors duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleBooking} className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-brand-green">Schedule Consultation</h3>

      {/* Appointment Type (Initial vs Follow-up) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">Appointment Type</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'INITIAL', label: 'First Consultation', fee: consultant.consultationFee },
            { key: 'FOLLOW_UP', label: 'Follow-up Visit', fee: consultant.followUpFee },
          ] as const).map((mode) => {
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => setVisitType(mode.key)}
                className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  visitType === mode.key
                    ? 'border-brand-gold bg-brand-gold-light text-brand-gold-dark font-bold'
                    : 'border-border hover:border-brand-green hover:bg-brand-green-light/30 text-brand-foreground/70'
                }`}
              >
                <span className="text-xs">{mode.label}</span>
                <span className="text-[10px] opacity-80">{formatPrice(mode.fee)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Type selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">Consultation Mode</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'VIDEO', label: 'Online', icon: Video },
            { key: 'OFFLINE', label: 'In-Person', icon: MapPin },
          ] as const).map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => setType(mode.key)}
                className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition-all duration-200 ${
                  type === mode.key
                    ? 'border-brand-gold bg-brand-gold-light text-brand-gold-dark font-bold'
                    : 'border-border hover:border-brand-green hover:bg-brand-green-light/30 text-brand-foreground/70'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] sm:text-xs leading-none">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">Select Date</label>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlot('');
            }}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-brand-green-light/40 text-brand-foreground border border-border rounded-2xl py-3 px-4 pl-10 focus:outline-none focus:border-brand-gold text-sm"
            required
          />
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">Available Slots</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {availableSlots.length > 0 ? (
            availableSlots.map((rawTime) => {
              const time = formatTimeSlot(rawTime);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSlot(time)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    slot === time
                      ? 'bg-brand-green border-brand-green text-white shadow-sm'
                      : 'bg-card border-border hover:border-brand-green text-brand-foreground/70'
                  }`}
                >
                  {time}
                </button>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-4 text-xs text-brand-foreground/50 italic bg-brand-green-light/10 border border-dashed border-border rounded-xl">
              {date ? 'No availability slots defined on this day.' : 'Please select a date to view available slots.'}
            </div>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="space-y-4 pt-2 border-t border-brand-green-light">
        <h4 className="text-sm font-bold text-brand-green">Patient Information</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-brand-foreground/80">Patient Name</label>
            <input 
              type="text" 
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full bg-card text-brand-foreground border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-gold text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-brand-foreground/80">Age</label>
            <input 
              type="number" 
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="Years"
              min="0"
              max="120"
              className="w-full bg-card text-brand-foreground border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-gold text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-brand-foreground/80">Mobile Number</label>
            <input 
              type="tel" 
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="+49 151 12345678"
              required
              className="w-full bg-card text-brand-foreground border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-gold text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-brand-foreground/80">Gender</label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="patientGender" 
                    value={g} 
                    checked={patientGender === g}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-brand-foreground/80">{g}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Medical History Fields */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-brand-foreground/80">Chronic Diseases (Optional)</label>
            <input 
              type="text" 
              value={chronicDiseases}
              onChange={(e) => setChronicDiseases(e.target.value)}
              placeholder="e.g., Diabetes, Hypertension..."
              className="w-full bg-card text-brand-foreground border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-gold text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-brand-foreground/80">Allergies (Optional)</label>
            <input 
              type="text" 
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g., Dust, Peanuts, Penicillin..."
              className="w-full bg-card text-brand-foreground border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-gold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Health Concern Description */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">Health Concern Details</label>
        <textarea
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          placeholder="Briefly describe your health issues (e.g. chronic acidity, hair fall, stress levels)..."
          rows={3}
          className="w-full bg-brand-green-light/40 text-brand-foreground border border-border rounded-2xl p-4 focus:outline-none focus:border-brand-gold text-sm"
          required
        />
      </div>

      {/* ACFP Fulfillment Acknowledgment */}
      {consultant.isAcfp && (
        <label className="flex items-start gap-3 p-4 bg-brand-gold-light/20 border border-brand-gold/20 rounded-2xl cursor-pointer hover:bg-brand-gold-light/40 transition-colors">
          <input
            type="checkbox"
            checked={acknowledgedFulfillment}
            onChange={(e) => setAcknowledgedFulfillment(e.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded text-brand-green focus:ring-brand-green cursor-pointer"
          />
          <div className="text-[11px] leading-relaxed text-brand-foreground/80">
            <span className="font-bold text-brand-green block mb-0.5">Medicine Fulfillment Acknowledgment</span>
            I understand that {consultant.name} will prepare and fulfill my prescribed Ayurvedic medicine plan via:
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-brand-gold-dark font-extrabold">
              {consultant.hasClinicPickup && <li>Clinic Pickup</li>}
              {consultant.hasSelfDispatch && <li>Doctor Self-Dispatch</li>}
              {consultant.hasAyurwedDelivery && <li>AYURWED Delivery</li>}
              {!consultant.hasClinicPickup && !consultant.hasSelfDispatch && !consultant.hasAyurwedDelivery && (
                <li className="italic text-brand-foreground/50">To be discussed with the doctor</li>
              )}
            </ul>
            I agree to receive/collect the medicines after my consultation.
          </div>
        </label>
      )}

      {/* Checkout and Fee summary */}
      <div className="bg-brand-gold-light/60 rounded-3xl p-5 border border-brand-gold/20 flex items-center justify-between">
        <div>
          <span className="text-xs text-brand-foreground/50 block font-semibold">Total Consult Fee</span>
          <span className="text-xl font-extrabold text-brand-green">{formatPrice(selectedFee)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-brand-gold-dark font-bold uppercase tracking-wider bg-brand-gold/25 px-2.5 py-1 rounded-full">
          <ShieldCheck className="h-4 w-4 text-brand-gold-dark" />
          <span>Secure Pay</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold py-4 rounded-full transition-all duration-300 shadow hover:shadow-lg disabled:bg-gray-200 disabled:text-muted-foreground"
      >
        {loading ? 'Processing...' : selectedFee > 0 ? 'Pay & Confirm Booking' : 'Confirm Booking'}
      </button>
    </form>
  );
}
