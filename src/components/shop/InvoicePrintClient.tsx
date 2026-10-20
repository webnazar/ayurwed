'use client';

import React, { useState } from 'react';
import { Printer, Download } from 'lucide-react';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export default function InvoicePrintClient({ order }: { order: any }) {
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>('A4');

  const handlePrint = () => window.print();

  const addr = order.shippingAddress;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <div className="invoice-print-container min-h-screen bg-slate-100 print:bg-white text-slate-900 flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body, main, #__next, .invoice-print-container, .invoice-sheet {
            background-color: white !important;
            background: white !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          div, section, header, footer, table {
            background-color: transparent !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
          .invoice-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 24px 32px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: ${paperSize};
            margin: 0;
          }
        }
      `}} />

      {/* Print Action Header */}
      <div className="no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/ayurwed-logo-2.webp" alt="AYURWED" className="h-8 object-contain" />
          <div>
            <span className="text-sm font-bold text-slate-800">Invoice #{order.orderNumber}</span>
            <span className="text-xs text-slate-500 ml-2">{invoiceDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Paper Size Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {(['A4', 'A5'] as const).map(size => (
              <button key={size} onClick={() => setPaperSize(size)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${paperSize === size ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                {size}
              </button>
            ))}
          </div>
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-[#045829] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#034520] transition-colors shadow-xs">
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-xs">
            <Download className="h-4 w-4" /> Save as PDF
          </button>
        </div>
      </div>

      {/* Invoice Sheet */}
      <div className="flex-1 py-6 px-2 print:p-0 flex justify-center">
        <div className={`invoice-sheet bg-white border border-slate-200 print:border-none shadow-md print:shadow-none rounded-3xl print:rounded-none flex flex-col relative overflow-hidden ${
          paperSize === 'A4'
            ? 'w-full max-w-[800px] min-h-[1123px] p-8 print:p-0'
            : 'w-full max-w-[559px] min-h-[793px] p-6 print:p-0'
        }`}>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none z-0">
            <img 
              src="/ayurwed.webp" 
              alt="Watermark" 
              className="w-[300px] h-[300px] object-contain" 
              style={{ filter: 'grayscale(100%) contrast(1.2) brightness(0.8)' }}
            />
          </div>

          {/* Content */}
          <div className="space-y-5 relative z-10 flex-1">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-[#045829]/20 pb-4">
              <div className="flex flex-col items-start space-y-1">
                <img src="/ayurwed-logo-2.webp" alt="Ayurwed Logo" className="h-10 object-contain" />
                <p className="text-[8px] text-[#045829] font-bold uppercase tracking-[0.25em]">Ancient Intelligence</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-extrabold text-[#045829] tracking-widest uppercase">Invoice</h2>
                <p className="text-xs text-slate-500 mt-1">Invoice #: <span className="font-bold text-slate-900">{order.orderNumber}</span></p>
                <p className="text-xs text-slate-500">Date: <span className="font-bold text-slate-900">{invoiceDate}</span></p>
                <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1 ${
                  order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                  'bg-[#045829]/10 text-[#045829] border border-[#045829]/30'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Billing & Shipping */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#045829]/5 p-3.5 rounded-2xl border border-[#045829]/10 space-y-0.5">
                <h3 className="text-[9px] font-bold uppercase text-[#045829] tracking-wider mb-2">Bill To / Ship To</h3>
                <p className="text-xs font-bold text-slate-900">{addr?.name || order.user.name}</p>
                {addr?.phone && <p className="text-[10px] text-slate-600">{addr.phone}</p>}
                {addr?.address && <p className="text-[10px] text-slate-600 leading-relaxed">{addr.address}</p>}
                {(addr?.city || addr?.state) && (
                  <p className="text-[10px] text-slate-600">{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                )}
              </div>
              <div className="space-y-0.5 text-right p-3.5">
                <h3 className="text-[9px] font-bold uppercase text-[#045829] tracking-wider mb-2">From</h3>
                <p className="text-xs font-bold text-[#045829]">Ayurwed Wellness Circle</p>
                <p className="text-[10px] text-slate-600">www.ayurwed.com</p>
                <p className="text-[10px] text-slate-600">support@ayurwed.com</p>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                  <p>Payment: <span className="font-bold text-slate-900">{order.paymentMethod}</span></p>
                  <p>Payment Status: <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>{order.paymentStatus}</span></p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#045829]/5 border-b border-slate-200">
                    <th className="py-2 px-3 font-bold text-[#045829] uppercase tracking-wider w-[35%]">Product</th>
                    <th className="py-2 px-3 font-bold text-[#045829] uppercase tracking-wider">SKU</th>
                    <th className="py-2 px-3 font-bold text-[#045829] uppercase tracking-wider text-center">Qty</th>
                    <th className="py-2 px-3 font-bold text-[#045829] uppercase tracking-wider text-right">Unit Price</th>
                    <th className="py-2 px-3 font-bold text-[#045829] uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-bold text-[#045829]">
                        {item.product.name}
                        {item.product.unit && <span className="text-slate-500 font-normal"> ({item.product.unit})</span>}
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono">{item.product.sku || '—'}</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">{item.quantity}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900">{formatPrice(item.price)}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#045829]">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${order.shipping === 0 ? 'text-emerald-700' : ''}`}>
                    {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-[#045829] text-base border-t border-slate-200 pt-2">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="bg-[#045829]/5 rounded-xl p-2.5 text-center border border-[#045829]/10">
                  <p className="text-[10px] text-slate-600 font-medium">
                    {order.paymentStatus === 'PAID'
                      ? '✓ Payment Received'
                      : `Amount Due: ${formatPrice(order.total)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="border border-slate-200 rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Order Notes</p>
                <p className="text-xs text-slate-700 italic">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="space-y-3 mt-6 relative z-10">
            <div className="border-t border-slate-200 pt-4 flex justify-between items-end">
              <div className="text-[9px] text-slate-500">
                <p className="font-semibold text-[#045829]">Ayurwed Ancient Intelligence</p>
                <p>This is a computer-generated invoice. No signature required.</p>
                <p className="mt-1 text-slate-400">Email: <span className="font-medium text-[#045829]">support@ayurwed.com</span></p>
              </div>
              <div className="text-center w-40 space-y-2">
                <div className="border-b border-slate-300 h-8" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Authorised Signatory</p>
                  <p className="text-[10px] text-slate-500">Ayurwed Wellness Circle</p>
                </div>
              </div>
            </div>
            <div className="text-center border-t border-slate-100 pt-2">
              <p className="text-[10px] font-bold tracking-widest text-[#045829]">https://www.ayurwed.com</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Thank you for choosing Ayurwed — Ancient Intelligence for Modern Wellness</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
