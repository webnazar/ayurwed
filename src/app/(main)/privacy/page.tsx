import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, Lock, Eye, Database, Server, UserCheck, 
  Cookie, Mail, Phone, CheckCircle2, FileText
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Security | AYURWED',
  description: 'Privacy Policy for the AYURWED ecosystem explaining how personal information, prepaid order data, doctor credentials, and consumer privacy are securely safeguarded.',
  keywords: [
    'Privacy Policy', 'AYURWED Privacy', 'Data Security', 'Customer Privacy', 
    'Prepaid Payment Security', 'Zero Data Sale Policy'
  ],
  alternates: {
    canonical: 'https://www.ayurwed.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Data Security | AYURWED',
    description: 'Learn how AYURWED protects customer personal data, orders, and privacy.',
    url: 'https://www.ayurwed.com/privacy',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-background text-brand-green-dark dark:text-foreground">
      
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pt-20 sm:pb-16 bg-gradient-to-b from-brand-green/5 via-transparent to-transparent border-b border-border">
        <div className="max-w-5xl mx-auto layout-padding-minimal text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
            <Lock className="h-4 w-4" /> Confidentiality & Trust
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-brand-green tracking-tight">
            Privacy Policy & <span className="text-brand-gold">Data Protection</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-brand-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Your trust is our cornerstone. Discover how AYURWED protects your personal details, order records, and digital privacy across our platform.
          </p>

          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Last Updated: October 2026 • Compliant with Indian IT Act & SPDI Rules
          </p>
        </div>
      </section>

      {/* Main Content Cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto layout-padding-minimal space-y-8">
          
          {/* Card 1: Privacy Commitment */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">1. Our Privacy Commitment</h2>
                <p className="text-xs text-muted-foreground">Highest Standards of Ethical Data Custodianship</p>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              At <strong>AYURWED</strong> (accessible from <Link href="https://www.ayurwed.com" className="text-brand-green font-bold underline">www.ayurwed.com</Link>), we respect the privacy of every individual who visits our marketplace, browses our doctor directory, enrolls in our academy, or uses our digital wellness resources.
            </p>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              We collect and process personal data strictly in accordance with applicable Indian information technology and personal data protection regulations. <strong>We do not sell, rent, or trade your personal information to third-party data brokers or marketing agencies.</strong>
            </p>
          </div>

          {/* Card 2: Information We Collect */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-gold/20 text-brand-gold-dark rounded-2xl">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">2. Information We Collect</h2>
                <p className="text-xs text-muted-foreground">Customer, Doctor, and Educational Profile Data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/15 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-brand-green font-bold text-sm">
                  <UserCheck className="h-4 w-4" /> Customer & Order Data
                </div>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  When you purchase products on our store, we collect your name, email, mobile phone number, delivery address, and pin code necessary to fulfill courier dispatch and deliver your shipment.
                </p>
              </div>

              <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/15 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-brand-green font-bold text-sm">
                  <FileText className="h-4 w-4" /> Doctor & Professional Data
                </div>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  For doctors subscribing to our directory, we collect clinical registration details (AYUSH/State Medical Council numbers), qualifications, clinic phone/email, and verification documents.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Payment Security (Prepaid Gateways) */}
          <div className="bg-card border-2 border-brand-green/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">3. Payment Information & Security</h2>
                <p className="text-xs text-brand-gold-dark font-bold uppercase tracking-wider">PCI-DSS Compliant 256-bit Encrypted Gateways</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              All transactions on AYURWED are strictly prepaid and processed through industry-leading, RBI-approved payment aggregators (such as Razorpay).
            </p>
            <div className="space-y-2 text-xs sm:text-sm text-foreground/80">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>No Card Storage:</strong> AYURWED servers <strong>never store or view</strong> your credit/debit card numbers, CVV codes, net banking passwords, or UPI PINs.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>End-to-End Encryption:</strong> All transaction communication takes place via encrypted TLS 1.3 / HTTPS connections directly between your browser and the payment gateway.</span>
              </div>
            </div>
          </div>

          {/* Card 4: How We Use Your Data */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">4. How We Use Your Information</h2>
                <p className="text-xs text-muted-foreground">Purpose-Specific Data Utilization</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Order Delivery:</strong> Packing, invoicing, and dispatching products ordered through our e-commerce store via verified logistics partners.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Directory Listing & Certification:</strong> Displaying verified doctor credentials on public directory profiles and issuing CAI Academy certificates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Customer Assistance:</strong> Responding to inquiries, order status tracking, and processing eligible damage exchanges.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>System Integrity:</strong> Preventing fraud, unauthorized access, and malicious platform abuse.</span>
              </li>
            </ul>
          </div>

          {/* Card 5: Information Sharing & Logistics */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">5. Information Sharing With Service Providers</h2>
                <p className="text-xs text-muted-foreground">Limited Third-Party Disclosures</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              We share your contact and shipping information only with reputable service providers necessary to operate our business:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-foreground/80">
              <li><strong>Logistics & Courier Partners:</strong> Name, delivery address, and phone number are provided to courier agencies solely to execute parcel delivery and SMS tracking updates.</li>
              <li><strong>Payment Aggregators:</strong> Transaction identifiers and payment status to confirm receipt of funds.</li>
              <li><strong>Legal & Regulatory Authorities:</strong> Only when legally compelled under court orders or statutory notices from government law enforcement agencies.</li>
            </ul>
          </div>

          {/* Card 6: Cookies & Preferences */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Cookie className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">6. Cookies & Client Preferences</h2>
                <p className="text-xs text-muted-foreground">Theme Storage & Session Integrity</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              AYURWED utilizes essential cookies and local storage tokens to maintain your login session, shopping cart items, and UI visual preferences (such as remembering your selected light or dark theme mode). We do not use third-party tracking cookies to serve cross-site behavioral advertisements.
            </p>
          </div>

          {/* Card 7: Contact Data Protection Officer */}
          <div className="bg-brand-green-light/40 border border-brand-green/20 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-brand-green text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-brand-green">Contact Our Privacy & Grievance Desk</h3>
            <p className="text-xs sm:text-sm text-brand-foreground/75 max-w-xl mx-auto">
              If you have any questions regarding your personal data, wish to update your records, or have privacy concerns, please contact us:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <a href="mailto:support@ayurwed.com" className="btn-green px-6 py-2.5 rounded-full text-xs font-bold">
                Email: support@ayurwed.com
              </a>
              <a href="tel:+919271711722" className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold">
                Helpline: +91 9271711722
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
