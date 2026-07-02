import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import OrderListClient from '@/components/admin/orders/OrderListClient';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          preparation: { select: { name: true, images: true } }
        }
      }
    }
  });

  // Convert Decimals to strings for the client component
  const safeOrders = orders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price),
      total: Number(item.total),
    }))
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Orders Management</h1>
        <p className="dashboard-header-subtitle">
          View, manage, and process customer orders across the platform.
        </p>
      </div>
      
      <OrderListClient initialOrders={safeOrders} />
    </div>
  );
}
