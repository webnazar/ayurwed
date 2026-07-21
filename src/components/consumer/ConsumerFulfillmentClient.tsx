'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Truck, Award, CheckCircle, Package, Info, Search, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import SafeImage from '@/components/ui/SafeImage';

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
    hasClinicPickup?: boolean;
    hasSelfDispatch?: boolean;
    hasAyurwedDelivery?: boolean;
    user?: {
      name: string;
      avatar: string | null;
    };
  };
}

export default function ConsumerFulfillmentClient({ initialFulfillments }: { initialFulfillments: FulfillmentOrder[] }) {
  const [fulfillments, setFulfillments] = useState<FulfillmentOrder[]>(initialFulfillments);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Track patient chosen fulfillment method for each pending order
  const [selectedMethods, setSelectedMethods] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    initialFulfillments.forEach(f => {
      if (f.status === 'PENDING') {
        if (f.consultant.hasSelfDispatch) {
          initial[f.id] = 'SELF_DISPATCH';
        } else if (f.consultant.hasClinicPickup) {
          initial[f.id] = 'CLINIC_PICKUP';
        } else if (f.consultant.hasAyurwedDelivery) {
          initial[f.id] = 'AYURWED_DELIVERY';
        } else {
          initial[f.id] = 'SELF_DISPATCH';
        }
      }
    });
    return initial;
  });

  const handleConfirmOrder = async (fulfillmentId: number) => {
    const selectedMethod = selectedMethods[fulfillmentId] || 'SELF_DISPATCH';
    toast.loading('Confirming product order...', { id: 'order' });
    try {
      const res = await fetch('/api/consumer/fulfillment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentId, method: selectedMethod })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      toast.dismiss('order');
      toast.success('Product order placed successfully!');

      setFulfillments(prev =>
        prev.map(f => (f.id === fulfillmentId ? { ...f, status: 'CONFIRMED', method: selectedMethod } : f))
      );
    } catch (err: any) {
      toast.dismiss('order');
      toast.error(err.message || 'Something went wrong');
    }
  };

  const filteredOrders = fulfillments.filter(f => {
    const matchesSearch = f.consultant?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(f.prescriptionId).includes(searchQuery);
    if (!matchesSearch) return false;

    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return !['COMPLETED', 'CANCELLED'].includes(f.status);
    if (filter === 'COMPLETED') return f.status === 'COMPLETED';
    if (filter === 'CANCELLED') return f.status === 'CANCELLED';
    return true;
  });

  const isShippingMethod = (method: string) => {
    return ['COURIER', 'SELF_DISPATCH', 'AYURWED_DELIVERY'].includes(method);
  };

  const getMethodDetails = (method: string) => {
    switch (method) {
      case 'CLINIC_PICKUP':
      case 'PICKUP':
        return {
          label: 'Clinic Pickup',
          icon: <MapPin className="h-3 w-3" />,
          badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200'
        };
      case 'SELF_DISPATCH':
      case 'COURIER':
        return {
          label: 'Doctor Self-Dispatch',
          icon: <Truck className="h-3 w-3" />,
          badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200'
        };
      case 'AYURWED_DELIVERY':
        return {
          label: 'Doctor Logistics Delivery',
          icon: <Truck className="h-3 w-3 text-brand-gold-dark" />,
          badgeClass: 'bg-brand-gold/25 text-brand-gold-dark border border-brand-gold/30'
        };
      case 'PENDING':
      default:
        return {
          label: 'Fulfillment Pending Selection',
          icon: <Info className="h-3 w-3" />,
          badgeClass: 'bg-gray-100 text-gray-800 border border-gray-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls panel */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
          <input
            type="text"
            placeholder="Search by doctor or prescription ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-brand-gold-light/40 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Orders', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' }
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === btn.value
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-brand-gold-light/40 hover:bg-brand-gold-light/80 text-brand-green'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card rounded-3xl p-16 text-center border border-border shadow-sm space-y-4">
          <Package className="h-12 w-12 text-brand-gold mx-auto animate-pulse-slow" />
          <h3 className="text-xl font-bold text-brand-green">No Product Orders</h3>
          <p className="text-sm text-brand-foreground/60 max-w-sm mx-auto">
            You don't have any product orders matching your current filter. Prescriptions finalized by certified practitioners will show up here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const methodDetails = getMethodDetails(order.method);
            const isShipping = isShippingMethod(order.method);

            return (
              <div key={order.id} className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-green-light/20 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-brand-green-light border border-brand-green/20 flex-shrink-0">
                      <SafeImage 
                        src={order.consultant?.user?.avatar} 
                        fallbackSrc="/avatar.webp"
                        alt={order.consultant?.user?.name || 'Doctor'} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-brand-green">{order.consultant?.user?.name || 'Doctor'}</h3>
                      <p className="text-xs text-brand-foreground/60">
                        Prescription #{order.prescriptionId} • {format(new Date(order.createdAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${methodDetails.badgeClass}`}>
                      {methodDetails.icon}
                      <span>{methodDetails.label}</span>
                    </span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-brand-gold/20 text-brand-gold-dark'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                {order.status !== 'CANCELLED' && order.status !== 'PENDING' && (
                  <div className="relative py-4 border-b border-brand-green-light/20 pb-6">
                    {isShipping ? (
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border z-0" />
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green transition-all duration-500 z-0"
                          style={{
                            width: 
                              order.status === 'CONFIRMED' ? '0%' :
                              order.status === 'PACKED' ? '33%' :
                              order.status === 'DISPATCHED' ? '66%' : '100%'
                          }}
                        />

                        {[
                          { label: 'Confirmed', status: 'CONFIRMED' },
                          { label: 'Packed', status: 'PACKED' },
                          { label: 'Dispatched', status: 'DISPATCHED' },
                          { label: 'Received', status: 'COMPLETED' }
                        ].map((step, idx) => {
                          const statuses = ['CONFIRMED', 'PACKED', 'DISPATCHED', 'COMPLETED'];
                          const currentIdx = statuses.indexOf(order.status);
                          const stepIdx = statuses.indexOf(step.status);
                          const isCompleted = stepIdx < currentIdx;
                          const isActive = stepIdx === currentIdx;

                          return (
                            <div key={step.label} className="flex flex-col items-center z-10 relative">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-brand-green border-brand-green text-white'
                                  : isActive
                                  ? 'bg-brand-gold border-brand-gold text-brand-green font-black animate-pulse-slow'
                                  : 'bg-white border-border text-brand-foreground/45'
                              }`}>
                                {isCompleted ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[9px] font-bold mt-1.5 transition-colors ${
                                isActive ? 'text-brand-green font-black' : 'text-brand-foreground/60'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border z-0" />
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green transition-all duration-500 z-0"
                          style={{
                            width: 
                              order.status === 'CONFIRMED' ? '0%' :
                              order.status === 'PACKED' ? '50%' : '100%'
                          }}
                        />

                        {[
                          { label: 'Preparing', status: 'CONFIRMED' },
                          { label: 'Ready for Pickup', status: 'PACKED' },
                          { label: 'Collected', status: 'COMPLETED' }
                        ].map((step, idx) => {
                          const statuses = ['CONFIRMED', 'PACKED', 'COMPLETED'];
                          const currentIdx = statuses.indexOf(order.status);
                          const stepIdx = statuses.indexOf(step.status);
                          const isCompleted = stepIdx < currentIdx;
                          const isActive = stepIdx === currentIdx;

                          return (
                            <div key={step.label} className="flex flex-col items-center z-10 relative">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-brand-green border-brand-green text-white'
                                  : isActive
                                  ? 'bg-brand-gold border-brand-gold text-brand-green font-black animate-pulse-slow'
                                  : 'bg-white border-border text-brand-foreground/45'
                              }`}>
                                {isCompleted ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[9px] font-bold mt-1.5 transition-colors ${
                                isActive ? 'text-brand-green font-black' : 'text-brand-foreground/60'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Courier Tracking or Pickup Location details */}
                {order.status !== 'CANCELLED' && (
                  <div className="bg-brand-gold-light/20 border border-brand-gold/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-3 items-start w-full">
                      <Info className="h-5 w-5 text-brand-gold-dark mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-brand-foreground/80 space-y-1 w-full">
                        {order.status === 'PENDING' ? (
                          <div className="flex flex-col gap-4 w-full pt-2">
                            <p className="font-extrabold text-brand-green text-xs">Choose Fulfillment Method:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {order.consultant.hasClinicPickup && (
                                <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedMethods[order.id] === 'CLINIC_PICKUP'
                                    ? 'border-brand-gold bg-brand-gold-light/40 font-bold'
                                    : 'border-border hover:border-brand-green text-brand-foreground/75'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`fulfillment-method-${order.id}`}
                                    checked={selectedMethods[order.id] === 'CLINIC_PICKUP'}
                                    onChange={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'CLINIC_PICKUP' }))}
                                    className="text-brand-green focus:ring-brand-green cursor-pointer"
                                  />
                                  <div className="text-xs">
                                    <span className="block font-bold">Clinic Pickup</span>
                                  </div>
                                </label>
                              )}
                              {order.consultant.hasSelfDispatch && (
                                <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedMethods[order.id] === 'SELF_DISPATCH'
                                    ? 'border-brand-gold bg-brand-gold-light/40 font-bold'
                                    : 'border-border hover:border-brand-green text-brand-foreground/75'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`fulfillment-method-${order.id}`}
                                    checked={selectedMethods[order.id] === 'SELF_DISPATCH'}
                                    onChange={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'SELF_DISPATCH' }))}
                                    className="text-brand-green focus:ring-brand-green cursor-pointer"
                                  />
                                  <div className="text-xs">
                                    <span className="block font-bold">Self-Dispatch</span>
                                  </div>
                                </label>
                              )}
                              {order.consultant.hasAyurwedDelivery && (
                                <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedMethods[order.id] === 'AYURWED_DELIVERY'
                                    ? 'border-brand-gold bg-brand-gold-light/40 font-bold'
                                    : 'border-border hover:border-brand-green text-brand-foreground/75'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`fulfillment-method-${order.id}`}
                                    checked={selectedMethods[order.id] === 'AYURWED_DELIVERY'}
                                    onChange={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'AYURWED_DELIVERY' }))}
                                    className="text-brand-green focus:ring-brand-green cursor-pointer"
                                  />
                                  <div className="text-xs">
                                    <span className="block font-bold">Doctor Logistics Delivery</span>
                                  </div>
                                </label>
                              )}
                              {!order.consultant.hasClinicPickup && !order.consultant.hasSelfDispatch && !order.consultant.hasAyurwedDelivery && (
                                <div className="col-span-3 text-xs italic text-brand-foreground/50 bg-brand-gold-light/20 p-3 rounded-xl border border-brand-gold/25">
                                  No fulfillment configuration set by doctor. Defaulting to doctor dispatch.
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleConfirmOrder(order.id)}
                              className="bg-brand-gold hover:bg-brand-green hover:text-white text-brand-green font-bold text-xs px-6 py-2.5 rounded-xl transition-all border border-brand-gold/30 shadow-sm whitespace-nowrap self-start uppercase tracking-wider"
                            >
                              Confirm Order
                            </button>
                          </div>
                        ) : (
                          <>
                            {isShipping ? (
                              <>
                                <p className="font-bold text-brand-green">Courier Dispatch details</p>
                                <p>
                                  Your consultant will pack and dispatch your Ayurvedic products.
                                </p>
                                {order.trackingNumber && (
                                  <p className="pt-1.5">
                                    Tracking ID:{' '}
                                    <span className="font-mono font-bold text-brand-gold-dark bg-white px-2 py-0.5 rounded border border-brand-gold/30">
                                      {order.trackingNumber}
                                    </span>
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-brand-green">Clinic Pickup location</p>
                                <p>
                                  Please collect your product pack directly from the consultant's clinic once status is "Ready for Pickup".
                                </p>
                                <p className="italic text-[10px] text-brand-foreground/60">
                                  Clinic details: Check doctor profile details or contact clinic support.
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Medicine Items List */}
                <div className="space-y-3">
                  <span className="text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider block">Prescribed Products</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.prescription.items.map(item => (
                      <div key={item.id} className="bg-white rounded-2xl p-4 border border-border shadow-sm space-y-2 text-xs">
                        <p className="font-bold text-brand-green text-sm">{item.preparation?.name || item.product?.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-brand-foreground/70">
                          <p><span className="font-bold block text-[9px] text-brand-foreground/45 uppercase">Dosage</span>{item.dosage}</p>
                          <p><span className="font-bold block text-[9px] text-brand-foreground/45 uppercase">Frequency</span>{item.frequency}</p>
                          <p><span className="font-bold block text-[9px] text-brand-foreground/45 uppercase">Duration</span>{item.duration}</p>
                          {item.instructions && (
                            <p className="col-span-2"><span className="font-bold block text-[9px] text-brand-foreground/45 uppercase">Instructions</span>{item.instructions}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
