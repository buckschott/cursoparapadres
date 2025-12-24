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

// Set to false when Parenting Class content is ready
const PARENTING_COMING_SOON = true;

// ============================================
// MAIN COMPONENT
// ============================================

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      // Load profile (but DON'T redirect based on profile_completed)
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
          <p className="text-white/70">Cargando sus cursos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-white font-brand">
            Putting Kids First<sup className="text-[8px] relative -top-2">®</sup>
          </Link>
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Bienvenido{getGreeting() ? `, ${getGreeting()}` : ''}
          </h1>
          <p className="text-white/70">
            Aquí puede acceder a sus cursos y certificados.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Co-Parenting Class */}
          {hasCourse('coparenting') && (
            <CourseCard
              title="Clase de Coparentalidad"
              subtitle="Para Divorcio, Separación y Custodia"
              courseType="coparenting"
              progress={getCourseProgress('coparenting')}
              certificate={getCertificate('coparenting')}
              totalLessons={TOTAL_LESSONS}
              comingSoon={false}
            />
          )}

          {/* Parenting Class */}
          {hasCourse('parenting') && (
            <CourseCard
              title="Clase de Crianza"
              subtitle="Para Habilidades Fundamentales"
              courseType="parenting"
              progress={getCourseProgress('parenting')}
              certificate={getCertificate('parenting')}
              totalLessons={TOTAL_LESSONS}
              comingSoon={PARENTING_COMING_SOON}
            />
          )}
        </div>

        {/* No Courses State */}
        {purchases.length === 0 && (
          <div className="bg-[#2A2A2A] rounded-2xl p-8 md:p-12 text-center border border-white/10">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-[#7EC8E3]/10 border-2 border-[#7EC8E3]/30">
              <svg className="w-8 h-8 text-[#7EC8E3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
              No tiene cursos activos
            </h2>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              Adquiera un curso para comenzar su educación parental y cumplir con su requisito de la corte.
            </p>
            <Link 
              href="/#precios"
              className="inline-flex items-center gap-2 bg-[#77DD77] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25"
            >
              Ver Cursos Disponibles
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Help Section */}
        {purchases.length > 0 && (
          <div className="mt-12">
            <HelpSection />
          </div>
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
  comingSoon: boolean;
}

function CourseCard({ 
  title, 
  subtitle, 
  courseType, 
  progress, 
  certificate, 
  totalLessons,
  comingSoon 
}: CourseCardProps) {
  const completedCount = progress?.lessons_completed.length || 0;
  const progressPercent = (completedCount / totalLessons) * 100;

  // Coming Soon State
  if (comingSoon) {
    return (
      <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10 opacity-75">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h2>
            <p className="text-sm text-white/60">{subtitle}</p>
          </div>
          <span className="bg-[#FFB347]/20 text-[#FFB347] text-xs font-semibold px-3 py-1.5 rounded-full">
            Próximamente
          </span>
        </div>
        
        <div className="bg-[#FFB347]/10 border border-[#FFB347]/30 rounded-xl p-4 mb-6">
          <p className="text-[#FFB347] text-sm">
            Este curso estará disponible pronto. Le notificaremos por correo electrónico cuando esté listo.
          </p>
        </div>
        
        <button 
          disabled
          className="w-full bg-white/10 text-white/40 py-4 rounded-xl font-bold cursor-not-allowed"
        >
          Próximamente
        </button>
      </div>
    );
  }

  // Completed State (has certificate)
  if (certificate) {
    return (
      <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-[#77DD77]/30">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>
        
        <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#77DD77]">¡Curso Completado!</p>
              <p className="text-sm text-[#77DD77]/80">
                Certificado #{certificate.certificate_number}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#77DD77]/70 bg-[#77DD77]/10 rounded-lg px-3 py-2">
            Código de Verificación: <span className="font-mono font-bold">{certificate.verification_code}</span>
          </p>
        </div>
        
        <Link 
          href={`/certificado/${certificate.id}`}
          className="block w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all text-center hover:shadow-lg hover:shadow-[#77DD77]/25"
        >
          Descargar Certificado
        </Link>
      </div>
    );
  }

  // In Progress State
  return (
    <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10 hover:border-white/20 transition-colors">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-sm text-white/60">{subtitle}</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/70">Progreso</span>
          <span className="text-white font-medium">{completedCount} de {totalLessons} lecciones</span>
        </div>
        <div className="w-full bg-[#1C1C1C] rounded-full h-3 border border-white/10">
          <div 
            className="bg-gradient-to-r from-[#7EC8E3] to-[#7EC8E3] h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progressPercent}%`,
              boxShadow: progressPercent > 0 ? '0 0 12px rgba(126, 200, 227, 0.4)' : 'none'
            }}
          />
        </div>
      </div>
      
      <Link 
        href={`/curso/${courseType}`}
        className="block w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#9DD8F3] transition-all text-center hover:shadow-lg hover:shadow-[#7EC8E3]/25"
      >
        {completedCount > 0 ? 'Continuar Curso' : 'Comenzar Curso'}
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
      <h3 className="text-lg font-semibold text-white mb-4">¿Necesita Ayuda?</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          href="/preguntas-frecuentes"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#7EC8E3]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#7EC8E3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">Preguntas Frecuentes</p>
            <p className="text-sm text-white/60">Respuestas a dudas comunes</p>
          </div>
        </Link>
        <a 
          href="mailto:info@cursoparapadres.org"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFB347]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#FFB347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">Contactar Soporte</p>
            <p className="text-sm text-white/60">info@cursoparapadres.org</p>
          </div>
        </a>
      </div>
    </div>
  );
}