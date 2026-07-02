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
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">2. How We Use Information</h2>
          <p>
            We may use the information we collect about you to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages;</li>
            <li>Perform internal operations, including, for example, to prevent fraud and abuse of our Services; to troubleshoot software bugs and operational problems; to conduct data analysis, testing, and research; and to monitor and analyze usage and activity trends;</li>
            <li>Send or facilitate communications between you and a delivery partner, such as estimated times of arrival (ETAs);</li>
            <li>Send you communications we think will be of interest to you, including information about products, services, promotions, news, and events of Ayurwed and other companies, where permissible and according to local applicable laws.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">3. Sharing of Information</h2>
          <p>
            We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>With drivers to enable them to provide the Services you request. For example, we share your name, photo (if you provide one), average User rating given by drivers, and pickup and/or drop-off locations with drivers;</li>
            <li>With other people, as directed by you, such as when you want to share your estimated time of arrival or split a fare with a friend;</li>
            <li>With third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us;</li>
            <li><strong>Medical and Consultation Data:</strong> We strictly adhere to healthcare data protection norms. We do not sell or share your personal health information, consultation data, or other personal data with third parties for research or commercial purposes without your explicit, informed consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">4. Analytics and Advertising Services Provided by Others</h2>
          <p>
            We may allow others to provide audience measurement and analytics services for us, to serve advertisements on our behalf across the Internet, and to track and report on the performance of those advertisements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">5. Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
          </p>
        </section>
      </div>
    </div>
  );
}
