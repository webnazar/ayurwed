import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import UserListClient from '@/components/admin/UserListClient';

export const revalidate = 0; // Dynamic rendering to always fetch latest users

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch all users in descending order of registration date
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items: true
        }
      }
    }
  });

  // Convert Date objects to ISO strings for client props
  const serializedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    orders: user.orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.reduce((acc, item) => acc + item.quantity, 0)
    }))
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">User Account Management</h1>
        <p className="dashboard-header-subtitle">
          Manage system users, change workspace credentials, modify roles, and toggle activity bans.
        </p>
      </div>

      <UserListClient initialUsers={serializedUsers} />
    </div>
  );
}
