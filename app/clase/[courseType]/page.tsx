'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { courseModules, TOTAL_MODULES, courseTypeNames } from '@/lib/courseContent';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CourseProgress {
  lessons_completed: number[];
  completed_at: string | null;
}

interface Certificate {
  id: string;
  certificate_number: string;
  verification_code: string;
}

export default function CourseOverviewPage() {
  const params = useParams();
  const courseType = params.courseType as string;
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const supabase = createClient();

  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      // Check if user has purchased this course
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .or(`course_type.eq.${courseType},course_type.eq.bundle`)
        .eq('status', 'active')
        .limit(1);

      const purchase = purchases?.[0];

      if (!purchase) {
        window.location.href = '/panel';
        return;
      }

      // Check for existing certificate
      const { data: certData } = await supabase
        .from('certificates')
        .select('id, certificate_number, verification_code')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .single();

      if (certData) {
        setCertificate(certData);
      }

      // Get or create progress
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .single();

      if (progressData) {
        setProgress(progressData);
      } else {
        // Create initial progress
        const { data: newProgress } = await supabase
          .from('course_progress')
          .insert({
            user_id: user.id,
            course_type: courseType,
            current_lesson: 1,
            lessons_completed: []
          })
          .select()
          .single();
        
        setProgress(newProgress);
      }

      setLoading(false);
      
      // Trigger animations
      setTimeout(() => setPageReady(true), 100);
    };

    loadProgress();
  }, [courseType]);

  // Animate progress bar after page ready
  useEffect(() => {
    if (pageReady && progress) {
      const targetProgress = (progress.lessons_completed?.length || 0) / TOTAL_MODULES * 100;
      setTimeout(() => setAnimatedProgress(targetProgress), 300);
    }
  }, [pageReady, progress]);

  const isModuleCompleted = (moduleId: number) => {
    return progress?.lessons_completed?.includes(moduleId) || false;
  };

  const isModuleUnlocked = (moduleId: number) => {
    if (moduleId === 1) return true;
    return isModuleCompleted(moduleId - 1);
  };

  const allModulesCompleted = () => {
    return (progress?.lessons_completed?.length || 0) === TOTAL_MODULES;
  };

  // Find the next lesson to take (first unlocked but not completed)
  const getNextLessonId = () => {
    for (const module of courseModules) {
      if (isModuleUnlocked(module.id) && !isModuleCompleted(module.id)) {
        return module.id;
      }
    }
    return null;
  };

  const completedCount = progress?.lessons_completed?.length || 0;
  const nextLessonId = getNextLessonId();

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="4"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none" 
                stroke="#7EC8E3" 
                strokeWidth="4"
                strokeLinecap="round" 
                strokeDasharray="60 191"
                className="animate-spin origin-center"
                style={{ animationDuration: '1.5s' }}
              />
              <circle
                cx="50" cy="50" r="28"
                fill="none" 
                stroke="#77DD77" 
                strokeWidth="3"
                strokeLinecap="round" 
                strokeDasharray="40 136"
                className="animate-spin origin-center"
                style={{ animationDuration: '2s', animationDirection: 'reverse' }}
              />
            </svg>
          </div>
          <p className="text-white/70 text-lg">Cargando clase...</p>
        </div>
      </main>
    );
  }

  const courseName = courseTypeNames[courseType as keyof typeof courseTypeNames]?.es || 'Clase';

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <Link href="/panel" className="text-[#7EC8E3] hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Title Section */}
        <section className={`mb-8 transition-all duration-700 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {courseName}
          </h1>
          <p className="text-white/60">
            {certificate 
              ? '¡Ha completado esta clase exitosamente!'
              : allModulesCompleted()
                ? 'Todas las lecciones completadas. ¡Tome el examen para obtener su certificado!'
                : 'Complete todas las lecciones para desbloquear el examen final.'
            }
          </p>
          <p className="text-white/40 text-sm mt-1">
            ~4 horas en total • {TOTAL_MODULES} lecciones
          </p>
        </section>

        {/* Certificate Banner (if completed) */}
        {certificate && (
          <section className={`mb-8 transition-all duration-700 delay-100 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="bg-[#77DD77]/15 border border-[#77DD77]/30 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#77DD77]">¡Clase Completada!</h2>
                    <p className="text-white/70 text-sm">
                      Certificado: <span className="font-mono font-bold text-white">{certificate.certificate_number}</span>
                    </p>
                  </div>
                </div>
                <Link
                  href={`/certificado/${certificate.id}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#77DD77] text-[#1C1C1C] px-6 py-3 rounded-xl font-bold hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Certificado
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Progress Bar */}
        <section className={`mb-8 transition-all duration-700 delay-150 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-[#2A2A2A] rounded-xl border border-white/10 p-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-white/60">Progreso de la Clase</span>
              <span className="text-white font-medium">{completedCount} de {TOTAL_MODULES} lecciones</span>
            </div>
            <div className="relative w-full bg-[#1C1C1C] rounded-full h-3 border border-white/10 overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7EC8E3] to-[#77DD77] rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${animatedProgress}%`,
                  boxShadow: animatedProgress > 0 ? '0 0 12px rgba(126, 200, 227, 0.4)' : 'none'
                }}
              />
            </div>
          </div>
        </section>

        {/* Lessons List */}
        <section className={`mb-8 transition-all duration-700 delay-200 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Lecciones
          </h2>
          
          <div className="space-y-3">
            {courseModules.map((module, index) => {
              const completed = isModuleCompleted(module.id);
              const unlocked = isModuleUnlocked(module.id);
              const isNext = module.id === nextLessonId;

              return (
                <div 
                  key={module.id}
                  className={`rounded-xl border p-4 md:p-5 transition-all ${
                    completed 
                      ? 'bg-[#77DD77]/10 border-[#77DD77]/30' 
                      : isNext
                        ? 'bg-[#7EC8E3]/10 border-[#7EC8E3]/50 ring-2 ring-[#7EC8E3]/30'
                        : unlocked 
                          ? 'bg-[#2A2A2A] border-white/10 hover:border-white/20' 
                          : 'bg-[#2A2A2A]/50 border-white/5 opacity-50'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 30}ms`,
                    opacity: pageReady ? (unlocked ? 1 : 0.5) : 0,
                    transform: pageReady ? 'translateY(0)' : 'translateY(10px)'
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Lesson Number / Checkmark */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        completed 
                          ? 'bg-[#77DD77] text-[#1C1C1C]' 
                          : isNext
                            ? 'bg-[#7EC8E3] text-[#1C1C1C]'
                            : unlocked 
                              ? 'bg-white/10 text-white' 
                              : 'bg-white/5 text-white/30'
                      }`}>
                        {completed ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          module.id
                        )}
                      </div>
                      
                      {/* Lesson Info */}
                      <div className="min-w-0">
                        <h3 className={`font-semibold text-sm md:text-base truncate ${
                          completed || unlocked ? 'text-white' : 'text-white/40'
                        }`}>
                          {module.titleEs}
                        </h3>
                        <p className="text-xs md:text-sm text-white/50">{module.estimatedTime}</p>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {unlocked ? (
                      <Link
                        href={`/clase/${courseType}/${module.slug}`}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 text-sm ${
                          completed 
                            ? 'bg-[#77DD77]/20 text-[#77DD77] hover:bg-[#77DD77]/30'
                            : isNext
                              ? 'bg-[#7EC8E3] text-[#1C1C1C] hover:bg-[#9DD8F3] shadow-md shadow-[#7EC8E3]/25'
                              : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {completed ? 'Revisar' : isNext ? 'Continuar' : 'Comenzar'}
                      </Link>
                    ) : (
                      <span className="text-xs text-white/40 flex items-center gap-1 flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Bloqueado
                      </span>
                    )}
                  </div>
                  
                  {/* "Next Up" Badge */}
                  {isNext && !completed && (
                    <div className="mt-3 pt-3 border-t border-[#7EC8E3]/20">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7EC8E3]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7EC8E3] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7EC8E3]"></span>
                        </span>
                        Siguiente lección
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Exam Card (only show if no certificate yet) */}
        {!certificate && (
          <section className={`transition-all duration-700 delay-300 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className={`rounded-2xl border p-6 ${
              allModulesCompleted() 
                ? 'bg-[#FFB347]/10 border-[#FFB347]/30' 
                : 'bg-[#2A2A2A]/50 border-white/5'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  allModulesCompleted() 
                    ? 'bg-[#FFB347]/20 border-2 border-[#FFB347]/40' 
                    : 'bg-white/5'
                }`}>
                  <svg className={`w-6 h-6 ${allModulesCompleted() ? 'text-[#FFB347]' : 'text-white/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${allModulesCompleted() ? 'text-[#FFB347]' : 'text-white/40'}`}>
                    Examen Final
                  </h3>
                  
                  {allModulesCompleted() ? (
                    <>
                      <p className="text-white/70 text-sm mt-1 mb-4">
                        ¡Ha completado todas las lecciones! Necesita 70% para aprobar. Puede retomarlo sin límite.
                      </p>
                      <Link
                        href={`/clase/${courseType}/examen`}
                        className="inline-flex items-center gap-2 bg-[#FFB347] text-[#1C1C1C] px-6 py-3 rounded-xl font-bold hover:bg-[#FFC05C] transition-all hover:shadow-lg hover:shadow-[#FFB347]/25 active:scale-[0.98]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tomar Examen Final
                      </Link>
                    </>
                  ) : (
                    <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Complete las {TOTAL_MODULES - completedCount} lecciones restantes para desbloquear.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Help Link */}
        <section className={`mt-8 text-center transition-all duration-700 delay-400 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-white/40 text-sm">
            ¿Tiene preguntas?{' '}
            <a 
              href="mailto:info@claseparapadres.com" 
              className="text-[#7EC8E3] hover:text-[#9DD8F3] transition-colors underline underline-offset-2"
            >
              Contáctenos
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}