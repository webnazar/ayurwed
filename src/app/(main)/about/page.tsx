import React from 'react';
import { Metadata } from 'next';
import { 
  Sparkles, BookOpen, Brain, Leaf, HeartHandshake, ShieldCheck, 
  Award, Target, Cpu, Layers, HelpCircle, Activity, CheckCircle2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | AYURWED',
  description: 'Learn how AYURWED is redefining Ayurvedic healthcare by combining Ancient Intelligence with Artificial Intelligence.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-background text-brand-green-dark dark:text-foreground">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-36 bg-gradient-to-b from-brand-green/5 to-transparent">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute top-48 -left-24 w-72 h-72 bg-brand-green/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto layout-padding-minimal text-center relative z-10 space-y-6">
          <div className="flex justify-center mb-8">
            <img
              src="/ayurwed.webp"
              alt="AYURWED Logo"
              className="h-36 sm:h-48 w-auto object-contain drop-shadow-md"
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest border border-brand-gold/30">
            <Sparkles className="h-4 w-4" /> Redefining Ayurveda
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-green tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Ancient Intelligence <br />
            <span className="text-brand-gold relative">
              Meets Artificial Intelligence
              <svg className="absolute w-full h-3 -bottom-2 left-0 text-brand-gold/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
              </svg>
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-brand-foreground/80 max-w-3xl mx-auto leading-relaxed pt-4 font-medium">
            AYURWED is a next-generation digital healthcare ecosystem built to transform the way Ayurveda is practiced, experienced, and delivered.
          </p>
        </div>
      </section>

      {/* 2. Intro Statement */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto layout-padding-minimal text-center space-y-6">
          <p className="text-lg sm:text-xl leading-relaxed text-brand-foreground/80">
            We believe Ayurveda is one of the world&apos;s oldest and most comprehensive systems of health. However, in today&apos;s digital era, patients often struggle to find trusted practitioners, maintain treatment history, receive personalized care, or continue long-term wellness journeys.
          </p>
          <div className="p-1.5 bg-brand-gold/10 border border-brand-gold/25 rounded-2xl inline-block max-w-2xl">
            <p className="text-base sm:text-lg font-bold text-brand-gold-dark px-4 py-2">
              AYURWED bridges this gap by combining <strong>Ancient Intelligence</strong>—the timeless wisdom of Ayurveda—with <strong>Artificial Intelligence</strong> to create a modern, patient-centric healthcare platform.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Philosophy Section */}
      <section className="py-20 bg-brand-green text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto layout-padding-minimal relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                <HeartHandshake className="h-4 w-4" /> Our Philosophy
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Empowering practitioners to deliver better, personalized care.
              </h2>
              <p className="text-brand-green-light text-lg leading-relaxed">
                At AYURWED, we believe technology should never replace the wisdom and experience of an Ayurvedic consultant. Instead, it should act as an assistant to augment human capability.
              </p>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Ancient Wisdom', desc: 'Preserving thousands of years of herbal science and traditional healing principles.' },
                { title: 'Modern Intelligence', desc: 'Utilizing computational tools to organize and accelerate knowledge discovery.' },
                { title: 'Personalized Care', desc: 'Crafting unique formulations tailored to individual patient constitution.' },
                { title: 'Trusted Human Expertise', desc: 'Ensuring every clinical decision is guided by a certified professional.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:translate-y-[-2px] transition-transform">
                  <h3 className="text-lg font-bold text-brand-gold mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-green-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 text-center max-w-3xl mx-auto space-y-2">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-green-light">AI Role</p>
                <p className="text-lg sm:text-xl font-extrabold text-brand-gold">Assists</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-green-light">Consultant Role</p>
                <p className="text-lg sm:text-xl font-extrabold text-white">Decides</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-green-light">Patient Outcome</p>
                <p className="text-lg sm:text-xl font-extrabold text-brand-green-light">Benefits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ancient vs. Artificial */}
      <section className="py-20 bg-[#fdf6e3] dark:bg-background">
        <div className="max-w-7xl mx-auto layout-padding-minimal">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green">Two Forms of Intelligence</h2>
            <p className="text-brand-foreground/70 max-w-2xl mx-auto text-lg">The foundation of AYURWED is the seamless integration of traditional wisdom and modern technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
              <div className="bg-brand-green/5 w-14 h-14 rounded-2xl flex items-center justify-center">
                <Leaf className="h-7 w-7 text-brand-green" />
              </div>
              <h3 className="text-2xl font-extrabold text-brand-green">Ancient Intelligence</h3>
              <p className="text-brand-foreground/70 leading-relaxed text-sm">
                Thousands of years of Ayurvedic knowledge, herbal science, traditional healing principles, and natural wellness practices. We honor the classical formulations, understanding their synergistic nature and properties.
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
              <div className="bg-brand-gold/10 w-14 h-14 rounded-2xl flex items-center justify-center">
                <Brain className="h-7 w-7 text-brand-gold-dark" />
              </div>
              <h3 className="text-2xl font-extrabold text-brand-green">Artificial Intelligence</h3>
              <p className="text-brand-foreground/70 leading-relaxed text-sm">
                Modern AI technologies that organize knowledge, assist consultants, analyze patient information, recommend possible preparation combinations, and streamline clinical workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. More Than a Consultation Platform */}
      <section className="py-16 bg-card border-y border-border text-center">
        <div className="max-w-4xl mx-auto layout-padding-minimal space-y-6">
          <h2 className="text-3xl font-extrabold text-brand-green">More Than a Consultation Platform</h2>
          <p className="text-lg text-brand-foreground/80 leading-relaxed max-w-2xl mx-auto">
            AYURWED is not an online pharmacy, nor is it an e-commerce marketplace.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {['Patients', 'Consultants', 'Knowledge Base', 'Preparations'].map((item, idx) => (
              <div key={idx} className="bg-brand-gold-light/20 border border-brand-gold/20 rounded-2xl p-4 font-bold text-brand-gold-dark">
                {item}
              </div>
            ))}
          </div>
          <p className="text-sm text-brand-foreground/60 pt-4 font-semibold">
            The platform has been designed around patient care—not product sales. Every feature exists to improve diagnosis, consultation, prescription management, follow-up, and long-term wellness.
          </p>
        </div>
      </section>

      {/* 6. The AYURWED Care Journey */}
      <section className="py-24 bg-[#fdf6e3] dark:bg-background">
        <div className="max-w-7xl mx-auto layout-padding-minimal">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green">The AYURWED Care Journey</h2>
            <p className="text-brand-foreground/70 max-w-2xl mx-auto text-lg">Every patient&apos;s journey follows a carefully designed, highly personalized pathway.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {[
              { step: '01', title: 'Understand', desc: 'Interact with Ayuri, our Wellness Guide, to organize your health concerns and prepare.' },
              { step: '02', title: 'Consult', desc: 'Connect with an AYURWED Certified Consultant for a personalized online or offline session.' },
              { step: '03', title: 'AI Prescription Engine', desc: 'Consultants use AI-assisted tools to review history, indications, and receive suggestions.' },
              { step: '04', title: 'Personalized Preparations', desc: 'Receive unique herbal extracts, powders, or classical preparations tailored to you.' },
              { step: '05', title: 'Continuous Care', desc: 'Every consultation and prescription is securely stored for long-term health tracking.' }
            ].map((journey, idx) => (
              <div key={idx} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
                <div>
                  <span className="text-brand-gold font-black text-3xl opacity-40 group-hover:opacity-100 transition-opacity block mb-4">{journey.step}</span>
                  <h4 className="text-lg font-bold text-brand-green mb-2">{journey.title}</h4>
                  <p className="text-xs text-brand-foreground/70 leading-relaxed">{journey.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. AYURWED Professional Network Section */}
      <section className="py-24 bg-card border-t border-b border-border relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto layout-padding-minimal space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
              <Award className="h-4 w-4 text-brand-gold-dark" /> Professional Network
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-green">
              AYURWED Professional Network
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-gold-dark animate-pulse">
              Excellence Begins with Certification
            </p>
            <div className="pt-4 space-y-4 text-brand-foreground/85 text-base sm:text-lg leading-relaxed">
              <p>
                At AYURWED, we believe exceptional patient care begins with knowledgeable and verified professionals. Every practitioner on our platform follows a structured journey through education, certification, verification, and approval before becoming part of the AYURWED ecosystem.
              </p>
              <p className="text-sm text-brand-foreground/60 max-w-2xl mx-auto italic">
                Unlike traditional directories where anyone can create a profile, AYURWED maintains a curated network of certified Ayurvedic professionals committed to ethical practice, continuous learning, and personalized patient care.
              </p>
            </div>
          </div>

          {/* Three Main Sub-sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            
            {/* Column 1: AYURWED Academy */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-[2rem] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="bg-brand-green/10 p-3 rounded-2xl text-brand-green">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="bg-brand-green text-white text-[10px] font-black px-2.5 py-0.5 rounded-md">CAI</span>
                    <span className="bg-brand-gold text-brand-green text-[10px] font-black px-2.5 py-0.5 rounded-md">CIA</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-brand-green">AYURWED Academy</h3>
                  <p className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider">Learn Before You Practice</p>
                  <p className="text-xs text-brand-foreground/75 leading-relaxed">
                    The AYURWED Academy is the foundation of our professional ecosystem. Every practitioner who wishes to consult patients on the platform is encouraged to complete one of our certification programs: <strong>CAI (Certificate in Ancient Intelligence)</strong> or <strong>CIA (Certified in Ancient Intelligence)</strong>.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-brand-green border-b border-brand-green/10 pb-1.5">Academy Curriculum Includes:</p>
                  <ul className="space-y-2.5 text-xs text-brand-foreground/80">
                    {[
                      'Ancient Intelligence & Ayurvedic Principles',
                      'AI-Assisted Clinical Decision Support',
                      'Digital Patient Consultation Workflow',
                      'Personalized Prescription Management',
                      'Product & Preparation Selection',
                      'Patient Record Management',
                      'Ethics & Professional Standards',
                      'AYURWED Platform Guidelines'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 2: AYURWED Certified Fulfillment Partner (ACFP) */}
            <div className="bg-gradient-to-br from-brand-green to-[#0d3419] text-white border border-brand-gold/30 rounded-[2rem] p-8 flex flex-col justify-between shadow-md relative overflow-hidden transition-all duration-300">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-bl-full"></div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="bg-brand-gold/20 p-3 rounded-2xl text-brand-gold">
                    <Award className="h-6 w-6 animate-pulse-slow" />
                  </div>
                  <span className="bg-brand-gold text-brand-green text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Verified</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white">ACFP Designation</h3>
                  <p className="text-xs font-bold text-brand-gold uppercase tracking-wider">Professional Recognition • Verified Membership</p>
                  <p className="text-xs text-brand-green-light leading-relaxed">
                    After successfully completing the required certification, practitioners may apply to become an AYURWED Certified Fulfillment Partner (ACFP). ACFP is an exclusive professional membership recognizing those meeting our highest standards.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-brand-gold border-b border-white/10 pb-1.5">Approved ACFP Members Receive:</p>
                  <ul className="space-y-2.5 text-xs text-brand-green-light">
                    {[
                      'Verified AYURWED Consultant Profile',
                      'Official ACFP Verification Badge',
                      'Online & Clinic Consultation Access',
                      'AI-Assisted Prescription Tools',
                      'Secure Digital Patient Records',
                      'Personalized Treatment Workflow',
                      'Medicine Fulfillment Support',
                      'Continuing Professional Education',
                      'Priority Platform Benefits'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                        <span className="text-white font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 3: Verification & Approval */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-[2rem] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="bg-brand-green/10 p-3 rounded-2xl text-brand-green">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2.5 py-0.5 rounded-full">Multi-stage Audit</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-brand-green">Verification & Approval</h3>
                  <p className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider">Building Trust Through Verification</p>
                  <p className="text-xs text-brand-foreground/75 leading-relaxed">
                    Every practitioner applying to AYURWED completes a multi-stage verification process to ensure quality, authenticity, and patient safety.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-brand-green border-b border-brand-green/10 pb-1.5">Our Verification Process Audits:</p>
                  <ul className="space-y-2.5 text-xs text-brand-foreground/80">
                    {[
                      'Identity Verification',
                      'Educational Qualification Verification',
                      'Professional Registration Verification',
                      'Clinic & Practice Information',
                      'Professional Experience Review',
                      'Platform Policy Acceptance',
                      'Ethical Practice Declaration'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-green/10 bg-brand-gold/10 p-3.5 rounded-2xl">
                <p className="text-[11px] sm:text-xs font-bold text-brand-gold-dark text-center leading-relaxed">
                  Only practitioners approved by the AYURWED Verification Team are permitted to consult patients and issue prescriptions through the platform.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Commitment, Vision, Mission, Promise */}
      <section className="py-20 bg-brand-green text-white border-t border-brand-green-border">
        <div className="max-w-7xl mx-auto layout-padding-minimal text-center space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Award className="h-8 w-8 text-brand-gold mx-auto" />
              <h4 className="text-lg font-bold text-white">Our Commitment</h4>
              <p className="text-xs text-brand-green-light leading-relaxed">
                We are committed to building a healthcare ecosystem based on trust, transparency, and patient-centered care.
              </p>
            </div>

            <div className="space-y-3">
              <Target className="h-8 w-8 text-brand-gold mx-auto" />
              <h4 className="text-lg font-bold text-white">Our Vision</h4>
              <p className="text-xs text-brand-green-light leading-relaxed">
                To become the world&apos;s most trusted digital ecosystem for Ayurveda by combining Ancient Intelligence, Artificial Intelligence, certified professionals, and modern technology.
              </p>
            </div>

            <div className="space-y-3">
              <Cpu className="h-8 w-8 text-brand-gold mx-auto" />
              <h4 className="text-lg font-bold text-white">Our Mission</h4>
              <p className="text-xs text-brand-green-light leading-relaxed">
                To empower practitioners with intelligent digital tools, enable patients to access trusted personalized care, and preserve the timeless wisdom of Ayurveda.
              </p>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-[2rem] p-8 sm:p-12 max-w-4xl mx-auto space-y-6">
            <Sparkles className="h-10 w-10 text-brand-gold mx-auto" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Our Promise</h3>
            <p className="text-lg text-brand-green-light italic max-w-2xl mx-auto">
              &quot;At AYURWED, technology never replaces human expertise. Artificial Intelligence supports. Ancient Intelligence guides. Certified Consultants decide. Patients come first.&quot;
            </p>
            <p className="text-xs text-brand-gold font-bold uppercase tracking-widest">That is the AYURWED promise.</p>
          </div>
          
        </div>
      </section>

    </div>
  );
}
