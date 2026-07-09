'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, Check, ArrowDownUp } from 'lucide-react';

const EXPERIENCE_RANGES = [
  { id: '0-5', label: '0-5 Years' },
  { id: '6-10', label: '6-10 Years' },
  { id: '11-15', label: '11-15 Years' },
  { id: '16-20', label: '16-20 Years' },
  { id: '20+', label: '20+ Years' },
];

const PRICE_RANGES = [
  { id: '0', label: 'Free (₹0)' },
  { id: '1-100', label: 'Under ₹100' },
  { id: '100-500', label: '₹100 - ₹500' },
  { id: '500-1000', label: '₹500 - ₹1,000' },
  { id: '1000+', label: '₹1,000+' },
];

const SORT_OPTIONS = [
  { id: '', label: 'Recommended' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const TYPE_OPTIONS = [
  { id: 'online', label: 'Online Consultation' },
  { id: 'offline', label: 'Offline Consultation' },
];

const FULFILLMENT_OPTIONS = [
  { id: 'clinic_pickup', label: 'Clinic Pickup' },
  { id: 'self_dispatch', label: 'Doctor Self-Dispatch' },
  { id: 'ayurwed_delivery', label: 'AYURWED Delivery' },
];

interface ConsultantFilterSidebarClientProps {
  initialSearch: string;
  initialExperience: string[];
  initialPrice: string[];
  initialSort: string;
  initialTypes: string[];
  initialFulfillments: string[];
}

export default function ConsultantFilterSidebarClient({
  initialSearch,
  initialExperience,
  initialPrice,
  initialSort,
  initialTypes,
  initialFulfillments,
}: ConsultantFilterSidebarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedExperience, setSelectedExperience] = useState<string[]>(initialExperience);
  const [selectedPrice, setSelectedPrice] = useState<string[]>(initialPrice);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes);
  const [selectedFulfillments, setSelectedFulfillments] = useState<string[]>(initialFulfillments);
  const [sort, setSort] = useState<string>(initialSort);

  const updateFilters = (
    newExp: string[],
    newPrice: string[],
    newSort: string,
    newTypes: string[],
    newFulfillments: string[]
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newExp.length > 0) params.set('experience', newExp.join(','));
    else params.delete('experience');

    if (newPrice.length > 0) params.set('price', newPrice.join(','));
    else params.delete('price');

    if (newSort) params.set('sort', newSort);
    else params.delete('sort');

    if (newTypes.length > 0) params.set('types', newTypes.join(','));
    else params.delete('types');

    if (newFulfillments.length > 0) params.set('fulfillments', newFulfillments.join(','));
    else params.delete('fulfillments');

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleExperience = (id: string) => {
    const updated = selectedExperience.includes(id)
      ? selectedExperience.filter((e) => e !== id)
      : [...selectedExperience, id];
    setSelectedExperience(updated);
    updateFilters(updated, selectedPrice, sort, selectedTypes, selectedFulfillments);
  };

  const togglePrice = (id: string) => {
    const updated = selectedPrice.includes(id)
      ? selectedPrice.filter((e) => e !== id)
      : [...selectedPrice, id];
    setSelectedPrice(updated);
    updateFilters(selectedExperience, updated, sort, selectedTypes, selectedFulfillments);
  };

  const toggleType = (id: string) => {
    const updated = selectedTypes.includes(id)
      ? selectedTypes.filter((t) => t !== id)
      : [...selectedTypes, id];
    setSelectedTypes(updated);
    updateFilters(selectedExperience, selectedPrice, sort, updated, selectedFulfillments);
  };

  const toggleFulfillment = (id: string) => {
    const updated = selectedFulfillments.includes(id)
      ? selectedFulfillments.filter((f) => f !== id)
      : [...selectedFulfillments, id];
    setSelectedFulfillments(updated);
    updateFilters(selectedExperience, selectedPrice, sort, selectedTypes, updated);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSort(newSort);
    updateFilters(selectedExperience, selectedPrice, newSort, selectedTypes, selectedFulfillments);
  };

  const clearFilters = () => {
    setSelectedExperience([]);
    setSelectedPrice([]);
    setSelectedTypes([]);
    setSelectedFulfillments([]);
    setSort('');
    router.push(pathname);
  };

  const hasFilters =
    selectedExperience.length > 0 ||
    selectedPrice.length > 0 ||
    selectedTypes.length > 0 ||
    selectedFulfillments.length > 0 ||
    initialSearch ||
    sort;

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-6 sticky top-24">
      <div className="flex items-center justify-between text-brand-green font-bold border-b border-brand-green-light pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <span>Filters</span>
        </div>
        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="text-xs text-brand-gold-dark hover:text-brand-gold underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand-green flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4" /> Sort By
        </h3>
        <select
          value={sort}
          onChange={handleSortChange}
          className="w-full bg-brand-gold-light/20 text-brand-foreground text-sm border border-border rounded-xl py-2 px-3 shadow-sm focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 transition-all appearance-none cursor-pointer"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Consultation Type Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand-green">Consultation Type</h3>
        <div className="flex flex-col space-y-2.5">
          {TYPE_OPTIONS.map((type) => {
            const isSelected = selectedTypes.includes(type.id);
            return (
              <div 
                key={type.id} 
                onClick={() => toggleType(type.id)}
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
                  {type.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medicine Fulfillment Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand-green">Medicine Fulfillment</h3>
        <div className="flex flex-col space-y-2.5">
          {FULFILLMENT_OPTIONS.map((fulfillment) => {
            const isSelected = selectedFulfillments.includes(fulfillment.id);
            return (
              <div 
                key={fulfillment.id} 
                onClick={() => toggleFulfillment(fulfillment.id)}
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
                  {fulfillment.label}
                </span>
              </div>
            );
          })}
        </div>
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

      {/* Price Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand-green">Consultation Fee</h3>
        <div className="flex flex-col space-y-2.5">
          {PRICE_RANGES.map((range) => {
            const isSelected = selectedPrice.includes(range.id);
            return (
              <div 
                key={range.id} 
                onClick={() => togglePrice(range.id)}
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
