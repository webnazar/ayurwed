'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Check, ToggleRight, ToggleLeft, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

interface DayAvailability { enabled: boolean; slots: string[]; }
type WeekAvailability = Record<string, DayAvailability>;

function initAvailability(raw: any): WeekAvailability {
  const result: WeekAvailability = {};
  DAYS.forEach(d => {
    result[d] = raw?.[d] ?? { enabled: false, slots: [...DEFAULT_SLOTS] };
  });
  return result;
}

export default function AvailabilityClient({
  initialAvailability, totalAppointments, bookedCount,
}: {
  initialAvailability: any;
  totalAppointments: number;
  bookedCount: number;
}) {
  const [availability, setAvailability] = useState<WeekAvailability>(initAvailability(initialAvailability));
  const [loading, setLoading] = useState(false);

  const enabledDays = Object.values(availability).filter(d => d.enabled).length;
  const totalSlots = Object.values(availability).filter(d => d.enabled).reduce((a, d) => a + d.slots.length, 0);

  const toggleDay = (day: string) => {
    setAvailability(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
  };

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const current = prev[day].slots;
      const updated = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot].sort();
      return { ...prev, [day]: { ...prev[day], slots: updated } };
    });
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/consultant/availability', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Availability saved!');
    } catch { toast.error('Save failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Available Days', value: enabledDays, icon: Calendar, color: 'text-brand-green bg-brand-green-light' },
          { label: 'Total Slots', value: totalSlots, icon: Clock, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Booked', value: totalAppointments, icon: Settings, color: 'text-amber-600 bg-amber-50' },
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

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-green" />
            <h2 className="font-bold text-brand-green">Weekly Availability</h2>
          </div>
          <button onClick={save} disabled={loading}
            className="px-6 py-2 rounded-full bg-brand-green text-white font-bold hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2 text-sm">
            {loading ? 'Saving...' : <><Check className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
        <div className="p-6 space-y-4">
          {DAYS.map(day => (
            <div key={day} className={`rounded-2xl border transition-colors ${availability[day].enabled ? 'border-brand-green/20 bg-brand-green-light/20' : 'border-border bg-muted/50'}`}>
              <div className="flex items-center justify-between p-4">
                <span className="font-bold text-brand-green">{day}</span>
                <button onClick={() => toggleDay(day)}>
                  {availability[day].enabled
                    ? <ToggleRight className="h-7 w-7 text-brand-green" />
                    : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                </button>
              </div>
              {availability[day].enabled && (
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  {DEFAULT_SLOTS.map(slot => (
                    <button key={slot} onClick={() => toggleSlot(day, slot)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all border ${availability[day].slots.includes(slot)
                        ? 'bg-brand-green text-white border-brand-green shadow-sm shadow-brand-green/20'
                        : 'bg-card text-foreground/70 border-border hover:border-brand-green/50 hover:bg-brand-green-light/20 hover:text-brand-green'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
