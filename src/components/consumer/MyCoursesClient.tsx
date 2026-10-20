'use client';

import React, { useState } from 'react';
import { BookOpen, Trophy, Clock, CheckCircle2, Award, PlayCircle, Lock, Sparkles, FileText, ChevronDown, ChevronUp, Download, ArrowRight, Brain, Cpu, FlaskConical, Network, Target, X, Check, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Enrollment {
  id: number; progress: number; completedAt: string | null; certificateUrl: string | null; createdAt: string;
  course: { id: number; title: string; slug: string; thumbnail: string; description: string; lessons: { id: number }[] };
}

interface MyCoursesClientProps {
  initialEnrollments: Enrollment[];
  isVerifiedDoctor?: boolean;
  doctorDegree?: string | null;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MODULE_QUIZZES: Record<number, { title: string; questions: QuizQuestion[] }> = {
  1: {
    title: 'Module 1 Assessment: Foundations of Ancient Intelligence',
    questions: [
      {
        id: 1,
        question: 'What fundamentally distinguishes the Ancient Extract Intelligence System (AEIS™) from traditional product-based learning?',
        options: [
          'It focuses on finished commercial remedies.',
          'It treats plants and extracts as structured information systems and formulation logic.',
          'It relies purely on modern chemical synthesis.',
          'It avoids botanical classification entirely.'
        ],
        correctIndex: 1,
        explanation: 'AEIS™ teaches formulation architecture and extract intelligence rather than memorizing fixed finished products.'
      },
      {
        id: 2,
        question: 'According to AEIS™ principles, how did ancient knowledge systems view natural laws?',
        options: [
          'As isolated, disconnected phenomena.',
          'As holistic, self-organizing intelligence models.',
          'As obsolete historical artifacts.',
          'As strictly synthetic compounds.'
        ],
        correctIndex: 1,
        explanation: 'Ancient knowledge systems observed nature as an interconnected, self-organizing intelligence system.'
      }
    ]
  },
  2: {
    title: 'Module 2 Assessment: Botanical Intelligence',
    questions: [
      {
        id: 1,
        question: 'In Botanical Intelligence, plants are primarily evaluated as:',
        options: [
          'Static biomass.',
          'Highly evolved information preservation systems.',
          'Single-constituent industrial chemicals.',
          'Decorative garden species.'
        ],
        correctIndex: 1,
        explanation: 'Plants synthesize complex phytochemicals to respond to environment and preserve evolutionary wisdom.'
      }
    ]
  },
  3: {
    title: 'Module 3 Assessment: Extract Intelligence & Preparation Science',
    questions: [
      {
        id: 1,
        question: 'Why are standardized extracts preferred over crude botanical powders in preparation-based prescribing?',
        options: [
          'They have cheaper production costs.',
          'They provide consistent potency, bio-availability, and quantifiable active constituents.',
          'They do not require quality testing.',
          'They eliminate active phytochemicals.'
        ],
        correctIndex: 1,
        explanation: 'Standardization ensures reliable clinical efficacy and consistent active phytochemical concentrations.'
      }
    ]
  }
};

export default function MyCoursesClient({
  initialEnrollments,
  isVerifiedDoctor = false,
  doctorDegree = null,
}: MyCoursesClientProps) {
  const enrollment = initialEnrollments[0] || null;
  const [activeModule, setActiveModule] = useState<number | null>(1);
  const [userProgress, setUserProgress] = useState<number>(enrollment?.progress || 0);

  // Quiz Modal State
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const modules = [
    {
      id: 1,
      number: 'Module 1',
      title: 'Foundations of Ancient Intelligence',
      duration: '2.5 Hours',
      icon: BookOpen,
      trackBadge: 'Universal',
      summary: 'Understand intelligence beyond information, explore ancient traditions, civilizational knowledge systems, and natural laws.',
      lessons: [
        { id: 101, title: '1.1 Introduction to Ancient Knowledge Systems', duration: '25 min', type: 'VIDEO' },
        { id: 102, title: '1.2 Civilizational Information Preservation', duration: '35 min', type: 'VIDEO' },
        { id: 103, title: '1.3 Natural Laws vs Product Mindset', duration: '40 min', type: 'ARTICLE' },
        { id: 104, title: '1.4 Module 1 Assessment & AI Scenario Analysis', duration: '50 min', type: 'QUIZ' },
      ]
    },
    {
      id: 2,
      number: 'Module 2',
      title: 'Botanical Intelligence',
      duration: '3.0 Hours',
      icon: Brain,
      trackBadge: 'Universal',
      summary: 'Plants as highly evolved knowledge systems, botanical classification, plant energetics, and functional categories.',
      lessons: [
        { id: 201, title: '2.1 Plants as Information Systems', duration: '30 min', type: 'VIDEO' },
        { id: 202, title: '2.2 Botanical Energetics & Classification', duration: '45 min', type: 'VIDEO' },
        { id: 203, title: '2.3 Traditional Functional Categories', duration: '45 min', type: 'ARTICLE' },
        { id: 204, title: '2.4 Botanical Intelligence Case Study Evaluation', duration: '60 min', type: 'QUIZ' },
      ]
    },
    {
      id: 3,
      number: 'Module 3',
      title: 'Extract Intelligence & Preparation-Based Formulations',
      duration: '4.0 Hours',
      icon: FlaskConical,
      trackBadge: 'Universal',
      summary: 'The core foundation of AEIS™. Learn extraction science, active constituents, potency, and preparation-based formulation principles.',
      lessons: [
        { id: 301, title: '3.1 Extraction Science & Bio-availability', duration: '45 min', type: 'VIDEO' },
        { id: 302, title: '3.2 Standardized Extracts vs Crude Botanicals', duration: '50 min', type: 'VIDEO' },
        { id: 303, title: '3.3 Formulation Logic using Extract Preparations', duration: '60 min', type: 'ARTICLE' },
        { id: 304, title: '3.4 Practical Formulation & Extraction Exam', duration: '85 min', type: 'QUIZ' },
      ]
    },
    {
      id: 4,
      number: 'Module 4',
      title: 'Combination Intelligence',
      duration: '3.5 Hours',
      icon: Network,
      trackBadge: 'Universal',
      summary: 'Formulation architecture, synergistic combination principles, multi-target botanical approaches, and extract interaction.',
      lessons: [
        { id: 401, title: '4.1 Synergistic Extraction Architecture', duration: '40 min', type: 'VIDEO' },
        { id: 402, title: '4.2 Complementary Extract Dynamics', duration: '50 min', type: 'VIDEO' },
        { id: 403, title: '4.3 Multi-Target Formulation Design', duration: '55 min', type: 'ARTICLE' },
        { id: 404, title: '4.4 Combination Design Assessment', duration: '65 min', type: 'QUIZ' },
      ]
    },
    isVerifiedDoctor ? {
      id: 5,
      number: 'Module 5',
      title: `Digital Clinical Workflow & AI Prescription Studio (${doctorDegree || 'Doctor Track'})`,
      duration: '3.5 Hours',
      icon: Target,
      trackBadge: '🩺 Verified Doctor Track',
      summary: 'Specialized Track for Verified Practitioners: Mastering patient management, digital prescription writers, dosage formulation, and AIPE clinical workflows.',
      lessons: [
        { id: 501, title: '5.1 Modern Digital Clinical Workflows & Patient Intake', duration: '35 min', type: 'VIDEO' },
        { id: 502, title: '5.2 AIPE Digital Prescription Writer & Dosage Calculator', duration: '45 min', type: 'VIDEO' },
        { id: 503, title: '5.3 Patient Protocol Management & Follow-up Design', duration: '50 min', type: 'ARTICLE' },
        { id: 504, title: '5.4 Real-World Clinical Simulation & Assessment', duration: '50 min', type: 'QUIZ' },
      ]
    } : {
      id: 5,
      number: 'Module 5',
      title: 'Personal Wellness Architecture & AEIS™ Applications',
      duration: '3.0 Hours',
      icon: Target,
      trackBadge: '🌱 Universal Wellness Track',
      summary: 'Translating Ancient Extract Intelligence System (AEIS™) principles into personal wellness, preventive health architecture, and lifestyle optimization.',
      lessons: [
        { id: 501, title: '5.1 Personal Wellness Architecture & Daily Regimen', duration: '35 min', type: 'VIDEO' },
        { id: 502, title: '5.2 Preventive Extract Application in Daily Life', duration: '40 min', type: 'VIDEO' },
        { id: 503, title: '5.3 Lifestyle & Functional Integration Protocols', duration: '45 min', type: 'ARTICLE' },
        { id: 504, title: '5.4 Personal Health Case Study Evaluation', duration: '50 min', type: 'QUIZ' },
      ]
    },
    {
      id: 6,
      number: 'Module 6',
      title: 'AI & Ancient Intelligence Discovery Platform',
      duration: '4.5 Hours',
      icon: Cpu,
      trackBadge: 'Universal AI',
      summary: 'Integrating Ancient Intelligence Prescription Platform and AI-assisted learning for predictive research, pattern discovery, and knowledge synthesis.',
      lessons: [
        { id: 601, title: '6.1 AI Architecture in Traditional Medicine', duration: '50 min', type: 'VIDEO' },
        { id: 602, title: '6.2 Predictive Formulation & Knowledge Graphs', duration: '60 min', type: 'VIDEO' },
        { id: 603, title: '6.3 Decision Support Systems & AI Exploration', duration: '60 min', type: 'ARTICLE' },
        { id: 604, title: '6.4 AI-Assisted Knowledge Synthesis Project', duration: '100 min', type: 'QUIZ' },
      ]
    },
    {
      id: 7,
      number: 'Module 7',
      title: isVerifiedDoctor ? 'Clinical Capstone Project & ACP Certification' : 'Universal Capstone Project & CAI Certification',
      duration: '5.0 Hours',
      icon: Trophy,
      trackBadge: isVerifiedDoctor ? '🩺 Doctor Capstone' : '🎓 General Capstone',
      summary: isVerifiedDoctor
        ? 'Final graduation project for Practitioners. Design an AI-assisted clinical solution, evaluated by the AI Examiner to earn AYURWED Certified Practitioner (ACP) status.'
        : 'Final graduation project. Apply the AEIS™ framework to design a wellness solution, evaluated by the AI Examiner to earn your CAI Certificate.',
      lessons: [
        { id: 701, title: '7.1 Capstone Proposal & Methodology', duration: '60 min', type: 'ARTICLE' },
        { id: 702, title: '7.2 AI Examiner Defense & Submission', duration: '120 min', type: 'QUIZ' },
        { id: 703, title: '7.3 Final CAI Credential Verification', duration: '60 min', type: 'ARTICLE' },
      ]
    }
  ];

  const handleStartLesson = (lesson: { id: number; title: string; type: string }, moduleId: number) => {
    if (lesson.type === 'QUIZ') {
      setActiveQuizModuleId(moduleId);
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
      setQuizScore(null);
    } else {
      toast.success(`Opening ${lesson.title}...`, { icon: '📖' });
    }
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuizModuleId) return;
    const quizData = MODULE_QUIZZES[activeQuizModuleId] || MODULE_QUIZZES[1];
    let correctCount = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / quizData.questions.length) * 100);
    setQuizScore(scorePercentage);
    setIsQuizSubmitted(true);

    if (scorePercentage >= 50) {
      const newProg = Math.min(userProgress + 15, 100);
      setUserProgress(newProg);
      toast.success(`Passed! AI Examiner Score: ${scorePercentage}%. Progress updated to ${newProg}%. 🎉`);
    } else {
      toast.error(`Score: ${scorePercentage}%. Review module concepts and try again.`);
    }
  };

  if (!enrollment) {
    return (
      <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm space-y-5 max-w-2xl mx-auto">
        <Award className="h-16 w-16 text-brand-gold mx-auto animate-pulse-slow" />
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-brand-green">Not Enrolled Yet</h3>
          <p className="text-sm text-muted-foreground">
            Enroll in our flagship <strong>Certificate in Ancient Intelligence (CAI)</strong> program to access course lessons, AI tutors, and earn your official certification credential.
          </p>
        </div>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-full font-extrabold text-sm hover:bg-brand-gold hover:text-brand-green transition-all shadow-md"
        >
          View CAI Program Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const isCompleted = enrollment.completedAt || userProgress >= 100;
  const currentQuizData = activeQuizModuleId ? (MODULE_QUIZZES[activeQuizModuleId] || MODULE_QUIZZES[1]) : null;

  return (
    <div className="space-y-8">
      {/* Flagship CAI Hero Card */}
      <div className="bg-gradient-to-r from-brand-green via-[#0f381b] to-brand-green text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-brand-green-light/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -z-0" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
              <Award className="h-4 w-4" /> Flagship Certification
            </div>

            {isCompleted ? (
              <span className="bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                <Trophy className="h-4 w-4" /> CAI Certified Graduate
              </span>
            ) : (
              <span className="bg-white/10 text-brand-gold font-bold text-xs px-3.5 py-1.5 rounded-full border border-white/10">
                Enrollment Active
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Certificate in Ancient Intelligence (CAI)
            </h2>
            <p className="text-sm sm:text-base text-brand-green-light/90 max-w-3xl leading-relaxed">
              Master the Ancient Extract Intelligence System (AEIS™) across 7 comprehensive modules. Bridge traditional wisdom, botanical extract science, and artificial intelligence.
            </p>
          </div>

          {/* Progress Bar & Actions */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-brand-green-light uppercase tracking-wider">Overall Course Progress</span>
              <span className="text-brand-gold text-sm">{userProgress}% Completed</span>
            </div>

            <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-brand-gold via-amber-400 to-emerald-400 rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${Math.max(userProgress, 5)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-white/70 flex items-center gap-4">
                <span>✓ 7 Modules</span>
                <span>•</span>
                <span>✓ 27 Lessons</span>
                <span>•</span>
                <span>✓ AI Tutor Active</span>
              </div>

              {isCompleted ? (
                <button
                  onClick={() => toast.success('Certificate download link generated! Available in your profile.')}
                  className="bg-brand-gold text-brand-green font-extrabold text-xs px-6 py-2.5 rounded-full hover:bg-white transition-all shadow-md flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download CAI Certificate
                </button>
              ) : (
                <button
                  onClick={() => {
                    const newProg = Math.min(userProgress + 15, 100);
                    setUserProgress(newProg);
                    toast.success(`Module progress saved! Course is now ${newProg}% complete.`);
                  }}
                  className="bg-brand-gold text-brand-green font-extrabold text-xs px-6 py-2.5 rounded-full hover:bg-white transition-all shadow-md flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" /> Continue Learning
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Module Accordions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-brand-green flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-gold" /> CAI Program Curriculum Modules
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">7 Modules • Self-Paced</span>
        </div>

        <div className="space-y-3">
          {modules.map((m) => {
            const isOpen = activeModule === m.id;
            const ModuleIcon = m.icon;
            return (
              <div
                key={m.id}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveModule(isOpen ? null : m.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl flex-shrink-0">
                      <ModuleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-brand-gold-dark uppercase tracking-widest block mb-0.5">
                        {m.number} • {m.duration}
                      </span>
                      <h4 className="font-extrabold text-base text-foreground leading-tight">{m.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block font-medium">
                      {m.lessons.length} Lessons
                    </span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-border/50 space-y-4 animate-in fade-in duration-150">
                    <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/30 p-3 rounded-xl">
                      {m.summary}
                    </p>

                    <div className="space-y-2">
                      {m.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-card border border-border/60 rounded-xl hover:border-brand-green/30 transition-all text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.type === 'QUIZ' ? (
                              <Brain className="h-4 w-4 text-brand-gold shrink-0" />
                            ) : (
                              <PlayCircle className="h-4 w-4 text-brand-green shrink-0" />
                            )}
                            <span className="font-bold text-foreground">{lesson.title}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground font-semibold">{lesson.duration}</span>
                            <button
                              type="button"
                              onClick={() => handleStartLesson(lesson, m.id)}
                              className={`px-3.5 py-1 font-bold rounded-lg transition-colors ${
                                lesson.type === 'QUIZ'
                                  ? 'bg-brand-gold text-brand-green hover:bg-brand-green hover:text-white'
                                  : 'bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white'
                              }`}
                            >
                              {lesson.type === 'QUIZ' ? 'Take Quiz' : 'Start'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Examiner Module Quiz Modal */}
      {activeQuizModuleId && currentQuizData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-card rounded-3xl overflow-hidden border border-border shadow-2xl space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-brand-gold" />
                <h3 className="font-bold text-brand-green text-base sm:text-lg">
                  {currentQuizData.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuizModuleId(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {currentQuizData.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-sm text-foreground">
                    {idx + 1}. {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = 'bg-card border-border hover:border-brand-green/50 text-foreground';
                      if (isSelected) {
                        btnStyle = 'bg-brand-green text-white border-brand-green font-bold';
                      }
                      if (isQuizSubmitted) {
                        if (isCorrect) btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-600';
                        else if (isSelected && !isCorrect) btnStyle = 'bg-rose-600 text-white font-bold border-rose-600';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isQuizSubmitted && isCorrect && <Check className="h-4 w-4 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {isQuizSubmitted && (
                    <div className="mt-2 p-3 bg-brand-green/10 rounded-xl text-xs text-brand-green font-semibold">
                      💡 <strong>AI Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              {quizScore !== null ? (
                <div className="text-sm font-bold text-brand-green">
                  AI Examiner Score: <span className="text-brand-gold text-base">{quizScore}%</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground font-medium">
                  Select your answers and submit for evaluation.
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveQuizModuleId(null)}
                  className="px-4 py-2 border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted"
                >
                  Close
                </button>

                {!isQuizSubmitted && (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < currentQuizData.questions.length}
                    className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      Object.keys(selectedAnswers).length < currentQuizData.questions.length
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green shadow-sm'
                    }`}
                  >
                    Submit to AI Examiner
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
