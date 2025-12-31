'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { QUESTIONS_PER_EXAM, PASS_THRESHOLD } from '@/lib/courseContent';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ============================================
// TYPES
// ============================================

interface ExamQuestion {
  id: string;
  question_text: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct_position: string;
  wrong_a_explanation: string;
  wrong_a_redirect: string;
  wrong_b_explanation: string;
  wrong_b_redirect: string;
  wrong_c_explanation: string;
  wrong_c_redirect: string;
  wrong_d_explanation: string;
  wrong_d_redirect: string;
}

interface ShuffledQuestion extends ExamQuestion {
  shuffledAnswers: { label: string; text: string; originalLabel: string }[];
}

const PASS_SCORE = Math.ceil(QUESTIONS_PER_EXAM * PASS_THRESHOLD);

function cleanRedirect(text: string): string {
  if (!text) return '';
  return text.replace(/(\d+)[A-Za-z]+/g, '$1');
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ExamPage() {
  const params = useParams();
  const courseType = params.courseType as string;
  const STORAGE_KEY = `exam_v3_${courseType}`;
  
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'intro' | 'exam' | 'done'>('intro');
  const [hasResumable, setHasResumable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  
  // Exam state
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongRed, setWrongRed] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const supabase = createClient();

  // Save state to localStorage
  useEffect(() => {
    if (phase === 'exam' && questions.length > 0) {
      const state = { questions, currentIndex, correctCount, selectedAnswer, submitted, isCorrect, wrongRed };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    }
  }, [phase, questions, currentIndex, correctCount, selectedAnswer, submitted, isCorrect, wrongRed, STORAGE_KEY]);

  // Initial check
  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { 
          window.location.href = '/iniciar-sesion'; 
          return; 
        }

        // Check for existing certificate
        const { data: existingCert, error: certError } = await supabase
          .from('certificates')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_type', courseType)
          .limit(1);

        if (certError) {
          console.error('Error checking certificate:', certError);
        }

        if (existingCert && existingCert.length > 0) {
          window.location.href = `/certificado/${existingCert[0].id}`;
          return;
        }

        const { data: prog, error: progError } = await supabase
          .from('course_progress')
          .select('lessons_completed')
          .eq('user_id', user.id)
          .eq('course_type', courseType)
          .single();

        if (progError) {
          console.error('Error checking progress:', progError);
        }

        if (!prog || prog.lessons_completed.length < 15) {
          window.location.href = `/curso/${courseType}`;
          return;
        }

        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const p = JSON.parse(saved);
            if (p.questions?.length) setHasResumable(true);
          }
        } catch {}

        setLoading(false);
      } catch (err) {
        console.error('Error in initial check:', err);
        setError('Error al cargar el examen. Por favor, recargue la página.');
        setLoading(false);
      }
    };
    check();
  }, [courseType, STORAGE_KEY]);

  const clear = useCallback(() => { 
    try {
      localStorage.removeItem(STORAGE_KEY); 
    } catch {}
  }, [STORAGE_KEY]);

  const resume = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setQuestions(p.questions || []);
        setCurrentIndex(p.currentIndex || 0);
        setCorrectCount(p.correctCount || 0);
        setSelectedAnswer(null);
        setSubmitted(false);
        setIsCorrect(false);
        setWrongRed('');
        setShowFeedback(false);
        setPhase('exam');
        setHasResumable(false);
        setError(null);
      }
    } catch (err) { 
      console.error('Error resuming exam:', err);
      clear(); 
      setError('No se pudo continuar el examen. Por favor, comience de nuevo.');
    }
  };

  const start = async () => {
    setIsStarting(true);
    setError(null);
    
    try {
      clear();
      setHasResumable(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      const versions = ['A', 'B', 'C'];
      const ver = versions[Math.floor(Math.random() * versions.length)];

      const { data: qs, error: fetchError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('course_type', courseType)
        .eq('version', ver);

      if (fetchError) {
        console.error('Error fetching questions:', fetchError);
        throw new Error('No se pudieron cargar las preguntas del examen.');
      }

      if (!qs?.length) { 
        throw new Error('No hay preguntas disponibles para este examen.');
      }

      const selected = shuffle(qs).slice(0, QUESTIONS_PER_EXAM);
      const processed: ShuffledQuestion[] = selected.map(q => {
        const ans = [
          { label: 'A', text: q.answer_a, originalLabel: 'A' },
          { label: 'B', text: q.answer_b, originalLabel: 'B' },
          { label: 'C', text: q.answer_c, originalLabel: 'C' },
          { label: 'D', text: q.answer_d, originalLabel: 'D' }
        ];
        return { ...q, shuffledAnswers: shuffle(ans).map((a, i) => ({ ...a, label: ['A','B','C','D'][i] })) };
      });

      setQuestions(processed);
      setCurrentIndex(0);
      setCorrectCount(0);
      setSelectedAnswer(null);
      setSubmitted(false);
      setIsCorrect(false);
      setWrongRed('');
      setShowFeedback(false);
      setPhase('exam');
    } catch (err) {
      console.error('Error starting exam:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar el examen. Por favor, intente de nuevo.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer || submitted) return;
    
    const q = questions[currentIndex];
    const sel = q.shuffledAnswers.find(a => a.label === selectedAnswer);
    const correct = sel?.originalLabel?.toUpperCase() === q.correct_position?.toUpperCase();
    
    let red = '';
    if (!correct && sel) {
      const o = sel.originalLabel;
      if (o === 'A') red = q.wrong_a_redirect || '';
      if (o === 'B') red = q.wrong_b_redirect || '';
      if (o === 'C') red = q.wrong_c_redirect || '';
      if (o === 'D') red = q.wrong_d_redirect || '';
    }

    setIsCorrect(correct);
    setWrongRed(red);
    setSubmitted(true);
    if (correct) setCorrectCount(prev => prev + 1);
    
    setTimeout(() => setShowFeedback(true), 100);
  };

  const handleNext = () => {
    setShowFeedback(false);
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setSubmitted(false);
        setIsCorrect(false);
        setWrongRed('');
      } else {
        finishExam();
      }
    }, 200);
  };

  const finishExam = async () => {
    clear();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const passed = correctCount >= PASS_SCORE;
      const score = Math.round((correctCount / QUESTIONS_PER_EXAM) * 100);

      await supabase.from('exam_attempts').insert({
        user_id: user.id,
        course_type: courseType,
        questions_shown: questions.map(q => q.id),
        score,
        passed
      });

      if (passed) {
        const { data: existingCerts } = await supabase
          .from('certificates')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_type', courseType)
          .limit(1);

        if (!existingCerts || existingCerts.length === 0) {
          const certNumber = `PKF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const verifyCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          
          const { data: newCert } = await supabase
            .from('certificates')
            .insert({
              user_id: user.id,
              course_type: courseType,
              certificate_number: certNumber,
              verification_code: verifyCode
            })
            .select('id')
            .single();

          if (newCert?.id) {
            fetch('/api/send-attorney-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ certificateId: newCert.id })
            }).catch(console.error);
          }

          await supabase
            .from('course_progress')
            .update({ completed_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('course_type', courseType);
        }
      }
    } catch (err) {
      console.error('Error finishing exam:', err);
    }
    
    setPhase('done');
  };

  const handleRetry = () => {
    clear();
    setQuestions([]);
    setCurrentIndex(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setIsCorrect(false);
    setWrongRed('');
    setShowFeedback(false);
    setError(null);
    setPhase('intro');
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="#7EC8E3" strokeWidth="4"
                strokeLinecap="round" strokeDasharray="60 191"
                className="animate-spin origin-center"
                style={{ animationDuration: '1.5s' }}
              />
              <circle
                cx="50" cy="50" r="28"
                fill="none" stroke="#77DD77" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="40 136"
                className="animate-spin origin-center"
                style={{ animationDuration: '2s', animationDirection: 'reverse' }}
              />
            </svg>
          </div>
          <p className="text-white/70 text-lg">Preparando su examen...</p>
        </div>
      </main>
    );
  }

  // ============================================
  // RESULTS SCREEN
  // ============================================
  if (phase === 'done') {
    const passed = correctCount >= PASS_SCORE;
    const score = Math.round((correctCount / QUESTIONS_PER_EXAM) * 100);
    
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-[#2A2A2A] rounded-2xl p-8 md:p-10 max-w-md w-full text-center border border-white/10 relative overflow-hidden">
          {passed ? (
            <>
              {/* Success celebration particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${4 + Math.random() * 6}px`,
                      height: `${4 + Math.random() * 6}px`,
                      backgroundColor: ['#77DD77', '#7EC8E3', '#FFE566', '#FFB347'][i % 4],
                      opacity: 0.2 + Math.random() * 0.2,
                      animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-[#77DD77]/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="relative w-20 h-20 bg-[#77DD77] rounded-full flex items-center justify-center shadow-lg shadow-[#77DD77]/30">
                    <svg className="w-10 h-10 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">¡Felicidades!</h1>
                <p className="text-white/60 mb-4">Ha aprobado el examen final</p>
                
                <div className="inline-flex items-center gap-2 bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-full px-5 py-2.5 mb-8">
                  <span className="text-[#77DD77] font-bold text-xl">{score}%</span>
                  <span className="text-[#77DD77]/70 text-sm">({correctCount}/{QUESTIONS_PER_EXAM} correctas)</span>
                </div>
                
                <Link 
                  href="/completar-perfil"
                  className="flex items-center justify-center gap-2 w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 mb-3 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Obtener Mi Certificado
                </Link>
                
                <Link 
                  href="/panel" 
                  className="block w-full text-white/50 py-3 rounded-xl hover:text-white transition-colors text-sm"
                >
                  Volver al Panel
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Failed State */}
              <div className="w-20 h-20 bg-[#FF9999]/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#FF9999]/30">
                <svg className="w-10 h-10 text-[#FF9999]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">No Aprobó Esta Vez</h1>
              <p className="text-white/60 mb-2">Obtuvo {score}% — necesita 70% para aprobar</p>
              
              <div className="bg-[#1C1C1C] rounded-xl p-4 mb-6 text-left border border-white/10">
                <p className="text-white/60 text-sm">
                  <strong className="text-white">No se preocupe</strong> — puede retomar el examen las veces que necesite. 
                  Le recomendamos revisar las lecciones antes de intentar de nuevo.
                </p>
              </div>
              
              <button 
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#9DD8F3] transition-all mb-3 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar Examen
              </button>
              
              <Link 
                href={`/curso/${courseType}`} 
                className="block w-full bg-transparent border border-white/20 text-white py-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                Revisar el Curso
              </Link>
            </>
          )}
        </div>
        
        {/* Float animation keyframes */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
          }
        `}</style>
      </main>
    );
  }

  // ============================================
  // INTRO SCREEN
  // ============================================
  if (phase === 'intro') {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <Link 
              href={`/curso/${courseType}`} 
              className="text-white/60 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Curso
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#7EC8E3]/10 border-2 border-[#7EC8E3]/30 mb-4">
                <svg className="w-10 h-10 text-[#7EC8E3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Examen Final</h1>
              <p className="text-white/50">Demuestre lo que ha aprendido para obtener su certificado</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FF9999]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#FF9999]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#FF9999] text-sm">{error}</p>
                    <p className="text-[#FF9999]/70 text-xs mt-1">Su progreso anterior está guardado. Puede intentar de nuevo.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Alert */}
            {hasResumable && (
              <div className="bg-[#FFB347]/10 border border-[#FFB347]/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#FFB347]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#FFB347]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#FFB347] mb-3">Tiene un examen en progreso</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={resume} 
                        className="bg-[#FFB347] text-[#1C1C1C] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#FFC05C] transition-colors"
                      >
                        Continuar Examen
                      </button>
                      <button 
                        onClick={start}
                        disabled={isStarting}
                        className="bg-white/10 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
                      >
                        {isStarting ? 'Cargando...' : 'Empezar de Nuevo'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Exam Info */}
            <div className="bg-[#1C1C1C] rounded-xl p-5 mb-6 border border-white/5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detalles del Examen
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 bg-[#7EC8E3]/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#7EC8E3]/20">
                    <span className="text-[#7EC8E3] font-bold">{QUESTIONS_PER_EXAM}</span>
                  </div>
                  <span>Preguntas de opción múltiple</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 bg-[#77DD77]/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#77DD77]/20">
                    <span className="text-[#77DD77] font-bold">70%</span>
                  </div>
                  <span>Puntuación mínima para aprobar ({PASS_SCORE} correctas)</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 bg-[#FFB347]/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#FFB347]/20">
                    <svg className="w-5 h-5 text-[#FFB347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span>Puede retomar el examen sin límite</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                  <span>Su progreso se guarda automáticamente</span>
                </li>
              </ul>
            </div>

            {/* Start Button */}
            {!hasResumable && (
              <button 
                onClick={start}
                disabled={isStarting}
                className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#9DD8F3] transition-all hover:shadow-lg hover:shadow-[#7EC8E3]/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Cargando Preguntas...</span>
                  </>
                ) : (
                  <>
                    <span>Comenzar Examen</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // EXAM SCREEN
  // ============================================
  const q = questions[currentIndex];
  if (!q) return null;

  const progressPercent = ((currentIndex + 1) / QUESTIONS_PER_EXAM) * 100;

  return (
    <main className="min-h-screen bg-background">
      {/* Progress Header */}
      <header className="bg-[#2A2A2A] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-white font-medium flex items-center gap-2">
              <span className="w-6 h-6 bg-[#7EC8E3]/20 rounded-full flex items-center justify-center text-[#7EC8E3] text-xs font-bold">
                {currentIndex + 1}
              </span>
              Pregunta {currentIndex + 1} de {QUESTIONS_PER_EXAM}
            </span>
            <span className="text-[#77DD77] font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {correctCount} correcta{correctCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-full bg-[#1C1C1C] rounded-full h-2.5 overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-[#7EC8E3] to-[#77DD77] h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progressPercent}%`,
                boxShadow: '0 0 12px rgba(126, 200, 227, 0.4)'
              }}
            />
          </div>
        </div>
      </header>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10">
          {/* Question Text */}
          <h2 className="text-lg md:text-xl font-semibold text-white mb-6 leading-relaxed">
            {q.question_text}
          </h2>
          
          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {q.shuffledAnswers.map((ans) => {
              const isSelected = selectedAnswer === ans.label;
              const showWrong = submitted && isSelected && !isCorrect;
              const showCorrect = submitted && isCorrect && isSelected;
              
              return (
                <button 
                  key={`q${currentIndex}-${ans.label}`} 
                  onClick={() => !submitted && setSelectedAnswer(ans.label)} 
                  disabled={submitted}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    ${showWrong 
                      ? 'border-[#FF9999] bg-[#FF9999]/10' 
                      : showCorrect
                        ? 'border-[#77DD77] bg-[#77DD77]/10'
                        : isSelected 
                          ? 'border-[#7EC8E3] bg-[#7EC8E3]/10' 
                          : 'border-white/10 hover:border-white/20 bg-[#1C1C1C]'
                    }
                    ${submitted ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className={`
                      w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all
                      ${showWrong 
                        ? 'bg-[#FF9999] text-[#1C1C1C]' 
                        : showCorrect
                          ? 'bg-[#77DD77] text-[#1C1C1C]'
                          : isSelected 
                            ? 'bg-[#7EC8E3] text-[#1C1C1C]' 
                            : 'bg-white/10 text-white/50'
                      }
                    `}>
                      {showCorrect ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : showWrong ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        ans.label
                      )}
                    </span>
                    <span className={`pt-1.5 ${isSelected || submitted ? 'text-white' : 'text-white/80'}`}>
                      {ans.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback Messages */}
          <div className={`transition-all duration-300 overflow-hidden ${showFeedback ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            {submitted && !isCorrect && (
              <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FF9999]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#FF9999]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#FF9999] mb-1">Respuesta Incorrecta</p>
                    <p className="text-[#FF9999]/80 text-sm">
                      Revisar: <strong>{wrongRed ? cleanRedirect(wrongRed) : 'el material del curso'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {submitted && isCorrect && (
              <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#77DD77] rounded-full flex items-center justify-center shadow-lg shadow-[#77DD77]/20">
                    <svg className="w-4 h-4 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-semibold text-[#77DD77]">¡Correcto!</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!submitted ? (
            <button 
              onClick={handleSubmit} 
              disabled={!selectedAnswer} 
              className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#9DD8F3] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              Confirmar Respuesta
            </button>
          ) : (
            <button 
              onClick={handleNext} 
              className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#9DD8F3] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  Siguiente Pregunta
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                'Ver Resultados'
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}