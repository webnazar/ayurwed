import React from 'react';
import { Metadata } from 'next';
import { Mail, Phone, MessageSquare, Sparkles } from 'lucide-react';
import ContactFormClient from '@/components/contact/ContactFormClient';

export const metadata: Metadata = {
  title: 'Contact Us — Get in Touch | AYURWED',
  description: 'Reach out to AYURWED. Connect with our team via email (support@ayurwed.com) or mobile (+919271711722) for inquiries on Ayurvedic products, doctor listings, and CAI certification.',
  keywords: [
    'Contact Ayurwed',
    'Ayurwed Support',
    'Ayurwed Email',
    'Ayurwed Phone Number',
    'Ayurwed Customer Care',
    'Ayurveda Consultation Support',
  ],
  alternates: {
    canonical: 'https://www.ayurwed.com/contact',
  },
  openGraph: {
    title: 'Contact Us — Get in Touch | AYURWED',
    description: 'Reach out to AYURWED via email or mobile for inquiries on Ayurvedic products, doctor listings, and CAI certification.',
    url: 'https://www.ayurwed.com/contact',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.ayurwed.com/icon.png',
        width: 512,
        height: 512,
        alt: 'Contact AYURWED',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — Get in Touch | AYURWED',
    description: 'Connect with AYURWED support via email and mobile.',
    images: ['https://www.ayurwed.com/icon.png'],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-background text-brand-green-dark dark:text-foreground">
      
      {/* Header Section */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pt-20 sm:pb-16 bg-gradient-to-b from-brand-green/5 via-transparent to-transparent border-b border-border">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-gold/15 rounded-full blur-3xl"></div>
          <div className="absolute top-24 -left-24 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto layout-padding-minimal text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
            <Sparkles className="h-4 w-4" /> Support & Inquiries
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-brand-green tracking-tight">
            Contact <span className="text-brand-gold">AYURWED</span>
          </h1>
          
          <p className="text-sm sm:text-base text-brand-foreground/75 max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or enquiry? Connect directly with our team via email or mobile.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto layout-padding-minimal">
          <ContactFormClient />
        </div>
      </section>

    </div>
  );
}
