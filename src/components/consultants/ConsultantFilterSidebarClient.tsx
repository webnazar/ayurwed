'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  SlidersHorizontal,
  Check,
  Award,
  ShieldCheck,
  RotateCcw,
  Languages,
  Briefcase,
  Phone,
  MessageCircle,
} from 'lucide-react';

const EXPERIENCE_RANGES = [
  { id: '0-5', label: '0-5 Years' },
  { id: '6-10', label: '6-10 Years' },
  { id: '11-15', label: '11-15 Years' },
  { id: '16-20', label: '16-20 Years' },
  { id: '20+', label: '20+ Years' },
];

const LANGUAGES = [
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'Hindi' },
  { id: 'Urdu', label: 'Urdu' },
  { id: 'Marathi', label: 'Marathi' },
  { id: 'Bengali', label: 'Bengali' },
  { id: 'Telugu', label: 'Telugu' },
  { id: 'Tamil', label: 'Tamil' },
  { id: 'Gujarati', label: 'Gujarati' },
  { id: 'Kannada', label: 'Kannada' },
  { id: 'Malayalam', label: 'Malayalam' },
  { id: 'Punjabi', label: 'Punjabi' },
  { id: 'Odia', label: 'Odia' },
  { id: 'Assamese', label: 'Assamese' },
  { id: 'Sanskrit', label: 'Sanskrit' },
  { id: 'Arabic', label: 'Arabic' },
  { id: 'French', label: 'French' },
  { id: 'German', label: 'German' },
  { id: 'Spanish', label: 'Spanish' },
  { id: 'Russian', label: 'Russian' },
  { id: 'Chinese', label: 'Chinese' },
  { id: 'Japanese', label: 'Japanese' },
];

const SORT_OPTIONS = [
  { id: '', label: 'Recommended' },
  { id: 'experience_desc', label: 'Experience: High to Low' },
  { id: 'rating_desc', label: 'Rating: High to Low' },
];

interface ConsultantFilterSidebarClientProps {
  initialSearch?: string;
  initialExperience?: string[];
  initialSort?: string;
  initialSpecialization?: string[];
  initialLanguages?: string[];
  initialVerifiedOnly?: boolean;
  initialCertifiedOnly?: boolean;
  // Legacy props fallback
  initialPrice?: string[];
  initialTypes?: string[];
  initialFulfillments?: string[];
}

