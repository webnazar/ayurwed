'use client';

import React, { useState } from 'react';
import { PhoneCall, CalendarPlus } from 'lucide-react';
import AdminBookOnBehalfModal from '@/components/admin/AdminBookOnBehalfModal';

interface AdminBookOnBehalfTriggerProps {
  consultants: any[];
  users: any[];
}

export default function AdminBookOnBehalfTrigger({ consultants, users }: AdminBookOnBehalfTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green shrink-0 whitespace-nowrap"
      >
        <PhoneCall className="h-4 w-4 animate-bounce-slow" />
        <span>Book Appointment on Behalf (Phone/Desk)</span>
      </button>

      <AdminBookOnBehalfModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        consultants={consultants}
        users={users}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
