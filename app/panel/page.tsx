'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

// ============================================
// TYPES
// ============================================

interface Purchase {
  id: string;
  course_type: string;
  purchased_at: string;
}

interface CourseProgress {
  course_type: string;
  current_lesson: number;
  lessons_completed: number[];
  completed_at: string | null;
}

interface Certificate {
  id: string;
  course_type: string;
  certificate_number: string;
  verification_code: string;
  issued_at: string;
}

interface Profile {
  full_name: string;
  email: string;
  legal_name: string;
  profile_completed: boolean;
}

const TOTAL_LESSONS = 15;

// ============================================
// MAIN COMPONENT
// ============================================

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load purchases
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (purchasesData) {
        setPurchases(purchasesData);
      }

      // Load progress
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressData) {
        setProgress(progressData);
      }

      // Load certificates
      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id);

      if (certificatesData) {
        setCertificates(certificatesData);
      }

      setLoading(false);
      
      // Trigger animations after a brief delay
      setTimeout(() => setPageReady(true), 100);
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getCourseProgress = (courseType: string) => {
    return progress.find(p => p.course_type === courseType);
  };

  const getCertificate = (courseType: string) => {
    return certificates.find(c => c.course_type === courseType);
  };

  const hasCourse = (courseType: string) => {
    return purchases.some(p => 
      p.course_type === courseType || p.course_type === 'bundle'
    );
  };

  const getGreeting = () => {
    if (profile?.legal_name) return profile.legal_name;
    if (profile?.full_name) return profile.full_name;
    return '';
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* Animated chalkboard-style loader */}
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
          <p className="text-white/70 text-lg">Cargando sus cursos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="" className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            <span className="text-lg font-semibold text-white font-brand">
              Putting Kids First<sup className="text-[8px] relative -top-2">®</sup>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Welcome Section */}
        <section className={`mb-10 transition-all duration-700 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[#7EC8E3] font-medium mb-1">{getTimeGreeting()}</p>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {getGreeting() ? `Hola, ${getGreeting()}` : 'Bienvenido a su Panel'}
              </h1>
              <p className="text-white/60 text-lg">
                Acceda a sus cursos y certificados aquí.
              </p>
            </div>
            
            {/* Quick Stats */}
            {purchases.length > 0 && (
              <div className="flex gap-4">
                <div className="bg-[#2A2A2A] rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-2xl font-bold text-[#77DD77]">{certificates.length}</p>
                  <p className="text-xs text-white/50">Certificados</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-2xl font-bold text-[#7EC8E3]">{purchases.length}</p>
                  <p className="text-xs text-white/50">Cursos</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Courses Grid */}
        {purchases.length > 0 && (
          <section className={`mb-12 transition-all duration-700 delay-100 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BookIcon className="w-5 h-5 text-[#7EC8E3]" />
              Mis Cursos
            </h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Co-Parenting Class */}
              {hasCourse('coparenting') && (
                <div className={`transition-all duration-700 delay-200 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <CourseCard
                    title="Clase de Coparentalidad"
                    subtitle="Para Divorcio, Separación y Custodia"
                    courseType="coparenting"
                    progress={getCourseProgress('coparenting')}
                    certificate={getCertificate('coparenting')}
                    totalLessons={TOTAL_LESSONS}
                  />
                </div>
              )}

              {/* Parenting Class */}
              {hasCourse('parenting') && (
                <div className={`transition-all duration-700 delay-300 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <CourseCard
                    title="Clase de Crianza"
                    subtitle="Para Habilidades Fundamentales"
                    courseType="parenting"
                    progress={getCourseProgress('parenting')}
                    certificate={getCertificate('parenting')}
                    totalLessons={TOTAL_LESSONS}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* No Courses State */}
        {purchases.length === 0 && (
          <section className={`transition-all duration-700 delay-100 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="bg-[#2A2A2A] rounded-2xl p-8 md:p-12 text-center border border-white/10 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7EC8E3]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#77DD77]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-[#7EC8E3]/10 border-2 border-[#7EC8E3]/30">
                  <EmptyStateIcon className="w-10 h-10 text-[#7EC8E3]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                  No tiene cursos activos
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Adquiera un curso para comenzar su educación parental y cumplir con su requisito de la corte.
                </p>
                <Link 
                  href="/#precios"
                  className="inline-flex items-center gap-3 bg-[#77DD77] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]"
                >
                  Ver Cursos Disponibles
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Help Section */}
        {purchases.length > 0 && (
          <section className={`transition-all duration-700 delay-400 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <HelpSection />
          </section>
        )}
      </div>
    </main>
  );
}

// ============================================
// COURSE CARD COMPONENT
// ============================================

interface CourseCardProps {
  title: string;
  subtitle: string;
  courseType: string;
  progress: CourseProgress | undefined;
  certificate: Certificate | undefined;
  totalLessons: number;
}

function CourseCard({ 
  title, 
  subtitle, 
  courseType, 
  progress, 
  certificate, 
  totalLessons
}: CourseCardProps) {
  const completedCount = progress?.lessons_completed.length || 0;
  const progressPercent = (completedCount / totalLessons) * 100;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 500);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  // Completed State (has certificate)
  if (certificate) {
    return (
      <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border-2 border-[#77DD77]/30 h-full relative overflow-hidden group hover:border-[#77DD77]/50 transition-colors">
        {/* Success glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#77DD77]/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-white/50">{subtitle}</p>
            </div>
            <div className="w-12 h-12 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="bg-[#77DD77]/10 border border-[#77DD77]/20 rounded-xl p-4 mb-6">
            <p className="font-bold text-[#77DD77] mb-2">¡Curso Completado!</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="text-[#77DD77]/80">
                Certificado: <span className="font-mono font-bold text-[#77DD77]">{certificate.certificate_number}</span>
              </span>
              <span className="text-[#77DD77]/80">
                Código: <span className="font-mono font-bold text-[#77DD77]">{certificate.verification_code}</span>
              </span>
            </div>
          </div>
          
          <Link 
            href={`/certificado/${certificate.id}`}
            className="flex items-center justify-center gap-2 w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]"
          >
            <DownloadIcon className="w-5 h-5" />
            Descargar Certificado
          </Link>
        </div>
      </div>
    );
  }

  // In Progress State
  return (
    <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10 h-full hover:border-white/20 transition-colors group">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[#7EC8E3] text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7EC8E3] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7EC8E3]"></span>
              </span>
              En Progreso
            </span>
          )}
        </div>
        <p className="text-sm text-white/50">{subtitle}</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Progreso</span>
          <span className="text-white font-medium">{completedCount} de {totalLessons} lecciones</span>
        </div>
        <div className="relative w-full bg-[#1C1C1C] rounded-full h-3 border border-white/10 overflow-hidden">
          {/* Animated fill */}
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7EC8E3] to-[#77DD77] rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${animatedProgress}%`,
              boxShadow: animatedProgress > 0 ? '0 0 12px rgba(126, 200, 227, 0.4)' : 'none'
            }}
          />
          {/* Lesson markers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalLessons - 1 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/5 last:border-r-0" />
            ))}
          </div>
        </div>
      </div>
      
      <Link 
        href={`/curso/${courseType}`}
        className="flex items-center justify-center gap-2 w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#9DD8F3] transition-all hover:shadow-lg hover:shadow-[#7EC8E3]/25 active:scale-[0.98] group-hover:shadow-md"
      >
        {completedCount > 0 ? (
          <>
            <PlayIcon className="w-5 h-5" />
            Continuar Curso
          </>
        ) : (
          <>
            <PlayIcon className="w-5 h-5" />
            Comenzar Curso
          </>
        )}
      </Link>
    </div>
  );
}

// ============================================
// HELP SECTION COMPONENT
// ============================================

function HelpSection() {
  return (
    <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <QuestionIcon className="w-5 h-5 text-white/60" />
        ¿Necesita Ayuda?
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          href="/preguntas-frecuentes"
          className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#7EC8E3]/30 hover:bg-[#7EC8E3]/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#7EC8E3]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#7EC8E3]/20 transition-colors">
            <svg className="w-6 h-6 text-[#7EC8E3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-[#7EC8E3] transition-colors">Preguntas Frecuentes</p>
            <p className="text-sm text-white/50">Respuestas a dudas comunes</p>
          </div>
        </Link>
        <a 
          href="mailto:info@cursoparapadres.org"
          className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#FFB347]/30 hover:bg-[#FFB347]/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FFB347]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFB347]/20 transition-colors">
            <svg className="w-6 h-6 text-[#FFB347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-[#FFB347] transition-colors">Contactar Soporte</p>
            <p className="text-sm text-white/50">info@cursoparapadres.org</p>
          </div>
        </a>
      </div>
    </div>
  );
}

// ============================================
// ICONS
// ============================================

function BookIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

function EmptyStateIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}