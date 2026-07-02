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
            By accessing and using the Ayurwed platform, you accept and agree to be bound by the terms and provision of this agreement. 
            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">2. Description of Service</h2>
          <p>
            Ayurwed provides users with access to a rich collection of resources, including various communications tools, forums, 
            shopping services, and personalized content. You understand and agree that the Service is provided "AS-IS" and that Ayurwed 
            assumes no responsibility for the timeliness, deletion, mis-delivery, or failure to store any user communications or personalization settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">3. Medical Disclaimer</h2>
          <p>
            The content provided on the Ayurwed platform, including but not limited to text, graphics, images, and other material contained on this website, 
            are for informational purposes only. The purpose of this website is to promote broad consumer understanding and knowledge of various health topics. 
            It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health care provider with any questions you may have regarding a medical condition or treatment and before undertaking a new health care regimen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">4. Privacy Policy</h2>
          <p>
            Registration data and certain other information about you are subject to our applicable privacy policy. For more information, see our full Privacy Policy at our Privacy Policy page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">5. Modifications to Service</h2>
          <p>
            Ayurwed reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. 
            You agree that Ayurwed shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
          </p>
        </section>
      </div>
    </div>
  );
}
