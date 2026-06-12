import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ManufacturerProfileForm from '@/components/manufacturer/ManufacturerProfileForm';
import ConsultantProfileForm from '@/components/consultant/ConsultantProfileForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AdminEditProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  const userId = Number(params.id);
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      manufacturerProfile: true,
      consultantProfile: true,
    }
  });

  if (!user) {
    return <div className="p-8 text-center text-red-500 font-bold">User not found</div>;
  }

  if (user.role !== 'MANUFACTURER' && user.role !== 'CONSULTANT') {
    return <div className="p-8 text-center text-red-500 font-bold">User does not have a dedicated profile (Must be MANUFACTURER or CONSULTANT).</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-header-card">
        <Link href="/dashboard/admin/users" className="inline-flex items-center gap-1 text-sm text-brand-green/70 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
        <h1 className="dashboard-header-title">Edit Profile: {user.name}</h1>
        <p className="dashboard-header-subtitle">
          Admin Override Mode. Modifying profile for {user.role.toLowerCase()}.
        </p>
      </div>

      <div className="pt-6">
        {user.role === 'MANUFACTURER' && user.manufacturerProfile && (
          <ManufacturerProfileForm 
            adminTargetUserId={userId}
            profile={{
              id: user.manufacturerProfile.id,
              companyName: user.manufacturerProfile.companyName,
              slug: user.manufacturerProfile.slug,
              description: user.manufacturerProfile.description,
              website: user.manufacturerProfile.website,
              contactEmail: user.manufacturerProfile.contactEmail,
              contactPhone: user.manufacturerProfile.contactPhone,
              gstNumber: user.manufacturerProfile.gstNumber,
              logo: user.manufacturerProfile.logo,
              manufacturingLicense: user.manufacturerProfile.manufacturingLicense,
              certifications: Array.isArray(user.manufacturerProfile.certifications) 
                ? (user.manufacturerProfile.certifications as any[]).map(c => typeof c === 'string' ? { name: c, url: '' } : c) 
                : [],
            }}
          />
        )}

        {user.role === 'MANUFACTURER' && !user.manufacturerProfile && (
           <div className="p-8 text-center text-brand-foreground/50 bg-white rounded-3xl border border-brand-green-border/10">This manufacturer has not created their profile yet.</div>
        )}

        {user.role === 'CONSULTANT' && user.consultantProfile && (
          <ConsultantProfileForm 
            data={{
              adminTargetUserId: userId,
              user: { name: user.name || '', avatar: user.avatar },
              profile: {
                specialization: user.consultantProfile.specialization,
                experience: user.consultantProfile.experience,
                bio: user.consultantProfile.bio,
                languages: user.consultantProfile.languages,
                consultationFee: Number(user.consultantProfile.consultationFee),
              }
            }}
          />
        )}

        {user.role === 'CONSULTANT' && !user.consultantProfile && (
           <div className="p-8 text-center text-brand-foreground/50 bg-white rounded-3xl border border-brand-green-border/10">This consultant has not created their profile yet.</div>
        )}
      </div>
    </div>
  );
}
