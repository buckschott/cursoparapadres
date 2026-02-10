'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { getCourseLessons, getContentFileName, supplementalContent, TOTAL_MODULES } from '@/lib/courseContent';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isPurchaseExpired } from '@/lib/purchase-utils';

// ============================================
// CONSTANTS
// ============================================

// User must scroll to this percentage before they can mark complete
const SCROLL_THRESHOLD = 95;

// ============================================
// MAIN COMPONENT
// ============================================

export default function ModulePage() {
  const params = useParams();
  const courseType = params.courseType as string;
  const moduleSlug = params.leccion as string;
  
  // Get lessons for this course type
  const courseModules = getCourseLessons(courseType);
  
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  
  const supabase = createClient();

  const isSupplemental = supplementalContent.some(s => s.slug === moduleSlug);
  const moduleInfo = courseModules.find(m => m.slug === moduleSlug);
  const supplementalInfo = supplementalContent.find(s => s.slug === moduleSlug);
  
  const title = moduleInfo?.titleEs || supplementalInfo?.titleEs || '';
  const moduleId = moduleInfo?.id;
  const estimatedTime = moduleInfo?.estimatedTime;

  useEffect(() => {
    const loadContent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      // Check if user has a valid (non-expired) purchase for this course
      const { data: purchases } = await supabase
        .from('purchases')
        .select('purchased_at')
        .eq('user_id', user.id)
        .or(`course_type.eq.${courseType},course_type.eq.bundle`)
        .eq('status', 'active')
        .limit(1);

      const purchase = purchases?.[0];

      if (!purchase || isPurchaseExpired(purchase.purchased_at)) {
        // No purchase or purchase expired — no lesson access, period
        window.location.href = '/panel';
        return;
      }

      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .single();

      if (moduleId && progressData) {
        const completed = progressData.lessons_completed.includes(moduleId);
        setIsCompleted(completed);
        // If already completed, they've already scrolled through once
        if (completed) setHasReachedBottom(true);
      }

      // Use getContentFileName to get the correct path based on course type
      const fileName = moduleInfo 
        ? getContentFileName(moduleInfo.id, courseType)
        : supplementalInfo?.fileName;

      if (fileName) {
        try {
          const response = await fetch(`/content/${fileName}`);
          if (response.ok) {
            const text = await response.text();
            setContent(text);
          }
        } catch (error) {
          console.error('Error loading content:', error);
        }
      }

      setLoading(false);
    };

    loadContent();
  }, [courseType, moduleSlug, moduleId]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      
      // Once user reaches threshold, unlock the button (stays unlocked)
      if (progress >= SCROLL_THRESHOLD && !hasReachedBottom) {
        setHasReachedBottom(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position (for short content or resumed reading)
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasReachedBottom]);

  const markComplete = async () => {
    if (!moduleId || isMarking || !hasReachedBottom) return;
    setIsMarking(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: progressData } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_type', courseType)
      .single();

    if (progressData && !progressData.lessons_completed.includes(moduleId)) {
      const newCompleted = [...progressData.lessons_completed, moduleId];
      
      await supabase
        .from('course_progress')
        .update({ 
          lessons_completed: newCompleted,
          current_lesson: Math.max(...newCompleted) + 1
        })
        .eq('user_id', user.id)
        .eq('course_type', courseType);

      setIsCompleted(true);
    }
    setIsMarking(false);
  };

  const getNextModule = () => {
    if (!moduleId) return null;
    if (moduleId < TOTAL_MODULES) {
      return courseModules.find(m => m.id === moduleId + 1);
    }
    return null;
  };

  const getPrevModule = () => {
    if (!moduleId || moduleId <= 1) return null;
    return courseModules.find(m => m.id === moduleId - 1);
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
          <p className="text-white/70">Cargando lección...</p>
        </div>
      </main>
    );
  }

  const nextModule = getNextModule();
  const prevModule = getPrevModule();
  
  // Calculate if button should be enabled
  const canMarkComplete = hasReachedBottom && !isCompleted;

  return (
    <main className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#7EC8E3] to-[#77DD77] transition-all duration-150"
          style={{ 
            width: `${scrollProgress}%`,
            boxShadow: scrollProgress > 0 ? '0 0 10px rgba(126, 200, 227, 0.5)' : 'none'
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-background border-b border-white/15 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link 
            href={`/clase/${courseType}`} 
            className="text-[#7EC8E3] hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la Clase
          </Link>
          
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 bg-[#77DD77]/20 text-[#77DD77] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#77DD77]/30">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completada
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Lesson Header */}
        {moduleId && (
          <div className="mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#7EC8E3]/20 border border-[#7EC8E3]/30 text-[#7EC8E3] font-bold text-sm">
                {moduleId}
              </span>
              <span className="text-[#7EC8E3] font-semibold text-sm uppercase tracking-wide">
                Lección {moduleId} de {TOTAL_MODULES}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h1>
            {estimatedTime && (
              <p className="text-white/60 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {estimatedTime}
              </p>
            )}
          </div>
        )}

        {/* Content Area - Chalkboard Style */}
        <article className="module-content bg-[#2A2A2A] rounded-2xl p-6 md:p-10 border border-white/10 mb-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>

        {/* Completion Section */}
        {moduleId && !isSupplemental && (
          <div className="mb-8">
            {!isCompleted ? (
              <div className={`border-2 rounded-2xl p-6 md:p-8 text-center transition-all duration-300 ${
                hasReachedBottom 
                  ? 'bg-[#7EC8E3]/10 border-[#7EC8E3]/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 transition-all duration-300 ${
                  hasReachedBottom 
                    ? 'bg-[#7EC8E3]/20 border border-[#7EC8E3]/30' 
                    : 'bg-white/10 border border-white/10'
                }`}>
                  {hasReachedBottom ? (
                    <svg className="w-7 h-7 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                </div>
                
                <h3 className={`font-bold text-lg mb-2 transition-colors ${
                  hasReachedBottom ? 'text-white' : 'text-white/60'
                }`}>
                  {hasReachedBottom 
                    ? '¿Terminó de leer esta lección?' 
                    : 'Continúe leyendo...'}
                </h3>
                
                <p className={`mb-6 text-sm max-w-md mx-auto transition-colors ${
                  hasReachedBottom ? 'text-white/70' : 'text-white/50'
                }`}>
                  {hasReachedBottom 
                    ? 'Marque como completada para desbloquear la siguiente lección y continuar su progreso.'
                    : 'Desplácese hasta el final de la lección para continuar.'}
                </p>
                
                {/* Progress indicator when not yet scrolled */}
                {!hasReachedBottom && (
                  <div className="mb-6">
                    <div className="w-full max-w-xs mx-auto bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7EC8E3] to-[#77DD77] transition-all duration-150 rounded-full"
                        style={{ width: `${Math.min(scrollProgress, 100)}%` }}
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      {Math.round(scrollProgress)}% leído
                    </p>
                  </div>
                )}
                
                <button
                  onClick={markComplete}
                  disabled={!canMarkComplete || isMarking}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
                    canMarkComplete
                      ? 'bg-[#7EC8E3] text-[#1C1C1C] hover:bg-[#9DD8F3] hover:shadow-lg hover:shadow-[#7EC8E3]/25 cursor-pointer'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  } disabled:opacity-70`}
                >
                  {isMarking ? (
                    <>
                      <LoadingSpinner />
                      <span>Guardando...</span>
                    </>
                  ) : canMarkComplete ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Marcar como Completada</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span>Desplácese para continuar</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-[#77DD77]/10 border-2 border-[#77DD77]/30 rounded-2xl p-6 md:p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#77DD77] mb-4">
                  <svg className="w-7 h-7 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#77DD77] text-lg mb-4">¡Lección Completada!</h3>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  {nextModule && (
                    <Link
                      href={`/clase/${courseType}/${nextModule.slug}`}
                      className="inline-flex items-center justify-center gap-2 bg-[#77DD77] text-[#1C1C1C] px-6 py-3 rounded-xl font-bold hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25"
                    >
                      Siguiente Lección
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                  {moduleId === TOTAL_MODULES && (
                    <Link
                      href={`/clase/${courseType}/examen`}
                      className="inline-flex items-center justify-center gap-2 bg-[#FFB347] text-[#1C1C1C] px-6 py-3 rounded-xl font-bold hover:bg-[#FFC05C] transition-all hover:shadow-lg hover:shadow-[#FFB347]/25"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ir al Examen Final
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-white/10">
          {prevModule ? (
            <Link
              href={`/clase/${courseType}/${prevModule.slug}`}
              className="flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Lección Anterior</span>
              <span className="sm:hidden">Anterior</span>
            </Link>
          ) : <div />}
          
          {nextModule && (
            <Link
              href={`/clase/${courseType}/${nextModule.slug}`}
              className="flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors group"
            >
              <span className="hidden sm:inline">Siguiente Lección</span>
              <span className="sm:hidden">Siguiente</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* ===== CHALKBOARD CONTENT STYLES ===== */}
      <style jsx global>{`
        /* Base content styling - chalk on chalkboard */
        .module-content {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.125rem;
          line-height: 1.8;
        }

        /* Headings - bright white like fresh chalk */
        .module-content h1,
        .module-content h2,
        .module-content h3,
        .module-content h4 {
          color: #FFFFFF;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .module-content h1 { font-size: 1.75rem; }
        .module-content h2 { 
          font-size: 1.5rem; 
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .module-content h3 { font-size: 1.25rem; color: #7EC8E3; }
        .module-content h4 { font-size: 1.125rem; color: #77DD77; }

        /* Paragraphs */
        .module-content p {
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 1.25rem;
        }

        /* Lists */
        .module-content ul,
        .module-content ol {
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }

        .module-content li {
          margin-bottom: 0.5rem;
        }

        .module-content ul li::marker {
          color: #7EC8E3;
        }

        .module-content ol li::marker {
          color: #77DD77;
          font-weight: 600;
        }

        /* Strong/Bold - chalk yellow highlight */
        .module-content strong {
          color: #FFE566;
          font-weight: 700;
        }

        /* Links - chalk blue */
        .module-content a {
          color: #7EC8E3;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }

        .module-content a:hover {
          color: #9DD8F3;
        }

        /* Blockquotes - styled like a note on the board */
        .module-content blockquote {
          border-left: 4px solid #7EC8E3;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background: rgba(126, 200, 227, 0.1);
          border-radius: 0 0.75rem 0.75rem 0;
          color: rgba(255, 255, 255, 0.9);
          font-style: italic;
        }

        .module-content blockquote p {
          margin-bottom: 0;
        }

        /* Horizontal rules */
        .module-content hr {
          margin: 2rem 0;
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        /* Tables */
        .module-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.95rem;
        }

        .module-content th,
        .module-content td {
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.75rem 1rem;
          text-align: left;
          color: rgba(255, 255, 255, 0.85);
        }

        .module-content th {
          background-color: rgba(126, 200, 227, 0.15);
          font-weight: 600;
          color: #FFFFFF;
        }

        .module-content tr:nth-child(even) {
          background-color: rgba(255, 255, 255, 0.03);
        }

        /* Code blocks */
        .module-content code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          color: #FFB347;
        }

        .module-content pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .module-content pre code {
          background: transparent;
          padding: 0;
          color: rgba(255, 255, 255, 0.9);
        }

        /* Images */
        .module-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }

        /* First paragraph - slightly larger */
        .module-content > p:first-of-type {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.95);
        }
      `}</style>
    </main>
  );
}

// ============================================
// LOADING SPINNER
// ============================================

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
