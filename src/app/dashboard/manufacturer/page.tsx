import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Layers, Award, CheckSquare, Inbox, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function ManufacturerDashboard() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  const profile = await db.manufacturerProfile.findUnique({
    where: { userId },
    include: {
      products: { select: { id: true, isActive: true } },
      enquiries: { select: { id: true, isRead: true } },
    },
  });

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-brand-green-border/10 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-brand-green">Profile Not Set Up</h2>
        <p className="text-brand-foreground/60 text-sm">Contact admin to set up your manufacturer profile.</p>
      </div>
    );
  }

  const activeProducts = profile.products.filter(p => p.isActive).length;
  const certifications = Array.isArray(profile.certifications) ? (profile.certifications as string[]) : [];
  const unreadEnquiries = profile.enquiries.filter(e => !e.isRead).length;
  const totalEnquiries = profile.enquiries.length;

  // Profile completeness
  const fields = [profile.companyName, profile.description, profile.website, profile.contactEmail, profile.contactPhone, profile.gstNumber];
  const filledFields = fields.filter(Boolean).length;
  const completeness = Math.round((filledFields / fields.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="dashboard-header-title">{profile.companyName}</h1>
            <p className="dashboard-header-subtitle">Your listing on India's Ayurveda Discovery Platform</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
              profile.listingTier === 'featured' ? 'bg-brand-gold text-brand-green' :
              profile.listingTier === 'premium' ? 'bg-white/20 text-white' :
              'bg-white/10 text-brand-green-light'
            }`}>
              {profile.listingTier} listing
            </span>
            {profile.isVerified && (
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
                AYUSH Verified
              </span>
            )}
          </div>
        </div>
        {/* Public profile link */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <Link href={`/manufacturers/${profile.slug}`} target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:text-white transition-colors font-semibold">
            <ExternalLink className="h-3.5 w-3.5" /> View Public Profile →
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Preparations', value: `${activeProducts}`, icon: Layers, color: 'text-brand-green', bg: 'bg-brand-green-light' },
          { label: 'Certifications', value: `${certifications.length} verified`, icon: Award, color: 'text-brand-gold-dark', bg: 'bg-brand-gold/15' },
          { label: 'Total Enquiries', value: `${totalEnquiries}`, icon: Inbox, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Unread Enquiries', value: `${unreadEnquiries}`, icon: CheckSquare, color: 'text-emerald-700', bg: 'bg-emerald-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
            <div className={`${bg} p-3 rounded-2xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-brand-foreground/50 block font-semibold">{label}</span>
              <span className="text-xl font-extrabold text-brand-green">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Completeness + Listing Tier Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
          <h3 className="font-bold text-brand-green flex items-center gap-2">
            <Star className="h-5 w-5 text-brand-gold" /> Profile Completeness
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brand-foreground/70">Progress</span>
              <span className="font-bold text-brand-green">{completeness}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5">
              <div className="bg-brand-green rounded-full h-2.5 transition-all" style={{ width: `${completeness}%` }} />
            </div>
            <p className="text-xs text-brand-foreground/50">
              Complete your profile to improve visibility on AYURWED Discovery.
            </p>
          </div>
          <Link href="/dashboard/manufacturer/profile"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold hover:text-brand-green transition-colors">
            Complete Profile →
          </Link>
        </div>

        <div className="bg-brand-gold-light/40 rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
          <h3 className="font-bold text-brand-green">Revenue Opportunities</h3>
          <ul className="space-y-2 text-sm text-brand-foreground/70">
            {[
              'Premium Listing — enhanced visibility',
              'Featured Manufacturer — homepage spotlight',
              'Sponsored Products — promoted catalog items',
              'Catalog Hosting — unlimited products',
              'Lead Generation — direct consumer enquiries',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 text-brand-green flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-brand-foreground/50 italic">Contact AYURWED to upgrade your listing tier.</p>
        </div>
      </div>
    </div>
  );
}
