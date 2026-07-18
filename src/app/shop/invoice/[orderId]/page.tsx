import React from 'react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import InvoicePrintClient from '@/components/shop/InvoicePrintClient';

export const revalidate = 0;

export async function generateMetadata(props: { params: Promise<{ orderId: string }> }): Promise<Metadata> {
  const { orderId } = await props.params;
  return { title: `AYURWED — Invoice #AW-${orderId}` };
}

export default async function InvoicePrintPage(props: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const id = parseInt(orderId);
  if (isNaN(id)) return notFound();

  const order = await db.shopOrder.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          product: {
            select: { name: true, sku: true, unit: true, images: true, category: true },
          },
        },
      },
    },
  });

  if (!order) return notFound();

  // Permission: ADMIN can see any order, consumer can see only their own
  const userRole = (session.user as any).role;
  const userId = parseInt(session.user.id as string);
  const isAllowed = userRole === 'ADMIN' || order.userId === userId;

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md text-center space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-sm text-slate-600">You do not have permission to view this invoice.</p>
        </div>
      </div>
    );
  }

  const safeOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    shippingAddress: (() => { try { return order.shippingAddress ? JSON.parse(order.shippingAddress) : null; } catch { return null; } })(),
    items: order.items.map((i) => ({
      ...i,
      price: Number(i.price),
      total: Number(i.total),
      product: {
        ...i.product,
        images: (() => { try { return JSON.parse(i.product.images || '[]'); } catch { return []; } })(),
      },
    })),
  };

  return <InvoicePrintClient order={safeOrder} />;
}
