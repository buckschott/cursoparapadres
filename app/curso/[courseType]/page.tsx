'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { courseModules, supplementalContent, TOTAL_MODULES, courseTypeNames } from '@/lib/courseContent';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CourseProgress {
  lessons_completed: number[];
  completed_at: string | null;
}

export default function CourseOverviewPage() {
  const params = useParams();
  const courseType = params.courseType as string;
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
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

      setLoading(false);
    };

    loadProgress();
  }, [courseType]);

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

  const completedCount = progress?.lessons_completed.length || 0;

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

  const courseName = courseTypeNames[courseType as keyof typeof courseTypeNames]?.es || 'Curso';

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-background border-b border-[#FFFFFF]/15">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/panel" className="text-[#7EC8E3] hover:text-[#FFFFFF] text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel de Control
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {courseName}
          </h1>
          <p className="text-white/70">
            Complete todas las lecciones para desbloquear el examen final.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-background rounded-xl shadow-sm shadow-black/20 border border-[#FFFFFF]/15 p-6 mb-8">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Progreso del Curso</span>
            <span>{completedCount} de {TOTAL_MODULES} lecciones</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-[#7EC8E3] h-3 rounded-full transition-all"
              style={{ width: `${(completedCount / TOTAL_MODULES) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4 mb-8">
          {courseModules.map((module) => {
            const completed = isModuleCompleted(module.id);
            const unlocked = isModuleUnlocked(module.id);

            return (
              <div 
                key={module.id}
                className={`bg-background rounded-xl shadow-sm shadow-black/20 border p-6 transition-all ${
                  completed ? 'border-[#77DD77]/30 bg-[#77DD77]/10/30' :
                  unlocked ? 'border-[#FFFFFF]/15 hover:border-[#7EC8E3]/30 hover:shadow-md' :
                  'border-[#FFFFFF]/10 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      completed ? 'bg-[#77DD77] text-white' :
                      unlocked ? 'bg-[#7EC8E3] text-white' :
                      'bg-gray-200 text-white/70'
                    }`}>
                      {completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        module.id
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        {module.titleEs}
                      </h3>
                      <p className="text-sm text-white/60">{module.estimatedTime}</p>
                    </div>
                  </div>
                  
                  {unlocked ? (
                    <Link
                      href={`/curso/${courseType}/${module.slug}`}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                        completed 
                          ? 'bg-[#77DD77]/20 text-[#77DD77] hover:bg-[#77DD77]/30'
                          : 'bg-[#7EC8E3] text-white hover:bg-[#6BB8D3]'
                      }`}
                    >
                      {completed ? 'Revisar' : 'Comenzar'}
                    </Link>
                  ) : (
                    <span className="text-sm text-white/70 flex items-center gap-1 flex-shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Exam Card */}
        <div className={`bg-background rounded-xl shadow-sm shadow-black/20 border p-6 ${
          allModulesCompleted() ? 'border-[#7EC8E3]/30' : 'border-[#FFFFFF]/10 opacity-60'
        }`}>
          <div>
            <h3 className="font-bold text-white text-lg">
              Examen Final
            </h3>
            {allModulesCompleted() ? (
              <>
                <p className="text-sm text-white/70 mt-1">
                  ¡Ya puede tomar el examen! Necesita 70% para aprobar. Puede retomarlo sin límite.
                </p>
                <Link
                  href={`/curso/${courseType}/examen`}
                  className="inline-block mt-4 px-6 py-3 bg-[#7EC8E3] text-white rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors"
                >
                  Comenzar Examen
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/70 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Complete todas las lecciones para desbloquear el examen final.
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
      `}</style>
    </main>
  );
}