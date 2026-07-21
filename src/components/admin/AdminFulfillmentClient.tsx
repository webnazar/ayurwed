'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Truck, Award, CheckCircle, Package, Info, Search, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface FulfillmentOrder {
  id: number;
  prescriptionId: number;
  consultantId: number;
  patientId: number;
  method: string;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
  prescription: {
    consultantJudgment: string;
    dosageInstructions: string | null;
    items: Array<{
      id: number;
      preparation?: {
        name: string;
      } | null;
      product?: {
        name: string;
      } | null;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string | null;
    }>;
  };
  consultant: {
    specialization: string;
    user?: {
      name: string;
    };
  };
  patient: {
    name: string;
    email: string;
  };
}

export default function AdminFulfillmentClient({ initialFulfillments }: { initialFulfillments: FulfillmentOrder[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMethod, setFilterMethod] = useState('ALL');

  const filteredOrders = initialFulfillments.filter(order => {
    const matchesSearch = 
      order.consultant?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.prescriptionId).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterStatus !== 'ALL' && order.status !== filterStatus) return false;
    if (filterMethod !== 'ALL' && order.method !== filterMethod) return false;

    return true;
  });

  const getMethodDetails = (method: string) => {
    switch (method) {
      case 'CLINIC_PICKUP':
      case 'PICKUP':
        return {
          label: method === 'PICKUP' ? 'Clinic Pickup (Legacy)' : 'Clinic Pickup',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200'
        };
      case 'SELF_DISPATCH':
      case 'COURIER':
        return {
          label: method === 'COURIER' ? 'Courier (Legacy)' : 'Doctor Self-Dispatch',
          badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200'
        };
      case 'AYURWED_DELIVERY':
        return {
          label: 'Doctor Logistics Delivery',
          badgeClass: 'bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30'
        };
      default:
        return {
          label: method,
          badgeClass: 'bg-gray-50 text-gray-700 border border-gray-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
          <input
            type="text"
            placeholder="Search by doctor, patient, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none font-bold text-brand-green"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PACKED">PACKED</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none font-bold text-brand-green"
          >
            <option value="ALL">All Methods</option>
            <option value="CLINIC_PICKUP">Clinic Pickup</option>
            <option value="SELF_DISPATCH">Doctor Self-Dispatch</option>
            <option value="AYURWED_DELIVERY">Doctor Logistics Delivery</option>
            <option value="COURIER">Courier (Legacy)</option>
            <option value="PICKUP">Pickup (Legacy)</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card rounded-3xl p-16 text-center border border-border shadow-sm space-y-4">
          <Package className="h-12 w-12 text-brand-gold mx-auto animate-pulse-slow" />
          <h3 className="text-xl font-bold text-brand-green">No Fulfillments Found</h3>
          <p className="text-sm text-brand-foreground/60 max-w-sm mx-auto">
            There are no matching fulfillment orders in the ecosystem.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-card rounded-3xl border border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-gold-light/40 border-b border-border text-brand-green font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-4">Prescription ID</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Consultant</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Tracking Number</th>
                  <th className="p-4">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-green-light/25">
                {filteredOrders.map(order => {
                  const methodInfo = getMethodDetails(order.method);
                  return (
                    <tr key={order.id} className="hover:bg-brand-gold-light/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-green">#{order.prescriptionId}</td>
                      <td className="p-4">
                        <p className="font-bold text-brand-foreground">{order.patient.name}</p>
                        <p className="text-[10px] text-brand-foreground/60">{order.patient.email}</p>
                      </td>
                      <td className="p-4 font-semibold text-brand-foreground">{order.consultant?.user?.name || 'Doctor'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${methodInfo.badgeClass}`}>
                          {methodInfo.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-brand-gold/20 text-brand-gold-dark'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-brand-foreground/75">
                        {order.trackingNumber || '—'}
                      </td>
                      <td className="p-4 text-brand-foreground/60">
                        {format(new Date(order.createdAt), 'dd MMM yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
