'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Check } from 'lucide-react';

const EXPERIENCE_RANGES = [
  { id: '0-5', label: '0-5 Years' },
  { id: '6-10', label: '6-10 Years' },
  { id: '11-15', label: '11-15 Years' },
  { id: '16-20', label: '16-20 Years' },
  { id: '20+', label: '20+ Years' },
];

interface ConsultantFilterSidebarClientProps {
  initialSearch: string;
  initialExperience: string[];
}

export default function ConsultantFilterSidebarClient({
  initialSearch,
  initialExperience,
}: ConsultantFilterSidebarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedExperience, setSelectedExperience] = useState<string[]>(initialExperience);

  const updateFilters = (newExp: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newExp.length > 0) params.set('experience', newExp.join(','));
    else params.delete('experience');

    router.push(`/consultants?${params.toString()}`);
  };

  const toggleExperience = (id: string) => {
    const updated = selectedExperience.includes(id)
      ? selectedExperience.filter((e) => e !== id)
      : [...selectedExperience, id];
    setSelectedExperience(updated);
    updateFilters(updated);
  };

  const clearFilters = () => {
    setSelectedExperience([]);
    router.push('/consultants');
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-6 sticky top-24">
      <div className="flex items-center justify-between text-brand-green font-bold border-b border-brand-green-light pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <span>Filters</span>
        </div>
        {(selectedExperience.length > 0 || initialSearch) && (
          <button 
            onClick={clearFilters}
            className="text-xs text-brand-gold-dark hover:text-brand-gold underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Experience Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand-green">Years of Experience</h3>
        <div className="flex flex-col space-y-2.5">
          {EXPERIENCE_RANGES.map((range) => {
            const isSelected = selectedExperience.includes(range.id);
            return (
              <div 
                key={range.id} 
                onClick={() => toggleExperience(range.id)}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-brand-green border-brand-green' 
                    : 'border-brand-foreground/30 group-hover:border-brand-gold'
                }`}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={`text-sm transition-colors ${
                  isSelected ? 'text-brand-green font-semibold' : 'text-brand-foreground/80 group-hover:text-brand-green'
                }`}>
                  {range.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
