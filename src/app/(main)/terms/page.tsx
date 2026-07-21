import React from 'react';

export const metadata = {
  title: 'Terms of Service | Ayurwed',
  description: 'Terms of Service for the Ayurwed Ecosystem Platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto layout-padding-minimal py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-green mb-8">Terms of Service</h1>
      
      <div className="prose prose-brand-green max-w-none text-brand-green/80 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Ayurwed platform ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to these terms, you should not access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">2. Description of Service & Intermediary Role</h2>
          <p>
            Ayurwed operates solely as a technology provider and intermediary platform connecting patients/consumers with independent, licensed Ayurvedic and AYUSH medical practitioners. 
            Ayurwed is <strong>not</strong> a medical provider, pharmacy, manufacturer, distributor, retailer, or stockist of pharmaceutical products or drugs.
          </p>
          <p className="mt-2">
            The platform provides tools for practitioners to manage scheduling, conduct online/offline consultations, generate digital prescription suggestions, and record compliance declarations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">3. Independent Practitioner Fulfillment & Drug License Disclaimer</h2>
          <p>
            All medicines, herbal preparations, and health products prescribed through the platform are dispensed, sold, packed, and fulfilled <strong>solely and directly</strong> by the respective independent practitioners under their own regulatory registrations and practitioner exemptions.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>No Stocking or Warehousing:</strong> Ayurwed does not purchase, stock, warehouse, or hold inventory of any medicines or preparations.
            </li>
            <li>
              <strong>Direct Dispensation & Dispatch:</strong> Invoicing, packaging, and physical fulfillment of prescriptions (whether via Clinic Pickup or Doctor Self-Dispatch) are the sole legal responsibility of the prescribing practitioner.
            </li>
            <li>
              <strong>Drug License Exemption:</strong> Since Ayurwed does not sell, distribute, stock, or exhibit for sale any drugs or medicines, it does not require a Drug License under the Drugs and Cosmetics Act, 1940 or similar laws. All regulatory licensing and compounding compliance obligations rest exclusively with the independent practitioners.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">4. Medical Disclaimer</h2>
          <p>
            The content provided on the Ayurwed platform, including artificial intelligence suggestions (Ayuri Bot), guidelines, and educational articles, is for informational and administrative support only. 
            It is not a substitute for professional medical assessment, diagnosis, or treatment. The final clinical judgment, dosage, and prescription selection remain the sole responsibility of the certified practitioner consulting the patient.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">5. Patient Procurement Choices</h2>
          <p>
            Patients consulting through Ayurwed remain free to procure their prescribed medicines independently from any external pharmacy or retail channel. Practitioners must offer "Prescription Only" modes where no procurement or fulfillment options are presented to the patient through this platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">6. Modifications to Service</h2>
          <p>
            Ayurwed reserves the right at any time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. 
            You agree that Ayurwed shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
          </p>
        </section>
      </div>
    </div>
  );
}
