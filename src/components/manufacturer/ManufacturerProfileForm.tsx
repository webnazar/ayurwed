'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, Globe, Mail, Phone, Building2, ShieldCheck, Plus, X } from 'lucide-react';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';

interface Cert { name: string; url: string; }

interface ProfileFormProps {
  adminTargetUserId?: number;
  profile: {
    id: number;
    companyName: string;
    slug: string;
    description: string;
    website: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    gstNumber: string | null;
    logo: string | null;
    manufacturingLicense: string | null;
    certifications: Cert[];
  };
}

export default function ManufacturerProfileForm({ profile, adminTargetUserId }: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    description: profile.description || '',
    website: profile.website || '',
    contactEmail: profile.contactEmail || '',
    contactPhone: profile.contactPhone || '',
    gstNumber: profile.gstNumber || '',
    logo: profile.logo || '',
    manufacturingLicense: profile.manufacturingLicense || '',
  });
  const [certs, setCerts] = useState<Cert[]>(Array.isArray(profile.certifications) ? profile.certifications : []);
  const [newCert, setNewCert] = useState({ name: '', url: '' });
  const [showCertForm, setShowCertForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const addCert = () => {
    if (!newCert.name.trim()) { toast.error('Certificate name is required'); return; }
    setCerts(prev => [...prev, { ...newCert }]);
    setNewCert({ name: '', url: '' });
    setShowCertForm(false);
  };
  const removeCert = (idx: number) => setCerts(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/manufacturer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: adminTargetUserId,
          description: form.description,
          website: form.website,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          gstNumber: form.gstNumber,
          logo: form.logo,
          manufacturingLicense: form.manufacturingLicense,
          certifications: certs,
        }),
      });
      if (res.ok) {
        toast.success('Profile & Certifications updated!');
        router.refresh();
      } else {
        toast.error('Failed to update profile.');
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
          <Building2 className="h-5 w-5" /> Company Information
        </h2>
        <div>
          <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Public Profile URL</label>
          <p className="text-sm text-brand-foreground/70 bg-brand-green-light/40 rounded-xl px-4 py-2.5 font-mono">
            /manufacturers/{profile.slug}
          </p>
        </div>
        <div>
          <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Company Logo</label>
          <div className="flex items-center gap-4">
            {form.logo && (
              <img src={form.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border-2 border-brand-green/20" />
            )}
            <ImageUploadCrop
              value={form.logo}
              onChange={(url) => setForm(f => ({ ...f, logo: url }))}
              folder="manufacturers"
              label={form.logo ? "Change Logo" : "Upload Logo"}
            />
          </div>
          <p className="text-[10px] text-brand-foreground/40 mt-1">Recommended size: 500x500px (1:1 square ratio)</p>
        </div>
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <label className="text-xs font-bold text-brand-foreground/60 block">About Company *</label>
            <span className="text-[10px] text-brand-foreground/40">{form.description.length}/500</span>
          </div>
          <textarea required rows={4} maxLength={500} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full text-sm bg-brand-green-light/20 border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold resize-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">GST Number</label>
            <input value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
              placeholder="22AAAAA0000A1Z5"
              className="w-full text-sm bg-brand-green-light/20 border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Manufacturing License No.</label>
            <input value={form.manufacturingLicense} onChange={e => setForm(f => ({ ...f, manufacturingLicense: e.target.value }))}
              placeholder="MH/103681"
              className="w-full text-sm bg-brand-green-light/20 border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-5">
        <h2 className="font-bold text-brand-green flex items-center gap-2 border-b border-brand-green-light pb-3">
          <Globe className="h-5 w-5" /> Contact Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Website</label>
            <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yourcompany.com"
              className="w-full text-sm bg-brand-green-light/20 border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="info@company.com"
              className="w-full text-sm bg-brand-green-light/20 border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5 flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Contact Phone</label>
            <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="+91 98765 43210"
              className="w-full text-sm bg-brand-green-light/20 border border-brand-green-border/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-brand-green-light pb-3">
          <h2 className="font-bold text-brand-green flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Certifications
          </h2>
          <button type="button" onClick={() => setShowCertForm(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-green hover:bg-brand-green-light px-3 py-1.5 rounded-xl border border-brand-green/20 transition-colors">
            <Plus className="h-3 w-3" /> Add Certificate
          </button>
        </div>

        <div className="space-y-3">
          {certs.length === 0 ? (
            <div className="text-center py-6 text-brand-foreground/40 text-sm bg-brand-green-light/10 rounded-2xl border border-dashed border-brand-green-border/20">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No certifications uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certs.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-brand-gold-light/20 rounded-2xl p-3 group border border-brand-green-border/10">
                  <div className="p-2 bg-brand-green-light rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-brand-green" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-brand-green text-sm">{cert.name}</p>
                    {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-[10px] text-brand-gold-dark hover:underline line-clamp-1">View Document</a>}
                  </div>
                  <button type="button" onClick={() => removeCert(idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-lg text-rose-400 hover:text-rose-600 shadow-sm">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showCertForm && (
            <div className="bg-brand-green-light/20 rounded-2xl p-4 space-y-3 border border-brand-green-border/20 max-w-sm mt-2">
              <input type="text" value={newCert.name} onChange={e => setNewCert(n => ({ ...n, name: e.target.value }))}
                placeholder="Certificate name (e.g. GMP, AYUSH)" className={inp} />
              <input type="url" value={newCert.url} onChange={e => setNewCert(n => ({ ...n, url: e.target.value }))}
                placeholder="Document URL (optional)" className={inp} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCertForm(false)} className="flex-1 py-2 rounded-xl text-xs font-bold text-brand-foreground/60 border border-brand-green-border/20 hover:bg-white transition-colors">Cancel</button>
                <button type="button" onClick={addCert} className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-colors">Add</button>
              </div>
            </div>
          )}
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
