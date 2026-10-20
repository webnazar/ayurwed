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

  let safeOrders: any[] = [];

  try {
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

    safeOrders = orders.map((o) => ({
      ...o,
      discount: (o as any).discount ? Number((o as any).discount) : 0,
      couponCode: (o as any).couponCode || null,
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
  } catch (err) {
    try {
      const rawOrders: any[] = await db.$queryRawUnsafe(`
        SELECT o.*, u.name as userName, u.email as userEmail, u.phone as userPhone
        FROM shop_orders o
        LEFT JOIN users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
      `);

      for (const o of rawOrders) {
        const rawItems: any[] = await db.$queryRawUnsafe(`
          SELECT i.*, p.name as productName, p.images as productImages, p.unit as productUnit
          FROM shop_order_items i
          LEFT JOIN products p ON i.productId = p.id
          WHERE i.orderId = ${o.id}
        `);

        safeOrders.push({
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
          createdAt: new Date(o.createdAt).toISOString(),
          updatedAt: new Date(o.updatedAt).toISOString(),
          shippingAddress: (() => { try { return o.shippingAddress ? JSON.parse(o.shippingAddress) : null; } catch { return null; } })(),
          user: { id: o.userId, name: o.userName, email: o.userEmail, phone: o.userPhone },
          items: rawItems.map((i: any) => ({
            id: i.id,
            orderId: i.orderId,
            productId: i.productId,
            quantity: Number(i.quantity),
            price: Number(i.price),
            total: Number(i.price * i.quantity),
            product: {
              id: i.productId,
              name: i.productName,
              unit: i.productUnit,
              images: (() => { try { return JSON.parse(i.productImages || '[]'); } catch { return []; } })(),
            },
          })),
        });
      }
    } catch (e) {
      console.error('Error fetching admin shop orders:', e);
    }
  }

  return <ShopOrdersListClient initialOrders={safeOrders} />;
}
