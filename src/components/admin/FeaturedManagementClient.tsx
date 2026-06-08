'use client';

import React, { useState } from 'react';
import { Star, Sparkles, Building2, Package, UserCircle, CheckCircle2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeaturedItem {
  id: number;
  name: string;
  isFeatured: boolean;
  isSponsored?: boolean;
  isPremium?: boolean;
  listingTier?: string;
}

interface FeaturedManagementClientProps {
  manufacturers: FeaturedItem[];
  products: FeaturedItem[];
  consultants: FeaturedItem[];
}

export default function FeaturedManagementClient({ manufacturers, products, consultants }: FeaturedManagementClientProps) {
  const [tab, setTab] = useState<'manufacturers' | 'products' | 'consultants'>('manufacturers');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredManufacturers = manufacturers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredConsultants = consultants.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleFlag = async (type: string, id: number, flag: string, currentValue: boolean) => {
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, flag, value: !currentValue }),
      });
      if (res.ok) {
        toast.success('Updated!');
        window.location.reload();
      } else {
        toast.error('Failed to update.');
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const FlagToggle = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors ${
        active ? 'bg-brand-gold text-brand-green' : 'bg-gray-100 text-brand-foreground/50 hover:bg-brand-green-light hover:text-brand-green'
      }`}>
      {active ? '✓ ' : ''}{label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-transparent">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-foreground/40">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-white border border-brand-green-border/10 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 border border-brand-green-border/10 w-full md:w-auto overflow-x-auto shadow-sm flex-shrink-0">
          {([
            { key: 'manufacturers', label: 'Manufacturers', icon: Building2 },
            { key: 'products', label: 'Products', icon: Package },
            { key: 'consultants', label: 'Consultants', icon: UserCircle },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                tab === key ? 'bg-brand-green text-white shadow' : 'text-brand-foreground/60 hover:text-brand-green'
              }`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Manufacturers */}
      {tab === 'manufacturers' && (
        <div className="space-y-3">
          {filteredManufacturers.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-green-light flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <p className="font-bold text-brand-green text-sm">{m.name}</p>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    m.listingTier === 'featured' ? 'bg-brand-gold/20 text-brand-gold-dark' :
                    m.listingTier === 'premium' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>{m.listingTier}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <FlagToggle label="Featured" active={m.isFeatured} onClick={() => toggleFlag('manufacturer', m.id, 'isFeatured', m.isFeatured)} />
                <FlagToggle label="Premium" active={!!m.isPremium} onClick={() => toggleFlag('manufacturer', m.id, 'isPremium', !!m.isPremium)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-green-light flex items-center justify-center">
                  <Package className="h-5 w-5 text-brand-green" />
                </div>
                <p className="font-bold text-brand-green text-sm">{p.name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FlagToggle label="Featured" active={p.isFeatured} onClick={() => toggleFlag('product', p.id, 'isFeatured', p.isFeatured)} />
                <FlagToggle label="Sponsored" active={!!p.isSponsored} onClick={() => toggleFlag('product', p.id, 'isSponsored', !!p.isSponsored)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultants */}
      {tab === 'consultants' && (
        <div className="space-y-3">
          {filteredConsultants.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-green-light flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-brand-green" />
                </div>
                <p className="font-bold text-brand-green text-sm">{c.name}</p>
              </div>
              <FlagToggle label="Featured" active={c.isFeatured} onClick={() => toggleFlag('consultant', c.id, 'isFeatured', c.isFeatured)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
