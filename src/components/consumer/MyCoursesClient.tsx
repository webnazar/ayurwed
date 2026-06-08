'use client';

import React, { useMemo } from 'react';
import { BookOpen, Trophy, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Enrollment {
  id: number; progress: number; completedAt: string | null; certificateUrl: string | null; createdAt: string;
  course: { id: number; title: string; slug: string; thumbnail: string; description: string; lessons: { id: number }[] };
}

export default function MyCoursesClient({ initialEnrollments }: { initialEnrollments: Enrollment[] }) {
  const stats = useMemo(() => ({
    enrolled: initialEnrollments.length,
    inProgress: initialEnrollments.filter(e => e.progress > 0 && !e.completedAt).length,
    completed: initialEnrollments.filter(e => !!e.completedAt).length,
    certificates: initialEnrollments.filter(e => !!e.certificateUrl).length,
  }), [initialEnrollments]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled', value: stats.enrolled, icon: BookOpen, color: 'text-brand-green bg-brand-green-light' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Certificates', value: stats.certificates, icon: Trophy, color: 'text-indigo-600 bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-brand-green-border/10 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-extrabold text-brand-green">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      {initialEnrollments.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-brand-green-border/10 shadow-sm space-y-4">
          <BookOpen className="h-14 w-14 text-brand-gold mx-auto animate-pulse-slow" />
          <h3 className="text-xl font-bold text-brand-green">No Courses Yet</h3>
          <p className="text-sm text-brand-foreground/60">Explore Ayurvedic wellness courses and start learning.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialEnrollments.map(e => {
            const totalLessons = e.course.lessons?.length || 0;
            const completedLessons = Math.round((e.progress / 100) * totalLessons);
            return (
              <div key={e.id} className="bg-white rounded-3xl overflow-hidden border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
                <div className="relative h-44 overflow-hidden bg-brand-green-light">
                  <img src={e.course.thumbnail} alt={e.course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {e.completedAt && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> Completed
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-brand-green line-clamp-2 group-hover:text-brand-gold transition-colors">{e.course.title}</h3>
                    <p className="text-xs text-brand-foreground/60 line-clamp-2">{e.course.description}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-brand-foreground/60 mb-1.5">
                        <span>{completedLessons}/{totalLessons} lessons</span>
                        <span className="font-bold text-brand-green">{e.progress}%</span>
                      </div>
                      <div className="h-2 bg-brand-green-light rounded-full overflow-hidden">
                        <div className="h-full bg-brand-green rounded-full transition-all duration-700" style={{ width: `${e.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 rounded-2xl bg-brand-green text-white text-xs font-bold hover:bg-brand-gold hover:text-brand-green transition-colors">
                        {e.progress === 0 ? 'Start Learning' : e.completedAt ? 'Review Course' : 'Continue'}
                      </button>
                      {e.certificateUrl && (
                        <a href={e.certificateUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-2.5 rounded-2xl border border-brand-green/20 text-brand-green text-xs font-bold hover:bg-brand-green-light transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" /> Cert
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
