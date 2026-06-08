'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, UserCircle, Stethoscope, Languages, Clock } from 'lucide-react';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';

interface ConsultantProfileProps {
  user: { name: string; avatar: string | null };
  profile: {
    specialization: string;
    experience: number;
    bio: string;
    languages: any;
    consultationFee: number;
  };
}

export default function ConsultantProfileForm({ data }: { data: ConsultantProfileProps }) {
  const router = useRouter();
  
  // Format languages from JSON array to comma-separated string for easy editing
  const initialLanguages = Array.isArray(data.profile.languages) 
    ? data.profile.languages.join(', ') 
    : '';

  const [form, setForm] = useState({
    name: data.user.name || '',
    avatar: data.user.avatar || '',
    specialization: data.profile.specialization || '',
    experience: data.profile.experience || 0,
    bio: data.profile.bio || '',
    languages: initialLanguages,
    consultationFee: data.profile.consultationFee || 0,
  });
  
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Parse comma-separated string back to array
    const languagesArray = form.languages
      .split(',')
      .map(lang => lang.trim())
      .filter(lang => lang.length > 0);

    try {
      const res = await fetch('/api/consultant/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          avatar: form.avatar,
          specialization: form.specialization,
          experience: Number(form.experience),
          bio: form.bio,
          languages: languagesArray,
          consultationFee: Number(form.consultationFee),
        }),
      });
      if (res.ok) {
        toast.success('Profile updated successfully!');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update profile.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full text-sm bg-brand-green-light/20 border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-5">
        <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
          <UserCircle className="h-5 w-5" /> Basic Identity
        </h2>
        
        <div>
          <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Profile Photo</label>
          <div className="flex items-center gap-4">
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-brand-gold/30 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-green-light/30 border-4 border-brand-green/10 flex items-center justify-center text-brand-green/30">
                <UserCircle className="h-12 w-12" />
              </div>
            )}
            <ImageUploadCrop
              value={form.avatar}
              onChange={(url) => setForm(f => ({ ...f, avatar: url }))}
              folder="consultants"
              label={form.avatar ? "Change Photo" : "Upload Photo"}
            />
          </div>
          <p className="text-[10px] text-brand-foreground/40 mt-2">Recommended size: 500x500px (1:1 square ratio)</p>
        </div>

        <div>
          <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Full Name *</label>
          <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Dr. Rajesh Kumar" className={inp} />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <label className="text-xs font-bold text-brand-foreground/60 block">Professional Bio *</label>
            <span className="text-[10px] text-brand-foreground/40">{form.bio.length}/500</span>
          </div>
          <textarea required rows={4} maxLength={500} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell your patients about your approach to wellness..."
            className={`${inp} resize-none`} />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-5">
        <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
          <Stethoscope className="h-5 w-5" /> Practice Details
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5" /> Specialization *
            </label>
            <input required type="text" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} 
              placeholder="e.g. Panchakarma, Nadi Pariksha"
              className={inp} />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Years of Experience *
            </label>
            <input required type="number" min="0" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: Number(e.target.value) }))} 
              className={inp} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1">
              <Languages className="h-3.5 w-3.5" /> Languages Spoken
            </label>
            <input type="text" value={form.languages} onChange={e => setForm(f => ({ ...f, languages: e.target.value }))} 
              placeholder="English, Hindi, Marathi"
              className={inp} />
            <p className="text-[10px] text-brand-foreground/40 mt-1.5 pl-1">Separate with commas.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Consultation Fee (₹) *</label>
            <input required type="number" min="0" value={form.consultationFee} onChange={e => setForm(f => ({ ...f, consultationFee: Number(e.target.value) }))} 
              placeholder="500"
              className={inp} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="w-full bg-brand-green text-white font-bold py-4 rounded-full hover:bg-brand-gold hover:text-brand-green transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
