'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Search,
  Plus,
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
  BadgeCheck,
  Download,
  FileUp,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';

interface Cert {
  name: string;
  url: string;
}

interface Brand {
  id: number;
  companyName: string;
  slug: string;
  slogan?: string | null;
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
  _count?: { products: number };
}

export default function BrandMasterClient({ initialBrands }: { initialBrands: Brand[] }) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [filterType, setFilterType] = useState<'ALL' | 'VERIFIED' | 'FEATURED'>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    id: 0,
    companyName: '',
    slogan: '',
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

  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const filteredData = useMemo(() => {
    return brands.filter(b => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.companyName.toLowerCase().includes(q) ||
        (b.contactEmail && b.contactEmail.toLowerCase().includes(q)) ||
        (b.gstNumber && b.gstNumber.toLowerCase().includes(q)) ||
        (b.manufacturingLicense && b.manufacturingLicense.toLowerCase().includes(q));

      const matchesFilter =
        filterType === 'ALL' ||
        (filterType === 'VERIFIED' && b.isVerified) ||
        (filterType === 'FEATURED' && b.isFeatured);

      return matchesSearch && matchesFilter;
    });
  }, [brands, searchTerm, filterType]);

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{
    companyName: string;
    slogan: string;
    description: string;
    manufacturingLicense: string;
    gstNumber: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    isVerified: string;
    isFeatured: string;
  }>({
    companyName: '',
    slogan: '',
    description: '',
    manufacturingLicense: '',
    gstNumber: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    isVerified: '',
    isFeatured: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeImportModal = () => {
    setShowImportModal(false);
    setCsvData([]);
    setCsvHeaders([]);
    setMapping({
      companyName: '',
      slogan: '',
      description: '',
      manufacturingLicense: '',
      gstNumber: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      isVerified: '',
      isFeatured: '',
    });
  };

  // Global Keyboard Shortcuts (Alt+N: New, Alt+S: Save/Search, Esc: Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!isFormOpen) openCreate();
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isFormOpen) {
          formRef.current?.requestSubmit();
        } else {
          searchRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        if (showImportModal) {
          closeImportModal();
        } else if (isFormOpen) {
          const activeTag = (e.target as HTMLElement)?.tagName;
          if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
            closeForm();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, showImportModal]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          const autoMap = {
            companyName: '',
            slogan: '',
            description: '',
            manufacturingLicense: '',
            gstNumber: '',
            website: '',
            contactEmail: '',
            contactPhone: '',
            isVerified: '',
            isFeatured: '',
          };
          results.meta.fields.forEach((f) => {
            const lower = f.toLowerCase();
            if (lower.includes('company') || lower.includes('brand') || lower === 'name') autoMap.companyName = f;
            else if (lower.includes('slogan') || lower.includes('tagline')) autoMap.slogan = f;
            else if (lower.includes('desc')) autoMap.description = f;
            else if (lower.includes('license') || lower.includes('mfg')) autoMap.manufacturingLicense = f;
            else if (lower.includes('gst')) autoMap.gstNumber = f;
            else if (lower.includes('web') || lower.includes('url') || lower.includes('site')) autoMap.website = f;
            else if (lower.includes('email') || lower.includes('mail')) autoMap.contactEmail = f;
            else if (lower.includes('phone') || lower.includes('contact') || lower.includes('mobile')) autoMap.contactPhone = f;
            else if (lower.includes('verified')) autoMap.isVerified = f;
            else if (lower.includes('featured')) autoMap.isFeatured = f;
          });
          setMapping(autoMap);
        }
        setCsvData(results.data);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      },
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeBulkImport = async () => {
    if (csvData.length === 0) return;
    if (!mapping.companyName) {
      toast.error("You must map a column to 'Brand Name' before importing.");
      return;
    }

    setIsImporting(true);
    try {
      const payload = csvData
        .map((row) => ({
          companyName: row[mapping.companyName],
          slogan: mapping.slogan ? row[mapping.slogan] : '',
          description: mapping.description ? row[mapping.description] : '',
          manufacturingLicense: mapping.manufacturingLicense ? row[mapping.manufacturingLicense] : '',
          gstNumber: mapping.gstNumber ? row[mapping.gstNumber] : '',
          website: mapping.website ? row[mapping.website] : '',
          contactEmail: mapping.contactEmail ? row[mapping.contactEmail] : '',
          contactPhone: mapping.contactPhone ? row[mapping.contactPhone] : '',
          isVerified: mapping.isVerified
            ? String(row[mapping.isVerified]).toLowerCase() === 'true' || row[mapping.isVerified] === '1' || row[mapping.isVerified] === true
            : false,
          isFeatured: mapping.isFeatured
            ? String(row[mapping.isFeatured]).toLowerCase() === 'true' || row[mapping.isFeatured] === '1' || row[mapping.isFeatured] === true
            : false,
        }))
        .filter((item) => item.companyName);

      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(
        `Successfully imported/updated ${data.successful} brands. ${data.failed > 0 ? `${data.failed} failed.` : ''}`
      );

      const freshRes = await fetch('/api/admin/brands');
      if (freshRes.ok) {
        setBrands(await freshRes.json());
      }
      closeImportModal();
    } catch (err: any) {
      toast.error(err.message || 'Error during bulk import');
    } finally {
      setIsImporting(false);
    }
  };

  const exportToCsv = () => {
    if (brands.length === 0) {
      toast.error('No brands available to export');
      return;
    }
    const rows = brands.map((b) => ({
      companyName: b.companyName,
      slogan: b.slogan || '',
      description: b.description || '',
      manufacturingLicense: b.manufacturingLicense || '',
      gstNumber: b.gstNumber || '',
      website: b.website || '',
      contactEmail: b.contactEmail || '',
      contactPhone: b.contactPhone || '',
      isVerified: b.isVerified ? 'true' : 'false',
      isFeatured: b.isFeatured ? 'true' : 'false',
    }));
    const csvString = Papa.unparse(rows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brands_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Brands exported to CSV successfully');
  };

  const downloadSampleCsv = () => {
    const sampleRows = [
      {
        companyName: 'Dabur India Ltd',
        slogan: 'Celebrate Life with Ayurveda',
        description: 'Leading Ayurvedic consumer goods and natural healthcare company established in 1884.',
        manufacturingLicense: 'AYU-DL-1884-DAB',
        gstNumber: '07AAACD1111A1Z5',
        website: 'https://www.dabur.com',
        contactEmail: 'contact@dabur.com',
        contactPhone: '+91 120 3982000',
        isVerified: 'true',
        isFeatured: 'true',
      },
      {
        companyName: 'Kottakkal Arya Vaidya Sala',
        slogan: 'Pioneers in Classical Ayurvedic Medicine',
        description: 'Centuries-old Ayurvedic institution renowned for authentic classical formulations and treatment.',
        manufacturingLicense: 'AYU-KL-1902-AVS',
        gstNumber: '32AAATK1902A1ZB',
        website: 'https://www.aryavaidyasala.com',
        contactEmail: 'mail@aryavaidyasala.com',
        contactPhone: '+91 483 2808000',
        isVerified: 'true',
        isFeatured: 'true',
      },
      {
        companyName: 'Baidyanath Ayurved',
        slogan: 'Asli Ayurved, Shuddh Ayurved',
        description: 'Traditional manufacturer of classical asavas, arishtas, and bhasmas with clinical purity.',
        manufacturingLicense: 'AYU-WB-1917-BDN',
        gstNumber: '19AAACB1917B1ZA',
        website: 'https://www.baidyanath.com',
        contactEmail: 'info@baidyanath.com',
        contactPhone: '+91 33 22872222',
        isVerified: 'true',
        isFeatured: 'false',
      },
    ];
    const csvString = Papa.unparse(sampleRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brands_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample brands CSV template downloaded');
  };

  const openCreate = () => {
    setForm(emptyForm);
    setCerts([]);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEdit = (b: Brand) => {
    setForm({
      id: b.id,
      companyName: b.companyName,
      slogan: b.slogan || '',
      description: b.description || '',
      logo: b.logo || '',
      manufacturingLicense: b.manufacturingLicense || '',
      gstNumber: b.gstNumber || '',
      website: b.website || '',
      contactEmail: b.contactEmail || '',
      contactPhone: b.contactPhone || '',
      isVerified: b.isVerified,
      isFeatured: b.isFeatured,
    });
    setCerts(Array.isArray(b.certifications) ? b.certifications : []);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyForm);
    setCerts([]);
    setShowCertForm(false);
  };

  const handleAddCert = () => {
    if (!newCert.name.trim()) return toast.error('Certification name is required');
    setCerts([...certs, { ...newCert }]);
    setNewCert({ name: '', url: '' });
    setShowCertForm(false);
  };

  const handleRemoveCert = (index: number) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) return toast.error('Brand Name is required');

    setLoading(true);
    try {
      const payload = {
        ...form,
        certifications: certs,
      };

      const url = '/api/admin/brands';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resText = await res.text();
      let resData: any = null;
      try {
        resData = resText ? JSON.parse(resText) : null;
      } catch (e) {
        console.error('Failed to parse response JSON:', resText);
      }

      if (!res.ok) {
        throw new Error(resData?.error || `Failed to save brand (status ${res.status})`);
      }

      const savedBrand = resData;

      if (isEditing) {
        setBrands(brands.map(b => (b.id === savedBrand.id ? savedBrand : b)));
        toast.success('Brand profile updated!');
      } else {
        setBrands([savedBrand, ...brands]);
        toast.success('New brand registered!');
      }

      closeForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands?id=${deleteTarget.id}`, { method: 'DELETE' });
      const resText = await res.text();
      let resData: any = null;
      try {
        resData = resText ? JSON.parse(resText) : null;
      } catch (e) {}

      if (!res.ok) {
        throw new Error(resData?.error || `Failed to delete brand (status ${res.status})`);
      }
      setBrands(brands.filter(b => b.id !== deleteTarget.id));
      toast.success('Brand deleted successfully');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerified = async (b: Brand) => {
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, isVerified: !b.isVerified }),
      });
      const resText = await res.text();
      let resData: any = null;
      try {
        resData = resText ? JSON.parse(resText) : null;
      } catch (e) {}

      if (!res.ok) {
        throw new Error(resData?.error || 'Failed to update verification status');
      }
      const updated = resData;
      setBrands(brands.map(item => (item.id === updated.id ? updated : item)));
      toast.success(`Brand ${updated.isVerified ? 'verified' : 'unverified'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleFeatured = async (b: Brand) => {
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, isFeatured: !b.isFeatured }),
      });
      const resText = await res.text();
      let resData: any = null;
      try {
        resData = resText ? JSON.parse(resText) : null;
      } catch (e) {}

      if (!res.ok) {
        throw new Error(resData?.error || 'Failed to update featured status');
      }
      const updated = resData;
      setBrands(brands.map(item => (item.id === updated.id ? updated : item)));
      toast.success(`Brand ${updated.isFeatured ? 'featured' : 'unfeatured'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* ── Header Banner with Merged Search (Minimal Margins, No Subtitle) ── */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Brands</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search brands, email, license, GST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={exportToCsv}
              title="Export All Brands to CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            {/* CSV Import Button */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              title="Bulk Import Brands from CSV"
              className="inline-flex items-center justify-center gap-1.5 bg-card border border-border hover:border-brand-green text-foreground hover:text-brand-green font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Import CSV</span>
            </button>

            {/* Add Brand Button */}
            <button
              type="button"
              onClick={openCreate}
              title="Add Brand (Alt+N)"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Brand</span>
              <kbd className="text-[10px] bg-white/20 px-1 py-0.5 rounded font-mono ml-0.5 hidden sm:inline">Alt+N</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid (Equal & Minimal Margins) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Total Brands</span>
            <span className="text-2xl font-black text-brand-green dark:text-brand-gold mt-1 block">
              {brands.length}
            </span>
          </div>
          <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Verified Brands</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {brands.filter(b => b.isVerified).length}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">Featured Brands</span>
            <span className="text-2xl font-black text-brand-gold-dark mt-1 block">
              {brands.filter(b => b.isFeatured).length}
            </span>
          </div>
          <div className="p-2.5 bg-brand-gold/15 text-brand-gold-dark rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Filter Tabs & View Mode Switcher Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-muted/60 border border-border rounded-2xl text-xs">
          {(['ALL', 'VERIFIED', 'FEATURED'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
                filterType === tab
                  ? 'bg-card text-brand-green dark:text-brand-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'ALL'
                ? `All (${brands.length})`
                : tab === 'VERIFIED'
                ? `Verified (${brands.filter(b => b.isVerified).length})`
                : `Featured (${brands.filter(b => b.isFeatured).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto text-xs text-muted-foreground shrink-0">
          <span className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>
              Showing <strong className="text-foreground">{filteredData.length}</strong> of{' '}
              <strong className="text-foreground">{brands.length}</strong>
            </span>
          </span>

          {/* View Toggle */}
          <div className="inline-flex items-center p-1 bg-muted/70 border border-border rounded-2xl text-xs gap-1">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              title="Cards View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-card text-brand-green dark:text-brand-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              title="Table View"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-card text-brand-green dark:text-brand-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main List */}
      {filteredData.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-title-primary">No brands found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm || filterType !== 'ALL'
              ? 'Try modifying your search keywords or filter.'
              : 'Get started by creating your first brand profile.'}
          </p>
        </div>
      ) : viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map(b => (
            <div
              key={b.id}
              className="bg-card border border-border hover:border-brand-green/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-4">
                {/* Header: Logo, Name, Badges */}
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-muted/40 rounded-2xl border border-border flex items-center justify-center overflow-hidden flex-shrink-0 p-2 group-hover:scale-105 transition-transform">
                    {b.logo ? (
                      <img src={b.logo} alt={b.companyName} className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-extrabold text-title-primary truncate group-hover:text-brand-green transition-colors">
                        {b.companyName}
                      </h3>
                      {b.isVerified && (
                        <span title="Verified Brand" className="inline-flex">
                          <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-500/15 flex-shrink-0" />
                        </span>
                      )}
                      {b.isFeatured && (
                        <span title="Featured Brand" className="inline-flex">
                          <Sparkles className="h-4 w-4 text-brand-gold fill-brand-gold/20 flex-shrink-0" />
                        </span>
                      )}
                    </div>
                    {b.slogan && (
                      <p className="text-xs font-serif italic text-brand-green/85 truncate mt-0.5">
                        &ldquo;{b.slogan}&rdquo;
                      </p>
                    )}
                    {b.manufacturingLicense && (
                      <span className="text-[11px] text-muted-foreground block truncate mt-0.5 font-mono">
                        Lic: {b.manufacturingLicense}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {b.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                )}

                {/* Certifications Tags */}
                {Array.isArray(b.certifications) && b.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {b.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green dark:text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded-full"
                      >
                        <Award className="h-2.5 w-2.5" />
                        <span>{cert.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions & Toggles */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleVerified(b)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                      b.isVerified
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                        : 'border-border text-muted-foreground hover:border-emerald-500/40'
                    }`}
                  >
                    {b.isVerified ? 'Verified' : 'Verify'}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(b)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                      b.isFeatured
                        ? 'bg-brand-gold/15 border-brand-gold/30 text-brand-gold-dark'
                        : 'border-border text-muted-foreground hover:border-brand-gold/40'
                    }`}
                  >
                    {b.isFeatured ? 'Featured' : 'Feature'}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(b)}
                    title="Edit Brand"
                    className="p-2 rounded-xl hover:bg-brand-green/10 text-muted-foreground hover:text-brand-green transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(b)}
                    title="Delete Brand"
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 w-12">Logo</th>
                  <th className="py-3.5 px-4">Brand Name</th>
                  <th className="py-3.5 px-4">License / Reg</th>
                  <th className="py-3.5 px-4">Certifications</th>
                  <th className="py-3.5 px-4">Website / Contact</th>
                  <th className="py-3.5 px-4 text-center">Verified</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map(b => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="h-9 w-9 bg-muted/60 rounded-xl border border-border flex items-center justify-center p-1 overflow-hidden">
                        {b.logo ? (
                          <img src={b.logo} alt={b.companyName} className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-title-primary">{b.companyName}</div>
                      {b.slogan && (
                        <div className="text-[10px] text-brand-green/80 italic truncate max-w-xs">
                          &ldquo;{b.slogan}&rdquo;
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {b.manufacturingLicense || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {Array.isArray(b.certifications) && b.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {b.certifications.map((c, i) => (
                            <span key={i} className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {b.website ? (
                        <a href={b.website} target="_blank" rel="noreferrer" className="text-brand-green hover:underline flex items-center gap-1">
                          <span>{b.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : b.contactEmail ? (
                        <span>{b.contactEmail}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleVerified(b)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.isVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {b.isVerified ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(b)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.isFeatured ? 'bg-brand-gold/15 text-brand-gold-dark' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {b.isFeatured ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(b)}
                        className="p-1.5 rounded-xl hover:bg-brand-green/10 text-muted-foreground hover:text-brand-green"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DRAWER / MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeForm}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">Brand Profile</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-title-primary">
                {isEditing ? 'Edit Brand' : 'Register New Brand'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter official brand identity, logo, manufacturing licenses, and verified certifications.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Logo Upload */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Brand Logo</label>
                <ImageUploadCrop
                  value={form.logo}
                  onChange={url => setForm(prev => ({ ...prev, logo: url }))}
                  folder="brands"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dabur, Baidyanath, Kottakkal Arya Vaidya Sala..."
                  value={form.companyName}
                  onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-brand-green text-foreground"
                />
              </div>

              {/* Brand Slogan */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Brand Slogan / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science of Life, Ancient Wisdom for Modern Living, Pure Classical Healing..."
                  value={form.slogan}
                  onChange={e => setForm(prev => ({ ...prev, slogan: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-brand-green text-foreground"
                />
                <span className="text-[10px] text-muted-foreground">Official brand motto or marketing tagline</span>
              </div>

              {/* Brand Story / Description */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Brand Heritage &amp; Story</label>
                <textarea
                  rows={3}
                  placeholder="Overview of the brand, clinical traditions, and specialized Ayurvedic preparations..."
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-brand-green text-foreground resize-none"
                />
              </div>

              {/* License & GST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Manufacturing License / Reg</label>
                  <input
                    type="text"
                    placeholder="AYUSH / State Drug Lic Number"
                    value={form.manufacturingLicense}
                    onChange={e => setForm(prev => ({ ...prev, manufacturingLicense: e.target.value }))}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-2xl text-xs focus:outline-none focus:border-brand-green text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground">In-house or Contract Manufacturing license</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">GST Number</label>
                  <input
                    type="text"
                    placeholder="22AAAAA0000A1Z5"
                    value={form.gstNumber}
                    onChange={e => setForm(prev => ({ ...prev, gstNumber: e.target.value }))}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-2xl text-xs focus:outline-none focus:border-brand-green text-foreground"
                  />
                </div>
              </div>

              {/* Website, Email, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.website}
                    onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-2xl text-xs focus:outline-none focus:border-brand-green text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="info@brand.com"
                    value={form.contactEmail}
                    onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-2xl text-xs focus:outline-none focus:border-brand-green text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={form.contactPhone}
                    onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-2xl text-xs focus:outline-none focus:border-brand-green text-foreground"
                  />
                </div>
              </div>

              {/* Quality Certifications */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Certifications (GMP, ISO, AYUSH Premium)</label>
                  <button
                    type="button"
                    onClick={() => setShowCertForm(!showCertForm)}
                    className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Certification
                  </button>
                </div>

                {showCertForm && (
                  <div className="bg-muted/40 p-3 rounded-2xl border border-border space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Cert Name (e.g. WHO-GMP, ISO 9001)"
                        value={newCert.name}
                        onChange={e => setNewCert(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-1.5 bg-card border border-border rounded-xl text-xs focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="Proof Document URL (optional)"
                        value={newCert.url}
                        onChange={e => setNewCert(prev => ({ ...prev, url: e.target.value }))}
                        className="px-3 py-1.5 bg-card border border-border rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCertForm(false)}
                        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCert}
                        className="text-xs font-bold bg-brand-green text-white px-3 py-1 rounded-xl"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {certs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {certs.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-muted border border-border px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <Award className="h-3 w-3 text-brand-green" />
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCert(idx)}
                          className="hover:text-rose-500 text-muted-foreground ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-border hover:bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={e => setForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="rounded text-brand-green"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Verified Brand</span>
                    <span className="text-[10px] text-muted-foreground">Display verified quality badge</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-border hover:bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded text-brand-green"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Featured Brand</span>
                    <span className="text-[10px] text-muted-foreground">Highlight on store &amp; home</span>
                  </div>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-border">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 rounded-2xl border border-border text-xs font-bold hover:bg-muted text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isEditing ? 'Update Brand' : 'Register Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-title-primary">
                Delete Brand &ldquo;{deleteTarget.companyName}&rdquo;?
              </h3>
              <p className="text-xs text-muted-foreground">
                This will permanently remove this brand profile. Associated products will remain intact with brand association unlinked.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-2xl border border-border text-xs font-bold hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-40"
              >
                {loading ? 'Deleting...' : 'Delete Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-brand-green text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <FileUp className="h-5 w-5 text-brand-gold" />
                <h3 className="text-base font-extrabold tracking-tight">Bulk Import Brands via CSV</h3>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                title="Close (Esc)"
                className="text-white/70 hover:text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-5 text-xs">
              {!csvData.length ? (
                <div
                  className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 text-brand-green mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-foreground mb-1">Click to select CSV file</h4>
                  <p className="text-xs text-muted-foreground mb-3">Your CSV should include a brand / company name column.</p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSampleCsv();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green/10 hover:bg-brand-green hover:text-white text-brand-green text-xs font-bold transition-all border border-brand-green/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Sample CSV Template</span>
                  </button>

                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-brand-green/10 p-4 rounded-xl flex items-center justify-between border border-brand-green/20">
                    <div className="flex items-center gap-3 text-brand-green">
                      <FileUp className="h-5 w-5" />
                      <div>
                        <p className="text-sm font-bold">CSV Loaded Successfully</p>
                        <p className="text-xs text-brand-green/80">{csvData.length} records detected.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCsvData([])}
                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-full"
                    >
                      Remove File
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-green flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Map CSV Columns
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Brand / Company Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={mapping.companyName}
                          onChange={(e) => setMapping({ ...mapping, companyName: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Slogan / Tagline (Optional)
                        </label>
                        <select
                          value={mapping.slogan}
                          onChange={(e) => setMapping({ ...mapping, slogan: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Description (Optional)
                        </label>
                        <select
                          value={mapping.description}
                          onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Mfg License (Optional)
                        </label>
                        <select
                          value={mapping.manufacturingLicense}
                          onChange={(e) => setMapping({ ...mapping, manufacturingLicense: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          GST Number (Optional)
                        </label>
                        <select
                          value={mapping.gstNumber}
                          onChange={(e) => setMapping({ ...mapping, gstNumber: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Website (Optional)
                        </label>
                        <select
                          value={mapping.website}
                          onChange={(e) => setMapping({ ...mapping, website: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Contact Email (Optional)
                        </label>
                        <select
                          value={mapping.contactEmail}
                          onChange={(e) => setMapping({ ...mapping, contactEmail: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Contact Phone (Optional)
                        </label>
                        <select
                          value={mapping.contactPhone}
                          onChange={(e) => setMapping({ ...mapping, contactPhone: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Ignore --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Verified Status (Optional)
                        </label>
                        <select
                          value={mapping.isVerified}
                          onChange={(e) => setMapping({ ...mapping, isVerified: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Default to Unverified --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Featured Status (Optional)
                        </label>
                        <select
                          value={mapping.isFeatured}
                          onChange={(e) => setMapping({ ...mapping, isFeatured: e.target.value })}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:border-brand-green"
                        >
                          <option value="">-- Default to Not Featured --</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-muted/30 border-t border-border flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={closeImportModal}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkImport}
                disabled={isImporting || !csvData.length || !mapping.companyName}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
              >
                {isImporting ? 'Processing...' : 'Run Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
