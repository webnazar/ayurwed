import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import CouponsClient from '@/components/admin/CouponsClient';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  let serializedCoupons: any[] = [];

  try {
    const rawRows: any[] = await db.$queryRawUnsafe(`SELECT * FROM shop_coupons ORDER BY createdAt DESC`);
    serializedCoupons = rawRows.map(c => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
      maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
      isPublished: Boolean(c.isPublished),
      usageCount: Number(c.usageCount || 0),
      createdAt: c.createdAt,
    }));
  } catch (e) {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS shop_coupons (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(191) NOT NULL UNIQUE,
          discountType VARCHAR(191) NOT NULL DEFAULT 'PERCENTAGE',
          discountValue DECIMAL(10, 2) NOT NULL,
          minOrderAmount DECIMAL(10, 2) NULL,
          maxDiscountAmount DECIMAL(10, 2) NULL,
          isPublished BOOLEAN NOT NULL DEFAULT TRUE,
          usageCount INT NOT NULL DEFAULT 0,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      const rawRows: any[] = await db.$queryRawUnsafe(`SELECT * FROM shop_coupons ORDER BY createdAt DESC`);
      serializedCoupons = rawRows.map(c => ({
        id: c.id,
        code: c.code,
        discountType: c.discountType,
        discountValue: Number(c.discountValue),
        minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
        maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
        isPublished: Boolean(c.isPublished),
        usageCount: Number(c.usageCount || 0),
        createdAt: c.createdAt,
      }));
    } catch (err) {
      console.error('Error fetching admin coupons:', err);
    }
  }

  return <CouponsClient initialCoupons={serializedCoupons} />;
}
