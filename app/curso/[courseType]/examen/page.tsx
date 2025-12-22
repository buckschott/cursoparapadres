'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { QUESTIONS_PER_EXAM, PASS_THRESHOLD } from '@/lib/courseContent';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
        // Already passed! Redirect to certificate
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

    if (!qs?.length) { alert('Error'); return; }

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

        // Send email to attorney if provided
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

  if (loading) {
    return <main className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EC8E3]"></div></main>;
  }

  if (phase === 'done') {
    const passed = correctCount >= PASS_SCORE;
    const score = Math.round((correctCount / QUESTIONS_PER_EXAM) * 100);
    
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-background rounded-2xl shadow-lg shadow-black/30 p-8 max-w-md w-full text-center">
          {passed ? (
            <>
              <div className="w-20 h-20 bg-[#77DD77]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#77DD77]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">¡Felicitaciones!</h1>
              <p className="text-white/70 mb-6">Ha aprobado con {score}% ({correctCount}/{QUESTIONS_PER_EXAM})</p>
              
              <Link 
                href="/completar-perfil"
                className="block w-full bg-[#7EC8E3] text-white py-4 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors mb-3"
              >
                Descargar Certificado
              </Link>
              
              <Link 
                href="/panel" 
                className="block w-full bg-[#2A2A2A] text-white py-3 rounded-lg hover:bg-[#333333] transition-colors"
              >
                Volver a los Cursos
              </Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-[#FF9999]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#FF9999]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">No Aprobó</h1>
              <p className="text-white/70 mb-6">Obtuvo {score}% — necesita 70%</p>
              <button 
                onClick={handleRetry}
                className="block w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] mb-3"
              >
                Reintentar
              </button>
              <Link 
                href={`/curso/${courseType}`} 
                className="block w-full bg-[#2A2A2A] text-white py-3 rounded-lg hover:bg-[#333333]"
              >
                Revisar el Curso
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  if (phase === 'intro') {
    return (
      <main className="min-h-screen bg-background">
        <header className="bg-background border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link href={`/curso/${courseType}`} className="text-[#7EC8E3] text-sm">← Volver al Curso</Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-background rounded-2xl shadow-lg shadow-black/30 p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Examen Final</h1>
            {hasResumable && (
              <div className="bg-[#FFB347]/10 border border-[#FFB347]/30 rounded-lg p-4 mb-6">
                <p className="font-semibold text-[#FFB347] mb-2">Examen en progreso</p>
                <div className="flex gap-3">
                  <button onClick={resume} className="bg-[#FFB347] text-white px-4 py-2 rounded-lg hover:bg-[#FFA337]">Continuar</button>
                  <button onClick={start} className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30">Empezar de Nuevo</button>
                </div>
              </div>
            )}
            <ul className="space-y-2 text-white/70 mb-8">
              <li>• {QUESTIONS_PER_EXAM} preguntas</li>
              <li>• Necesita 70% ({PASS_SCORE} correctas)</li>
              <li>• Progreso guardado automáticamente</li>
            </ul>
            {!hasResumable && <button onClick={start} className="w-full bg-[#7EC8E3] text-white py-4 rounded-lg font-bold hover:bg-[#6BB8D3] text-lg">Comenzar Examen</button>}
          </div>
        </div>
      </main>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-background border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Pregunta {currentIndex + 1} de {QUESTIONS_PER_EXAM}</span>
            <span>{correctCount} correctas</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-[#7EC8E3] h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / QUESTIONS_PER_EXAM) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-background rounded-2xl shadow-lg shadow-black/30 p-8" key={currentIndex}>
          <h2 className="text-lg font-semibold text-white mb-6">{q.question_text}</h2>
          <div className="space-y-3 mb-6">
            {q.shuffledAnswers.map((ans) => {
              const isSel = selectedAnswer === ans.label;
              const showR = submitted && isSel && !isCorrect;
              return (
                <button 
                  key={`q${currentIndex}-${ans.label}`} 
                  onClick={() => !submitted && setSelectedAnswer(ans.label)} 
                  disabled={submitted}
                  className={`w-full p-4 rounded-lg border-2 text-left text-white transition-colors ${showR ? 'border-[#FF9999]/100 bg-[#FF9999]/10' : isSel ? 'border-[#7EC8E3] bg-[#7EC8E3]/10' : 'border-[#FFFFFF]/15 hover:border-[#FFFFFF]/20'} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="font-semibold mr-2">{ans.label}.</span>{ans.text}
                </button>
              );
            })}
          </div>
          {submitted && !isCorrect && (
            <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 rounded-lg p-4 mb-6">
              <p className="font-semibold text-[#FF9999] mb-2">Incorrecto</p>
              <p className="text-[#FF9999] text-sm"><strong>Revise:</strong> {wrongRed ? cleanRedirect(wrongRed) : 'el material del curso'}</p>
            </div>
          )}
          {submitted && isCorrect && (
            <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-lg p-4 mb-6">
              <p className="font-semibold text-[#77DD77]">¡Correcto!</p>
            </div>
          )}
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!selectedAnswer} className="w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] disabled:opacity-50 transition-colors">Confirmar</button>
          ) : (
            <button onClick={handleNext} className="w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors">{currentIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}</button>
          )}
        </div>
      </div>
    </main>
  );
}