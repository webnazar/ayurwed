'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, UserCircle, Stethoscope, Languages, Clock, Pencil, Truck } from 'lucide-react';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';

interface ConsultantProfileProps {
  adminTargetUserId?: number;
  user: { name: string; avatar: string | null };
  profile: {
    degree?: string | null;
    specialization: string;
    experience: number;
    bio: string;
    languages: any;
    consultationFee: number;
    followUpFee: number;
    isCaiCertified?: boolean;
    isVerified?: boolean;
    isAcfp?: boolean;
    fulfillmentMethod?: string | null;
    hasClinicPickup?: boolean;
    hasSelfDispatch?: boolean;
    hasAyurwedDelivery?: boolean;
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
    degree: data.profile.degree || '',
    specialization: data.profile.specialization || '',
    experience: data.profile.experience || 0,
    bio: data.profile.bio || '',
    languages: initialLanguages,
    consultationFee: data.profile.consultationFee || 0,
    followUpFee: data.profile.followUpFee || 0,
    isCaiCertified: data.profile.isCaiCertified || false,
    isVerified: data.profile.isVerified || false,
    isAcfp: data.profile.isAcfp || false,
    fulfillmentMethod: data.profile.fulfillmentMethod || 'COURIER',
    hasClinicPickup: data.profile.hasClinicPickup || false,
    hasSelfDispatch: data.profile.hasSelfDispatch || false,
    hasAyurwedDelivery: data.profile.hasAyurwedDelivery || false,
  });
  
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving) {
          const formElement = document.querySelector('form');
          if (formElement) formElement.requestSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving]);

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
          targetUserId: data.adminTargetUserId,
          name: form.name,
          avatar: form.avatar,
          degree: form.degree,
          specialization: form.specialization,
          experience: Number(form.experience),
          bio: form.bio,
          languages: languagesArray,
          consultationFee: Number(form.consultationFee),
          followUpFee: Number(form.followUpFee),
          isCaiCertified: form.isCaiCertified,
          isVerified: form.isVerified,
          isAcfp: form.isAcfp,
          fulfillmentMethod: form.fulfillmentMethod,
          hasClinicPickup: form.hasClinicPickup,
          hasSelfDispatch: form.hasSelfDispatch,
          hasAyurwedDelivery: form.hasAyurwedDelivery,
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

  const inp = "w-full text-sm bg-brand-green-light/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold";

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto w-full space-y-6">
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-5">
        <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
          <UserCircle className="h-5 w-5" /> Basic Identity
        </h2>
        
        <div className="flex flex-col items-center py-4">
          <ImageUploadCrop
            value={form.avatar}
            onChange={(url) => setForm(f => ({ ...f, avatar: url }))}
            folder="consultants"
          >
            <div className="relative group rounded-full">
              {form.avatar ? (
                <img src={form.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-brand-gold/50 shadow-md group-hover:opacity-90 transition-opacity" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-brand-green-light/30 border-4 border-brand-green/10 flex items-center justify-center text-brand-green/40 shadow-sm group-hover:bg-brand-green-light/50 transition-colors">
                  <UserCircle className="h-16 w-16" />
                </div>
              )}
              {/* Edit Icon Overlay */}
              <div className="absolute top-1 right-1 bg-brand-green text-white p-2 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                <Pencil className="h-4 w-4" />
              </div>
            </div>
          </ImageUploadCrop>
          <p className="text-[10px] text-brand-foreground/40 mt-4 text-center">Click to change photo · Recommended 500x500px</p>
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

      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-5">
        <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
          <Stethoscope className="h-5 w-5" /> Practice Details
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5" /> Degree / Qualifications *
            </label>
            <input required type="text" value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} 
              placeholder="e.g. BAMS, MD (Ayurveda)"
              className={inp} />
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Follow-up Fee (₹) *</label>
            <input required type="number" min="0" value={form.followUpFee} onChange={e => setForm(f => ({ ...f, followUpFee: Number(e.target.value) }))} 
              placeholder="150"
              className={inp} />
          </div>
        </div>
      </div>

      {/* Fulfillment Settings */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-5">
        <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
          <Truck className="h-5 w-5" /> Fulfillment Settings
        </h2>
        <div className="space-y-4">
          <p className="text-xs text-brand-foreground/70 leading-relaxed">
            As an AYURWED Certified Consultant & Fulfillment Partner (ACFP), you are required to fulfill prescribed medicines. Please select the fulfillment options you support (select all that apply).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              form.hasClinicPickup
                ? 'border-brand-gold bg-brand-gold-light/40 text-brand-gold-dark font-bold'
                : 'border-border hover:border-brand-green hover:bg-brand-green-light/30 text-brand-foreground/70'
            }`}>
              <input
                type="checkbox"
                checked={form.hasClinicPickup}
                onChange={(e) => setForm(f => ({ ...f, hasClinicPickup: e.target.checked }))}
                className="mt-1 text-brand-green focus:ring-brand-green cursor-pointer h-4 w-4 rounded"
              />
              <div>
                <span className="text-sm font-bold block text-brand-green">Clinic Pickup</span>
                <span className="text-[10px] text-brand-foreground/60 block mt-1 leading-normal">
                  Give medicine in clinic directly to the patient.
                </span>
              </div>
            </label>

            <label className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              form.hasSelfDispatch
                ? 'border-brand-gold bg-brand-gold-light/40 text-brand-gold-dark font-bold'
                : 'border-border hover:border-brand-green hover:bg-brand-green-light/30 text-brand-foreground/70'
            }`}>
              <input
                type="checkbox"
                checked={form.hasSelfDispatch}
                onChange={(e) => setForm(f => ({ ...f, hasSelfDispatch: e.target.checked }))}
                className="mt-1 text-brand-green focus:ring-brand-green cursor-pointer h-4 w-4 rounded"
              />
              <div>
                <span className="text-sm font-bold block text-brand-green">Doctor Self-Dispatch</span>
                <span className="text-[10px] text-brand-foreground/60 block mt-1 leading-normal">
                  Dispatch the prescribed medicines to the patient by yourself.
                </span>
              </div>
            </label>

            <label className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              form.hasAyurwedDelivery
                ? 'border-brand-gold bg-brand-gold-light/40 text-brand-gold-dark font-bold'
                : 'border-border hover:border-brand-green hover:bg-brand-green-light/30 text-brand-foreground/70'
            }`}>
              <input
                type="checkbox"
                checked={form.hasAyurwedDelivery}
                onChange={(e) => setForm(f => ({ ...f, hasAyurwedDelivery: e.target.checked }))}
                className="mt-1 text-brand-green focus:ring-brand-green cursor-pointer h-4 w-4 rounded"
              />
              <div>
                <span className="text-sm font-bold block text-brand-green">AYURWED Delivery</span>
                <span className="text-[10px] text-brand-foreground/60 block mt-1 leading-normal">
                  AYURWED platform handles the delivery to the patient.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {data.adminTargetUserId && (
        <div className="bg-card rounded-3xl p-6 border border-brand-gold/30 shadow-sm space-y-5">
          <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
            <UserCircle className="h-5 w-5 text-brand-gold-dark" /> Administrative Controls
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {/* CAI Certified */}
            <label className="flex items-center gap-3 p-4 bg-brand-green-light/10 border border-brand-green/10 rounded-2xl cursor-pointer hover:bg-brand-green-light/25 transition-colors">
              <input
                type="checkbox"
                checked={form.isCaiCertified}
                onChange={e => setForm(f => ({ ...f, isCaiCertified: e.target.checked }))}
                className="h-4 w-4 rounded text-brand-green focus:ring-brand-green cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold block text-brand-green">CAI Certified</span>
                <span className="text-[9px] text-brand-foreground/50 block">Eligible to prescribe</span>
              </div>
            </label>

            {/* Profile Verified */}
            <label className="flex items-center gap-3 p-4 bg-brand-green-light/10 border border-brand-green/10 rounded-2xl cursor-pointer hover:bg-brand-green-light/25 transition-colors">
              <input
                type="checkbox"
                checked={form.isVerified}
                onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))}
                className="h-4 w-4 rounded text-brand-green focus:ring-brand-green cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold block text-brand-green">Profile Verified</span>
                <span className="text-[9px] text-brand-foreground/50 block">Visible & active to practice</span>
              </div>
            </label>

            {/* ACFP Verified */}
            <label className="flex items-center gap-3 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl cursor-pointer hover:bg-brand-gold/20 transition-colors">
              <input
                type="checkbox"
                checked={form.isAcfp}
                onChange={e => setForm(f => ({ ...f, isAcfp: e.target.checked }))}
                className="h-4 w-4 rounded text-brand-gold focus:ring-brand-gold cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold block text-brand-gold-dark">ACFP Certified</span>
                <span className="text-[9px] text-brand-foreground/50 block">Partner & Fulfillment</span>
              </div>
            </label>
          </div>
        </div>
      )}

      <button type="submit" disabled={saving}
        className="w-full bg-brand-green text-white font-bold py-4 rounded-full hover:bg-brand-gold hover:text-brand-green transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Profile'}
        {!saving && <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono ml-1 border border-white/30">Alt+S</kbd>}
      </button>
    </form>
  );
}
