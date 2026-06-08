'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Video, MessageSquare, PhoneCall, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  consultant: {
    id: number;
    userId: number;
    name: string;
    specialization: string;
    consultationFee: number;
    availability: Record<string, string[]>;
  };
}

export default function BookingForm({ consultant }: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [type, setType] = useState<'CHAT' | 'AUDIO' | 'VIDEO'>('VIDEO');
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

    setLoading(true);
    // Simulate Razorpay transaction overlay
    toast.loading('Initializing secure payment gateway...');
    
    setTimeout(() => {
      toast.dismiss();
      toast.success('Mock Razorpay Payment Successful!');
      setBookingSuccess(true);
      setLoading(false);
    }, 2500);
  };

  if (bookingSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-brand-green-border/15 shadow text-center space-y-6">
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
          <p><strong>Type:</strong> {type}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/consumer')}
          className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold py-3 rounded-full transition-colors duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleBooking} className="bg-white rounded-3xl p-8 border border-brand-green-border/10 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-brand-green">Schedule Consultation</h3>

      {/* Type selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">Consultation Mode</label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'VIDEO', label: 'Video Call', icon: Video },
            { key: 'AUDIO', label: 'Audio Call', icon: PhoneCall },
            { key: 'CHAT', label: 'Secure Chat', icon: MessageSquare },
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
                    : 'border-brand-green-border/10 hover:border-brand-green hover:bg-brand-green-light/30 text-brand-foreground/70'
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
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-brand-green-light/40 text-brand-foreground border border-brand-green-border/10 rounded-2xl py-3 px-4 pl-10 focus:outline-none focus:border-brand-gold text-sm"
            required
          />
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-brand-green uppercase tracking-wider block">Available Slots</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSlot(time)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                slot === time
                  ? 'bg-brand-green border-brand-green text-white shadow-sm'
                  : 'bg-white border-brand-green-border/10 hover:border-brand-green text-brand-foreground/70'
              }`}
            >
              {time}
            </button>
          ))}
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
          className="w-full bg-brand-green-light/40 text-brand-foreground border border-brand-green-border/10 rounded-2xl p-4 focus:outline-none focus:border-brand-gold text-sm"
          required
        />
      </div>

      {/* Checkout and Fee summary */}
      <div className="bg-brand-gold-light/60 rounded-3xl p-5 border border-brand-gold/20 flex items-center justify-between">
        <div>
          <span className="text-xs text-brand-foreground/50 block font-semibold">Total Consult Fee</span>
          <span className="text-xl font-extrabold text-brand-green">{formatPrice(consultant.consultationFee)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-brand-gold-dark font-bold uppercase tracking-wider bg-brand-gold/25 px-2.5 py-1 rounded-full">
          <ShieldCheck className="h-4 w-4 text-brand-gold-dark" />
          <span>Secure Pay</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold py-4 rounded-full transition-all duration-300 shadow hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400"
      >
        {loading ? 'Processing...' : 'Pay & Confirm Booking'}
      </button>
    </form>
  );
}
