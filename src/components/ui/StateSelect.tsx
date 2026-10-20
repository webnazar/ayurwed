'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

interface StateSelectProps {
  value: string;
  onChange: (state: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function StateSelect({
  value,
  onChange,
  placeholder = 'Select or type state...',
  className = '',
  required = false,
}: StateSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStates = useMemo(() => {
    if (!search.trim()) return INDIAN_STATES;
    const q = search.toLowerCase().trim();
    return INDIAN_STATES.filter(s => s.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (state: string) => {
    onChange(state);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : (value || search)}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            // Allow typing custom state if needed
            onChange(e.target.value);
          }}
          onClick={() => {
            setIsOpen(true);
            setSearch(value || '');
          }}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 bg-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:border-brand-gold pr-10 transition-all ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearch('');
              }}
              className="p-1 text-muted-foreground hover:text-rose-600 rounded-md transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
            className="p-1 text-muted-foreground hover:text-brand-green transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-card border border-border rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>States & Union Territories ({filteredStates.length})</span>
            {search && <span className="text-brand-gold-dark">Filtering "{search}"</span>}
          </div>

          {filteredStates.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground italic text-center">
              No matching state found. Press enter to use "{search}".
            </div>
          ) : (
            filteredStates.map((s) => {
              const isSelected = value?.toLowerCase() === s.toLowerCase();
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-green/10 text-brand-green font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{s}</span>
                  {isSelected && <Check className="h-4 w-4 text-brand-green" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
