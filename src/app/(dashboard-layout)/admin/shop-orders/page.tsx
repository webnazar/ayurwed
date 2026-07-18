import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ShopOrdersListClient from '@/components/admin/ShopOrdersListClient';

export const revalidate = 0;

export default async function AdminShopOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const orders = await db.shopOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, images: true, unit: true } },
        },
      },
    },
  });

  const safeOrders = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    total: Number(o.total),
    shippingAddress: (() => { try { return o.shippingAddress ? JSON.parse(o.shippingAddress) : null; } catch { return null; } })(),
    items: o.items.map((i) => ({
      ...i,
      price: Number(i.price),
      total: Number(i.total),
      product: {
        ...i.product,
        images: (() => { try { return JSON.parse(i.product.images || '[]'); } catch { return []; } })(),
      },
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Shop Orders</h1>
        <p className="dashboard-header-subtitle">
          View, manage, and process customer shop orders. Update statuses and print invoices.
        </p>
      </div>
      <ShopOrdersListClient initialOrders={safeOrders} />
    </div>
  );
}
