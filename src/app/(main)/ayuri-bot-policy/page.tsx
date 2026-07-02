import React from 'react';

export const metadata = {
  title: 'Ayuri Bot Policy | Ayurwed',
  description: 'Ayuri Bot Usage Policy for the Ayurwed Ecosystem Platform.',
};

export default function AyuriBotPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto layout-padding-minimal py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-green mb-8">Ayuri Bot Policy</h1>
      
      <div className="prose prose-brand-green max-w-none text-brand-green/80 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">1. Introduction to Ayuri</h2>
          <p>
            Ayuri is our AI-powered Ayurvedic assistant designed to provide general information about Ayurvedic concepts, doshas, herbs, and wellness practices. It is intended for educational purposes only and should not be considered a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">2. Limitations of the AI</h2>
          <p>
            While Ayuri strives to provide accurate and helpful information based on traditional Ayurvedic texts and modern wellness practices:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Ayuri cannot diagnose medical conditions, prescribe treatments, or provide personalized medical advice.</li>
            <li>Information provided by Ayuri may not be complete or fully applicable to your specific health situation.</li>
            <li>In case of a medical emergency, you must immediately contact emergency services or a healthcare professional.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">3. User Responsibilities</h2>
          <p>
            By interacting with Ayuri, you agree to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the bot responsibly and not rely on it for critical health decisions.</li>
            <li>Always consult with a qualified healthcare provider or a certified Ayurvedic practitioner before making changes to your diet, lifestyle, or starting any new wellness regimen based on Ayuri's suggestions.</li>
            <li>Refrain from sharing sensitive personal health information (PHI) or personally identifiable information (PII) during your interactions with Ayuri.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">4. Data Privacy and Usage</h2>
          <p>
            Interactions with Ayuri may be logged and analyzed to improve the quality of the AI and our services. We handle all data in accordance with our Privacy Policy. We do not use your conversations with Ayuri to uniquely identify you for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-green mb-3">5. Disclaimer of Liability</h2>
          <p>
            Ayurwed disclaims any liability for damages, injuries, or health complications resulting from actions taken or not taken based on the information provided by Ayuri. Your use of Ayuri is entirely at your own risk.
          </p>
        </section>
      </div>
    </div>
  );
}
