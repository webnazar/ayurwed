'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserCircle, MapPin, Save, Loader2, ShieldCheck, Stethoscope, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchSelect from '@/components/ui/SearchSelect';

const INDIAN_STATES = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands', meta: 'UT' },
  { value: 'Chandigarh', label: 'Chandigarh', meta: 'UT' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu', meta: 'UT' },
  { value: 'Delhi', label: 'Delhi', meta: 'UT' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir', meta: 'UT' },
  { value: 'Ladakh', label: 'Ladakh', meta: 'UT' },
  { value: 'Lakshadweep', label: 'Lakshadweep', meta: 'UT' },
  { value: 'Puducherry', label: 'Puducherry', meta: 'UT' }
];

interface ProfileData {
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function ConsumerProfileForm() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    gender: '',
  });

  // Practitioner Application state
  const [docForm, setDocForm] = useState({
    degree: 'BAMS',
    registrationNumber: '',
    specialization: 'Ayurvedic Medicine',
    experience: 5,
  });
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [docApplied, setDocApplied] = useState(false);

  const handleApplyDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.registrationNumber) {
      toast.error('Please enter your Medical Registration Number');
      return;
    }
    setIsSubmittingDoc(true);
    try {
      const res = await fetch('/api/consultant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');
      toast.success(data.message || 'Application submitted successfully for Admin review!');
      setDocApplied(true);
    } catch (err: any) {
      toast.error(err.message || 'Error submitting application');
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving) {
          const form = document.getElementById('consumer-profile-form') as HTMLFormElement;
          if (form) form.requestSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/consumer/profile');
      if (res.ok) {
        const data = await res.json();
        const p: ProfileData = data.profile || {};
        
        setFormData({
          name: p.user?.name || session?.user?.name || '',
          email: p.user?.email || session?.user?.email || '',
          phone: p.user?.phone || '',
          address: p.address || '',
          landmark: p.landmark || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
          gender: p.gender || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/consumer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully!');
      if (session) {
        await update();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <form id="consumer-profile-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      
      {/* 1. Personal Information */}
      <div className="bg-card rounded-[2rem] p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="bg-brand-green/10 p-2.5 rounded-xl">
            <UserCircle className="h-6 w-6 text-brand-green" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-green">Personal Information</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your personal identity and contact details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              disabled
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground/70 cursor-not-allowed font-medium" 
            />
            <p className="text-[10px] text-muted-foreground">Name is linked to your registration account.</p>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              disabled
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground/70 cursor-not-allowed font-medium" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-medium" 
              placeholder="+91 9XXXXXXXXX"
            />
            <p className="text-[10px] text-muted-foreground">Used for e-commerce courier dispatch & SMS tracking.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth (Optional)</label>
            <input 
              type="date" 
              name="dateOfBirth" 
              value={formData.dateOfBirth} 
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-medium" 
            />
          </div>

          <div className="space-y-2 md:col-span-2 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
            <div className="flex flex-wrap gap-4 pt-0.5">
              {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer bg-muted/40 hover:bg-muted/70 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground transition-colors">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g} 
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="text-brand-green focus:ring-brand-green"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Shipping & Delivery Address */}
      <div className="bg-card rounded-[2rem] p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="bg-brand-gold/15 p-2.5 rounded-xl">
            <MapPin className="h-6 w-6 text-brand-gold-dark" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-green">Shipping & Delivery Address</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Primary delivery address for your e-commerce store purchases</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Street Address / House No. / Building</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              rows={2}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green resize-none font-medium" 
              placeholder="Flat/House No., Building Name, Street / Locality"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Landmark (Optional)</label>
            <input 
              type="text" 
              name="landmark" 
              value={formData.landmark} 
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-medium" 
              placeholder="Near Metro Station, Opposite City Park, etc."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City / District</label>
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-medium" 
              placeholder="e.g. Pune, Mumbai, Bangalore"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State</label>
            <SearchSelect
              options={INDIAN_STATES}
              value={formData.state}
              onChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
              placeholder="Select State"
              className="w-full bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PIN Code</label>
            <input 
              type="text" 
              name="pincode" 
              value={formData.pincode} 
              onChange={handleChange}
              maxLength={6}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-medium" 
              placeholder="6 Digits (e.g. 411001)"
            />
          </div>
        </div>
      </div>

      {/* 3. Practitioner Access Application Card */}
      <div className="bg-card rounded-[2rem] p-6 sm:p-8 border border-brand-gold/30 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="bg-brand-green/10 p-2.5 rounded-xl text-brand-green">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-green flex flex-wrap items-center gap-2">
              <span>Apply for Doctor / Practitioner Directory Listing</span>
              <span className="text-[10px] bg-brand-gold/20 text-brand-gold-dark px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                BAMS • MD • AYUSH
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Are you a licensed Ayurvedic practitioner? Submit your registration credentials to be verified and listed in our public doctor directory.
            </p>
          </div>
        </div>

        {docApplied ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
            <FileCheck className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold">Application Received for Verification!</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Our Verification Team is validating your Medical Council Registration. Once approved, your account will be upgraded to a verified doctor profile.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Qualifying Degree / Title *
                </label>
                <select
                  value={docForm.degree}
                  onChange={e => setDocForm(f => ({ ...f, degree: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-brand-gold"
                >
                  <option value="BAMS">BAMS (Bachelor of Ayurvedic Medicine & Surgery)</option>
                  <option value="MD (Ayurveda)">MD (Ayurveda) / MS (Ayurveda)</option>
                  <option value="BUMS">BUMS (Bachelor of Unani Medicine & Surgery)</option>
                  <option value="BSMS">BSMS (Siddha Medicine & Surgery)</option>
                  <option value="BHMS">BHMS (Homeopathic Medicine)</option>
                  <option value="MBBS">MBBS with Integrative Medicine</option>
                  <option value="Certified Nutrition Expert">Certified Nutrition / Ayurvedic Lifestyle Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Medical Council Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.registrationNumber}
                  onChange={e => setDocForm(f => ({ ...f, registrationNumber: e.target.value }))}
                  placeholder="e.g. MH/AYU/88412 or Central Council Reg."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleApplyDoctor}
                disabled={isSubmittingDoc || !docForm.registrationNumber}
                className="btn-gold px-6 py-3 rounded-xl text-xs font-extrabold transition-all shadow-xs disabled:opacity-40 flex items-center gap-2 cursor-pointer"
              >
                {isSubmittingDoc ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><ShieldCheck className="h-4 w-4" /> Submit Practitioner Verification Credentials</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="btn-green px-8 py-3.5 rounded-full font-bold shadow-md flex items-center gap-2 disabled:opacity-70 cursor-pointer"
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Saving Changes...</>
          ) : (
            <><Save className="h-5 w-5" /> Save Profile <span className="hidden sm:inline-flex ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded border border-white/30 font-medium">Alt+S</span></>
          )}
        </button>
      </div>

    </form>
  );
}
