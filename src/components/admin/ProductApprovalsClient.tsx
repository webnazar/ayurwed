'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag, Eye, EyeOff, Star, Sparkles, Calendar, Layers, Info, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchSelect from '@/components/ui/SearchSelect';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  ingredients: any; // JSON
  benefits: any; // JSON
  usage: string;
  mrp: string | null;
  isSponsored: boolean;
  images: any; // JSON
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
  manufacturer: { companyName: string };
  createdAt: string;
}

export default function ProductApprovalsClient({ initialProducts }: { initialProducts: ProductItem[] }) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: products.length,
      approved: products.filter(p => p.isActive).length,
      pending: products.filter(p => !p.isActive).length,
      featured: products.filter(p => p.isFeatured).length,
    };
  }, [products]);

  // Unique categories for filtering
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category.name));
    return Array.from(list);
  }, [products]);

  // Update product handler
  const handleUpdateProduct = async (productId: number, updates: { isActive?: boolean; isFeatured?: boolean }) => {
    setLoadingProductId(productId);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, ...updates }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
      toast.success('Product updated successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error updating product');
    } finally {
      setLoadingProductId(null);
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.manufacturer.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'APPROVED' && p.isActive) ||
        (statusFilter === 'PENDING' && !p.isActive) ||
        (statusFilter === 'FEATURED' && p.isFeatured);

      const matchesCategory = categoryFilter === 'ALL' || p.category.name === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, statusFilter, categoryFilter]);

  // Parse images JSON safely
  const getProductImage = (imagesVal: any) => {
    try {
      const arr = typeof imagesVal === 'string' ? JSON.parse(imagesVal) : imagesVal;
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
      return '/placeholder-product.png';
    } catch {
      return '/placeholder-product.png';
    }
  };

  // Parse ingredients/benefits safely
  const parseJsonArray = (val: any): string[] => {
    try {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      }
      return [];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-brand-green-light p-3 rounded-2xl text-brand-green">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Total Submissions</span>
            <span className="text-xl font-extrabold text-brand-green">{stats.total} products</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Approved & Active</span>
            <span className="text-xl font-extrabold text-brand-green">{stats.approved} products</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-2xl text-rose-500">
            <X className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Pending / Blocked</span>
            <span className="text-xl font-extrabold text-brand-green">{stats.pending} submissions</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-brand-gold/15 p-3 rounded-2xl text-brand-gold-dark">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Featured Highlights</span>
            <span className="text-xl font-extrabold text-brand-green">{stats.featured} verified</span>
          </div>
        </div>
      </div>

      {/* Action Filters Panel */}
      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-foreground/40">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search preparations by name, manufacturer, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-green" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">Approved & Published</option>
                <option value="PENDING">Pending Approval</option>
                <option value="FEATURED">Featured Only</option>
              </select>
            </div>

            <SearchSelect
              options={[
                { value: 'ALL', label: 'All Categories' },
                ...categories.map(c => ({ value: c, label: c })),
              ]}
              value={categoryFilter}
              onChange={v => setCategoryFilter(v || 'ALL')}
              placeholder="All Categories"
              icon={<Layers className="h-4 w-4" />}
              clearable={false}
              className="w-48"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-brand-green-border/10">
          <table className="min-w-full divide-y divide-brand-green-border/10 bg-white">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Manufacturer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-brand-green uppercase tracking-wider">Pricing / Stock</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Featured</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Publish Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-brand-foreground/50">
                    No products submitted yet or matching filter preferences.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-gold-light/10 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-brand-gold-light/40 rounded-xl flex items-center justify-center overflow-hidden border border-brand-gold/15 flex-shrink-0">
                          <img
                            src={getProductImage(product.images)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-brand-green">{product.name}</div>
                          <div className="text-xs text-brand-foreground/50">ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-foreground/80">
                      {product.manufacturer.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-brand-gold-light px-2.5 py-1 rounded-full text-xs font-bold text-brand-gold-dark">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-bold text-brand-green">{product.mrp ? `₹ ${Number(product.mrp).toFixed(2)}` : 'N/A'}</div>
                      <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">
                        {product.isSponsored ? 'Sponsored' : 'Organic'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleUpdateProduct(product.id, { isFeatured: !product.isFeatured })}
                        disabled={loadingProductId === product.id}
                        className={`p-1.5 rounded-full border transition-all ${
                          product.isFeatured
                            ? 'bg-amber-50 text-amber-500 border-amber-300 shadow-sm scale-110'
                            : 'bg-white text-gray-300 border-gray-200 hover:text-amber-400'
                        }`}
                      >
                        <Star className="h-4.5 w-4.5 fill-current" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleUpdateProduct(product.id, { isActive: !product.isActive })}
                        disabled={loadingProductId === product.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {product.isActive ? (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            <span>Active / Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-brand-green hover:text-brand-gold font-bold inline-flex items-center gap-1 border border-brand-green/30 hover:border-brand-gold px-2.5 py-1.5 rounded-xl transition-all"
                      >
                        <Info className="h-3.5 w-3.5" />
                        <span>Preparation</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Inspect Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-brand-green-border/10 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-250 flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-5 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/20">
                  <img src={getProductImage(selectedProduct.images)} alt={selectedProduct.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base leading-tight flex items-center gap-2 flex-wrap">
                    {selectedProduct.name}
                    {selectedProduct.isFeatured && <Sparkles className="h-4 w-4 text-brand-gold animate-bounce flex-shrink-0" />}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedProduct.category.name}</span>
                    <span className="text-[10px] text-brand-green-light">by {selectedProduct.manufacturer.companyName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full flex-shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* Row 1: Key metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-brand-gold-light/50 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Reference MRP</span>
                  <span className="text-base font-extrabold text-brand-green">{selectedProduct.mrp ? `₹${Number(selectedProduct.mrp).toFixed(2)}` : 'N/A'}</span>
                </div>
                <div className="bg-brand-gold-light/50 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Visibility</span>
                  <span className={`text-xs font-extrabold ${selectedProduct.isSponsored ? 'text-indigo-600' : 'text-brand-foreground/50'}`}>
                    {selectedProduct.isSponsored ? '✦ Sponsored' : 'Organic'}
                  </span>
                </div>
                <div className="bg-brand-gold-light/50 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Status</span>
                  <span className={`text-xs font-extrabold ${selectedProduct.isActive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {selectedProduct.isActive ? '● Live' : '● Suspended'}
                  </span>
                </div>
                <div className="bg-brand-gold-light/50 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Featured</span>
                  <span className={`text-xs font-extrabold ${selectedProduct.isFeatured ? 'text-amber-500' : 'text-brand-foreground/30'}`}>
                    {selectedProduct.isFeatured ? '★ Yes' : '☆ No'}
                  </span>
                </div>
              </div>

              {/* Row 2: Meta details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-brand-green-border/10 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] text-brand-foreground/45 font-bold uppercase tracking-wider block">Product Details</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-brand-foreground/50 font-semibold">ID</span>
                      <span className="font-bold text-brand-green"># {selectedProduct.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-foreground/50 font-semibold">Slug</span>
                      <code className="font-mono bg-brand-gold-light/50 text-brand-gold-dark px-1.5 py-0.5 rounded text-[10px]">{selectedProduct.slug}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-foreground/50 font-semibold">Category</span>
                      <span className="font-bold text-brand-foreground/80">{selectedProduct.category.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-foreground/50 font-semibold">Manufacturer</span>
                      <span className="font-bold text-brand-foreground/80 text-right max-w-[140px] truncate">{selectedProduct.manufacturer.companyName}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-brand-green-border/10 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] text-brand-foreground/45 font-bold uppercase tracking-wider block">Pricing & Inventory</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-brand-foreground/50 font-semibold">Reference MRP</span>
                      <span className="font-bold text-brand-green">{selectedProduct.mrp ? `₹ ${Number(selectedProduct.mrp).toFixed(2)}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-foreground/50 font-semibold">Sponsored</span>
                      <span className={`font-bold ${selectedProduct.isSponsored ? 'text-indigo-600' : 'text-brand-foreground/30'}`}>
                        {selectedProduct.isSponsored ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-foreground/50 font-semibold">Submitted</span>
                      <span className="font-bold text-brand-foreground/70">
                        {new Date(selectedProduct.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider mb-1.5">Product Description</span>
                <p className="text-xs text-brand-foreground/75 leading-relaxed bg-brand-gold-light/20 border border-brand-green-border/5 rounded-xl p-3 font-medium">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Ingredients + Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-3">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider mb-2">Ingredients</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parseJsonArray(selectedProduct.ingredients).length > 0
                      ? parseJsonArray(selectedProduct.ingredients).map((ing, idx) => (
                          <span key={idx} className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-md">{ing}</span>
                        ))
                      : <span className="text-[10px] text-brand-foreground/30">No ingredients listed</span>
                    }
                  </div>
                </div>
                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider mb-2">Key Benefits</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parseJsonArray(selectedProduct.benefits).length > 0
                      ? parseJsonArray(selectedProduct.benefits).map((b, idx) => (
                          <span key={idx} className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md">{b}</span>
                        ))
                      : <span className="text-[10px] text-brand-foreground/30">No benefits listed</span>
                    }
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div>
                <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider mb-1.5">Usage & Directions</span>
                <p className="text-xs text-brand-foreground/75 leading-relaxed bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 font-medium">
                  {selectedProduct.usage || 'No usage directions provided.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-brand-green-border/10 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    handleUpdateProduct(selectedProduct.id, { isActive: !selectedProduct.isActive });
                    setSelectedProduct(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
                  }}
                  className={`flex-1 text-center text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all ${
                    selectedProduct.isActive
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedProduct.isActive ? 'Suspend / Unpublish' : 'Approve & Publish'}
                </button>
                <button
                  onClick={() => {
                    handleUpdateProduct(selectedProduct.id, { isFeatured: !selectedProduct.isFeatured });
                    setSelectedProduct(prev => prev ? { ...prev, isFeatured: !prev.isFeatured } : null);
                  }}
                  className={`flex-1 text-center text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all ${
                    selectedProduct.isFeatured
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-brand-gold-light text-brand-gold-dark hover:bg-brand-gold/25'
                  }`}
                >
                  {selectedProduct.isFeatured ? 'Remove from Featured' : '★ Feature Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
