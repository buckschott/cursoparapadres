'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ============================================
// MAIN COMPONENT (with Suspense boundary)
// ============================================

export default function ExitoPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ExitoContent />
    </Suspense>
  );
}

// ============================================
// LOADING STATE
// ============================================

function LoadingState() {
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
        <p className="text-white/70 text-lg">Confirmando su compra...</p>
      </div>
    </main>
  );
}

// ============================================
// SUCCESS CONTENT
// ============================================

function ExitoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [pageReady, setPageReady] = useState(false);
  const [checkmarkDrawn, setCheckmarkDrawn] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Staggered animation sequence
    const timer1 = setTimeout(() => setPageReady(true), 100);
    const timer2 = setTimeout(() => setCheckmarkDrawn(true), 400);
    const timer3 = setTimeout(() => setShowParticles(true), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.svg" 
              alt="" 
              className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity" 
              aria-hidden="true" 
            />
            <span className="text-lg font-semibold text-white font-brand">
              Putting Kids First<sup className="text-[8px] relative -top-2">®</sup>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12 md:py-20">
        <div className={`max-w-lg w-full transition-all duration-700 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Success Card */}
          <div className="bg-[#2A2A2A] rounded-2xl p-8 md:p-10 border border-white/10 text-center relative overflow-hidden">
            
            {/* Celebration Particles */}
            {showParticles && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full animate-float-up"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: '-10px',
                      width: `${4 + Math.random() * 8}px`,
                      height: `${4 + Math.random() * 8}px`,
                      backgroundColor: ['#77DD77', '#7EC8E3', '#FFE566', '#FFB347', '#FF9999'][i % 5],
                      opacity: 0.6 + Math.random() * 0.4,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${3 + Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#77DD77]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Animated Checkmark */}
              <div className="inline-flex items-center justify-center w-28 h-28 mb-6 relative">
                {/* Outer ring pulse */}
                <div className={`absolute inset-0 rounded-full bg-[#77DD77]/20 transition-all duration-1000 ${checkmarkDrawn ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`} />
                
                {/* Main circle */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="#77DD77"
                    className={`transition-all duration-500 ${checkmarkDrawn ? 'opacity-100' : 'opacity-0'}`}
                  />
                  
                  {/* Drawing circle border */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#77DD77" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={checkmarkDrawn ? 0 : 283}
                    className="transition-all duration-700 ease-out"
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                  />
                  
                  {/* Checkmark that draws */}
                  <path 
                    d="M30 50 L45 65 L70 35" 
                    fill="none" 
                    stroke={checkmarkDrawn ? '#1C1C1C' : '#77DD77'}
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeDasharray="60"
                    strokeDashoffset={checkmarkDrawn ? 0 : 60}
                    className="transition-all duration-500 ease-out"
                    style={{ transitionDelay: '300ms' }}
                  />
                </svg>
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¡Todo listo!
              </h1>
              
              {/* Subheading */}
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Su curso está listo. Puede comenzar ahora o regresar en cualquier momento — su progreso se guardará automáticamente.
              </p>

              {/* CTA Button */}
              <Link
                href="/panel"
                className="inline-flex items-center justify-center gap-3 w-full bg-[#77DD77] text-[#1C1C1C] py-4 px-8 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98] mb-4 group"
              >
                <span>Comenzar el Curso</span>
                <svg 
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Email notice */}
              <div className="bg-[#1C1C1C] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3 text-left">
                  <div className="w-8 h-8 bg-[#7EC8E3]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">
                      Un correo de confirmación está en camino.
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      Si no lo ve, revise su carpeta de correo no deseado (spam o junk).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Reassurance */}
          <div className={`mt-6 text-center transition-all duration-700 delay-500 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-white/40 text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pago seguro procesado por Stripe
            </p>
          </div>

          {/* Help Link */}
          <div className={`mt-4 text-center transition-all duration-700 delay-700 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-white/40 text-sm">
              ¿Tiene preguntas?{' '}
              <a 
                href="mailto:info@cursoparapadres.org" 
                className="text-[#7EC8E3] hover:text-[#9DD8F3] transition-colors underline underline-offset-2"
              >
                Contáctenos
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-400px) rotate(720deg) scale(0);
            opacity: 0;
          }
        }
        
        .animate-float-up {
          animation: float-up ease-out forwards;
        }
      `}</style>
    </main>
  );
}
