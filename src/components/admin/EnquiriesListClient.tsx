'use client';

import React, { useState, useMemo } from 'react';
import { Search, Eye, Trash2, Calendar, Building2, Package, User, X, CheckCircle2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface EnquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  manufacturer: { companyName: string; slug: string };
  product: { name: string; slug: string } | null;
}

export default function EnquiriesListClient({ initialEnquiries }: { initialEnquiries: EnquiryItem[] }) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, LAST_7, LAST_30
  
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Logic
  const filteredEnquiries = useMemo(() => {
    let filtered = enquiries;

    // Date Filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === 'LAST_7') cutoff.setDate(now.getDate() - 7);
      if (dateFilter === 'LAST_30') cutoff.setDate(now.getDate() - 30);

      filtered = filtered.filter(e => new Date(e.createdAt) >= cutoff);
    }

    // Search Filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.email.toLowerCase().includes(q) ||
        e.manufacturer.companyName.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [enquiries, searchTerm, dateFilter]);

  const handleOpenModal = async (enquiry: EnquiryItem) => {
    setSelectedEnquiry(enquiry);
    // Mark as read automatically
    if (!enquiry.isRead) {
      try {
        const res = await fetch('/api/admin/enquiries', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: enquiry.id, isRead: true })
        });
        if (res.ok) {
          setEnquiries(prev => prev.map(e => e.id === enquiry.id ? { ...e, isRead: true } : e));
          router.refresh();
        }
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/enquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEnquiries(prev => prev.filter(e => e.id !== id));
        setDeleteConfirmId(null);
        toast.success('Enquiry deleted successfully');
        router.refresh();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting enquiry');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
          <input
            type="text"
            placeholder="Search by User Name, Email, or Manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="h-4 w-4 text-brand-foreground/50" />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 outline-none w-full md:w-48 font-semibold"
          >
            <option value="ALL">All Time</option>
            <option value="LAST_7">Last 7 Days</option>
            <option value="LAST_30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-brand-foreground/40 font-medium">
                    No enquiries found.
                  </td>
                </tr>
              ) : filteredEnquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-brand-green" />
                      <span className="font-bold text-brand-green">{enq.name}</span>
                    </div>
                    <div className="text-xs text-brand-foreground/60">{enq.email}</div>
                    {enq.phone && <div className="text-xs text-brand-foreground/60 mt-0.5">{enq.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-brand-foreground/60">
                        <Building2 className="h-3.5 w-3.5 text-brand-green" />
                        <span className="font-semibold">{enq.manufacturer.companyName}</span>
                      </div>
                      {enq.product && (
                        <div className="flex items-center gap-1.5 text-xs text-brand-foreground/60">
                          <Package className="h-3.5 w-3.5 text-brand-green" />
                          <span>{enq.product.name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-brand-foreground/60">
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {enq.isRead ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Unread
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(enq)}
                        className="p-2 text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                        title="View Enquiry"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setDeleteConfirmId(enq.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl">Enquiry Details</h3>
                <p className="text-sm text-brand-green-light mt-0.5">
                  Sent on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 bg-card/10 hover:bg-card/20 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-2xl p-4 border border-border">
                  <h4 className="text-[10px] font-bold text-brand-foreground/50 uppercase tracking-wider mb-2">Sender Info</h4>
                  <p className="font-bold text-brand-green text-sm flex items-center gap-1.5"><User className="h-3.5 w-3.5"/> {selectedEnquiry.name}</p>
                  <div className="space-y-1.5 mt-3">
                    <p className="text-xs font-semibold text-brand-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-brand-foreground/50" /> {selectedEnquiry.email}
                    </p>
                    {selectedEnquiry.phone ? (
                      <p className="text-xs font-semibold text-brand-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-brand-foreground/50" /> {selectedEnquiry.phone}
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-brand-foreground/50 flex items-center gap-1.5 italic">
                        <Phone className="h-3 w-3 opacity-50" /> No mobile number provided
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-muted rounded-2xl p-4 border border-border">
                  <h4 className="text-[10px] font-bold text-brand-foreground/50 uppercase tracking-wider mb-2">Target Info</h4>
                  <p className="font-bold text-brand-foreground text-sm flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-brand-green"/> {selectedEnquiry.manufacturer.companyName}</p>
                  {selectedEnquiry.product && (
                    <p className="text-xs font-semibold text-brand-foreground/80 mt-1 flex items-center gap-1.5"><Package className="h-3 w-3 text-brand-green"/> {selectedEnquiry.product.name}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-brand-green mb-3">Message Content</h4>
                <div className="bg-brand-gold-light/20 p-5 rounded-2xl border border-border text-sm text-brand-foreground leading-relaxed">
                  {selectedEnquiry.message}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Delete Enquiry?</h3>
              <p className="text-sm text-brand-foreground/60">
                Are you sure you want to delete this enquiry? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-muted border-t border-border flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-card border border-border text-sm font-bold hover:bg-muted-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)} 
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
