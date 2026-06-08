import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ShieldAlert, Users, Layers, ShoppingBag, Calendar } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Fetch basic counts
  const usersCount = await db.user.count();
  const productsCount = await db.product.count();
  const enquiriesCount = await db.enquiry.count();
  const appointmentsCount = await db.appointment.count();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white border border-brand-green-border/20 shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold">System Administration</h1>
        <p className="text-sm text-brand-green-light mt-2">
          Global stats overview, formulation validations, doctor approvals, and content logs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-brand-green-light p-3 rounded-2xl text-brand-green">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Registered Users</span>
            <span className="text-xl font-extrabold text-brand-green">{usersCount} accounts</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-brand-gold/15 p-3 rounded-2xl text-brand-gold-dark">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Active Formulations</span>
            <span className="text-xl font-extrabold text-brand-green">{productsCount} products</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-700">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Total Enquiries</span>
            <span className="text-xl font-extrabold text-brand-green">{enquiriesCount} leads</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-2xl text-rose-700">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-foreground/50 block font-semibold">Consultations</span>
            <span className="text-xl font-extrabold text-brand-green">{appointmentsCount} sessions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
