'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { courseModules, TOTAL_MODULES, courseTypeNames } from '@/lib/courseContent';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ============================================
// TYPES
// ============================================

interface CourseProgress {
  lessons_completed: number[];
  completed_at: string | null;
  current_lesson: number;
}

interface Certificate {
  id: string;
  certificate_number: string;
  verification_code: string;
  issued_at: string;
}

type CourseState = 'welcome' | 'in-progress' | 'exam-ready' | 'complete';

// ============================================
// ANIMATION CONSTANTS
// ============================================

const ANIMATION = {
  PROGRESS_DELAY: 300,
  STAGGER_DELAY: 100,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function CourseOverviewPage() {
  const params = useParams();
  const courseType = params.courseType as string;
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
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

      // Check for certificate
      const { data: certData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .single();

      if (certData) {
        setCertificate(certData);
      }

      setLoading(false);
    };

    loadProgress();
  }, [courseType]);

  // Animate progress bar after load
  useEffect(() => {
    if (!loading && progress) {
      const targetPercent = (progress.lessons_completed.length / TOTAL_MODULES) * 100;
      const timer = setTimeout(() => {
        setAnimatedPercent(targetPercent);
      }, ANIMATION.PROGRESS_DELAY);
      return () => clearTimeout(timer);
    }
  }, [loading, progress]);

  // Helper functions
  const isModuleCompleted = (moduleId: number) => {
    return progress?.lessons_completed.includes(moduleId) || false;
  };

  const isModuleUnlocked = (moduleId: number) => {
    if (moduleId === 1) return true;
    return isModuleCompleted(moduleId - 1);
  };

  const allModulesCompleted = () => {
    return progress?.lessons_completed.length === TOTAL_MODULES;
  };

  const getCurrentModule = () => {
    // Find first incomplete module that's unlocked
    for (const module of courseModules) {
      if (!isModuleCompleted(module.id) && isModuleUnlocked(module.id)) {
        return module;
      }
    }
    return null;
  };

  const getCourseState = (): CourseState => {
    if (certificate) return 'complete';
    if (allModulesCompleted()) return 'exam-ready';
    if (progress && progress.lessons_completed.length > 0) return 'in-progress';
    return 'welcome';
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;
    setIsDownloading(true);
    // Small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = `/certificado/${certificate.id}`;
    setIsDownloading(false);
  };

  const completedCount = progress?.lessons_completed.length || 0;
  const courseState = getCourseState();
  const currentModule = getCurrentModule();
  const courseName = courseTypeNames[courseType as keyof typeof courseTypeNames]?.es || 'Curso';

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="#7EC8E3" strokeWidth="4"
                strokeLinecap="round" strokeDasharray="60 140"
              />
            </svg>
          </div>
          <p className="text-white/70">Cargando su curso...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-[#FFFFFF]/15">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link 
            href="/panel" 
            className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel
          </Link>
          <Link href="/" className="text-white font-semibold font-brand">
            Putting Kids First<sup className="text-[8px] relative -top-2">®</sup>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* State-Dependent Hero */}
        <section className="text-center mb-10">
          <StateHero 
            state={courseState} 
            courseName={courseName}
            completedCount={completedCount}
            totalCount={TOTAL_MODULES}
          />
        </section>

        {/* Progress Tracker */}
        <section className="mb-8">
          <ProgressTracker 
            completedCount={completedCount}
            totalCount={TOTAL_MODULES}
            animatedPercent={animatedPercent}
            courseState={courseState}
          />
        </section>

        {/* Certificate Section (if complete) */}
        {courseState === 'complete' && certificate && (
          <section className="mb-8">
            <CertificateCard 
              certificate={certificate}
              isDownloading={isDownloading}
              onDownload={handleDownloadCertificate}
            />
          </section>
        )}

        {/* Continue CTA (if in progress) */}
        {courseState !== 'complete' && currentModule && courseState !== 'exam-ready' && (
          <section className="mb-8">
            <Link
              href={`/curso/${courseType}/${currentModule.slug}`}
              className="w-full bg-[#77DD77] text-[#1C1C1C] py-5 px-6 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <PlayIcon className="w-6 h-6" />
              <span>
                {completedCount === 0 ? 'Comenzar' : 'Continuar'}: {currentModule.titleEs}
              </span>
            </Link>
          </section>
        )}

        {/* Exam CTA (if ready) */}
        {courseState === 'exam-ready' && (
          <section className="mb-8">
            <ExamCTA courseType={courseType} />
          </section>
        )}

        {/* Lessons List */}
        {courseState !== 'complete' && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Lecciones</h3>
            <div className="space-y-3">
              {courseModules.map((module, index) => {
                const completed = isModuleCompleted(module.id);
                const unlocked = isModuleUnlocked(module.id);
                const isCurrent = currentModule?.id === module.id;

                return (
                  <LessonCard
                    key={module.id}
                    module={module}
                    courseType={courseType}
                    completed={completed}
                    unlocked={unlocked}
                    isCurrent={isCurrent}
                    index={index}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Exam Card (locked state) */}
        {courseState !== 'complete' && courseState !== 'exam-ready' && (
          <section className="mb-8">
            <div className="bg-[#2A2A2A] rounded-xl border border-white/10 p-6 opacity-60">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <LockIcon className="w-6 h-6 text-white/40" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Examen Final</h3>
                  <p className="text-sm text-white/50">
                    Complete todas las lecciones para desbloquear el examen.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Help Section */}
        <section>
          <HelpSection />
        </section>
      </div>
    </main>
  );
}

// ============================================
// STATE HERO COMPONENT
// ============================================

function StateHero({ 
  state, 
  courseName,
  completedCount,
  totalCount 
}: { 
  state: CourseState; 
  courseName: string;
  completedCount: number;
  totalCount: number;
}) {
  const content = {
    welcome: {
      icon: <WelcomeIcon />,
      iconBg: 'bg-[#77DD77]/10 border-[#77DD77]/30',
      greeting: `¡Bienvenido a ${courseName}!`,
      message: 'Su inscripción está confirmada. Comience ahora y complete su requisito a su propio ritmo.',
    },
    'in-progress': {
      icon: <ProgressIcon />,
      iconBg: 'bg-[#7EC8E3]/10 border-[#7EC8E3]/30',
      greeting: '¡Buen Progreso!',
      message: `Ha completado ${completedCount} de ${totalCount} lecciones. Continúe donde lo dejó.`,
    },
    'exam-ready': {
      icon: <ExamReadyIcon />,
      iconBg: 'bg-[#FFB347]/10 border-[#FFB347]/30',
      greeting: '¡Listo Para el Examen!',
      message: 'Ha completado todas las lecciones. Apruebe el examen final para recibir su certificado.',
    },
    complete: {
      icon: <CompleteIcon />,
      iconBg: 'bg-[#77DD77]/10 border-[#77DD77]/30',
      greeting: '¡Felicidades!',
      message: 'Ha completado el curso exitosamente. Su certificado está listo para descargar.',
    },
  };

  const { icon, iconBg, greeting, message } = content[state];

  return (
    <div>
      <div className={`inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full border-2 ${iconBg}`}>
        {icon}
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
        {greeting}
      </h1>
      <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto">
        {message}
      </p>
    </div>
  );
}

// ============================================
// PROGRESS TRACKER COMPONENT
// ============================================

function ProgressTracker({ 
  completedCount, 
  totalCount, 
  animatedPercent,
  courseState 
}: { 
  completedCount: number; 
  totalCount: number; 
  animatedPercent: number;
  courseState: CourseState;
}) {
  return (
    <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-white/10">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Progreso del Curso</h2>
          <p className="text-sm text-white/60">
            {completedCount} de {totalCount} lecciones completadas
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[#77DD77]">
            {Math.round((completedCount / totalCount) * 100)}%
          </span>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="relative h-4 bg-[#1C1C1C] rounded-full overflow-hidden border border-white/10">
        {/* Ink fill effect */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#77DD77] via-[#88EE88] to-[#77DD77] rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${animatedPercent}%`,
            boxShadow: animatedPercent > 0 ? '0 0 20px rgba(119, 221, 119, 0.4)' : 'none',
          }}
        >
          {/* Ink edge glow */}
          {animatedPercent > 0 && animatedPercent < 100 && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-[#77DD77]/50"
              style={{ filter: 'blur(2px)' }}
            />
          )}
        </div>

        {/* Lesson markers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalCount - 1 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-white/5 last:border-r-0" />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{completedCount}</div>
          <div className="text-xs text-white/60">Completadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalCount - completedCount}</div>
          <div className="text-xs text-white/60">Restantes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {courseState === 'complete' ? (
              <span className="text-[#77DD77]">✓</span>
            ) : courseState === 'exam-ready' ? (
              <span className="text-[#FFB347]">!</span>
            ) : (
              '—'
            )}
          </div>
          <div className="text-xs text-white/60">Examen</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LESSON CARD COMPONENT
// ============================================

interface LessonCardProps {
  module: typeof courseModules[0];
  courseType: string;
  completed: boolean;
  unlocked: boolean;
  isCurrent: boolean;
  index: number;
}

function LessonCard({ module, courseType, completed, unlocked, isCurrent, index }: LessonCardProps) {
  const href = `/curso/${courseType}/${module.slug}`;
  
  const cardClasses = `
    block relative p-4 md:p-5 rounded-xl border-2 transition-all
    ${isCurrent 
      ? 'bg-[#77DD77]/10 border-[#77DD77]/50 hover:border-[#77DD77]' 
      : completed
        ? 'bg-[#2A2A2A] border-white/10 hover:border-white/20'
        : 'bg-[#1C1C1C] border-white/5 opacity-60 cursor-not-allowed'
    }
  `;

  const content = (
    <div className="flex items-center gap-4">
      {/* Lesson number / checkmark */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
        ${completed 
          ? 'bg-[#77DD77] text-[#1C1C1C]' 
          : isCurrent
            ? 'bg-[#7EC8E3] text-[#1C1C1C]'
            : 'bg-white/10 text-white/40'
        }
      `}>
        {completed ? (
          <CheckmarkIcon className="w-5 h-5" />
        ) : (
          module.id
        )}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-sm truncate ${completed || unlocked ? 'text-white' : 'text-white/40'}`}>
          {module.titleEs}
        </h4>
        <p className={`text-sm ${completed || unlocked ? 'text-white/60' : 'text-white/30'}`}>
          {module.estimatedTime}
        </p>
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0">
        {isCurrent && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7EC8E3]/20 text-[#7EC8E3] text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7EC8E3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7EC8E3]"></span>
            </span>
            {index === 0 ? 'Comenzar' : 'Continuar'}
          </span>
        )}
        {completed && !isCurrent && (
          <span className="text-[#77DD77] text-sm font-semibold">Completada</span>
        )}
        {!completed && !isCurrent && !unlocked && (
          <LockIcon className="w-5 h-5 text-white/20" />
        )}
      </div>
    </div>
  );

  if (unlocked) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {content}
    </div>
  );
}

// ============================================
// EXAM CTA COMPONENT
// ============================================

function ExamCTA({ courseType }: { courseType: string }) {
  return (
    <div className="relative bg-gradient-to-br from-[#7EC8E3]/20 to-[#7EC8E3]/5 rounded-2xl p-6 md:p-8 border-2 border-[#7EC8E3]/30 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7EC8E3]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#7EC8E3]/20 border-2 border-[#7EC8E3]/40">
          <ExamIcon className="w-8 h-8 text-[#7EC8E3]" />
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          ¡Es Hora del Examen Final!
        </h3>
        <p className="text-white/70 mb-6 max-w-md mx-auto text-sm md:text-base">
          Ha completado todas las lecciones. Apruebe el examen para recibir su certificado oficial aceptado por la corte.
        </p>
        
        <Link
          href={`/curso/${courseType}/examen`}
          className="inline-flex items-center gap-2 bg-[#7EC8E3] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#9DD8F3] transition-all hover:shadow-lg hover:shadow-[#7EC8E3]/25"
        >
          Comenzar Examen
          <ArrowRightIcon className="w-5 h-5" />
        </Link>

        <p className="text-white/50 text-sm mt-4">
          Necesita 70% para aprobar. Puede retomarlo sin límite.
        </p>
      </div>
    </div>
  );
}

// ============================================
// CERTIFICATE CARD COMPONENT
// ============================================

function CertificateCard({ 
  certificate, 
  isDownloading, 
  onDownload 
}: { 
  certificate: Certificate;
  isDownloading: boolean;
  onDownload: () => void;
}) {
  return (
    <div className="relative bg-gradient-to-br from-[#77DD77]/20 to-[#77DD77]/5 rounded-2xl p-6 md:p-10 border-2 border-[#77DD77]/30 overflow-hidden">
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <CelebrationParticles />
      </div>
      
      <div className="relative z-10 text-center">
        {/* Animated certificate stamp */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
          <CertificateStampIcon />
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          ¡Su Certificado Está Listo!
        </h3>
        <p className="text-white/70 mb-6 max-w-md mx-auto text-sm md:text-base">
          Descargue su certificado oficial con código de verificación judicial.
        </p>

        {/* Certificate details */}
        <div className="bg-[#1C1C1C]/50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
          <p className="text-sm text-white/60 mb-1">Certificado #{certificate.certificate_number}</p>
          <p className="text-sm text-white/60">Código: <span className="text-[#77DD77] font-mono">{certificate.verification_code}</span></p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-3 bg-[#77DD77] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <LoadingSpinner />
                <span>Abriendo...</span>
              </>
            ) : (
              <>
                <DownloadIcon className="w-6 h-6" />
                <span>Descargar Certificado</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELP SECTION COMPONENT
// ============================================

function HelpSection() {
  return (
    <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">¿Necesita Ayuda?</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          href="/preguntas-frecuentes"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
        >
          <QuestionIcon className="w-8 h-8 text-[#7EC8E3]" />
          <div>
            <p className="font-semibold text-white">Preguntas Frecuentes</p>
            <p className="text-sm text-white/60">Respuestas a dudas comunes</p>
          </div>
        </Link>
        <a 
          href="mailto:info@cursoparapadres.org"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
        >
          <SupportIcon className="w-8 h-8 text-[#FFB347]" />
          <div>
            <p className="font-semibold text-white">Contactar Soporte</p>
            <p className="text-sm text-white/60">info@cursoparapadres.org</p>
          </div>
        </a>
      </div>
    </div>
  );
}

// ============================================
// CELEBRATION PARTICLES
// ============================================

function CelebrationParticles() {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ['#77DD77', '#7EC8E3', '#FFE566', '#FFB347'][i % 4],
            opacity: 0.2 + Math.random() * 0.3,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// ICONS
// ============================================

function WelcomeIcon() {
  return (
    <svg className="w-10 h-10 text-[#77DD77]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg className="w-10 h-10 text-[#7EC8E3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  );
}

function ExamReadyIcon() {
  return (
    <svg className="w-10 h-10 text-[#FFB347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

function CompleteIcon() {
  return (
    <svg className="w-10 h-10 text-[#77DD77]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}

function CheckmarkIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function PlayIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ExamIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function DownloadIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function QuestionIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function SupportIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function CertificateStampIcon() {
  return (
    <svg className="w-full h-full certificate-stamp" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#77DD77" strokeWidth="3" className="certificate-ring" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#77DD77" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      <path d="M30 50 L45 65 L70 35" fill="none" stroke="#77DD77" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="certificate-check" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}