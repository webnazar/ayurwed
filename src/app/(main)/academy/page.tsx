import React from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Star, CheckCircle2, Video, Users, Award, ArrowRight, PlayCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academy | AYURWED',
  description: 'Master the ancient science of Ayurveda with our certified courses. Choose from fundamental, advanced, and practitioner-level programs.',
};

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3]">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-36 bg-gradient-to-b from-brand-green/5 to-transparent">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-48 -left-24 w-72 h-72 bg-brand-green/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-2 border border-brand-green/20">
            <GraduationCap className="h-4 w-4" /> AYURWED Academy
          </div>
          <div className="text-lg sm:text-xl font-bold text-brand-foreground/80 mb-6 tracking-wide">
            The World&apos;s First Academy of Ancient Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-brand-green tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Ancient <span className="text-brand-gold relative">Intelligence.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-gold/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
            </span> <br className="hidden sm:block" /> Powered by Artificial Intelligence.
          </h1>
          
          <p className="text-lg sm:text-xl text-brand-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            The systematic study and application of timeless knowledge, enhanced by Artificial Intelligence to deliver personalized, evidence-informed learning and wellness guidance for the modern world.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#courses" className="w-full sm:w-auto px-8 py-4 bg-brand-green text-white rounded-full font-bold text-lg hover:bg-brand-gold hover:text-brand-green transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
              Explore Courses <ArrowRight className="h-5 w-5" />
            </a>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-brand-green/20 text-brand-green rounded-full font-bold text-lg hover:bg-brand-green/5 transition-all duration-300 flex items-center justify-center gap-2">
              <PlayCircle className="h-5 w-5" /> Watch Intro
            </button>
          </div>
        </div>
      </section>

      {/* 2. Features / Value Proposition */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-green mb-4">Why Choose Our Academy?</h2>
            <p className="text-brand-foreground/60 max-w-2xl mx-auto">We combine 5000-year-old wisdom with advanced Artificial Intelligence to provide the most personalized and comprehensive AYURWED+AI learning experience available.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Interactive AI Tutor', desc: 'Every lecture, quiz, and practical exercise is AI-personalized, giving you a deeply tailored AI-guided learning journey.' },
              { icon: Video, title: 'AI-Generated Case Studies', desc: 'Immerse yourself in real-world scenarios through dynamic, AI-generated case studies and continuous AI-driven progress tracking.' },
              { icon: Award, title: 'AI-Based Examinations', desc: 'Robust AI-based assessments that adapt to your knowledge level, culminating in a prestigious digital credential.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-brand-gold-light/30 border border-brand-green-border/10 rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-brand-green/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-brand-green" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-3">{feature.title}</h3>
                <p className="text-brand-foreground/70 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Pricing / Courses Section */}
      <section id="courses" className="py-24 bg-brand-green relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Choose Your Learning Path</h2>
            <p className="text-brand-green-light max-w-2xl mx-auto text-lg">Whether you are a curious beginner or an aspiring holistic health coach, we have the perfect curriculum for you.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-center">
            
            {/* CAI */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="text-3xl mb-3">🏆</div>
                <div className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-md text-sm font-black tracking-widest border border-brand-green/20 mb-3">CAI</div>
                <h3 className="text-xl font-bold text-brand-foreground/80 mb-2 leading-tight">Certificate in Ancient Intelligence</h3>
                <p className="text-sm text-brand-green font-bold uppercase tracking-wider">Specialization: Ayurwed</p>
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-brand-foreground/60 text-sm font-medium uppercase tracking-wide">Duration:</span>
                <span className="text-2xl font-extrabold text-brand-green">3 Months</span>
              </div>
              <p className="text-sm text-brand-foreground/70 mb-8 h-16 text-center">Perfect for individuals seeking foundational knowledge in Ancient Intelligence and Ayurvedic principles.</p>
              
              <ul className="space-y-4 mb-8">
                {['Introduction to Ancient Intelligence', 'AI-powered learning platform', 'AI-generated assessments', 'AI mentor support', 'Digital certificate'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-foreground/80 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              
              <Link href="https://academy.ayurwed.com" target="_blank" className="block w-full text-center py-3.5 rounded-xl border-2 border-brand-green text-brand-green font-bold hover:bg-brand-green hover:text-white transition-colors">
                Enroll in CAI
              </Link>
            </div>

            {/* DAI (Highlighted) */}
            <div className="bg-gradient-to-b from-brand-gold to-brand-gold-dark rounded-[2.5rem] p-1 shadow-2xl relative transform lg:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-green text-brand-gold px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border border-brand-gold/30">
                Most Popular
              </div>
              <div className="bg-white rounded-[2.3rem] p-8 h-full flex flex-col">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="text-4xl mb-3">🥈</div>
                  <div className="bg-brand-gold/20 text-brand-gold-dark px-3 py-1 rounded-md text-sm font-black tracking-widest border border-brand-gold/30 mb-3">DAI</div>
                  <h3 className="text-xl font-bold text-brand-gold-dark mb-2 leading-tight">Diploma in Ancient Intelligence</h3>
                  <p className="text-sm text-brand-green font-bold uppercase tracking-wider">Specialization: Ayurwed</p>
                </div>
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-brand-foreground/60 text-sm font-medium uppercase tracking-wide">Duration:</span>
                  <span className="text-3xl font-extrabold text-brand-green">1 Year</span>
                </div>
                <p className="text-sm text-brand-foreground/70 mb-8 h-16 text-center">Comprehensive training for deep mastery of holistic wellness, herbology, and traditional therapies.</p>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  {['Everything in CAI', 'AI-guided personalized learning', 'Interactive AI tutor sessions', 'AI-generated case studies', 'AI-driven progress tracking'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-brand-foreground/90 font-bold">
                      <CheckCircle2 className="h-5 w-5 text-brand-gold flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                
                <Link href="https://academy.ayurwed.com" target="_blank" className="block w-full text-center py-4 rounded-xl bg-brand-green text-white font-bold hover:bg-brand-gold hover:text-brand-green transition-colors shadow-lg">
                  Apply for DAI
                </Link>
              </div>
            </div>

            {/* FAI */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="text-3xl mb-3">🥇</div>
                <div className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-md text-sm font-black tracking-widest border border-brand-green/20 mb-3">FAI ⭐</div>
                <h3 className="text-xl font-bold text-brand-foreground/80 mb-2 leading-tight">Fellow of Ancient Intelligence</h3>
                <p className="text-sm text-brand-green font-bold uppercase tracking-wider">Specialization: Ayurwed</p>
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-brand-foreground/60 text-sm font-medium uppercase tracking-wide">Duration:</span>
                <span className="text-2xl font-extrabold text-brand-green">2 Years</span>
              </div>
              <p className="text-sm text-brand-foreground/70 mb-8 h-16 text-center">Our standout credential demonstrating mastery, research, leadership, and professional excellence.</p>
              
              <ul className="space-y-4 mb-8">
                {['Everything in DAI', 'Mastery & Research Excellence', 'AI-Enhanced Professional Practice', 'Leadership in Wellness', 'Standout FAI Credential'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-foreground/80 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              
              <Link href="https://academy.ayurwed.com" target="_blank" className="block w-full text-center py-3.5 rounded-xl border-2 border-brand-green text-brand-green font-bold hover:bg-brand-green hover:text-white transition-colors">
                Apply for FAI
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Final CTA */}
      <section className="py-20 bg-[#fdf6e3]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <BookOpen className="h-12 w-12 text-brand-gold mx-auto mb-2" />
          <h2 className="text-3xl font-extrabold text-brand-green">Ready to begin your journey?</h2>
          <p className="text-brand-foreground/70">Join thousands of students globally who are reclaiming their health and heritage.</p>
          <div className="pt-4">
            <Link href="https://academy.ayurwed.com" target="_blank" className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-green font-bold px-8 py-4 rounded-full hover:bg-brand-green hover:text-white transition-colors duration-300 shadow-xl">
              <Star className="h-5 w-5" /> Go to Learning Platform
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
