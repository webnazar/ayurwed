'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserCircle, MapPin, Activity, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileData {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  medicalHistory?: string;
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
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    gender: '',
    medicalHistory: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

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
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
          gender: p.gender || '',
          medicalHistory: p.medicalHistory || ''
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
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('Profile updated successfully');
        await update(); // Update NextAuth session if needed
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      
      {/* Personal Information */}
      <div className="bg-white rounded-[2rem] p-8 border border-brand-green-border/10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-brand-green-light">
          <div className="bg-brand-green/10 p-2.5 rounded-xl">
            <UserCircle className="h-6 w-6 text-brand-green" />
          </div>
          <h2 className="text-xl font-bold text-brand-green">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-foreground/80">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              disabled
              className="w-full bg-slate-50 border border-brand-green-border/20 rounded-xl px-4 py-3 text-brand-foreground/60 cursor-not-allowed" 
            />
            <p className="text-[10px] text-brand-foreground/40">Name cannot be changed directly.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-foreground/80">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              disabled
              className="w-full bg-slate-50 border border-brand-green-border/20 rounded-xl px-4 py-3 text-brand-foreground/60 cursor-not-allowed" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-foreground/80">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              className="w-full bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
              placeholder="+91 "
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-foreground/80">Date of Birth</label>
            <input 
              type="date" 
              name="dateOfBirth" 
              value={formData.dateOfBirth} 
              onChange={handleChange}
              className="w-full bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-brand-foreground/80">Gender</label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g} 
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-sm text-brand-foreground/80">{g}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* eCommerce Delivery Address */}
      <div className="bg-white rounded-[2rem] p-8 border border-brand-green-border/10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-brand-green-light">
          <div className="bg-brand-gold/10 p-2.5 rounded-xl">
            <MapPin className="h-6 w-6 text-brand-gold-dark" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-green">Delivery Address</h2>
            <p className="text-xs text-brand-foreground/50 mt-1">This address will be used as default for eCommerce orders.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-brand-foreground/80">Street Address</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              rows={2}
              className="w-full bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold resize-none" 
              placeholder="House/Flat No., Building Name, Street"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-foreground/80">City / District</label>
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleChange}
              className="w-full bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-foreground/80">State</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleChange}
                className="w-full bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-foreground/80">Pincode</label>
              <input 
                type="text" 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleChange}
                className="w-full bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" 
                placeholder="6 Digits"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Health Overview */}
      <div className="bg-white rounded-[2rem] p-8 border border-brand-green-border/10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-brand-green-light">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl">
            <Activity className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-green">Health Overview</h2>
            <p className="text-xs text-brand-foreground/50 mt-1">Helps practitioners personalize your consultations.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-foreground/80">Medical History & Allergies (Optional)</label>
          <textarea 
            name="medicalHistory" 
            value={formData.medicalHistory} 
            onChange={handleChange}
            rows={4}
            className="w-full bg-white border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold resize-none" 
            placeholder="Please briefly describe any known allergies, chronic conditions, or ongoing treatments..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-green text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-gold hover:text-brand-green transition-all duration-300 shadow-md flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-5 w-5" /> Save Profile</>
          )}
        </button>
      </div>

    </form>
  );
}
