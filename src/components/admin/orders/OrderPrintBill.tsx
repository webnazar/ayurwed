import React from 'react';

interface OrderPrintBillProps {
  order: any;
}

export default function OrderPrintBill({ order }: OrderPrintBillProps) {
  if (!order) return null;

  return (
    <div className="hidden print:block absolute inset-0 bg-card text-foreground p-8 z-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <img src="/icon.webp" alt="Ayurwed Logo" className="h-16 w-16" />
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-wider">AYURWED</h1>
              <p className="text-sm text-muted-foreground">The Authentic Ayurvedic Platform</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">TAX INVOICE</h2>
            <p className="text-sm text-muted-foreground font-medium">Order #: {order.orderNumber}</p>
            <p className="text-sm text-muted-foreground font-medium">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground font-medium">Status: {order.paymentStatus}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b pb-1">Billed To</h3>
            <p className="font-bold text-gray-800">{order.user?.name}</p>
            <p className="text-sm text-muted-foreground">{order.user?.email}</p>
            <p className="text-sm text-muted-foreground">{order.user?.phone || 'N/A'}</p>
            {order.billingAddress && (
              <p className="text-sm text-muted-foreground mt-2">
                {order.billingAddress.street}<br />
                {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.pincode}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b pb-1">Shipped To</h3>
            {order.shippingAddress ? (
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Same as billing address</p>
            )}
            <div className="mt-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 border-b pb-1">Payment Method</h3>
               <p className="text-sm text-gray-800 font-semibold">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b-2 border-gray-800">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-700">#</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-700">Item Description</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-700 text-center">Qty</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Unit Price</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="py-4 px-4 text-sm text-gray-800">{idx + 1}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-foreground">{item.product?.name || item.preparation?.name || 'Product'}</td>
                  <td className="py-4 px-4 text-sm text-gray-800 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-sm text-gray-800 text-right">₹{Number(item.price).toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm font-bold text-foreground text-right">₹{Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-6 border-t-2 border-gray-800">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-foreground border-t pt-2">
              <span>Total</span>
              <span>₹{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Thank you for choosing Ayurwed.</p>
          <p className="text-xs text-muted-foreground">If you have any questions about this invoice, please contact support@ayurwed.com.</p>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
