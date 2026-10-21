import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Bot, Brain, AlertTriangle, ShieldCheck, Stethoscope, 
  FileText, CheckCircle2, Lock, Scale, Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ayuri Bot Policy & AI Safety | AYURWED',
  description: 'Ayuri AI Bot Usage & Safety Policy for the AYURWED Ecosystem explaining clinical boundaries, educational role, doctor autonomy, and algorithmic safety terms.',
  keywords: [
    'Ayuri Bot Policy', 'Ayurveda AI Policy', 'Ancient Intelligence Bot', 
    'AI Safety Guidelines', 'Clinical AI Disclaimer'
  ],
  alternates: {
    canonical: 'https://www.ayurwed.com/ayuri-bot-policy',
  },
  openGraph: {
    title: 'Ayuri Bot Policy & AI Safety | AYURWED',
    description: 'Learn about the role, boundaries, and safe usage guidelines for Ayuri, AYURWED\'s conversational Ayurvedic AI assistant.',
    url: 'https://www.ayurwed.com/ayuri-bot-policy',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function AyuriBotPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-background text-brand-green-dark dark:text-foreground">
      
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pt-20 sm:pb-16 bg-gradient-to-b from-brand-green/5 via-transparent to-transparent border-b border-border">
        <div className="max-w-5xl mx-auto layout-padding-minimal text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
            <Bot className="h-4 w-4" /> AI Ethics & Safety Guidelines
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-brand-green tracking-tight">
            Ayuri Bot <span className="text-brand-gold">Policy & Boundaries</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-brand-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Ayuri is AYURWED&apos;s intelligent conversational assistant designed to bridge classical Ayurvedic concepts with modern digital health discovery.
          </p>

          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Last Updated: October 2026 • Ethical AI Deployment Framework
          </p>
        </div>
      </section>

      {/* Main Content Cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto layout-padding-minimal space-y-8">
          
          {/* Card 1: Role of Ayuri */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-gold/20 text-brand-gold-dark rounded-2xl">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">1. What is Ayuri?</h2>
                <p className="text-xs text-muted-foreground">Ancient Intelligence Powered by Computational Language Models</p>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <strong>Ayuri</strong> is an AI-powered Ayurvedic guide trained on recognized classical Ayurvedic treatises (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) and modern wellness principles. Ayuri assists users in understanding basic Ayurvedic concepts such as Tridosha (Vata, Pitta, Kapha), Prakriti, Dinacharya (daily regimen), and common herbal uses.
            </p>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              Ayuri is engineered strictly as an <strong>educational and exploratory assistant</strong>. It operates within carefully structured guardrails to prevent misleading, unauthorized, or dangerous clinical claims.
            </p>
          </div>

          {/* Card 2: Crucial Safety Alert & Clinical Boundaries */}
          <div className="bg-card border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">2. Important Safety Boundaries & Disclaimers</h2>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Not a Doctor • Not a Substitute for Medical Care</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-2 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
              <p className="font-extrabold uppercase">Notice Regarding Medical Consultations:</p>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed font-medium">
                <li>Ayuri is <strong>NOT a licensed physician or medical practitioner</strong>. Conversations with Ayuri do not create a doctor-patient relationship.</li>
                <li>Ayuri cannot definitively diagnose diseases, prescribe pharmaceutical medicines, or formulate emergency treatment regimens.</li>
                <li><strong>Medical Emergencies:</strong> If you are experiencing a medical emergency, acute chest pain, severe allergic reaction, or shortness of breath, immediately dial local emergency services (112 / 108 in India) or visit the nearest hospital. Do not rely on Ayuri in life-threatening situations.</li>
              </ul>
            </div>
          </div>

          {/* Card 3: Platform Scope & No-Prescription / No-Booking Policy */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">3. Platform Boundaries: No Prescriptions or Appointment Bookings</h2>
                <p className="text-xs text-muted-foreground">eCommerce Shop • Knowledge Center • Doctors List Directory</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              AYURWED strictly operates across three specific informational and retail pillars:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>No Prescriptions:</strong> AYURWED and Ayuri AI do not generate, handle, or dispense clinical or medical prescriptions. Any guidance provided by Ayuri is strictly informational and educational.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>No Appointment Bookings:</strong> The platform does not schedule, book, or process clinical consultations or doctor appointments.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Direct Practitioner Directory:</strong> Our Doctors List connects users directly with certified practitioners. Users can view public profiles and reach out to doctors directly via phone or WhatsApp at their own discretion.</span>
              </li>
            </ul>
          </div>

          {/* Card 4: Product Recommendations & Store Rules */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-gold/20 text-brand-gold-dark rounded-2xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">4. Product Mentions & Store Purchases</h2>
                <p className="text-xs text-muted-foreground">Transparent E-Commerce Policies</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              When Ayuri mentions classical Ayurvedic formulations or wellness remedies, links may direct to the AYURWED marketplace. All store purchases are governed strictly by our <Link href="/terms" className="text-brand-green font-bold underline">Terms of Service</Link>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-foreground/80">
              <li><strong>Prepaid Only:</strong> All orders are 100% prepaid. No Cash on Delivery (COD) is available.</li>
              <li><strong>No-Return Policy:</strong> Once delivered, consumables and wellness products cannot be returned or refunded.</li>
              <li><strong>Damaged / Open Seal Exchange:</strong> Replacements are offered strictly for items received in damaged condition or with broken seals, provided a mandatory continuous unboxing video is submitted within 48 hours.</li>
            </ul>
          </div>

          {/* Card 5: Safe Terms & Algorithmic Liability Limitations */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-2xl">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green">5. Company Legal Protections & Disclaimers</h2>
                <p className="text-xs text-muted-foreground">Comprehensive Algorithmic Risk Allocation</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <p>
                <strong>As-Is AI Provision:</strong> Ayuri is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While AYURWED employs rigorous benchmark validation to align AI responses with authentic Ayurvedic classical texts, language models may occasionally generate incomplete, general, or imprecise information.
              </p>
              <p>
                <strong>Zero Company Clinical Liability:</strong> AYURWED, its founders, and operators explicitly disclaim any liability for adverse health outcomes, misinterpretations, or damages resulting from self-treatment, delay in seeking human medical care, or actions taken based on Ayuri conversations.
              </p>
              <p>
                <strong>User Discretion:</strong> Users must always verify guidance with a certified Ayurvedic doctor before undertaking major lifestyle changes, dietary fasts, or initiating new herbal supplements, particularly if pregnant, nursing, or managing chronic conditions.
              </p>
            </div>
          </div>

          {/* Bottom Navigation Link */}
          <div className="bg-brand-green-light/40 border border-brand-green/20 rounded-3xl p-6 text-center space-y-3">
            <h3 className="text-base sm:text-lg font-extrabold text-brand-green">Consult a Certified Ayurvedic Doctor</h3>
            <p className="text-xs sm:text-sm text-brand-foreground/75 max-w-xl mx-auto">
              Ready for a professional, personalized consultation? Browse our directory of verified doctors across India with zero platform fees.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <Link href="/doctors" className="btn-green px-6 py-2.5 rounded-full text-xs font-bold">
                Find a Doctor Directory →
              </Link>
              <Link href="/contact" className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold">
                Contact Support Desk
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
