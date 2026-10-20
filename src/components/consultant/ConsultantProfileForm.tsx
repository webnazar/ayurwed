'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, UserCircle, Stethoscope, Languages, Clock, Pencil, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
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
    procurementDeclaration?: boolean;
    procurementReference?: string | null;
    registrationNumber?: string | null;
  };
}

export default function ConsultantProfileForm({ data }: { data: ConsultantProfileProps }) {
  const router = useRouter();
  
  // Format languages from JSON array to comma-separated string for easy editing
  const initialLanguages = Array.isArray(data.profile.languages) 
    ? data.profile.languages.join(', ') 
    : '';

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: data.user.name || '',
    avatar: data.user.avatar || '',
    password: '',
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
    procurementDeclaration: data.profile.procurementDeclaration || false,
    procurementReference: data.profile.procurementReference || '',
    registrationNumber: data.profile.registrationNumber || '',
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
          password: form.password && form.password.trim().length > 0 ? form.password.trim() : undefined,
          degree: form.degree,
          specialization: form.specialization,
          experience: Number(form.experience),
          bio: form.bio,
          languages: languagesArray,
          consultationFee: Number(form.consultationFee),
          followUpFee: Number(form.followUpFee),
          isCaiCertified: form.isCaiCertified,
          isVerified: form.isVerified,
          isAcfp: false,
          fulfillmentMethod: form.fulfillmentMethod,
          hasClinicPickup: false,
          hasSelfDispatch: false,
          hasAyurwedDelivery: false,
          procurementDeclaration: false,
          procurementReference: '',
          registrationNumber: form.registrationNumber,
        }),
      });
      if (res.ok) {
        toast.success('Profile updated successfully!');
        setForm((f) => ({ ...f, password: '' }));
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Full Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Dr. Rajesh Kumar" className={inp} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-brand-foreground/60 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-brand-green" /> Password
              </label>
              <span className="text-[10px] text-muted-foreground font-medium">
                (Leave blank to keep existing password)
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="•••••••• (Enter new password to change)"
                className={`${inp} pr-10`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
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
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5" /> Degree / Qualifications *
            </label>
            <input required type="text" value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} 
              placeholder="e.g. BAMS, MD (Ayurveda)"
              className={inp} />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-gold-dark" /> Registration No *
            </label>
            <input required type="text" value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} 
              placeholder="e.g. AYUSH-90248-IND"
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
              placeholder="e.g. English, Hindi, Arabic, French, German"
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

      {/* Admin Controls */}
      {data.adminTargetUserId && (
        <div className="bg-card rounded-3xl p-6 border border-brand-gold/30 shadow-sm space-y-5">
          <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
            <UserCircle className="h-5 w-5 text-brand-gold-dark" /> Administrative Controls
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
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
