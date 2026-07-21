import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import MyOrdersClient from '@/components/consumer/MyOrdersClient';

export const revalidate = 0;

export default async function ConsumerFulfillmentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = Number((session.user as any).id);

  const rawOrders = await db.shopOrder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const orders = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    shippingAddress: (() => {
      try {
        return o.shippingAddress ? JSON.parse(o.shippingAddress) : null;
      } catch {
        return null;
      }
    })(),
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      price: Number(i.price),
      product: {
        id: i.product.id,
        name: i.product.name,
        slug: i.product.slug,
        images: (() => {
          try {
            return JSON.parse(i.product.images || '[]');
          } catch {
            return [];
          }
        })(),
      },
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">My Product Orders</h1>
        <p className="dashboard-header-subtitle">Track and manage your eCommerce orders placed through the Ayurwed shop.</p>
      </div>
      <MyOrdersClient initialOrders={orders as any} />
    </div>
  );
}
