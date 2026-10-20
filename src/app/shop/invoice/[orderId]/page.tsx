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

  let safeOrder: any = null;

  try {
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

    if (order) {
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

      safeOrder = {
        ...order,
        discount: (order as any).discount ? Number((order as any).discount) : 0,
        couponCode: (order as any).couponCode || null,
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
    }
  } catch (err) {
    try {
      const rawOrders: any[] = await db.$queryRawUnsafe(`
        SELECT o.*, u.name as userName, u.email as userEmail, u.phone as userPhone
        FROM shop_orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE o.id = ${id}
        LIMIT 1
      `);

      if (rawOrders && rawOrders.length > 0) {
        const o = rawOrders[0];
        const userRole = (session.user as any).role;
        const userId = parseInt(session.user.id as string);
        const isAllowed = userRole === 'ADMIN' || o.userId === userId;

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

        const rawItems: any[] = await db.$queryRawUnsafe(`
          SELECT i.*, p.name as productName, p.sku as productSku, p.unit as productUnit, p.images as productImages, p.category as productCategory
          FROM shop_order_items i
          LEFT JOIN products p ON i.productId = p.id
          WHERE i.orderId = ${o.id}
        `);

        safeOrder = {
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.userId,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          subtotal: Number(o.subtotal),
          discount: o.discount ? Number(o.discount) : 0,
          couponCode: o.couponCode || null,
          shipping: Number(o.shipping),
          total: Number(o.total),
          notes: o.notes || null,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          shippingAddress: (() => { try { return o.shippingAddress ? JSON.parse(o.shippingAddress) : null; } catch { return null; } })(),
          user: { name: o.userName, email: o.userEmail, phone: o.userPhone },
          items: rawItems.map((i: any) => ({
            id: i.id,
            orderId: i.orderId,
            productId: i.productId,
            quantity: Number(i.quantity),
            price: Number(i.price),
            total: Number(i.price * i.quantity),
            product: {
              name: i.productName,
              sku: i.productSku,
              unit: i.productUnit,
              category: i.productCategory,
              images: (() => { try { return JSON.parse(i.productImages || '[]'); } catch { return []; } })(),
            },
          })),
        };
      }
    } catch (e) {
      console.error('Error fetching invoice order:', e);
    }
  }

  if (!safeOrder) return notFound();

  return <InvoicePrintClient order={safeOrder} />;
}
