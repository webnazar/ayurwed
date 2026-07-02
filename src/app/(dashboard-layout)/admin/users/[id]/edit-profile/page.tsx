import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ConsultantProfileForm from '@/components/consultant/ConsultantProfileForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AdminEditProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  const userId = Number(params.id);
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      consultantProfile: true,
    }
  });

  if (!user) {
    return <div className="p-8 text-center text-red-500 font-bold">User not found</div>;
  }

  if (user.role !== 'CONSULTANT') {
    return (
      <div className="p-8 text-center text-brand-foreground/50 bg-card rounded-3xl border border-border">
        User does not have a dedicated profile (Must be CONSULTANT).
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-header-card">
        <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-brand-green/70 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
        <h1 className="dashboard-header-title">Edit Profile: {user.name}</h1>
        <p className="dashboard-header-subtitle">
          Admin Override Mode. Modifying profile for {user.role.toLowerCase()}.
        </p>
      </div>

      <div className="pt-6">
        {user.role === 'CONSULTANT' && user.consultantProfile && (
          <ConsultantProfileForm 
            data={{
              adminTargetUserId: userId,
              user: { name: user.name || '', avatar: user.avatar },
              profile: {
                degree: user.consultantProfile.degree,
                specialization: user.consultantProfile.specialization,
                experience: user.consultantProfile.experience,
                bio: user.consultantProfile.bio,
                languages: user.consultantProfile.languages,
                consultationFee: Number(user.consultantProfile.consultationFee),
                followUpFee: Number(user.consultantProfile.followUpFee),
                isCaiCertified: user.consultantProfile.isCaiCertified,
                isVerified: user.consultantProfile.isVerified,
                isAcfp: user.consultantProfile.isAcfp,
                fulfillmentMethod: user.consultantProfile.fulfillmentMethod,
              }
            }}
          />
        )}

        {user.role === 'CONSULTANT' && !user.consultantProfile && (
           <div className="p-8 text-center text-brand-foreground/50 bg-card rounded-3xl border border-border">This consultant has not created their profile yet.</div>
        )}
      </div>
    </div>
  );
}
