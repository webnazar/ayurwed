import React from 'react';
import ManufacturerProfileForm from '@/components/manufacturer/ManufacturerProfileForm';

export default function TestPage() {
  return (
    <div className="p-10">
      <ManufacturerProfileForm 
        adminTargetUserId={9}
        profile={{
          id: 2,
          companyName: 'Patanjali',
          slug: 'patanjali',
          description: null as any,
          website: null,
          contactEmail: null,
          contactPhone: null,
          gstNumber: null,
          logo: null,
          manufacturingLicense: null,
          certifications: ['GMP Certified'] as any,
        }}
      />
    </div>
  );
}
