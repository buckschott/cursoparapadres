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
  
  // Exam state
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongRed, setWrongRed] = useState('');
  
  const supabase = createClient();

  // Save state to localStorage whenever exam state changes
  useEffect(() => {
    if (phase === 'exam' && questions.length > 0) {
      const state = { questions, currentIndex, correctCount, selectedAnswer, submitted, isCorrect, wrongRed };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    }
  }, [phase, questions, currentIndex, correctCount, selectedAnswer, submitted, isCorrect, wrongRed, STORAGE_KEY]);

  // Initial check - including certificate check
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/iniciar-sesion'; return; }

      // Check if user already has a certificate for this course
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .limit(1);

      if (existingCert && existingCert.length > 0) {
        window.location.href = `/certificado/${existingCert[0].id}`;
        return;
      }

      const { data: prog } = await supabase
        .from('course_progress')
        .select('lessons_completed')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .single();

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
    };
    check();
  }, [courseType, STORAGE_KEY]);

  const clear = useCallback(() => { 
    localStorage.removeItem(STORAGE_KEY); 
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
        setPhase('exam');
        setHasResumable(false);
      }
    } catch { clear(); }
  };

  const start = async () => {
    clear();
    setHasResumable(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const versions = ['A', 'B', 'C'];
    const ver = versions[Math.floor(Math.random() * versions.length)];

    const { data: qs } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('version', ver);

    if (!qs?.length) { alert('Error al cargar el examen. Por favor, intente de nuevo.'); return; }

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
    setPhase('exam');
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
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setIsCorrect(false);
      setWrongRed('');
    } else {
      finishExam();
    }
  };

  const finishExam = async () => {
    clear();
    
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
    setPhase('intro');
  };

  // ============================================
  // LOADING STATE
  // ============================================
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
          <p className="text-white/70">Cargando examen...</p>
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
        <div className="bg-[#2A2A2A] rounded-2xl p-8 md:p-10 max-w-md w-full text-center border border-white/10">
          {passed ? (
            <>
              {/* Success State */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-[#77DD77]/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative w-20 h-20 bg-[#77DD77]/20 rounded-full flex items-center justify-center border-2 border-[#77DD77]/40">
                  <svg className="w-10 h-10 text-[#77DD77]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">¡Felicidades!</h1>
              <p className="text-white/70 mb-2">Ha aprobado el examen</p>
              
              <div className="inline-flex items-center gap-2 bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-full px-4 py-2 mb-8">
                <span className="text-[#77DD77] font-bold text-lg">{score}%</span>
                <span className="text-[#77DD77]/70 text-sm">({correctCount}/{QUESTIONS_PER_EXAM} correctas)</span>
              </div>
              
              <Link 
                href="/completar-perfil"
                className="block w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 mb-3"
              >
                Obtener Mi Certificado
              </Link>
              
              <Link 
                href="/panel" 
                className="block w-full bg-transparent text-white/70 py-3 rounded-xl hover:text-white transition-colors text-sm"
              >
                Volver al Panel
              </Link>
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
              <p className="text-white/70 mb-2">Obtuvo {score}% — necesita 70% para aprobar</p>
              
              <div className="bg-[#1C1C1C] rounded-xl p-4 mb-6 text-left">
                <p className="text-white/60 text-sm">
                  No se preocupe — puede retomar el examen las veces que necesite. 
                  Le recomendamos revisar las lecciones antes de intentar de nuevo.
                </p>
              </div>
              
              <button 
                onClick={handleRetry}
                className="block w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#9DD8F3] transition-all mb-3"
              >
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
        <header className="bg-background border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <Link 
              href={`/curso/${courseType}`} 
              className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7EC8E3]/10 border-2 border-[#7EC8E3]/30 mb-4">
                <svg className="w-8 h-8 text-[#7EC8E3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Examen Final</h1>
              <p className="text-white/60">Demuestre lo que ha aprendido para obtener su certificado</p>
            </div>

            {/* Resume Alert */}
            {hasResumable && (
              <div className="bg-[#FFB347]/10 border border-[#FFB347]/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FFB347]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#FFB347]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#FFB347] mb-2">Tiene un examen en progreso</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={resume} 
                        className="bg-[#FFB347] text-[#1C1C1C] px-4 py-2 rounded-lg font-semibold hover:bg-[#FFC05C] transition-colors"
                      >
                        Continuar
                      </button>
                      <button 
                        onClick={start} 
                        className="bg-white/10 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                      >
                        Empezar de Nuevo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Exam Info */}
            <div className="bg-[#1C1C1C] rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-white mb-4">Detalles del Examen</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-8 h-8 bg-[#7EC8E3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#7EC8E3] font-bold text-sm">{QUESTIONS_PER_EXAM}</span>
                  </div>
                  <span>Preguntas de opción múltiple</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-8 h-8 bg-[#77DD77]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#77DD77] font-bold text-sm">70%</span>
                  </div>
                  <span>Puntuación mínima para aprobar ({PASS_SCORE} correctas)</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-8 h-8 bg-[#FFB347]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#FFB347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span>Puede retomar el examen sin límite</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#9DD8F3] transition-all hover:shadow-lg hover:shadow-[#7EC8E3]/25 flex items-center justify-center gap-2"
              >
                Comenzar Examen
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
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
      <header className="bg-[#2A2A2A] border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-white font-medium">
              Pregunta {currentIndex + 1} de {QUESTIONS_PER_EXAM}
            </span>
            <span className="text-[#77DD77] font-medium">
              {correctCount} correcta{correctCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-full bg-[#1C1C1C] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#7EC8E3] to-[#7EC8E3] h-2 rounded-full transition-all duration-500"
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
        <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10" key={currentIndex}>
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
                    ${submitted ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${showWrong 
                        ? 'bg-[#FF9999] text-[#1C1C1C]' 
                        : showCorrect
                          ? 'bg-[#77DD77] text-[#1C1C1C]'
                          : isSelected 
                            ? 'bg-[#7EC8E3] text-[#1C1C1C]' 
                            : 'bg-white/10 text-white/60'
                      }
                    `}>
                      {ans.label}
                    </span>
                    <span className={`pt-1 ${isSelected || submitted ? 'text-white' : 'text-white/80'}`}>
                      {ans.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback Messages */}
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
                    Le recomendamos revisar: <strong>{wrongRed ? cleanRedirect(wrongRed) : 'el material del curso'}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {submitted && isCorrect && (
            <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#77DD77] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="font-semibold text-[#77DD77]">¡Correcto!</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!submitted ? (
            <button 
              onClick={handleSubmit} 
              disabled={!selectedAnswer} 
              className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#9DD8F3] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Confirmar Respuesta
            </button>
          ) : (
            <button 
              onClick={handleNext} 
              className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#9DD8F3] transition-all flex items-center justify-center gap-2"
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