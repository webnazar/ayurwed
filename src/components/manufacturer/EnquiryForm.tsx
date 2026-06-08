'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';

interface EnquiryFormProps {
  manufacturerId: number;
  productId?: number;
  companyName: string;
}

export default function EnquiryForm({ manufacturerId, productId, companyName }: EnquiryFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, manufacturerId, productId }),
      });
      if (res.ok) {
        toast.success('Enquiry sent!');
        setDone(true);
      } else {
        toast.error('Failed to send. Please try again.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
        <MessageSquare className="h-8 w-8 text-emerald-600 mx-auto" />
        <p className="font-bold text-emerald-800">Enquiry Sent!</p>
        <p className="text-xs text-emerald-700">{companyName} has been notified and will reach out to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="col-span-2 sm:col-span-1 text-sm bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="col-span-2 sm:col-span-1 text-sm bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
        <input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          className="col-span-2 text-sm bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
        <textarea required rows={4} placeholder={`Message to ${companyName}...`} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="col-span-2 text-sm bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold resize-none" />
      </div>
      <button type="submit" disabled={submitting}
        className="w-full bg-brand-green text-white font-bold py-3.5 rounded-full hover:bg-brand-gold hover:text-brand-green transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
        <MessageSquare className="h-4 w-4" />
        {submitting ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  );
}
