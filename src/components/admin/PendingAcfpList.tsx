'use client';

import React, { useState } from 'react';
import { Award, Check, X, ShieldAlert, Loader2, Calendar, AwardIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingConsultant {
  id: number;
  specialization: string;
  experience: number;
  acfpVerifiedAt: string | null;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface PendingAcfpListProps {
  initialList: PendingConsultant[];
}

export default function PendingAcfpList({ initialList }: PendingAcfpListProps) {
  const [list, setList] = useState<PendingConsultant[]>(initialList);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleAction = async (profileId: number, action: 'approve' | 'reject') => {
    setProcessingId(profileId);
    const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} ACFP application...`);
    try {
      const res = await fetch('/api/admin/acfp/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, action }),
      });

      if (res.ok) {
        toast.success(
          action === 'approve' 
            ? 'ACFP Application Approved & Certified!' 
            : 'ACFP Application Rejected & Reset.',
          { id: toastId }
        );
        setList(prev => prev.filter(c => c.id !== profileId));
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to process action.', { id: toastId });
      }
    } catch {
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  if (list.length === 0) {
    return null; // Hidden if there are no pending approvals
  }

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-6 border-b border-border bg-brand-gold/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5.5 w-5.5 text-brand-gold-dark dark:text-brand-gold animate-pulse-slow" />
          <h2 className="font-extrabold text-brand-green dark:text-foreground text-lg">
            Pending ACFP Partner Verifications
          </h2>
        </div>
        <span className="bg-brand-gold text-brand-green font-black px-3 py-1 rounded-full text-xs animate-bounce">
          {list.length} Action Required
        </span>
      </div>

      <div className="divide-y divide-brand-green-border/10">
        {list.map(c => (
          <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-brand-gold-light/5 transition-colors">
            {/* Doctor details */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-brand-green text-white font-bold rounded-full flex items-center justify-center text-lg shadow flex-shrink-0">
                {c.user.avatar ? (
                  <img src={c.user.avatar} alt={c.user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  c.user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-brand-green dark:text-foreground text-base">
                  {c.user.name}
                </h4>
                <p className="text-xs text-brand-foreground/60 dark:text-muted-foreground">
                  {c.user.email}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="bg-brand-green-light dark:bg-brand-green-light/20 text-brand-green border border-brand-green/10 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {c.specialization}
                  </span>
                  <span className="bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {c.experience} Years Exp
                  </span>
                  {c.acfpVerifiedAt && (
                    <span className="text-brand-foreground/40 dark:text-muted-foreground/50 text-[10px] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Applied: {new Date(c.acfpVerifiedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 self-end md:self-center">
              <button
                disabled={processingId === c.id}
                onClick={() => handleAction(c.id, 'reject')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-all"
              >
                <X className="h-4 w-4" /> Reject
              </button>
              <button
                disabled={processingId === c.id}
                onClick={() => handleAction(c.id, 'approve')}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green font-bold text-xs shadow-sm transition-all"
              >
                {processingId === c.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Approve & Certify
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
