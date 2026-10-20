'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Pencil,
  LayoutGrid,
  List,
  Sparkles,
  Award,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';

interface Cert {
  name: string;
  url: string;
}

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
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [filterType, setFilterType] = useState<'ALL' | 'VERIFIED' | 'FEATURED'>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

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

  const [deleteTarget, setDeleteTarget] = useState<Manufacturer | null>(null);

  const filteredData = useMemo(() => {
    return manufacturers.filter(m => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.companyName.toLowerCase().includes(q) ||
        (m.contactEmail && m.contactEmail.toLowerCase().includes(q)) ||
        (m.gstNumber && m.gstNumber.toLowerCase().includes(q)) ||
        (m.manufacturingLicense && m.manufacturingLicense.toLowerCase().includes(q));

      const matchesFilter =
        filterType === 'ALL' ||
        (filterType === 'VERIFIED' && m.isVerified) ||
        (filterType === 'FEATURED' && m.isFeatured);

      return matchesSearch && matchesFilter;
    });
  }, [manufacturers, searchTerm, filterType]);

  // Global Keyboard Shortcuts (Alt+N: New, Alt+S: Save, Esc: Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + N: New Manufacturer
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!isFormOpen && !deleteTarget) {
          openCreate();
        }
      }

      // Alt + S: Save Manufacturer
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isFormOpen && formRef.current) {
          formRef.current.requestSubmit();
        }
      }

      // Esc: Close active modal
      if (e.key === 'Escape') {
        if (isFormOpen) {
          e.preventDefault();
          setIsFormOpen(false);
        } else if (deleteTarget) {
          e.preventDefault();
          setDeleteTarget(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, deleteTarget]);

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
        setManufacturers(prev => prev.map(m => (m.id === saved.id ? saved : m)));
        toast.success(`Manufacturer ${saved.companyName} updated`);
      } else {
        setManufacturers(prev => [saved, ...prev]);
        toast.success(`Manufacturer ${saved.companyName} created`);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/manufacturers?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setManufacturers(prev => prev.filter(m => m.id !== deleteTarget.id));
      toast.success(`Manufacturer ${deleteTarget.companyName} deleted`);
      setDeleteTarget(null);
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
    <div className="space-y-4">
      {/* Header Banner with Merged Search & Create Action (Minimal Margins, No Subtitle) */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Manufacturer Master</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                type="text"
                placeholder="Search manufacturers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-foreground placeholder:text-foreground/40 shadow-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Create Manufacturer Button */}
            <button
              type="button"
              onClick={openCreate}
              title="Add Manufacturer (Alt+N)"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Manufacturer</span>
              <kbd className="text-[10px] bg-white/20 px-1 py-0.5 rounded font-mono ml-0.5 hidden sm:inline">Alt+N</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-muted/60 border border-border rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-card text-brand-green shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({manufacturers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('VERIFIED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'VERIFIED'
                ? 'bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Verified ({manufacturers.filter(m => m.isVerified).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('FEATURED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'FEATURED'
                ? 'bg-card text-amber-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Featured ({manufacturers.filter(m => m.isFeatured).length})
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filteredData.length}</strong> of{' '}
              <strong className="text-foreground">{manufacturers.length}</strong>
            </span>
          </span>

          <div className="inline-flex items-center p-1 bg-muted/70 border border-border rounded-2xl text-xs gap-1">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              title="Card View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-card text-brand-green shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              title="Grid / Table View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-card text-brand-green shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {filteredData.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-3 shadow-sm">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">
            {searchTerm || filterType !== 'ALL'
              ? 'No manufacturers match your filter.'
              : 'No pharmaceutical or herbal manufacturers found.'}
          </p>
          <button
            type="button"
            onClick={searchTerm || filterType !== 'ALL' ? () => { setSearchTerm(''); setFilterType('ALL'); } : openCreate}
            className="text-xs font-bold text-brand-green underline"
          >
            {searchTerm || filterType !== 'ALL' ? 'Reset search & filters' : 'Add your first manufacturer'}
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredData.map((m) => (
            <div
              key={m.id}
              className="relative bg-card rounded-3xl border border-border hover:border-brand-green/40 dark:hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-brand-green" />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* Header Row: Logo + Company Name + Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {m.logo ? (
                      <img
                        src={m.logo}
                        alt={m.companyName}
                        className="h-12 w-12 rounded-2xl object-cover border-2 border-brand-green/20 dark:border-brand-gold/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center border-2 border-brand-green/20 flex-shrink-0">
                        <Building2 className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-base text-foreground truncate" title={m.companyName}>
                        {m.companyName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <Globe className="h-3 w-3 shrink-0" />
                        <span className="truncate">/{m.slug}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {m.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    )}
                    {m.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {m.description && (
                  <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed bg-muted/40 p-3 rounded-2xl border border-border">
                    {m.description}
                  </p>
                )}

                {/* Contact & Legal Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Email</span>
                    {m.contactEmail ? (
                      <a
                        href={`mailto:${m.contactEmail}`}
                        className="font-bold text-foreground hover:text-brand-green hover:underline truncate block"
                        title={m.contactEmail}
                      >
                        {m.contactEmail}
                      </a>
                    ) : (
                      <span className="font-semibold text-muted-foreground/60 italic truncate block">Not provided</span>
                    )}
                  </div>

                  <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Phone</span>
                    {m.contactPhone ? (
                      <a
                        href={`tel:${m.contactPhone}`}
                        className="font-bold text-foreground hover:text-brand-green hover:underline truncate block"
                        title={m.contactPhone}
                      >
                        {m.contactPhone}
                      </a>
                    ) : (
                      <span className="font-semibold text-muted-foreground/60 italic truncate block">Not provided</span>
                    )}
                  </div>

                  {m.website && (
                    <div className="col-span-2 bg-background border border-border rounded-xl px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <Globe className="h-3.5 w-3.5 text-brand-green shrink-0" />
                        <span className="text-[11px] truncate">{m.website}</span>
                      </div>
                      <a
                        href={m.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-green hover:underline text-[11px] font-bold inline-flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>Visit</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {(m.manufacturingLicense || m.gstNumber) && (
                    <div className="col-span-2 bg-muted/40 border border-border rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
                      {m.manufacturingLicense && (
                        <span className="truncate">
                          <strong className="text-muted-foreground font-semibold">Lic:</strong> {m.manufacturingLicense}
                        </span>
                      )}
                      {m.gstNumber && (
                        <span className="truncate font-mono font-bold text-brand-green">
                          GST: {m.gstNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Certifications Badges */}
                {m.certifications && m.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.certifications.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-muted text-foreground px-2 py-0.5 rounded-lg border border-border"
                      >
                        <Award className="h-3 w-3 text-brand-gold shrink-0" />
                        <span>{c.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  title="Edit Manufacturer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-brand-green hover:text-white hover:border-brand-green transition-all shadow-sm"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(m)}
                  title="Delete Manufacturer"
                  className="p-1.5 rounded-xl bg-card border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table / Grid View */
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border uppercase font-extrabold text-[10px] tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-5">Manufacturer</th>
                  <th className="py-3 px-5">Contact Details</th>
                  <th className="py-3 px-5">License & GST</th>
                  <th className="py-3 px-5">Certifications</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredData.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {m.logo ? (
                          <img
                            src={m.logo}
                            alt={m.companyName}
                            className="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center border border-border shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-2">
                            {m.companyName}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Globe className="h-3 w-3" /> /{m.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-muted-foreground">
                      <div className="space-y-0.5">
                        {m.contactEmail && (
                          <a
                            href={`mailto:${m.contactEmail}`}
                            className="hover:text-brand-green hover:underline flex items-center gap-1 truncate max-w-[180px]"
                          >
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{m.contactEmail}</span>
                          </a>
                        )}
                        {m.contactPhone && (
                          <a
                            href={`tel:${m.contactPhone}`}
                            className="hover:text-brand-green hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{m.contactPhone}</span>
                          </a>
                        )}
                        {!m.contactEmail && !m.contactPhone && <span className="italic text-foreground/40">Not provided</span>}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="space-y-0.5 text-[11px]">
                        {m.manufacturingLicense && (
                          <div className="truncate max-w-[150px]">
                            <span className="text-muted-foreground font-semibold">Lic:</span> {m.manufacturingLicense}
                          </div>
                        )}
                        {m.gstNumber && (
                          <div className="font-mono font-bold text-brand-green truncate max-w-[150px]">
                            GST: {m.gstNumber}
                          </div>
                        )}
                        {!m.manufacturingLicense && !m.gstNumber && <span className="italic text-muted-foreground/60">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      {m.certifications && m.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.certifications.map((c, i) => (
                            <span key={i} className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold border border-border">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        {m.isVerified && (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        )}
                        {m.isFeatured && (
                          <span className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        {!m.isVerified && !m.isFeatured && (
                          <span className="text-muted-foreground text-[10px] font-semibold">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 text-muted-foreground hover:text-brand-green hover:bg-muted rounded-xl transition-colors inline-flex"
                        title="Edit Manufacturer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors inline-flex"
                        title="Delete Manufacturer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Manufacturer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 border border-border max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-brand-green to-[#0f381b] text-white">
              <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
                <Building2 className="h-5 w-5 text-brand-gold" />
                {isEditing ? 'Edit Manufacturer' : 'New Manufacturer'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2 py-1 rounded-lg">
                  <span>Save</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold text-brand-gold">
                    Alt+S
                  </kbd>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  title="Close (Esc)"
                  aria-label="Close"
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full flex items-center gap-1 transition-colors"
                >
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold text-white/80">
                    Esc
                  </kbd>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form
              ref={formRef}
              id="manufacturer-form"
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs"
            >
              {/* Logo & Basic Info */}
              <div className="bg-muted/30 rounded-2xl p-5 border border-border space-y-4">
                <div className="flex flex-col items-center py-2">
                  <ImageUploadCrop
                    value={form.logo}
                    onChange={(url) => setForm(f => ({ ...f, logo: url }))}
                    folder="manufacturers"
                  >
                    <div className="relative group rounded-full cursor-pointer">
                      {form.logo ? (
                        <img
                          src={form.logo}
                          alt="Logo"
                          className="w-28 h-28 rounded-full object-cover border-4 border-brand-gold/50 shadow-md group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-brand-green/10 border-4 border-brand-green/20 flex items-center justify-center text-brand-green shadow-sm group-hover:bg-brand-green/20 transition-colors">
                          <Building2 className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-brand-green text-white p-1.5 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                        <Pencil className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </ImageUploadCrop>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Click to upload logo · Recommended 500x500px
                  </p>
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">
                    Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.companyName}
                    onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-bold text-foreground focus:outline-none focus:border-brand-green shadow-sm text-xs"
                  />
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-muted-foreground mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-medium text-foreground focus:outline-none focus:border-brand-green resize-none shadow-sm text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Contact & Legal */}
              <div className="bg-muted/30 rounded-2xl p-5 border border-border space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-green flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Contact & Legal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-muted-foreground mb-1 text-[11px]">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-muted-foreground mb-1 text-[11px]">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={form.contactPhone}
                      onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-muted-foreground mb-1 text-[11px]">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-muted-foreground mb-1 text-[11px]">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={form.gstNumber}
                      onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-brand-green uppercase"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold uppercase text-muted-foreground mb-1 text-[11px]">
                      Manufacturing License Number
                    </label>
                    <input
                      type="text"
                      value={form.manufacturingLicense}
                      onChange={e => setForm(f => ({ ...f, manufacturingLicense: e.target.value }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isVerified}
                      onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))}
                      className="w-4 h-4 text-brand-green rounded focus:ring-brand-green cursor-pointer"
                    />
                    <span className="font-bold text-foreground">Verified Manufacturer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-brand-green rounded focus:ring-brand-green cursor-pointer"
                    />
                    <span className="font-bold text-foreground">Featured on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Certifications Builder */}
              <div className="space-y-3 bg-muted/30 rounded-2xl p-5 border border-border">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-green flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Quality Certifications
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCertForm(true)}
                    className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Certificate
                  </button>
                </div>

                {certs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {certs.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-card p-2.5 rounded-xl border border-border text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Award className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                          <span className="font-bold truncate">{c.name}</span>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-green hover:underline shrink-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCert(i)}
                          className="text-muted-foreground hover:text-red-500 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showCertForm && (
                  <div className="bg-card p-3 rounded-xl border border-brand-green/30 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Certificate Name (e.g. GMP, ISO 9001)"
                        value={newCert.name}
                        onChange={e => setNewCert(n => ({ ...n, name: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-brand-green"
                      />
                      <input
                        type="url"
                        placeholder="Verification Link / Document URL"
                        value={newCert.url}
                        onChange={e => setNewCert(n => ({ ...n, url: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-brand-green"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCertForm(false)}
                        className="px-3 py-1 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addCert}
                        className="px-3 py-1 text-xs font-bold bg-brand-green text-white rounded-lg hover:bg-brand-gold hover:text-brand-green"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                title="Cancel (Esc)"
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <span>Cancel</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/80 border border-border rounded font-mono text-foreground/60 hidden sm:inline">
                  Esc
                </kbd>
              </button>
              <button
                type="submit"
                form="manufacturer-form"
                disabled={loading}
                title="Save (Alt+S)"
                className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>{loading ? 'Saving...' : isEditing ? 'Update Manufacturer' : 'Create Manufacturer'}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-semibold hidden sm:inline">
                  Alt+S
                </kbd>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && setDeleteTarget(null)}
          />

          <div className="relative bg-card rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center border border-red-500/30 animate-in zoom-in-95 duration-150">
            <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center text-red-600 mb-3">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">Delete Manufacturer?</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{deleteTarget.companyName}</strong>? This will remove the manufacturer profile and link associations.
            </p>
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={loading}
                className="px-4 py-2 bg-muted rounded-xl text-xs font-bold border border-border hover:bg-card text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
