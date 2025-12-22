'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        if (!profileData.profile_completed) {
          window.location.href = '/completar-perfil';
          return;
        }
        setProfile(profileData);
      }

      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (purchasesData) {
        setPurchases(purchasesData);
      }

      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressData) {
        setProgress(progressData);
      }

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

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-background border-b border-[#FFFFFF]/15">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-white">
            Putting Kids First <sup className="text-xs">®</sup>
          </Link>
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white text-sm font-medium"
           
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido{profile?.legal_name ? `, ${profile.legal_name}` : ''}
          </h1>
          <p className="text-white/70">
            Aquí puede acceder a sus cursos y certificados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Co-Parenting Class - Active */}
          {hasCourse('coparenting') && (
            <div className="bg-background rounded-2xl shadow-lg shadow-black/30 p-8 border border-[#FFFFFF]/15">
              <h2 className="text-2xl font-bold text-white mb-4">
                Clase de Coparentalidad
              </h2>
              
              {getCertificate('coparenting') ? (
                <div className="space-y-4">
                  <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-[#77DD77]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-[#77DD77]">¡Curso Completado!</span>
                    </div>
                    <p className="text-sm text-[#77DD77]">
                      Certificado #{getCertificate('coparenting')?.certificate_number}
                    </p>
                    <p className="text-sm text-[#77DD77]">
                      Código de Verificación: {getCertificate('coparenting')?.verification_code}
                    </p>
                  </div>
                  <button onClick={() => window.location.href = `/certificado/${getCertificate("coparenting")?.id}`} className="w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors">
                    Descargar Certificado
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4">
                    <div className="flex justify-between text-sm text-white/70 mb-2">
                      <span>Progreso</span>
                      <span>{getCourseProgress('coparenting')?.lessons_completed.length || 0} de {TOTAL_LESSONS} lecciones</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-[#7EC8E3] h-2 rounded-full transition-all"
                        style={{ width: `${((getCourseProgress('coparenting')?.lessons_completed.length || 0) / TOTAL_LESSONS) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link 
                    href="/curso/coparenting"
                    className="block w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors text-center"
                  >
                    {getCourseProgress('coparenting')?.lessons_completed.length ? 'Continuar Curso' : 'Comenzar Curso'}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Parenting Class - Coming Soon */}
          {hasCourse('parenting') && (
            <div className="bg-background rounded-2xl shadow-lg shadow-black/30 p-8 border border-[#FFFFFF]/15">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Clase de Crianza
                </h2>
                {PARENTING_COMING_SOON && (
                  <span className="bg-[#FFB347]/20 text-[#FFB347] text-xs font-semibold px-3 py-1 rounded-full">
                    Próximamente
                  </span>
                )}
              </div>
              
              {PARENTING_COMING_SOON ? (
                <div className="space-y-4">
                  <div className="bg-[#FFB347]/10 border border-[#FFB347]/30 rounded-lg p-4">
                    <p className="text-[#FFB347] text-sm">
                      Este curso estará disponible pronto. Le notificaremos por correo electrónico cuando esté listo.
                    </p>
                  </div>
                  <button 
                    disabled
                    className="w-full bg-white/10 text-white/40 py-3 rounded-lg font-bold cursor-not-allowed"
                  >
                    Próximamente
                  </button>
                </div>
              ) : getCertificate('parenting') ? (
                <div className="space-y-4">
                  <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-[#77DD77]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-[#77DD77]">¡Curso Completado!</span>
                    </div>
                    <p className="text-sm text-[#77DD77]">
                      Certificado #{getCertificate('parenting')?.certificate_number}
                    </p>
                    <p className="text-sm text-[#77DD77]">
                      Código de Verificación: {getCertificate('parenting')?.verification_code}
                    </p>
                  </div>
                  <button onClick={() => window.location.href = `/certificado/${getCertificate("parenting")?.id}`} className="w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors">
                    Descargar Certificado
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4">
                    <div className="flex justify-between text-sm text-white/70 mb-2">
                      <span>Progreso</span>
                      <span>{getCourseProgress('parenting')?.lessons_completed.length || 0} de {TOTAL_LESSONS} lecciones</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-[#7EC8E3] h-2 rounded-full transition-all"
                        style={{ width: `${((getCourseProgress('parenting')?.lessons_completed.length || 0) / TOTAL_LESSONS) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link 
                    href="/curso/parenting"
                    className="block w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors text-center"
                  >
                    {getCourseProgress('parenting')?.lessons_completed.length ? 'Continuar Curso' : 'Comenzar Curso'}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {purchases.length === 0 && (
          <div className="bg-background rounded-2xl shadow-lg shadow-black/30 p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              No tiene cursos activos
            </h2>
            <p className="text-white/70 mb-6">
              Adquiera un curso para comenzar su educación parental.
            </p>
            <Link 
              href="/#precios"
              className="inline-block bg-[#7EC8E3] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors"
             
            >
              Ver Cursos Disponibles
            </Link>
          </div>
        )}
      </div>

      <style jsx global>{`
      `}</style>
    </main>
  );
}