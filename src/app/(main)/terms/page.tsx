import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, CreditCard, RefreshCw, Video, AlertTriangle, 
  FileText, Users, ShoppingBag, Scale, Clock, CheckCircle2, XCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & Sales Policy | AYURWED',
  description: 'Terms of Service and E-Commerce Policy for AYURWED governing platform usage, prepaid orders, strict no-COD policy, damage-only exchange policy with mandatory unboxing video, doctor directory, and company liability limitations.',
  keywords: [
    'Terms of Service', 'AYURWED Terms', 'Return Policy', 'Exchange Policy', 
    'Unboxing Video Mandatory', 'No COD Policy', 'Prepaid Orders', 'Company Protection Terms'
  ],
  alternates: {
    canonical: 'https://www.ayurwed.com/terms',
  },
  openGraph: {
    title: 'Terms of Service & Sales Policy | AYURWED',
    description: 'Terms of Service and Sales Policy governing AYURWED e-commerce, prepaid orders, exchanges, and platform usage.',
    url: 'https://www.ayurwed.com/terms',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-background text-brand-green-dark dark:text-foreground">
      
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pt-20 sm:pb-16 bg-gradient-to-b from-brand-green/5 via-transparent to-transparent border-b border-border">
        <div className="max-w-5xl mx-auto layout-padding-minimal text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
            <Scale className="h-4 w-4" /> Legal Agreement & Policies
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-brand-green tracking-tight">
            Terms of <span className="text-brand-gold">Service & Sales</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-brand-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before utilizing the AYURWED ecosystem, placing orders on our store, or connecting with doctors on our directory.
          </p>

          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Last Updated: October 2026 • Effective Immediately
          </p>
        </div>
      </section>

      {/* Main Content in Professional Cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto layout-padding-minimal space-y-8">
          
          {/* Card 1: Platform Overview */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">1. Acceptance of Terms & Ecosystem Scope</h2>
                <p className="text-xs text-muted-foreground">Agreement between You (&quot;User&quot; or &quot;Customer&quot;) and AYURWED (&quot;Company&quot;)</p>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              By accessing or using any part of <strong>AYURWED</strong> (including <Link href="https://www.ayurwed.com" className="text-brand-green font-bold underline">ayurwed.com</Link>, our e-commerce store, independent doctor directory, CAI Academy, and AI diagnostic software), you accept and agree to be legally bound by these Terms of Service. If you do not agree, you must immediately discontinue use of the platform.
            </p>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              AYURWED serves as an integrated ecosystem comprising: (a) an authentic Ayurvedic e-commerce store, (b) an independent directory of licensed Ayurvedic doctors, (c) the Certificate in Ancient Intelligence (CAI) educational academy, and (d) proprietary AI clinical diagnosis and prescription software licensed to subscribed medical practitioners.
            </p>
          </div>

          {/* Card 2: E-Commerce Payment Terms (Strict No-COD) */}
          <div className="bg-card border-2 border-brand-gold/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-gold/20 text-brand-gold-dark rounded-2xl">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">2. Orders & Payment Policy (Strictly Prepaid Only)</h2>
                <p className="text-xs text-brand-gold-dark font-bold uppercase tracking-wider">No Cash on Delivery (COD) Accepted</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-extrabold uppercase tracking-wide">Important Payment Notice:</p>
                <p>
                  AYURWED operates on a <strong>100% Prepaid Order Model</strong>. We do <strong>NOT</strong> offer Cash on Delivery (COD) under any circumstance. Orders will be processed and dispatched only after complete payment confirmation through our authorized online payment gateway.
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-foreground/80">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Accepted Payment Modes:</strong> UPI (Google Pay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, Net Banking, and approved digital wallets through RBI-authorized payment processors.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Order Confirmation:</strong> An electronic confirmation receipt and invoice are generated upon successful payment. The Company reserves the right to cancel or withhold any order if payment cannot be verified or is flagged for suspected fraud.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Pricing & Taxes:</strong> All product prices displayed on the store are in Indian Rupees (INR) and inclusive of applicable GST unless explicitly indicated otherwise. Shipping costs, if applicable, are computed at checkout prior to payment.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Return & Exchange Policy (Damage-Only & Mandatory Video) */}
          <div className="bg-card border-2 border-red-500/25 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-2xl">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">3. Return, Replacement & Exchange Policy</h2>
                <p className="text-xs text-red-600 font-bold uppercase tracking-wider">No Returns • Exchanges Only for Damaged or Opened Products</p>
              </div>
            </div>

            {/* Mandatory Unboxing Video Callout */}
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-wide">
                <Video className="h-5 w-5" /> Mandatory Continuous Unboxing Video Recording
              </div>
              <p className="text-xs sm:text-sm text-red-950 dark:text-red-200 leading-relaxed font-medium">
                To claim an exchange for a physically damaged item or a product received with an open/broken seal, the customer <strong>MUST provide an uncut, continuous 360-degree video recording</strong> from the very beginning of unboxing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-red-900 dark:text-red-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  <span>Showing outer packaging label & tracking ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  <span>Uncut video of breaking the courier seal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  <span>Clear close-up of the damaged/opened item</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  <span>Claims without this video will be rejected</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <p>
                <strong>Strict No-Return Policy:</strong> Because Ayurvedic medicines, herbal supplements, oils, and churnas are ingestible and topical wellness goods, items once sold and delivered <strong>CANNOT be returned or refunded</strong> under any general circumstance (including buyer&apos;s remorse, incorrect selection, or personal taste).
              </p>
              <p>
                <strong>Exchange Eligibility:</strong> An item is eligible strictly for an identical <strong>replacement exchange</strong> if and only if:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The item was physically crushed, broken, or leaking upon courier arrival.</li>
                <li>The inner manufacturer safety seal was already broken or opened upon opening the parcel.</li>
                <li>The incorrect product was shipped compared to the verified order invoice.</li>
              </ul>
              <p>
                <strong>Reporting Window:</strong> Any claim must be reported within <strong>48 hours of delivery</strong> to <a href="mailto:support@ayurwed.com" className="text-brand-green font-bold underline">support@ayurwed.com</a> or our WhatsApp helpline at <a href="tel:+919271711722" className="text-brand-green font-bold underline">+91 9271711722</a> accompanied by the mandatory unboxing video and clear photographs. Claims received after 48 hours cannot be entertained.
              </p>
            </div>
          </div>

          {/* Card 4: Doctor Directory & Zero Intermediary Fee Disclaimer */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">4. Independent Doctor Directory & Zero Commission</h2>
                <p className="text-xs text-muted-foreground">Direct Doctor-Patient Communication Disclaimer</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <p>
                AYURWED provides an open directory listing verified Ayurvedic doctors and practitioners. Patients connect with, call, visit, and consult doctors directly:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span><strong>Zero Platform Fee for Patients:</strong> AYURWED does not charge patients any platform booking fee or commission for contacting or consulting listed doctors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span><strong>Independent Medical Responsibility:</strong> Doctors listed on AYURWED are independent practitioners and are not employees, agents, or clinical representatives of the Company. All medical assessments, diagnosis, treatment regimens, and dosage instructions are the sole professional liability of the consulting doctor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span><strong>Doctor Subscriptions:</strong> Doctors pay a subscription fee to AYURWED solely for directory listing and complimentary access to our AI Clinical Diagnosis & Digital Prescription Software. The Company does not split, take commission on, or handle patient consultation fees.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 5: Safe Terms & Company Limitation of Liability */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">5. Company Legal Protections & Limitation of Liability</h2>
                <p className="text-xs text-muted-foreground">Comprehensive Risk Allocation & Safety Terms</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <p>
                <strong>Maximum Liability Cap:</strong> To the fullest extent permitted by applicable law, in no event shall AYURWED, its founders, directors, employees, affiliates, or licensors be liable for any indirect, incidental, punitive, special, or consequential damages. In all circumstances involving e-commerce transactions, the Company&apos;s total aggregate liability shall be strictly capped at the <strong>actual amount paid by the customer for the specific product in question</strong>.
              </p>
              <p>
                <strong>Medical Product Disclaimer:</strong> Information, descriptions, ingredients, and traditional benefits provided on product pages are derived from classical Ayurvedic texts and manufacturer labels. They are provided for educational and wellness awareness only and do not constitute emergency medical advice. Individual results from Ayurvedic herbal products may vary based on Prakriti (body constitution), lifestyle, age, and adherence.
              </p>
              <p>
                <strong>Courier & Shipping Limitations:</strong> AYURWED dispatches shipments through third-party insured logistics partners. While we endeavor to ensure prompt delivery within estimated timelines (typically 3–7 business days), the Company shall not be held liable for delays arising from Force Majeure events, strikes, natural disasters, regional lockdowns, or incorrect customer address details.
              </p>
            </div>
          </div>

          {/* Card 6: Intellectual Property & Jurisdiction */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">6. Intellectual Property, Governing Law & Jurisdiction</h2>
                <p className="text-xs text-muted-foreground">Legal Jurisdiction & Proprietary Rights</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <p>
                All trademarks, trade names, logos, CAI Academy course modules, text, software code, UI designs, and digital assets associated with <strong>AYURWED — Ancient Intelligence</strong> are the exclusive intellectual property of the Company. Unauthorized reproduction, scraping, reverse engineering, or commercial redistribution is strictly prohibited.
              </p>
              <p>
                These Terms of Service and any purchase or use of the platform shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>. Any dispute, claim, or legal proceeding arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts of law in <strong>Maharashtra, India</strong>.
              </p>
            </div>
          </div>

          {/* Contact Support for Policy Queries */}
          <div className="bg-brand-green-light/40 border border-brand-green/20 rounded-3xl p-6 text-center space-y-3">
            <h3 className="text-base sm:text-lg font-extrabold text-brand-green">Questions Regarding Our Terms or Returns?</h3>
            <p className="text-xs sm:text-sm text-brand-foreground/75 max-w-xl mx-auto">
              Our support team is available Monday through Saturday to assist you with order status, exchange requests, or policy clarifications.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <a href="mailto:support@ayurwed.com" className="btn-green px-5 py-2.5 rounded-full text-xs font-bold">
                Email: support@ayurwed.com
              </a>
              <a href="tel:+919271711722" className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold">
                Call: +91 9271711722
              </a>
              <Link href="/contact" className="text-xs font-bold text-brand-green hover:underline py-2">
                Visit Contact Page →
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
