'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  meta?: string; // optional subtitle
}

interface SearchSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  clearable?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  icon,
  clearable = true,
  className = '',
  disabled = false,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find(o => o.value === value) ?? null;

  const filtered = query.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.meta ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setHighlightedIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleSelect = useCallback(
    (opt: SelectOption) => {
      onChange(opt.value);
      setOpen(false);
      setQuery('');
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  // Keyboard handler on the search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => (i + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => (i - 1 + filtered.length) % filtered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={open ? () => setOpen(false) : handleOpen}
        disabled={disabled}
        className={[
          'w-full flex items-center gap-2 border rounded-2xl py-2.5 px-4 text-sm transition-all',
          'focus:outline-none focus:ring-2 focus:ring-brand-green/25',
          'bg-brand-gold-light/20 border-brand-green-border/20',
          open ? 'ring-2 ring-brand-green/25 border-brand-green/30' : 'hover:border-brand-green/30',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {icon && <span className="text-brand-foreground/40 flex-shrink-0">{icon}</span>}
        <span className={`flex-1 text-left truncate ${selected ? 'text-brand-foreground' : 'text-brand-foreground/40'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {clearable && selected && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-brand-green/10 text-brand-foreground/40 hover:text-brand-green transition-colors"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-brand-foreground/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={[
            'absolute z-50 mt-1.5 w-full bg-white border border-brand-green-border/20',
            'rounded-2xl shadow-xl overflow-hidden',
            'animate-in fade-in slide-in-from-top-1 duration-150',
          ].join(' ')}
          style={{ minWidth: '180px' }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-brand-green-border/10">
            <div className="flex items-center gap-2 bg-brand-gold-light/40 rounded-xl px-3 py-2">
              <Search className="h-3.5 w-3.5 text-brand-foreground/40 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search or use ↑↓ Enter…"
                className="flex-1 bg-transparent text-sm text-brand-foreground placeholder:text-brand-foreground/35 outline-none min-w-0"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-brand-foreground/40 hover:text-brand-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul ref={listRef} className="max-h-52 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-brand-foreground/40 text-center">No results found</li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      onClick={() => handleSelect(opt)}
                      className={[
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                        isHighlighted && !isSelected
                          ? 'bg-brand-green/10 text-brand-green'
                          : isSelected
                          ? 'bg-brand-green/8 text-brand-green font-semibold'
                          : 'text-brand-foreground hover:bg-brand-gold-light/40',
                      ].join(' ')}
                    >
                      {/* Keyboard focus indicator bar */}
                      <span className={`w-0.5 h-4 rounded-full flex-shrink-0 transition-all ${isHighlighted ? 'bg-brand-green' : 'bg-transparent'}`} />
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.meta && <span className="text-xs text-brand-foreground/40 truncate max-w-[80px]">{opt.meta}</span>}
                      {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0 text-brand-green" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Keyboard hint footer */}
          <div className="px-4 py-2 border-t border-brand-green-border/10 flex items-center gap-3 text-[10px] text-brand-foreground/35 font-medium">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>Esc close</span>
          </div>
        </div>
      )}
    </div>
  );
}
