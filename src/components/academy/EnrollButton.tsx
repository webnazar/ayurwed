'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnrollButtonProps {
  isLoggedIn: boolean;
  initialEnrolled: boolean;
}

export default function EnrollButton({ isLoggedIn, initialEnrolled }: EnrollButtonProps) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const whatsappButton = (
    <a
      href="https://wa.me/919271711722?text=Hello%20AYURWED,%20I%20have%20an%20enquiry%20regarding%20the%20Certificate%20in%20Ancient%20Intelligence%20(CAI)%20program."
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba56] text-white px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all w-full font-bold transform hover:-translate-y-0.5 whitespace-nowrap"
    >
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span>WhatsApp Enquiry</span>
    </a>
  );

  if (!isLoggedIn) {
    return (
      <div className="pt-8 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link
            href="/login?callbackUrl=/academy"
            className="inline-flex items-center justify-center gap-2 btn-gold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all w-full whitespace-nowrap"
          >
            <Award className="h-6 w-6" /> Login to Enroll
          </Link>
          {whatsappButton}
        </div>
        <p className="text-xs text-brand-foreground/50 mt-4 uppercase tracking-widest font-bold text-center">
          Access your wellness workspace to enroll or chat with us for queries
        </p>
      </div>
    );
  }

  if (enrolled) {
    return (
      <div className="pt-8 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link
            href="/consumer/dashboard/courses"
            className="inline-flex items-center justify-center gap-2 btn-green px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all w-full whitespace-nowrap"
          >
            Go to My Courses <ArrowRight className="h-5 w-5" />
          </Link>
          {whatsappButton}
        </div>
        <p className="text-xs text-brand-foreground/50 mt-4 uppercase tracking-widest font-bold text-brand-green font-bold text-center">
          You are enrolled in this program!
        </p>
      </div>
    );
  }

  const handleEnroll = async () => {
    setLoading(true);
    const toastId = toast.loading('Enrolling in CAI Program...');
    try {
      const res = await fetch('/api/academy/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        toast.success('Successfully enrolled in Certificate in Ancient Intelligence!', { id: toastId });
        setEnrolled(true);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to enroll. Please try again.', { id: toastId });
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 btn-gold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all w-full disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" /> Enrolling...
            </>
          ) : (
            <>
              <Award className="h-6 w-6" /> Enroll in CAI Program
            </>
          )}
        </button>
        {whatsappButton}
      </div>
      <p className="text-xs text-brand-foreground/50 mt-4 uppercase tracking-widest font-bold text-center">
        Join the New Knowledge Movement
      </p>
    </div>
  );
}
