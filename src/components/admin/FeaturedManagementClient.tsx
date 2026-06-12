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
      {/* Action Filters Panel */}
      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Search Box */}
          <div className="relative w-full flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-foreground/40">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto flex-shrink-0">
            {([
              { key: 'manufacturers', label: 'Manufacturers', icon: Building2 },
              { key: 'products', label: 'Products', icon: Package },
              { key: 'consultants', label: 'Consultants', icon: UserCircle },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border border-brand-green-border/10 ${
                  tab === key ? 'bg-brand-green text-white shadow-md border-transparent' : 'bg-brand-gold-light/40 text-brand-foreground/60 hover:text-brand-green hover:bg-brand-gold-light'
                }`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-brand-green-border/10 mt-4">
          <table className="min-w-full divide-y divide-brand-green-border/10 bg-white">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">
                  {tab === 'manufacturers' ? 'Manufacturer Info' : tab === 'products' ? 'Product Name' : 'Consultant Name'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Status / Tier</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {tab === 'manufacturers' && (
                filteredManufacturers.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-brand-foreground/50">No manufacturers found.</td></tr>
                ) : filteredManufacturers.map((m) => (
                  <tr key={m.id} className="hover:bg-brand-gold-light/10 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-brand-green" />
                        </div>
                        <div className="font-bold text-brand-green text-sm">{m.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        m.listingTier === 'featured' ? 'bg-brand-gold/20 text-brand-gold-dark' :
                        m.listingTier === 'premium' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{m.listingTier || 'Standard'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-2">
                      <FlagToggle label="Featured" active={m.isFeatured} onClick={() => toggleFlag('manufacturer', m.id, 'isFeatured', m.isFeatured)} />
                      <FlagToggle label="Premium" active={!!m.isPremium} onClick={() => toggleFlag('manufacturer', m.id, 'isPremium', !!m.isPremium)} />
                    </td>
                  </tr>
                ))
              )}

              {tab === 'products' && (
                filteredProducts.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-brand-foreground/50">No products found.</td></tr>
                ) : filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-gold-light/10 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-brand-green" />
                        </div>
                        <div className="font-bold text-brand-green text-sm">{p.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-brand-foreground/50">
                      Product
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-2">
                      <FlagToggle label="Featured" active={p.isFeatured} onClick={() => toggleFlag('product', p.id, 'isFeatured', p.isFeatured)} />
                      <FlagToggle label="Sponsored" active={!!p.isSponsored} onClick={() => toggleFlag('product', p.id, 'isSponsored', !!p.isSponsored)} />
                    </td>
                  </tr>
                ))
              )}

              {tab === 'consultants' && (
                filteredConsultants.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-brand-foreground/50">No consultants found.</td></tr>
                ) : filteredConsultants.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-gold-light/10 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-5 w-5 text-brand-green" />
                        </div>
                        <div className="font-bold text-brand-green text-sm">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-brand-foreground/50">
                      Consultant
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-2">
                      <FlagToggle label="Featured" active={c.isFeatured} onClick={() => toggleFlag('consultant', c.id, 'isFeatured', c.isFeatured)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
