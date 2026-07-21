import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Ayurwed',
  description: 'Privacy Policy for the Ayurwed Ecosystem Platform.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto layout-padding-minimal py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-green mb-8">Privacy Policy</h1>
      
      <div className="prose prose-brand-green max-w-none text-brand-green/80 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you register an account, request consultations, input practitioner registration details, create clinical prescriptions, or place order requests. This information may include:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Personal Identity & Contact:</strong> Name, email address, phone number, physical mailing address, and login credentials.</li>
            <li><strong>Professional Verification (for Practitioners):</strong> AYUSH or medical registration number, academic credentials, and supplier reference/procurement declarations.</li>
            <li><strong>Health & Clinical Data:</strong> Patient case histories, diagnostic details, symptoms, and digital prescriptions drafted by practitioners.</li>
            <li><strong>Fulfillment Preferences:</strong> Selected fulfillment modes (e.g. Clinic Pickup, Doctor Self-Dispatch) and order delivery destinations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">2. How We Use Information</h2>
          <p>
            We use the information we collect about you to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Operate, maintain, and secure the Ayurwed SaaS platform and clinical tools.</li>
            <li>Facilitate scheduling, diagnostic communication, and digital prescription creation between patients and independent practitioners.</li>
            <li>Enable independent practitioners to process fulfillment orders (compounding, packaging, local shipping, or in-clinic pickup notifications).</li>
            <li>Verify credentials and ensure compliance with platform terms and professional standards.</li>
            <li>Troubleshoot technical issues, identify bugs, and prevent fraudulent usage of the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">3. Sharing of Information</h2>
          <p>
            As an intermediary platform, Ayurwed shares specific data to facilitate direct practitioner-patient interactions:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Practitioner-Patient Link:</strong> We share patient demographics, contact details, and case files with the selected consulting practitioner to enable proper diagnosis.</li>
            <li><strong>Order Processing Data:</strong> For prescription and retail product orders, customer shipping details are shared directly and exclusively with the fulfilling practitioner to organize dispatch or clinic collection. Ayurwed does not share this data with third-party logistics agents directly; any external shipping/postal services are booked independently by the fulfilling practitioner.</li>
            <li><strong>Healthcare Confidentiality:</strong> Clinical files and diagnostic records are strictly confidential. We do not sell, rent, or share personal health information with marketing companies, research groups, or commercial partners without your explicit, informed consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">4. Data Security & Storage</h2>
          <p>
            We implement state-of-the-art administrative, technical, and physical security controls to safeguard patient medical histories and doctor credentials. Information is stored in encrypted, highly secure database nodes to protect against data loss, theft, and unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">5. Regulatory Disclosures</h2>
          <p>
            We may disclose information as necessary to satisfy any applicable law, regulation, legal process, or governmental request, including verifying practitioner registration numbers against regulatory bodies.
          </p>
        </section>
      </div>
    </div>
  );
}
