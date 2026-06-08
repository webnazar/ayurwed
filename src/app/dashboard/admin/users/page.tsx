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
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">User Account Management</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Manage system users, change workspace credentials, modify roles, and toggle activity bans.
        </p>
      </div>

      <UserListClient initialUsers={serializedUsers} />
    </div>
  );
}
