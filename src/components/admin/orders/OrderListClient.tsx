'use client';

import React, { useState, useMemo } from 'react';
import { Search, Printer, Eye, Filter, Check, X, CreditCard, Truck, PackageOpen, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderPrintBill from './OrderPrintBill';

export default function OrderListClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [printOrder, setPrintOrder] = useState<any>(null);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((o: any) => o.status === statusFilter);
    }
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((o: any) => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.user?.name.toLowerCase().includes(q) ||
        o.user?.email.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  const updateStatus = async (id: number, status: string, paymentStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, paymentStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update order');
      const updated = await res.json();
      
      setOrders(orders.map((o: any) => o.id === id ? {
        ...updated,
        totalAmount: Number(updated.totalAmount),
        items: updated.items.map((i:any) => ({...i, price: Number(i.price), total: Number(i.total)}))
      } : o));
      
      if (selectedOrder?.id === id) {
        setSelectedOrder({
          ...updated,
          totalAmount: Number(updated.totalAmount),
          items: updated.items.map((i:any) => ({...i, price: Number(i.price), total: Number(i.total)}))
        });
      }

      toast.success('Order updated successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePrint = (order: any) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Print Overlay */}
      {printOrder && <OrderPrintBill order={printOrder} />}

      {/* Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-brand-foreground/50" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 outline-none w-full md:w-48"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-brand-green-border/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-green-border/10">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-brand-green uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-brand-foreground/40 font-medium">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-brand-gold-light/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-green">{order.orderNumber}</div>
                    <div className="text-xs text-brand-foreground/50 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.user?.name}</div>
                    <div className="text-xs text-brand-foreground/60">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value, order.paymentStatus)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-green/20 cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="PENDING" className="bg-white text-gray-900">PENDING</option>
                      <option value="PROCESSING" className="bg-white text-gray-900">PROCESSING</option>
                      <option value="SHIPPED" className="bg-white text-gray-900">SHIPPED</option>
                      <option value="DELIVERED" className="bg-white text-gray-900">DELIVERED</option>
                      <option value="CANCELLED" className="bg-white text-gray-900">CANCELLED</option>
                    </select>
                    <div className="text-[10px] font-semibold text-brand-foreground/50 uppercase mt-1">
                      {order.paymentStatus} ({order.paymentMethod})
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-brand-green">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                        className="p-2 rounded-xl text-brand-green hover:bg-brand-green-light transition-colors border border-brand-green/20"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrint(order)}
                        className="p-2 rounded-xl text-brand-gold-dark hover:bg-brand-gold-light transition-colors border border-brand-gold/50"
                        title="Print Bill"
                      >
                        <Printer className="h-4 w-4" />
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
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-xl">Order Details</h3>
                <p className="text-sm text-brand-green-light">{selectedOrder.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedOrder)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-grow">
              
              {/* Status Manager */}
              <div className="bg-brand-gold-light/20 p-5 rounded-2xl border border-brand-green-border/10">
                <h4 className="text-sm font-bold text-brand-green uppercase tracking-wider mb-4">Manage Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-brand-foreground/60 uppercase block mb-1">Order Status</label>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value, selectedOrder.paymentStatus)}
                      className="w-full bg-white border border-brand-green-border/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-foreground/60 uppercase block mb-1">Payment Status</label>
                    <select 
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => updateStatus(selectedOrder.id, selectedOrder.status, e.target.value)}
                      className="w-full bg-white border border-brand-green-border/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-bold text-brand-green uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PackageOpen className="h-4 w-4" /> Ordered Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Leaf className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.product?.name}</p>
                          <p className="text-xs text-gray-500 font-medium">₹{item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-bold text-brand-green">
                        ₹{item.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Shipping Address</h4>
                  {selectedOrder.shippingAddress ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
                      <p className="font-bold text-gray-900 mb-1">{selectedOrder.user?.name}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                      <p className="mt-2 text-xs font-semibold text-gray-500 flex items-center gap-1"><Truck className="h-3 w-3"/> Delivery Details</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No shipping details provided</p>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Payment Details</h4>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1"><CreditCard className="h-3 w-3"/> {selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-900">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="font-bold text-brand-green">Grand Total</span>
                      <span className="font-extrabold text-brand-green text-lg">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
