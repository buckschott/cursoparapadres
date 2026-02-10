'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
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

interface PassedExam {
  course_type: string;
  passed: boolean;
  score: number;
}

const TOTAL_LESSONS = 15;
const PURCHASE_RETRY_INTERVAL = 2000; // 2 seconds
const PURCHASE_RETRY_MAX_TIME = 15000; // 15 seconds total
const CERTIFICATE_VALIDITY_MONTHS = 12;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a certificate has expired (older than 12 months)
 */
function isCertificateExpired(issuedAt: string): boolean {
  const issueDate = new Date(issuedAt);
  const expirationDate = new Date(issueDate);
  expirationDate.setMonth(expirationDate.getMonth() + CERTIFICATE_VALIDITY_MONTHS);
  return new Date() > expirationDate;
}

/**
 * Get expiration date for display
 */
function getExpirationDate(issuedAt: string): string {
  const issueDate = new Date(issuedAt);
  const expirationDate = new Date(issueDate);
  expirationDate.setMonth(expirationDate.getMonth() + CERTIFICATE_VALIDITY_MONTHS);
  return expirationDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [passedExams, setPassedExams] = useState<PassedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Post-purchase handling states
  const [isJustPurchased, setIsJustPurchased] = useState(false);
  const [purchaseRetryCount, setPurchaseRetryCount] = useState(0);
  const [purchaseProcessingFailed, setPurchaseProcessingFailed] = useState(false);

  const supabase = createClient();
  const searchParams = useSearchParams();

  // Check if user just completed a purchase
  useEffect(() => {
    const purchasedParam = searchParams.get('purchased');
    if (purchasedParam === 'true') {
      setIsJustPurchased(true);
      // Clean up URL without triggering navigation
      window.history.replaceState({}, '', '/panel');
    }
  }, [searchParams]);

  // Function to load purchases (extracted for retry logic)
  const loadPurchases = useCallback(async (userId: string) => {
    const { data: purchasesData } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    return purchasesData || [];
  }, [supabase]);

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
      const purchasesData = await loadPurchases(user.id);
      setPurchases(purchasesData);

      // Load progress
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressData) {
        setProgress(progressData);

        // Check if this is likely a first visit (has purchases but no progress or 0 lessons)
        const totalLessonsCompleted = progressData.reduce(
          (sum, p) => sum + (p.lessons_completed?.length || 0), 0
        );
        if (purchasesData && purchasesData.length > 0 && totalLessonsCompleted === 0) {
          setIsFirstVisit(true);
        }
      }

      // Load certificates
      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id);

      if (certificatesData) {
        setCertificates(certificatesData);
      }

      // Load passed exams (join through purchases to get course_type)
      const { data: examData } = await supabase
        .from('exam_attempts')
        .select('passed, score, purchase_id, purchases!inner(course_type)')
        .eq('user_id', user.id)
        .eq('passed', true);

      if (examData && examData.length > 0) {
        const passed: PassedExam[] = examData.map((exam: any) => ({
          course_type: exam.purchases.course_type,
          passed: exam.passed,
          score: exam.score,
        }));
        setPassedExams(passed);
      }

      setLoading(false);

      // Trigger animations after a brief delay
      setTimeout(() => setPageReady(true), 100);
    };

    loadData();
  }, [supabase, loadPurchases]);

  // Auto-retry logic for just-purchased users with no courses showing
  useEffect(() => {
    if (!isJustPurchased || loading) return;
    if (purchases.length > 0) {
      // Purchase found, clear the just-purchased flag
      setIsJustPurchased(false);
      setIsFirstVisit(true); // Show welcome banner
      return;
    }

    // No purchases found but user just purchased - start retry
    const retryStartTime = Date.now();

    const retryInterval = setInterval(async () => {
      const elapsed = Date.now() - retryStartTime;

      if (elapsed >= PURCHASE_RETRY_MAX_TIME) {
        // Max time reached, stop retrying
        clearInterval(retryInterval);
        setPurchaseProcessingFailed(true);
        setIsJustPurchased(false);
        return;
      }

      // Try to load purchases again
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPurchases = await loadPurchases(user.id);
      setPurchaseRetryCount(prev => prev + 1);

      if (newPurchases.length > 0) {
        // Found purchases!
        setPurchases(newPurchases);
        setIsJustPurchased(false);
        setIsFirstVisit(true);
        clearInterval(retryInterval);

        // Also reload progress since it might have been created
        const { data: progressData } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', user.id);
        if (progressData) {
          setProgress(progressData);
        }
      }
    }, PURCHASE_RETRY_INTERVAL);

    return () => clearInterval(retryInterval);
  }, [isJustPurchased, loading, purchases.length, supabase, loadPurchases]);

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

  const hasPassedExam = (courseType: string) => {
    return passedExams.some(e => e.course_type === courseType);
  };

  // Check if user has access to a course (direct purchase OR bundle)
  const hasCourse = (courseType: string) => {
    return purchases.some(p =>
      p.course_type === courseType || p.course_type === 'bundle'
    );
  };

  // Get list of courses user has access to
  const getAccessibleCourses = (): string[] => {
    const courses: string[] = [];

    for (const purchase of purchases) {
      if (purchase.course_type === 'bundle') {
        if (!courses.includes('coparenting')) courses.push('coparenting');
        if (!courses.includes('parenting')) courses.push('parenting');
      } else if (!courses.includes(purchase.course_type)) {
        courses.push(purchase.course_type);
      }
    }

    return courses;
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

  // Check if any course is ready for exam (all lessons complete, no certificate, no passed exam)
  const hasExamReady = () => {
    for (const courseType of getAccessibleCourses()) {
      const prog = getCourseProgress(courseType);
      const cert = getCertificate(courseType);
      const passed = hasPassedExam(courseType);
      if (prog && prog.lessons_completed?.length >= TOTAL_LESSONS && !cert && !passed) {
        return true;
      }
    }
    return false;
  };

  // Count active (non-expired) certificates
  const getActiveCertificateCount = () => {
    return certificates.filter(c => !isCertificateExpired(c.issued_at)).length;
  };

  // Loading state
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
          <p className="text-white/70 text-lg">Cargando sus clases...</p>
        </div>
      </main>
    );
  }

  // Post-purchase processing state (waiting for purchase to appear)
  if (isJustPurchased && purchases.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
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
                stroke="#77DD77"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="60 191"
                className="animate-spin origin-center"
                style={{ animationDuration: '1.5s' }}
              />
              <circle
                cx="50" cy="50" r="28"
                fill="none"
                stroke="#7EC8E3"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="40 136"
                className="animate-spin origin-center"
                style={{ animationDuration: '2s', animationDirection: 'reverse' }}
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Procesando su compra...</h2>
          <p className="text-white/60 mb-4">
            Estamos preparando su clase. Esto solo toma unos segundos.
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#77DD77] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Purchase processing failed state
  if (purchaseProcessingFailed && purchases.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background border-b border-[#FFFFFF]/10 sticky top-0 z-50">
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

        <div className="max-w-xl mx-auto px-4 md:px-6 py-12">
          {/* Gold standard card styling */}
          <div className="bg-background rounded-2xl p-8 border border-[#FFFFFF]/15 shadow-xl shadow-black/40 text-center">
            {/* Universal clock icon */}
            <div className="w-16 h-16 mx-auto mb-6">
              <img 
                src="/clock.svg" 
                alt="" 
                className="w-full h-full"
                aria-hidden="true"
              />
            </div>

            <h2 className="text-xl font-bold text-white mb-3">
              Su compra está siendo procesada
            </h2>

            <p className="text-white/70 mb-6">
              Su pago fue recibido exitosamente, pero la configuración de su clase está tardando más de lo esperado. Esto puede tomar unos minutos.
            </p>

            <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-4 mb-6 text-left">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-[#77DD77] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-[#77DD77] text-sm font-medium">Su pago está confirmado</p>
                  <p className="text-[#77DD77]/80 text-sm mt-1">
                    Su clase debería aparecer en unos momentos. Intente actualizar la página.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-3 px-6 rounded-xl font-bold hover:bg-[#9DD8F3] transition-colors"
              >
                Actualizar Página
              </button>

              <a
                href="mailto:hola@claseparapadres.com?subject=Mi%20clase%20no%20aparece%20después%20de%20pagar"
                className="block w-full bg-white/10 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Contactar Soporte
              </a>
            </div>

            <p className="text-white/40 text-xs mt-6">
              Si el problema persiste después de 5 minutos, contáctenos y resolveremos esto inmediatamente.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const accessibleCourses = getAccessibleCourses();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-[#FFFFFF]/10 sticky top-0 z-50">
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
        <section className={`mb-8 transition-all duration-700 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[#7EC8E3] font-medium mb-1">{getTimeGreeting()}</p>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {getGreeting() ? `Hola, ${getGreeting()}` : 'Bienvenido a su Panel'}
              </h1>
              <p className="text-white/60 text-lg">
                Acceda a sus clases y certificados aquí.
              </p>
            </div>

            {/* Quick Stats - Gold standard card styling */}
            {accessibleCourses.length > 0 && (
              <div className="flex gap-4">
                <div className="bg-background rounded-xl px-4 py-3 border border-[#FFFFFF]/15 shadow-lg shadow-black/30">
                  <p className="text-2xl font-bold text-[#77DD77]">{getActiveCertificateCount()}</p>
                  <p className="text-xs text-white/50">Certificados</p>
                </div>
                <div className="bg-background rounded-xl px-4 py-3 border border-[#FFFFFF]/15 shadow-lg shadow-black/30">
                  <p className="text-2xl font-bold text-[#7EC8E3]">{accessibleCourses.length}</p>
                  <p className="text-xs text-white/50">Clases</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* First Visit Welcome Banner */}
        {isFirstVisit && accessibleCourses.length > 0 && (
          <section className={`mb-8 transition-all duration-700 delay-50 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="bg-[#77DD77]/15 border border-[#77DD77]/30 rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-black/20">
              {/* Celebration particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[
                  { left: 8, top: 15, size: 4, delay: 0, duration: 2.5 },
                  { left: 15, top: 28, size: 5, delay: 0.25, duration: 3 },
                  { left: 22, top: 65, size: 6, delay: 0.5, duration: 2.8 },
                  { left: 35, top: 20, size: 4, delay: 0.75, duration: 3.2 },
                  { left: 45, top: 75, size: 5, delay: 1, duration: 2.6 },
                  { left: 55, top: 35, size: 6, delay: 1.25, duration: 3 },
                  { left: 65, top: 60, size: 4, delay: 1.5, duration: 2.9 },
                  { left: 72, top: 25, size: 5, delay: 1.75, duration: 3.1 },
                  { left: 80, top: 70, size: 6, delay: 2, duration: 2.7 },
                  { left: 88, top: 40, size: 4, delay: 2.25, duration: 3 },
                  { left: 28, top: 50, size: 5, delay: 0.4, duration: 2.8 },
                  { left: 92, top: 18, size: 4, delay: 1.1, duration: 3.2 },
                ].map((particle, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-[#77DD77] celebration-particle"
                    style={{
                      left: `${particle.left}%`,
                      top: `${particle.top}%`,
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      animationDelay: `${particle.delay}s`,
                      animationDuration: `${particle.duration}s`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#1C1C1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#77DD77] mb-1">¡Bienvenido! Su cuenta está lista.</h2>
                  <p className="text-white/70">
                    Haga clic en <span className="text-white font-medium">"Comenzar Clase"</span> abajo para iniciar su primera lección.
                    Recibirá su certificado al completar todas las lecciones y aprobar el examen final.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Profile Completion Banner - Show when user has courses but profile is incomplete */}
        {/* This is now optional and available before passing the exam */}
        {profile && !profile.profile_completed && accessibleCourses.length > 0 && !isFirstVisit && (
          <section className={`mb-8 transition-all duration-700 delay-50 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="bg-[#7EC8E3]/15 border border-[#7EC8E3]/30 rounded-2xl p-6 shadow-xl shadow-black/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#7EC8E3]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[#7EC8E3] mb-1">Complete su perfil ahora</h2>
                  <p className="text-white/70 mb-4">
                    Ahorre tiempo completando su información ahora. Necesitará estos datos (número de caso, condado, etc.) para generar su certificado cuando termine la clase.
                  </p>
                  <Link
                    href="/completar-perfil"
                    className="inline-flex items-center gap-2 bg-[#7EC8E3] text-[#1C1C1C] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#9DD8F3] transition-colors"
                  >
                    Completar Perfil
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <p className="text-white/50 text-xs mt-3">
                    También puede hacer esto después de aprobar el examen.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Courses Grid */}
        {accessibleCourses.length > 0 && (
          <section className={`mb-12 transition-all duration-700 delay-100 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BookIcon className="w-5 h-5 text-[#7EC8E3]" />
              Mis Clases
            </h2>
            <div className={`grid gap-6 md:gap-8 ${accessibleCourses.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'}`}>
              {/* Co-Parenting Class */}
              {accessibleCourses.includes('coparenting') && (
                <div className={`transition-all duration-700 delay-200 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <CourseCard
                    title="Clase de Coparentalidad"
                    subtitle="Para Divorcio, Separación y Custodia"
                    courseType="coparenting"
                    progress={getCourseProgress('coparenting')}
                    certificate={getCertificate('coparenting')}
                    examPassed={hasPassedExam('coparenting')}
                    totalLessons={TOTAL_LESSONS}
                  />
                </div>
              )}

              {/* Parenting Class */}
              {accessibleCourses.includes('parenting') && (
                <div className={`transition-all duration-700 delay-300 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <CourseCard
                    title="Clase de Crianza"
                    subtitle="Para Habilidades Fundamentales"
                    courseType="parenting"
                    progress={getCourseProgress('parenting')}
                    certificate={getCertificate('parenting')}
                    examPassed={hasPassedExam('parenting')}
                    totalLessons={TOTAL_LESSONS}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* No Courses State */}
        {accessibleCourses.length === 0 && (
          <section className={`transition-all duration-700 delay-100 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* Gold standard card styling */}
            <div className="bg-background rounded-2xl p-8 md:p-12 text-center border border-[#FFFFFF]/15 shadow-xl shadow-black/40 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7EC8E3]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#77DD77]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-[#7EC8E3]/10 border-2 border-[#7EC8E3]/30">
                  <EmptyStateIcon className="w-10 h-10 text-[#7EC8E3]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                  No tiene clases activas
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Adquiera una clase para comenzar su educación parental y cumplir con su requisito de la corte.
                </p>
                <Link
                  href="/#precios"
                  className="inline-flex items-center gap-3 bg-[#77DD77] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]"
                >
                  Ver Clases Disponibles
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Help Section */}
        {accessibleCourses.length > 0 && (
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
  examPassed: boolean;
  totalLessons: number;
}

function CourseCard({
  title,
  subtitle,
  courseType,
  progress,
  certificate,
  examPassed,
  totalLessons
}: CourseCardProps) {
  const completedCount = progress?.lessons_completed?.length || 0;
  const progressPercent = (completedCount / totalLessons) * 100;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Check if certificate is expired (older than 12 months)
  const isExpired = certificate ? isCertificateExpired(certificate.issued_at) : false;
  const expirationDate = certificate ? getExpirationDate(certificate.issued_at) : '';

  // State logic:
  // 1. Has certificate AND expired → Expired
  // 2. Has certificate AND not expired → Complete
  // 3. Passed exam but no certificate → Profile Required
  // 4. All lessons complete but no passed exam → Exam Ready
  // 5. Otherwise → In Progress
  const isComplete = !!certificate && !isExpired;
  const isProfileRequired = !certificate && examPassed;
  const isExamReady = completedCount >= totalLessons && !certificate && !examPassed;

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 500);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  // ============================================
  // STATE 0: Expired Certificate
  // ============================================
  if (certificate && isExpired) {
    return (
      <div className="bg-background rounded-2xl p-6 md:p-8 border border-[#FFFFFF]/10 shadow-xl shadow-black/40 h-full relative overflow-hidden opacity-75">
        {/* Expired badge */}
        <div className="absolute top-4 right-4 bg-white/10 text-white/60 px-3 py-1 rounded-full text-xs font-medium">
          Expirado
        </div>

        <div className="relative z-10">
          <div className="mb-4">
            <h3 className="text-xl md:text-2xl font-bold text-white/60 mb-1">{title}</h3>
            <p className="text-sm text-white/40">{subtitle}</p>
          </div>

          <div className="bg-[#1C1C1C] border border-[#FFFFFF]/10 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              {/* Universal clock icon */}
              <div className="w-10 h-10 flex-shrink-0">
                <img 
                  src="/clock.svg" 
                  alt="" 
                  className="w-full h-full opacity-50"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-semibold text-white/60 mb-1">Certificado Expirado</p>
                <p className="text-white/40 text-sm">
                  Este certificado expiró el {expirationDate}. Para obtener un nuevo certificado para un nuevo caso, debe inscribirse de nuevo.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1C] border border-[#FFFFFF]/10 rounded-xl p-3 mb-6">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="text-white/40">
                Certificado: <span className="font-mono text-white/50">{certificate.certificate_number}</span>
              </span>
            </div>
          </div>

          <Link
            href="/#precios"
            className="flex items-center justify-center gap-2 w-full bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Inscribirse de Nuevo
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // STATE 1: Completed (has certificate, not expired)
  // ============================================
  if (isComplete) {
    return (
      <div className="bg-background rounded-2xl p-6 md:p-8 border-2 border-[#77DD77]/30 shadow-xl shadow-black/40 h-full relative overflow-hidden group hover:border-[#77DD77]/50 transition-colors">
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
            <p className="font-bold text-[#77DD77] mb-2">¡Clase Completada!</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="text-[#77DD77]/80">
                Certificado: <span className="font-mono font-bold text-[#77DD77]">{certificate!.certificate_number}</span>
              </span>
              <span className="text-[#77DD77]/80">
                Código: <span className="font-mono font-bold text-[#77DD77]">{certificate!.verification_code}</span>
              </span>
            </div>
            <p className="text-[#77DD77]/60 text-xs mt-2">
              Válido hasta: {expirationDate}
            </p>
          </div>

          <Link
            href={`/certificado/${certificate!.id}`}
            className="flex items-center justify-center gap-2 w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]"
          >
            <DownloadIcon className="w-5 h-5" />
            Ver Certificado
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // STATE 2: Profile Required (passed exam, no certificate)
  // ============================================
  if (isProfileRequired) {
    return (
      <div className="bg-background rounded-2xl p-6 md:p-8 border-2 border-[#77DD77]/30 shadow-xl shadow-black/40 h-full relative overflow-hidden group hover:border-[#77DD77]/50 transition-colors">
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
            <p className="font-bold text-[#77DD77] mb-1">¡Examen Aprobado!</p>
            <p className="text-[#77DD77]/80 text-sm">
              Complete su información para generar su certificado oficial.
            </p>
          </div>

          <Link
            href="/completar-perfil"
            className="flex items-center justify-center gap-2 w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Obtener Mi Certificado
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // STATE 3: Exam Ready (all lessons complete, no passed exam)
  // ============================================
  if (isExamReady) {
    return (
      <div className="bg-background rounded-2xl p-6 md:p-8 border-2 border-[#FFB347]/30 shadow-xl shadow-black/40 h-full relative overflow-hidden group hover:border-[#FFB347]/50 transition-colors">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB347]/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-white/50">{subtitle}</p>
            </div>
            <div className="w-12 h-12 bg-[#FFB347]/20 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-[#FFB347]/40">
              <svg className="w-6 h-6 text-[#FFB347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-[#FFB347]/10 border border-[#FFB347]/20 rounded-xl p-4 mb-6">
            <p className="font-bold text-[#FFB347] mb-1">¡Lecciones Completadas!</p>
            <p className="text-[#FFB347]/80 text-sm">
              Ha completado las {totalLessons} lecciones. Tome el examen final para obtener su certificado.
            </p>
          </div>

          <Link
            href={`/clase/${courseType}/examen`}
            className="flex items-center justify-center gap-2 w-full bg-[#FFB347] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#FFC05C] transition-all hover:shadow-lg hover:shadow-[#FFB347]/25 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tomar Examen Final
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // STATE 4: In Progress
  // ============================================
  return (
    <div className="bg-background rounded-2xl p-6 md:p-8 border border-[#FFFFFF]/15 shadow-xl shadow-black/40 h-full hover:border-[#FFFFFF]/30 transition-colors group">
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
        <div className="relative w-full bg-[#1C1C1C] rounded-full h-3 border border-[#FFFFFF]/10 overflow-hidden">
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
        href={`/clase/${courseType}`}
        className="flex items-center justify-center gap-2 w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#9DD8F3] transition-all hover:shadow-lg hover:shadow-[#7EC8E3]/25 active:scale-[0.98] group-hover:shadow-md"
      >
        {completedCount > 0 ? (
          <>
            <PlayIcon className="w-5 h-5" />
            Continuar Clase
          </>
        ) : (
          <>
            <PlayIcon className="w-5 h-5" />
            Comenzar Clase
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
    <div className="bg-background rounded-2xl p-6 border border-[#FFFFFF]/15 shadow-xl shadow-black/40">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <QuestionIcon className="w-5 h-5 text-white/60" />
        ¿Necesita Ayuda?
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/preguntas-frecuentes"
          className="flex items-center gap-4 p-4 rounded-xl border border-[#FFFFFF]/10 hover:border-[#7EC8E3]/30 hover:bg-[#7EC8E3]/5 transition-all group"
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
          href="mailto:hola@claseparapadres.com"
          className="flex items-center gap-4 p-4 rounded-xl border border-[#FFFFFF]/10 hover:border-[#FFB347]/30 hover:bg-[#FFB347]/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FFB347]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFB347]/20 transition-colors">
            <svg className="w-6 h-6 text-[#FFB347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-[#FFB347] transition-colors">Contactar Soporte</p>
            <p className="text-sm text-white/50">hola@claseparapadres.com</p>
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
