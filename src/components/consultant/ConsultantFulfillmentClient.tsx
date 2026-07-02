'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Truck, Award, CheckCircle, Package, Info, Search, ShieldCheck, Edit, Save, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
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
      preparation: {
        name: string;
      };
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string | null;
    }>;
  };
  patient: {
    name: string;
    email: string;
  };
}

export default function ConsultantFulfillmentClient({ initialFulfillments }: { initialFulfillments: FulfillmentOrder[] }) {
  const [fulfillments, setFulfillments] = useState<FulfillmentOrder[]>(initialFulfillments);
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});

  const handleUpdateStatus = async (fulfillmentId: number, status: string, trackingNumber?: string) => {
    toast.loading('Updating fulfillment status...', { id: 'status-update' });
    try {
      const res = await fetch('/api/consultant/fulfillment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillmentId,
          status,
          trackingNumber
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      toast.dismiss('status-update');
      toast.success(`Fulfillment status updated to ${status}`);

      setFulfillments(prev =>
        prev.map(f => (f.id === fulfillmentId ? { ...f, status, trackingNumber: trackingNumber || f.trackingNumber } : f))
      );
    } catch (err: any) {
      toast.dismiss('status-update');
      toast.error(err.message || 'Something went wrong');
    }
  };

  const filteredOrders = fulfillments.filter(f => f.status === activeTab);

  const getTabBadgeCount = (status: string) => {
    return fulfillments.filter(f => f.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="bg-card rounded-3xl p-3 border border-border shadow-sm overflow-x-auto flex gap-2 scrollbar-none">
        {[
          { label: 'Pending Action', value: 'PENDING' },
          { label: 'Confirmed', value: 'CONFIRMED' },
          { label: 'Packed / Ready', value: 'PACKED' },
          { label: 'Dispatched', value: 'DISPATCHED' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Cancelled', value: 'CANCELLED' }
        ].map(tab => {
          const count = getTabBadgeCount(tab.value);
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-brand-gold-light/40 hover:bg-brand-gold-light/80 text-brand-green'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  activeTab === tab.value
                    ? 'bg-brand-gold text-brand-green'
                    : 'bg-brand-green text-white'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card rounded-3xl p-16 text-center border border-border shadow-sm space-y-4">
          <Package className="h-12 w-12 text-brand-gold mx-auto animate-pulse-slow" />
          <h3 className="text-xl font-bold text-brand-green">No Orders In This Stage</h3>
          <p className="text-sm text-brand-foreground/60 max-w-sm mx-auto">
            All orders in the "{activeTab}" status category are listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-green-light/20 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-brand-green">Patient: {order.patient.name}</h3>
                  <p className="text-xs text-brand-foreground/60">
                    Prescription #{order.prescriptionId} • Ordered on {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    order.method === 'COURIER'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.method === 'COURIER' ? <Truck className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {order.method === 'COURIER' ? 'Courier Delivery' : 'Clinic Pickup'}
                  </span>
                </div>
              </div>

              {/* Medicine Items List */}
              <div className="space-y-3">
                <span className="text-[10px] text-brand-foreground/50 uppercase font-bold tracking-wider block">Prescribed Medicines</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.prescription.items.map(item => (
                    <div key={item.id} className="bg-brand-gold-light/10 rounded-2xl p-4 border border-border text-xs space-y-2">
                      <p className="font-bold text-brand-green text-sm">{item.preparation.name}</p>
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

              {/* Actions Box */}
              <div className="bg-brand-gold-light/20 border border-brand-gold/20 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-brand-gold-dark flex-shrink-0" />
                  <span className="text-xs font-bold text-brand-green">Fulfillment Action Dashboard</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                  <div className="text-xs text-brand-foreground/70">
                    {order.status === 'PENDING' && (
                      <p>Waiting for the patient to verify and confirm their medicine order from their dashboard.</p>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <p>Order is confirmed. Please pack the medicines and mark as packed once completed.</p>
                    )}
                    {order.status === 'PACKED' && order.method === 'COURIER' && (
                      <p>Medicines are packed and ready to ship. Please dispatch via courier and enter the tracking details.</p>
                    )}
                    {order.status === 'PACKED' && order.method === 'PICKUP' && (
                      <p>Medicines are packed and ready. Waiting for the patient to collect them from your clinic.</p>
                    )}
                    {order.status === 'DISPATCHED' && (
                      <p>Medicines are in transit. Mark as completed once patient confirms receipt.</p>
                    )}
                    {order.status === 'COMPLETED' && (
                      <p className="text-emerald-700 font-bold">✓ This fulfillment order has been completed successfully.</p>
                    )}
                    {order.status === 'CANCELLED' && (
                      <p className="text-rose-700 font-bold">This fulfillment order has been cancelled.</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                        className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>Mark as Packed</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {order.status === 'PACKED' && order.method === 'COURIER' && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
                        <input
                          type="text"
                          placeholder="Enter Courier & Tracking ID..."
                          value={trackingInputs[order.id] || ''}
                          onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                          className="bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none w-full sm:w-56"
                        />
                        <button
                          onClick={() => {
                            if (!trackingInputs[order.id]) {
                              toast.error('Please enter a tracking ID');
                              return;
                            }
                            handleUpdateStatus(order.id, 'DISPATCHED', trackingInputs[order.id]);
                          }}
                          className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap"
                        >
                          Ship Order
                        </button>
                      </div>
                    )}

                    {order.status === 'PACKED' && order.method === 'PICKUP' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>Confirm Collection</span>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {order.status === 'DISPATCHED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>Confirm Delivery</span>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {['PENDING', 'CONFIRMED', 'PACKED'].includes(order.status) && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-rose-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
