import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, GraduationCap, Star, CheckCircle2, Video, Users, Award, 
  ArrowRight, PlayCircle, Network, Leaf, Target, Cpu, Brain, FlaskConical, 
  Layers, ShieldCheck, Microscope, Database, Workflow, Sparkles, HelpCircle, FileText
} from 'lucide-react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import EnrollButton from '@/components/academy/EnrollButton';

export const metadata: Metadata = {
  title: 'Academy | AYURWED',
  description: 'Master the Ancient Extract Intelligence System (AEIS™) with our flagship Certificate in Ancient Intelligence (CAI) program.',
};

export default async function AcademyPage() {
  const session = await getServerSession(authOptions);
  let initialEnrolled = false;

  if (session?.user?.id) {
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: Number(session.user.id),
        course: { slug: 'cai' },
      },
    });
    initialEnrolled = !!enrollment;
  }

  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-background">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-36 bg-gradient-to-b from-brand-green/5 to-transparent">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-48 -left-24 w-72 h-72 bg-brand-green/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto layout-padding-minimal text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-4 border border-brand-gold/30">
            <Award className="h-4 w-4" /> Flagship Certification
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-brand-green tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto">
            Certificate in <span className="text-brand-gold relative">Ancient Intelligence.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-gold/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
            </span> <br className="hidden md:block" /> (CAI)
          </h1>
          
          <p className="text-lg sm:text-xl text-brand-foreground/80 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Understand, analyze, and apply humanity's ancient knowledge systems using modern scientific thinking and artificial intelligence. CAI serves as the educational foundation of the AYURWED ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#aeis" className="w-full sm:w-auto px-8 py-4 btn-green rounded-full text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
              Explore Program <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 btn-outline text-lg">
              <PlayCircle className="h-5 w-5" /> Introduction Video
            </button>
          </div>
        </div>
      </section>

      {/* 2. Program Overview & Philosophy */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto layout-padding-minimal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest border border-brand-green/20">
                <BookOpen className="h-4 w-4" /> Philosophy
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-green leading-tight">
                Ancient civilizations did not create products; they created intelligent systems.
              </h2>
              <p className="text-brand-foreground/70 text-lg leading-relaxed">
                Unlike traditional educational programs that focus on isolated products or remedies, CAI introduces learners to the <strong className="text-brand-green">Ancient Extract Intelligence System (AEIS™)</strong>—a structured framework that transforms ancient wisdom into an organized, scalable, and AI-enabled knowledge architecture.
              </p>
              <p className="text-brand-foreground/70 text-lg leading-relaxed">
                Most programs teach finished formulations. We teach the <strong className="text-brand-gold-dark">intelligence behind extracts</strong>, their properties, interactions, synergies, and applications. You will learn formulation logic rather than memorizing products.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-brand-green to-brand-green-dark rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
               <h3 className="text-2xl font-bold mb-6 relative z-10">Integrated Framework</h3>
               <ul className="space-y-4 relative z-10">
                 {[
                   'Ancient Knowledge Intelligence',
                   'Botanical Intelligence',
                   'Extract Intelligence',
                   'Combination Intelligence',
                   'Application Intelligence',
                   'Artificial Intelligence'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 font-semibold text-brand-green-light text-lg">
                     <CheckCircle2 className="h-5 w-5 text-brand-gold flex-shrink-0" /> {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why a Single Flagship Course? */}
      <section className="py-20 bg-brand-green text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
         <div className="max-w-4xl mx-auto layout-padding-minimal relative z-10 space-y-8">
            <ShieldCheck className="h-16 w-16 text-brand-gold mx-auto" />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Why a Single Flagship Course?</h2>
            <p className="text-xl text-brand-green-light max-w-2xl mx-auto leading-relaxed">
              The Academy follows a <strong className="text-brand-gold">quality-first philosophy</strong>. Instead of offering multiple disconnected courses, we focus on continuously improving one world-class certification program.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 text-left">
              {[
                'Deeper curriculum development',
                'Higher academic standards',
                'Continuous AI-assisted enhancement',
                'Consistent learner outcomes',
                'Stronger certification credibility',
                'Ongoing refinement based on data'
              ].map((benefit, i) => (
                <div key={i} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-start gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                   <Sparkles className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
                   <span className="text-sm font-medium text-white">{benefit}</span>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* 4. AEIS 6 Layers */}
      <section id="aeis" className="py-24 bg-[#fdf6e3] dark:bg-background">
        <div className="max-w-7xl mx-auto layout-padding-minimal">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green">The Ancient Extract Intelligence System (AEIS™)</h2>
            <p className="text-brand-foreground/70 max-w-2xl mx-auto text-lg">The CAI curriculum is structurally built around six fundamental layers of intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: BookOpen, title: '1. Ancient Knowledge', 
                desc: 'Understanding traditional systems of knowledge, observation, and wisdom.',
                topics: ['Origins of systems', 'Preservation traditions', 'Natural laws', 'Historical frameworks', 'Wisdom-based decisions']
              },
              { 
                icon: Leaf, title: '2. Botanical Intelligence', 
                desc: 'Understanding plants as highly evolved knowledge systems.',
                topics: ['Botanical classification', 'Traditional plant uses', 'Plant energetics', 'Functional categories', 'Historical applications']
              },
              { 
                icon: FlaskConical, title: '3. Extract Intelligence', 
                desc: 'The foundation of the Academy\'s proprietary methodology.',
                topics: ['Extraction science', 'Standardization principles', 'Active constituents', 'Potency and concentration', 'Quality assessment']
              },
              { 
                icon: Network, title: '4. Combination Intelligence', 
                desc: 'Understanding how multiple extracts work together synergistically.',
                topics: ['Synergy principles', 'Complementary actions', 'Supporting extracts', 'Combination architecture', 'Multi-target approaches']
              },
              { 
                icon: Target, title: '5. Application Intelligence', 
                desc: 'Translating extract intelligence into practical health outcomes.',
                topics: ['Wellness applications', 'Cognitive & Metabolic support', 'Stress and resilience', 'Performance optimization', 'Lifestyle integration']
              },
              { 
                icon: Cpu, title: '6. Artificial Intelligence', 
                desc: 'Using modern AI to expand and accelerate human understanding.',
                topics: ['AI-assisted learning', 'Knowledge graph exploration', 'Pattern discovery', 'Intelligent research', 'Predictive formulation']
              }
            ].map((layer, idx) => (
              <div key={idx} className="bg-card border border-border rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                <div className="bg-brand-green/5 group-hover:bg-brand-green/10 transition-colors w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <layer.icon className="h-7 w-7 text-brand-gold-dark" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-3">{layer.title}</h3>
                <p className="text-brand-foreground/70 text-sm mb-6 leading-relaxed flex-grow">{layer.desc}</p>
                <div className="bg-brand-green/5 rounded-xl p-4 mt-auto">
                  <ul className="space-y-2">
                    {layer.topics.map((topic, i) => (
                      <li key={i} className="text-xs text-brand-foreground/80 font-medium flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-brand-gold"></div> {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Curriculum Structure */}
      <section className="py-24 bg-card border-t border-border">
         <div className="max-w-4xl mx-auto layout-padding-minimal">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green">Curriculum Structure</h2>
              <p className="text-brand-foreground/70 text-lg">A 7-module comprehensive journey culminating in a practical Capstone Project.</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  mod: 'Module 1', title: 'Foundations of Ancient Intelligence',
                  outcomes: 'Understand intelligence beyond information, explore ancient traditions, and civilizational knowledge systems.',
                  assessment: 'AI-generated scenario analysis & foundational examination.'
                },
                {
                  mod: 'Module 2', title: 'Botanical Intelligence',
                  outcomes: 'Understand the role of plants in ancient systems, classification, and functional properties.',
                  assessment: 'Botanical intelligence case studies & AI tutor discussions.'
                },
                {
                  mod: 'Module 3', title: 'Extract Intelligence & Preparation-Based Prescription',
                  outcomes: 'Understand extracts as knowledge units. Learn extraction science, standardization, and preparation-based clinical prescription.',
                  assessment: 'AI-generated extraction scenarios & practical analysis.'
                },
                {
                  mod: 'Module 4', title: 'Combination Intelligence',
                  outcomes: 'Understand formulation architecture and how intelligent combinations are created synergistically.',
                  assessment: 'AI-generated formulation challenges & combination design.'
                },
                {
                  mod: 'Module 5', title: 'Digital Clinical Workflow & Patient Management',
                  outcomes: 'Master the AYURWED Ecosystem, patient management dashboards, and digital clinical workflows.',
                  assessment: 'Real-world application simulations & decision exercises.'
                },
                {
                  mod: 'Module 6', title: 'AI and the Ancient Intelligence Prescription Platform',
                  outcomes: 'Learn how to integrate the Ancient Intelligence Prescription Platform and AI-assisted learning for predictive research and diagnosis.',
                  assessment: 'AI-assisted exploration projects & knowledge synthesis.'
                },
                {
                  mod: 'Module 7', title: 'Capstone Project & Ecosystem Integration',
                  outcomes: 'Apply the AEIS™ to solve a contemporary challenge. Identify extracts, design combinations, prescribe preparations, and integrate into the AYURWED ecosystem.',
                  assessment: 'Evaluated by the AI Examiner and academic reviewers.'
                }
              ].map((module, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 bg-[#fdf6e3] dark:bg-background border border-border p-6 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-brand-gold/50 transition-colors">
                  <div className="md:w-1/3 flex-shrink-0">
                     <span className="text-brand-gold font-black uppercase tracking-widest text-xs mb-1 block">{module.mod}</span>
                     <h3 className="text-xl font-bold text-brand-green leading-tight">{module.title}</h3>
                  </div>
                  <div className="md:w-2/3 space-y-4">
                     <div>
                       <span className="text-xs font-bold text-brand-foreground/50 uppercase tracking-wider block mb-1">Learning Outcomes</span>
                       <p className="text-sm text-brand-foreground/80 leading-relaxed">{module.outcomes}</p>
                     </div>
                     <div>
                       <span className="text-xs font-bold text-brand-foreground/50 uppercase tracking-wider block mb-1">Assessment</span>
                       <div className="inline-flex items-center gap-2 bg-brand-green/5 text-brand-green text-xs font-semibold px-3 py-1.5 rounded-lg">
                          <Brain className="h-3.5 w-3.5" /> {module.assessment}
                       </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* 6. AI-Powered Learning Experience */}
      <section className="py-24 bg-[#fdf6e3] dark:bg-background border-t border-border">
        <div className="max-w-7xl mx-auto layout-padding-minimal">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green mb-4">AI-Powered Learning Experience</h2>
            <p className="text-brand-foreground/70 max-w-2xl mx-auto text-lg">Every learner experiences a uniquely tailored journey powered by our proprietary educational AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
              <div className="bg-brand-green/5 group-hover:bg-brand-green/10 transition-colors w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-brand-gold-dark" />
              </div>
              <h3 className="text-xl font-bold text-brand-green mb-4">Personal AI Tutor</h3>
              <ul className="space-y-3 text-brand-foreground/80 text-sm font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Explains concepts simply</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Adapts to your learning style</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Identifies knowledge gaps</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Recommends pathways 24/7</li>
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group transform md:-translate-y-4">
              <div className="bg-brand-green/5 group-hover:bg-brand-green/10 transition-colors w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Workflow className="h-8 w-8 text-brand-gold-dark" />
              </div>
              <h3 className="text-xl font-bold text-brand-green mb-4">Dynamic Case Studies</h3>
              <ul className="space-y-3 text-brand-foreground/80 text-sm font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Personalized scenarios</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Adaptive difficulty</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Multi-perspective analysis</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> No two learners identical</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
              <div className="bg-brand-green/5 group-hover:bg-brand-green/10 transition-colors w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Microscope className="h-8 w-8 text-brand-gold-dark" />
              </div>
              <h3 className="text-xl font-bold text-brand-green mb-4">The AI Examiner</h3>
              <ul className="space-y-3 text-brand-foreground/80 text-sm font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Competency-based evaluation</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Tests analytical thinking</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Assesses problem-solving</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Evaluates ethical reasoning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Your Journey Beyond Certification (New Section) */}
      <section className="py-24 bg-brand-green text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-7xl mx-auto layout-padding-minimal relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-brand-gold/30">
              <Sparkles className="h-3.5 w-3.5" /> Premium Ecosystem
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Your Journey Beyond Certification
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-brand-green-light leading-relaxed">
              Completing the Certificate in Ancient Intelligence (CAI) makes eligible practitioners capable of applying to become an <strong>AYURWED Certified Consultant & Fulfillment Partner (ACFP)</strong>.
            </p>
            <p className="text-xs sm:text-sm text-brand-green-light/80 max-w-2xl mx-auto">
              This is not another course or certificate. It is a professional recognition and verified membership awarded to qualified practitioners who successfully complete clinical verification and become part of the trusted AYURWED network.
            </p>
          </div>

          {/* Flowchart Timeline */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-6 gap-8 relative">
            {[
              { step: '01', title: 'Learn', desc: 'Acquire foundational knowledge of AEIS™.' },
              { step: '02', title: 'Certificate in Ancient Intelligence (CAI)', desc: 'Complete the flagship educational program.' },
              { step: '03', title: 'Apply for Verification', desc: 'Submit clinical credentials on your dashboard.' },
              { step: '04', title: 'Clinic & Practitioner Verification', desc: 'Undergo rigorous practitioner & clinic verification.' },
              { step: '05', title: 'Become AYURWED Certified Consultant & Fulfillment Partner (ACFP)', desc: 'Awarded premium badge and verified network status.' },
              { step: '06', title: 'Start Receiving Patients', desc: 'Start providing end-to-end care and medicine fulfillment.' }
            ].map((node, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 group relative">
                {/* Step Circle */}
                <div className="w-14 h-14 rounded-full bg-[#fdf6e3] text-brand-green border-4 border-brand-gold flex items-center justify-center font-black text-sm shadow-md group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-green transition-all duration-300 relative z-10">
                  {node.step}
                </div>
                {/* Text */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-brand-gold text-sm sm:text-base">{node.title}</h4>
                  <p className="text-[11px] sm:text-xs text-brand-green-light/80 leading-relaxed max-w-[160px] mx-auto">
                    {node.desc}
                  </p>
                </div>
                {/* Arrow connector */}
                {i < 5 && (
                  <div className="hidden md:block absolute top-7 left-[65%] w-[70%] h-0.5 border-t border-dashed border-brand-gold/30 -z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Outcomes & CTA */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto layout-padding-minimal">
          <div className="bg-[#fdf6e3] dark:bg-background border border-border rounded-[2.5rem] p-8 sm:p-12 text-center shadow-xl">
             <GraduationCap className="h-16 w-16 text-brand-gold mx-auto mb-6" />
             <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green mb-6">Become a Certified Expert</h2>
             
             <p className="text-brand-foreground/70 text-lg mb-10 max-w-2xl mx-auto">
               Upon completion, graduates will possess the ability to bridge Ancient Intelligence, Extract Intelligence, and Artificial Intelligence—creating solutions for health, research, and enterprise.
             </p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-3xl mx-auto mb-12">
               {[
                 'Analyze botanical and extract intelligence',
                 'Design intelligent extract combinations',
                 'Apply ancient principles to modern challenges',
                 'Utilize AI for research and discovery',
                 'Think systematically across disciplines',
                 'Contribute to the evolution of AEIS™'
               ].map((outcome, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-brand-foreground/80">{outcome}</span>
                  </div>
               ))}
             </div>

             <EnrollButton isLoggedIn={!!session} initialEnrolled={initialEnrolled} />
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/919271711722?text=Hello%20AYURWED,%20I%20have%20an%20enquiry%20regarding%20the%20Certificate%20in%20Ancient%20Intelligence%20(CAI)%20program."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-[31px] z-50 bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:bg-[#20ba56] transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 flex items-center justify-center group"
        aria-label="Enquire on WhatsApp"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out text-white font-bold whitespace-nowrap text-xs">
          Enquire on WhatsApp
        </span>
      </a>

    </div>
  );
}
