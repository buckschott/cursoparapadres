'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { courseModules, supplementalContent, TOTAL_MODULES } from '@/lib/courseContent';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ModulePage() {
  const params = useParams();
  const courseType = params.courseType as string;
  const moduleSlug = params.leccion as string;
  
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
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

      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .single();

      if (moduleId && progressData) {
        setIsCompleted(progressData.lessons_completed.includes(moduleId));
      }

      const fileName = moduleInfo 
        ? `leccion-${moduleInfo.id}.md`
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const markComplete = async () => {
    if (!moduleId) return;

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EC8E3] mx-auto mb-4"></div>
          <p className="text-white/70">Cargando...</p>
        </div>
      </main>
    );
  }

  const nextModule = getNextModule();
  const prevModule = getPrevModule();

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-[#7EC8E3] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <header className="bg-background border-b border-[#FFFFFF]/15 sticky top-1 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/curso/${courseType}`} className="text-[#7EC8E3] hover:text-[#FFFFFF] text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Curso
          </Link>
          {isCompleted && (
            <span className="bg-[#77DD77]/20 text-[#77DD77] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completado
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {moduleId && (
          <div className="mb-8">
            <p className="text-[#7EC8E3] font-semibold text-sm mb-2">LECCIÓN {moduleId}</p>
            <h1 className="text-3xl font-bold text-white mb-2">
              {title}
            </h1>
            {estimatedTime && (
              <p className="text-white/60">{estimatedTime}</p>
            )}
          </div>
        )}

        <article className="module-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>

        {moduleId && !isSupplemental && (
          <div className="mt-12 pt-8 border-t border-[#FFFFFF]/15">
            {!isCompleted ? (
              <div className="bg-[#7EC8E3]/10 border border-[#7EC8E3]/30 rounded-xl p-6 text-center">
                <h3 className="font-bold text-white mb-2">¿Terminó de leer esta lección?</h3>
                <p className="text-white/70 mb-4 text-sm">
                  Márquelo como completado para desbloquear el siguiente lección.
                </p>
                <button
                  onClick={markComplete}
                  className="bg-[#7EC8E3] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors"
                >
                  Marcar como Completado
                </button>
              </div>
            ) : (
              <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-[#77DD77]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-[#77DD77]">¡Lección Completada!</span>
                </div>
                
                <div className="flex justify-center gap-4">
                  {nextModule && (
                    <Link
                      href={`/curso/${courseType}/${nextModule.slug}`}
                      className="bg-[#7EC8E3] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors"
                    >
                      Siguiente Lección
                    </Link>
                  )}
                  {moduleId === TOTAL_MODULES && (
                    <Link
                      href={`/curso/${courseType}/examen`}
                      className="bg-[#77DD77] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#77DD77] transition-colors"
                    >
                      Ir al Examen
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {prevModule ? (
            <Link
              href={`/curso/${courseType}/${prevModule.slug}`}
              className="text-[#7EC8E3] hover:text-[#FFFFFF] font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Lección Anterior
            </Link>
          ) : <div></div>}
          
          {nextModule && (
            <Link
              href={`/curso/${courseType}/${nextModule.slug}`}
              className="text-[#7EC8E3] hover:text-[#FFFFFF] font-medium flex items-center gap-1"
            >
              Siguiente Lección
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      <style jsx global>{`
        
        .module-content {
          color: #111827;
          font-size: 1.125rem;
          line-height: 1.75;
        }
        .module-content h1, .module-content h2, .module-content h3, .module-content h4 {
          color: #111827;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .module-content h1 { font-size: 2rem; }
        .module-content h2 { font-size: 1.5rem; }
        .module-content h3 { font-size: 1.25rem; }
        .module-content p {
          color: #111827;
          margin-bottom: 1rem;
        }
        .module-content ul, .module-content ol {
          color: #111827;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .module-content li {
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .module-content strong {
          color: #111827;
          font-weight: 700;
        }
        .module-content a {
          color: #2563eb;
        }
        .module-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #374151;
          font-style: italic;
        }
        .module-content hr {
          margin: 2rem 0;
          border-color: #e5e7eb;
        }
        .module-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .module-content th, .module-content td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
          color: #111827;
        }
        .module-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
    </main>
  );
}
