'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, Building2, ShieldCheck, Globe, Mail, Phone, ExternalLink, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';

interface Cert { name: string; url: string; }

interface Manufacturer {
  id: number;
  companyName: string;
  slug: string;
  description: string;
  logo: string | null;
  manufacturingLicense: string | null;
  certifications: Cert[];
  gstNumber: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  isFeatured: boolean;
}

export default function ManufacturerMasterClient({ initialManufacturers }: { initialManufacturers: Manufacturer[] }) {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(initialManufacturers);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const emptyForm = {
    id: 0,
    companyName: '',
    description: '',
    logo: '',
    manufacturingLicense: '',
    gstNumber: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    isVerified: false,
    isFeatured: false,
  };
  
  const [form, setForm] = useState(emptyForm);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [newCert, setNewCert] = useState({ name: '', url: '' });
  const [showCertForm, setShowCertForm] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredData = useMemo(() => {
    return manufacturers.filter(m => 
      m.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.contactEmail && m.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [manufacturers, searchTerm]);

  const openCreate = () => {
    setForm(emptyForm);
    setCerts([]);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEdit = (m: Manufacturer) => {
    setForm({
      id: m.id,
      companyName: m.companyName,
      description: m.description || '',
      logo: m.logo || '',
      manufacturingLicense: m.manufacturingLicense || '',
      gstNumber: m.gstNumber || '',
      website: m.website || '',
      contactEmail: m.contactEmail || '',
      contactPhone: m.contactPhone || '',
      isVerified: m.isVerified,
      isFeatured: m.isFeatured,
    });
    setCerts(Array.isArray(m.certifications) ? m.certifications : []);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, certifications: certs };
      const url = '/api/admin/manufacturers';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }

      const saved = await res.json();
      
      if (isEditing) {
        setManufacturers(prev => prev.map(m => m.id === saved.id ? saved : m));
        toast.success('Manufacturer updated');
      } else {
        setManufacturers(prev => [saved, ...prev]);
        toast.success('Manufacturer created');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/manufacturers?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setManufacturers(prev => prev.filter(m => m.id !== deleteId));
      toast.success('Manufacturer deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error('Could not delete manufacturer');
    } finally {
      setLoading(false);
    }
  };

  const addCert = () => {
    if (!newCert.name.trim()) return toast.error('Certificate name required');
    setCerts(prev => [...prev, newCert]);
    setNewCert({ name: '', url: '' });
    setShowCertForm(false);
  };
  
  const removeCert = (idx: number) => setCerts(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search manufacturers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-green transition-colors text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" /> Add Manufacturer
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Manufacturer</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-foreground/50">
                  No manufacturers found.
                </td>
              </tr>
            ) : (
              filteredData.map(m => (
                <tr key={m.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {m.logo ? (
                        <img src={m.logo} alt={m.companyName} className="h-10 w-10 rounded-xl object-cover border border-border" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-brand-gold-light/30 flex items-center justify-center border border-border">
                          <Building2 className="h-5 w-5 text-brand-green" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-brand-green flex items-center gap-2">
                          {m.companyName}
                        </div>
                        <div className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                          <Globe className="h-3 w-3" /> /{m.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      {m.contactEmail && (
                        <div className="flex items-center gap-1.5 text-foreground/80">
                          <Mail className="h-3.5 w-3.5 opacity-60" /> {m.contactEmail}
                        </div>
                      )}
                      {m.contactPhone && (
                        <div className="flex items-center gap-1.5 text-foreground/80">
                          <Phone className="h-3.5 w-3.5 opacity-60" /> {m.contactPhone}
                        </div>
                      )}
                      {!m.contactEmail && !m.contactPhone && <span className="text-foreground/40 italic">Not provided</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEdit(m)} className="p-2 text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(m.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-3xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-brand-green to-[#0f381b] text-white rounded-t-3xl">
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                {isEditing ? <Edit className="h-5 w-5 text-brand-gold" /> : <Plus className="h-5 w-5 text-brand-gold" />}
                {isEditing ? 'Edit Manufacturer' : 'New Manufacturer'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white/70 hover:text-white bg-card/10 hover:bg-card/20 p-1.5 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="bg-muted/30 rounded-2xl p-5 border border-border space-y-5">
                <div className="flex flex-col items-center py-4">
                  <ImageUploadCrop
                    value={form.logo}
                    onChange={(url) => setForm(f => ({ ...f, logo: url }))}
                    folder="manufacturers"
                  >
                    <div className="relative group rounded-full">
                      {form.logo ? (
                        <img src={form.logo} alt="Logo" className="w-32 h-32 rounded-full object-cover border-4 border-brand-gold/50 shadow-md group-hover:opacity-90 transition-opacity" />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-brand-green-light/30 border-4 border-brand-green/10 flex items-center justify-center text-brand-green/40 shadow-sm group-hover:bg-brand-green-light/50 transition-colors">
                          <Building2 className="h-16 w-16" />
                        </div>
                      )}
                      {/* Edit Icon Overlay */}
                      <div className="absolute top-1 right-1 bg-brand-green text-white p-2 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                        <Pencil className="h-4 w-4" />
                      </div>
                    </div>
                  </ImageUploadCrop>
                  <p className="text-[10px] text-foreground/40 mt-4 text-center">Click to change logo · Recommended 500x500px</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground/60 mb-1.5">Company Name *</label>
                  <input required type="text" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold shadow-sm" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-foreground/60 mb-1.5">Description *</label>
                  <textarea required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold resize-none shadow-sm" />
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-muted/50 rounded-2xl p-4 border border-border space-y-4">
                <h4 className="font-bold text-sm text-brand-green flex items-center gap-2"><Phone className="h-4 w-4" /> Contact & Legal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/60 mb-1.5">Email Address</label>
                    <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/60 mb-1.5">Phone Number</label>
                    <input type="text" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/60 mb-1.5">Website</label>
                    <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/60 mb-1.5">GST Number</label>
                    <input type="text" value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-foreground/60 mb-1.5">Manufacturing License</label>
                    <input type="text" value={form.manufacturingLicense} onChange={e => setForm(f => ({ ...f, manufacturingLicense: e.target.value }))}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                </div>
              </div>



              {/* Certifications */}
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-brand-green flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Certifications</h4>
                  <button type="button" onClick={() => setShowCertForm(true)}
                    className="text-xs font-bold text-brand-green flex items-center gap-1 hover:underline">
                    <Plus className="h-3 w-3" /> Add Certificate
                  </button>
                </div>
                
                {certs.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {certs.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted p-2 rounded-lg border border-border text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <ShieldCheck className="h-3 w-3 text-brand-gold-dark shrink-0" />
                          <span className="font-semibold truncate">{c.name}</span>
                          {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-brand-green shrink-0"><ExternalLink className="h-3 w-3" /></a>}
                        </div>
                        <button type="button" onClick={() => removeCert(i)} className="text-red-400 hover:text-red-600 ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showCertForm && (
                  <div className="bg-brand-gold-light/10 p-3 rounded-lg border border-brand-gold/30 flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Certificate Name (e.g. GMP)" value={newCert.name} onChange={e => setNewCert(n => ({...n, name: e.target.value}))}
                        className="w-full px-3 py-1.5 text-xs border rounded-md" />
                      <input type="url" placeholder="URL (optional)" value={newCert.url} onChange={e => setNewCert(n => ({...n, url: e.target.value}))}
                        className="w-full px-3 py-1.5 text-xs border rounded-md" />
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" onClick={addCert} className="bg-brand-green text-white px-2 py-1.5 rounded-md text-[10px] font-bold">Add</button>
                      <button type="button" onClick={() => setShowCertForm(false)} className="bg-muted text-foreground px-2 py-1.5 rounded-md text-[10px] border">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </form>
            
            <div className="p-6 border-t border-border bg-muted/30 rounded-b-3xl flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-card border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Manufacturer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-card rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold mb-2">Delete Manufacturer?</h3>
            <p className="text-sm text-foreground/60 mb-6">Are you sure? This will remove the manufacturer profile and all linked data.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-muted rounded-xl text-sm font-bold border hover:bg-card">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
