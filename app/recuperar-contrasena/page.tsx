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

  // Initial check
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/iniciar-sesion'; return; }

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
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_type', courseType)
        .single();

      if (!existingCert) {
        const certNumber = `PKF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const verifyCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        await supabase
          .from('certificates')
          .insert({
            user_id: user.id,
            course_type: courseType,
            certificate_number: certNumber,
            verification_code: verifyCode
          });

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
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></main>;
  }

  if (phase === 'done') {
    const passed = correctCount >= PASS_SCORE;
    const score = Math.round((correctCount / QUESTIONS_PER_EXAM) * 100);
    
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {passed ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Felicitaciones!</h1>
              <p className="text-gray-600 mb-6">Ha aprobado con {score}% ({correctCount}/{QUESTIONS_PER_EXAM})</p>
              
              <Link 
                href="/completar-perfil"
                className="block w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors mb-3"
              >
                Descargar Certificado
              </Link>
              
              <Link 
                href="/panel" 
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Volver a los Cursos
              </Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">No Aprobó</h1>
              <p className="text-gray-600 mb-6">Obtuvo {score}% — necesita 70%</p>
              <button 
                onClick={handleRetry}
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mb-3"
              >
                Reintentar
              </button>
              <Link 
                href={`/curso/${courseType}`} 
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
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
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link href={`/curso/${courseType}`} className="text-blue-600 text-sm">← Volver al Curso</Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Examen Final</h1>
            {hasResumable && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-amber-800 mb-2">Examen en progreso</p>
                <div className="flex gap-3">
                  <button onClick={resume} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">Continuar</button>
                  <button onClick={start} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Empezar de Nuevo</button>
                </div>
              </div>
            )}
            <ul className="space-y-2 text-gray-600 mb-8">
              <li>• {QUESTIONS_PER_EXAM} preguntas</li>
              <li>• Necesita 70% ({PASS_SCORE} correctas)</li>
              <li>• Progreso guardado automáticamente</li>
            </ul>
            {!hasResumable && <button onClick={start} className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 text-lg">Comenzar Examen</button>}
          </div>
        </div>
      </main>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pregunta {currentIndex + 1} de {QUESTIONS_PER_EXAM}</span>
            <span>{correctCount} correctas</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / QUESTIONS_PER_EXAM) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8" key={currentIndex}>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{q.question_text}</h2>
          <div className="space-y-3 mb-6">
            {q.shuffledAnswers.map((ans) => {
              const isSel = selectedAnswer === ans.label;
              const showR = submitted && isSel && !isCorrect;
              return (
                <button 
                  key={`q${currentIndex}-${ans.label}`} 
                  onClick={() => !submitted && setSelectedAnswer(ans.label)} 
                  disabled={submitted}
                  className={`w-full p-4 rounded-lg border-2 text-left text-gray-900 transition-colors ${showR ? 'border-red-500 bg-red-50' : isSel ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="font-semibold mr-2">{ans.label}.</span>{ans.text}
                </button>
              );
            })}
          </div>
          {submitted && !isCorrect && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-red-800 mb-2">Incorrecto</p>
              <p className="text-red-600 text-sm"><strong>Revise:</strong> {wrongRed ? cleanRedirect(wrongRed) : 'el material del curso'}</p>
            </div>
          )}
          {submitted && isCorrect && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-green-800">¡Correcto!</p>
            </div>
          )}
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!selectedAnswer} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">Confirmar</button>
          ) : (
            <button onClick={handleNext} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">{currentIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}</button>
          )}
        </div>
      </div>
    </main>
  );
}