export default function ConsultantFilterSidebarClient({
  initialSearch = '',
  initialExperience = [],
  initialSort = '',
  initialSpecialization = [],
  initialLanguages = [],
  initialVerifiedOnly = false,
  initialCertifiedOnly = false,
}: ConsultantFilterSidebarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedExperience, setSelectedExperience] = useState<string[]>(initialExperience);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    searchParams.get('languages')?.split(',').filter(Boolean) || initialLanguages
  );
  const [sort, setSort] = useState<string>(initialSort || searchParams.get('sort') || '');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(
    searchParams.get('verified') === 'true' || initialVerifiedOnly
  );
  const [certifiedOnly, setCertifiedOnly] = useState<boolean>(
    searchParams.get('certified') === 'true' || initialCertifiedOnly
  );

  React.useEffect(() => {
    setSort(searchParams.get('sort') || '');
    setSelectedExperience(searchParams.get('experience')?.split(',').filter(Boolean) || []);
    setSelectedLanguages(searchParams.get('languages')?.split(',').filter(Boolean) || []);
    setVerifiedOnly(searchParams.get('verified') === 'true');
    setCertifiedOnly(searchParams.get('certified') === 'true');
  }, [searchParams]);

  const applyFilters = (
    newExp: string[],
    newLang: string[],
    newSort: string,
    newVerified: boolean,
    newCertified: boolean
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Clean up old obsolete booking params and specialization
    params.delete('price');
    params.delete('types');
    params.delete('fulfillments');
    params.delete('specialization');

    if (newExp.length > 0) params.set('experience', newExp.join(','));
    else params.delete('experience');

    if (newLang.length > 0) params.set('languages', newLang.join(','));
    else params.delete('languages');

    if (newSort) params.set('sort', newSort);
    else params.delete('sort');

    if (newVerified) params.set('verified', 'true');
    else params.delete('verified');

    if (newCertified) params.set('certified', 'true');
    else params.delete('certified');

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleExperience = (id: string) => {
    const updated = selectedExperience.includes(id)
      ? selectedExperience.filter((e) => e !== id)
      : [...selectedExperience, id];
    setSelectedExperience(updated);
    applyFilters(updated, selectedLanguages, sort, verifiedOnly, certifiedOnly);
  };

  const toggleLanguage = (id: string) => {
    const updated = selectedLanguages.includes(id)
      ? selectedLanguages.filter((l) => l !== id)
      : [...selectedLanguages, id];
    setSelectedLanguages(updated);
    applyFilters(selectedExperience, updated, sort, verifiedOnly, certifiedOnly);
  };

  const handleSortChange = (newSort: string) => {
    const nextSort = sort === newSort && newSort !== '' ? '' : newSort;
    setSort(nextSort);
    applyFilters(selectedExperience, selectedLanguages, nextSort, verifiedOnly, certifiedOnly);
  };

  const toggleVerifiedOnly = () => {
    const nextVal = !verifiedOnly;
    setVerifiedOnly(nextVal);
    applyFilters(selectedExperience, selectedLanguages, sort, nextVal, certifiedOnly);
  };

  const toggleCertifiedOnly = () => {
    const nextVal = !certifiedOnly;
    setCertifiedOnly(nextVal);
    applyFilters(selectedExperience, selectedLanguages, sort, verifiedOnly, nextVal);
  };

  const resetAllFilters = () => {
    setSelectedExperience([]);
    setSelectedLanguages([]);
    setSort('');
    setVerifiedOnly(false);
    setCertifiedOnly(false);

    const params = new URLSearchParams();
    const currentSearch = searchParams.get('search');
    if (currentSearch) params.set('search', currentSearch);
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFiltersCount =
    selectedExperience.length +
    selectedLanguages.length +
    (sort ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (certifiedOnly ? 1 : 0);

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-brand-green" />
          <h2 className="font-extrabold text-base text-foreground">Filter Doctors</h2>
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-brand-gold-dark hover:text-brand-green font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Direct Contact Notice */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
          <Phone className="h-3.5 w-3.5" />
          <span>Direct Patient Connection</span>
        </div>
        <p className="text-[11px] text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed">
          Call or WhatsApp listed Ayurvedic doctors directly. Zero platform fees or booking charges.
        </p>
      </div>

      {/* Sort By */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider block">
          Sort By
        </label>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSortChange(opt.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                sort === opt.id
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-muted/50 text-foreground/70 hover:bg-muted'
              }`}
            >
              <span>{opt.label}</span>
              {sort === opt.id && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Verified & Credentials Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider block">
          Credentials
        </label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={toggleVerifiedOnly}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
              verifiedOnly
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-card border-border text-foreground/70 hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified Degrees Only</span>
            </div>
            {verifiedOnly && <Check className="h-3.5 w-3.5 text-emerald-600" />}
          </button>

          <button
            type="button"
            onClick={toggleCertifiedOnly}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
              certifiedOnly
                ? 'bg-brand-gold/15 border-brand-gold/30 text-brand-gold-dark'
                : 'bg-card border-border text-foreground/70 hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-gold-dark" />
              <span>CAI Certified Doctors</span>
            </div>
            {certifiedOnly && <Check className="h-3.5 w-3.5 text-brand-gold-dark" />}
          </button>
        </div>
      </div>


      {/* Experience Ranges */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider block flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-brand-green" />
          <span>Experience</span>
        </label>
        <div className="space-y-1">
          {EXPERIENCE_RANGES.map((range) => {
            const isSelected = selectedExperience.includes(range.id);
            return (
              <label
                key={range.id}
                onClick={() => toggleExperience(range.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-green-light text-brand-green font-bold'
                    : 'hover:bg-muted/50 text-foreground/80'
                }`}
              >
                <span>{range.label}</span>
                <span
                  className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                    isSelected
                      ? 'bg-brand-green border-brand-green text-white'
                      : 'border-border bg-card'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider block flex items-center gap-1.5">
          <Languages className="h-3.5 w-3.5 text-brand-green" />
          <span>Languages Spoken</span>
        </label>
        <div className="space-y-1">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.id);
            return (
              <label
                key={lang.id}
                onClick={() => toggleLanguage(lang.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-green-light text-brand-green font-bold'
                    : 'hover:bg-muted/50 text-foreground/80'
                }`}
              >
                <span>{lang.label}</span>
                <span
                  className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                    isSelected
                      ? 'bg-brand-green border-brand-green text-white'
                      : 'border-border bg-card'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
