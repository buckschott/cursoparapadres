'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

interface PurchaseDetails {
  courseName: string;
  amount: string;
  email: string;
}

// ============================================
// PREVIEW MODE (Admin Testing Only)
// ============================================

const PREVIEW_CONFIG = {
  allowedEmails: [
    'info@claseparapadres.com',
    'info@puttingkidsfirst.org',
  ],
  mockPurchase: {
    courseName: 'Clase de Coparentalidad',
    amount: '$60.00',
    email: 'preview@test.com',
  },
};

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
// HAND-DRAWN CHECKMARK COMPONENT
// ============================================

interface HandDrawnCheckmarkProps {
  animate: boolean;
  className?: string;
}

function HandDrawnCheckmark({ animate, className = '' }: HandDrawnCheckmarkProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 1020.47 1020.29" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-hidden="true"
    >
      <path 
        d="M1010.22,510.25c-5.46,154.58-74.13,293.54-180.55,384.66-85.58,73.28-203.14,113.92-319.45,115.34-134.55,1.64-258.17-51.66-346.59-139.61C74.41,781.89,16.35,645.85,10.22,510.25c-3.71-82.01,40.27-228.24,110.17-313.13C213.44,84.12,352.09,15.88,510.22,10.25c114.12-4.06,217.39,41.04,303.61,102.70,114.63,81.99,202.01,237.92,196.39,397.30Z" 
        fill="none" 
        stroke="#77DD77" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="20"
        className={animate ? 'checkmark-circle-path' : ''}
        style={{
          strokeDasharray: animate ? 3200 : 0,
          strokeDashoffset: animate ? 0 : 0,
        }}
      />
      <path 
        d="M864.04,312.39c-223.76,231.76-239.76,251.45-497.94,497.76-105.94-98.18-116.61-111.03-209.67-211.84,44.34-53.13,51.61-58.47,103.49-102.10,59.15,45.33,108.38,103.22,108.77,103.80,126.22-133.54,257.68-265.64,393.37-389.86,51.07,44.36,58.07,51.86,101.98,102.24Z" 
        fill="none" 
        stroke="#77DD77" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="20"
        className={animate ? 'checkmark-check-path' : ''}
        style={{
          strokeDasharray: animate ? 2400 : 0,
          strokeDashoffset: animate ? 0 : 0,
        }}
      />
    </svg>
  );
}

// ============================================
// SUCCESS CONTENT
// ============================================

function ExitoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  
  const isPreviewMode = searchParams.get('preview') === 'true';
  const previewEmail = searchParams.get('email') || '';
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [checkmarkAnimating, setCheckmarkAnimating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      if (isPreviewMode && previewEmail) {
        const isAllowed = PREVIEW_CONFIG.allowedEmails.some(
          email => email.toLowerCase() === previewEmail.toLowerCase()
        );
        
        if (isAllowed) {
          setIsPreview(true);
          setPurchaseDetails({
            ...PREVIEW_CONFIG.mockPurchase,
            email: previewEmail,
          });
          setVerifying(false);
          
          if (prefersReducedMotion) {
            setPageReady(true);
            setCheckmarkAnimating(true);
            setShowForm(true);
          } else {
            setTimeout(() => setPageReady(true), 100);
            setTimeout(() => setCheckmarkAnimating(true), 300);
            setTimeout(() => setShowForm(true), 1200);
          }
          return;
        }
      }
      
      if (!sessionId) {
        setSessionError('No se encontro informacion de la compra.');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setSessionError(data.error || 'No pudimos verificar su compra.');
          setVerifying(false);
          return;
        }

        setPurchaseDetails({
          courseName: data.courseName,
          amount: data.amount,
          email: data.email,
        });
        setVerifying(false);

        if (prefersReducedMotion) {
          setPageReady(true);
          setCheckmarkAnimating(true);
          setShowForm(true);
        } else {
          setTimeout(() => setPageReady(true), 100);
          setTimeout(() => setCheckmarkAnimating(true), 300);
          setTimeout(() => setShowForm(true), 1200);
        }

      } catch (err) {
        setSessionError('Error de conexion.');
        setVerifying(false);
      }
    };

    verifySession();
  }, [sessionId, prefersReducedMotion, isPreviewMode, previewEmail]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setSessionError(null);
    setVerifying(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!sessionId) {
      setSessionError('No se encontro informacion de la compra.');
      setVerifying(false);
      setIsRetrying(false);
      return;
    }

    try {
      const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setSessionError(data.error || 'No pudimos verificar su compra.');
        setVerifying(false);
        setIsRetrying(false);
        return;
      }

      setPurchaseDetails({
        courseName: data.courseName,
        amount: data.amount,
        email: data.email,
      });
      setVerifying(false);
      setIsRetrying(false);

      if (prefersReducedMotion) {
        setPageReady(true);
        setCheckmarkAnimating(true);
        setShowForm(true);
      } else {
        setTimeout(() => setPageReady(true), 100);
        setTimeout(() => setCheckmarkAnimating(true), 300);
        setTimeout(() => setShowForm(true), 1200);
      }

    } catch (err) {
      setSessionError('Error de conexion.');
      setVerifying(false);
      setIsRetrying(false);
    }
  };

  const passwordLength = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = passwordLength && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPreview) {
      setError('Modo de prueba: El formulario no envia datos reales. Use una compra real para probar el flujo completo.');
      return;
    }
    
    if (!canSubmit) return;
    if (!sessionId) {
      setError('Sesion no valida. Por favor, contacte soporte.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/complete-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Algo salio mal. Por favor, intente de nuevo.');
        setIsSubmitting(false);
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: password,
      });

      if (signInError) {
        console.error('Client sign-in error:', signInError);
        setError('Cuenta creada. Por favor, inicie sesion.');
        setTimeout(() => {
          router.push('/iniciar-sesion');
        }, 2000);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/panel?purchased=true');
      }, 800);

    } catch (err) {
      setError('Error de conexion. Por favor, intente de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return <LoadingState />;
  }

  // ============================================
  // SESSION ERROR STATE - Reframed as "Still Processing"
  // ============================================
  if (sessionError) {
    return (
      <main className="min-h-screen bg-background">
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
                Putting Kids First<sup className="text-[8px] relative -top-2">&reg;</sup>
              </span>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center px-4 py-12 md:py-16">
          <div className="max-w-lg w-full">
            <div className="bg-[#2A2A2A] rounded-2xl p-8 md:p-10 border border-white/10">
              
              {/* Payment Confirmed - Reassurance First */}
              <div className="flex items-center justify-center gap-3 mb-6 pb-6 border-b border-white/10">
                <div className="w-10 h-10 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#1C1C1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#77DD77] font-semibold text-lg">
                  Su pago fue recibido
                </span>
              </div>
              
              {/* Still Processing Message */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#7EC8E3]/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-3">
                  Su cuenta se esta configurando
                </h1>
                
                <p className="text-white/70">
                  Esto puede tomar unos momentos. Mientras tanto, le enviamos un correo con sus datos de acceso.
                </p>
              </div>

              {/* What to Do - Clear Steps */}
              <div className="bg-[#1C1C1C] rounded-xl p-5 mb-6 border border-white/5">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Que hacer ahora</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#7EC8E3]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#7EC8E3] text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Revise su correo electronico</p>
                      <p className="text-white/50 text-sm">Le enviamos instrucciones de acceso (revise spam tambien)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#7EC8E3]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#7EC8E3] text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">O intente de nuevo en unos segundos</p>
                      <p className="text-white/50 text-sm">A veces solo necesita un momento mas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 px-6 rounded-xl font-bold hover:bg-[#9DD8F3] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isRetrying ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Intentar de Nuevo</span>
                    </>
                  )}
                </button>
                
                <Link
                  href="/iniciar-sesion"
                  className="block w-full bg-white/10 text-white py-4 px-6 rounded-xl font-medium hover:bg-white/20 transition-colors text-center"
                >
                  Ya tengo mi contrasena - Iniciar Sesion
                </Link>
              </div>
              
              {/* Support - Minimized */}
              <p className="text-white/40 text-xs text-center mt-6">
                Sigue sin funcionar despues de varios intentos?{' '}
                <a
                  href="mailto:info@claseparapadres.com?subject=Problema%20al%20crear%20cuenta%20despues%20de%20pagar"
                  className="text-[#7EC8E3] hover:text-[#9DD8F3] underline underline-offset-2"
                >
                  Escribanos
                </a>
                {' '}y lo resolvemos inmediatamente.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="bg-[#FFE566] text-[#1C1C1C] text-center py-2 px-4 text-sm font-bold">
          MODO DE PRUEBA - Los datos son simulados. El formulario no enviara.
        </div>
      )}
      
      {/* Minimal Header */}
      <header className="bg-background border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="" 
              className="h-6 w-auto opacity-80" 
              aria-hidden="true" 
            />
            <span className="text-lg font-semibold text-white font-brand">
              Putting Kids First<sup className="text-[8px] relative -top-2">&reg;</sup>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-8 md:py-12">
        <div className={`max-w-md w-full transition-all duration-500 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Main Card */}
          <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10 relative overflow-hidden">
            
            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#77DD77]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              
              {/* Step 1: Payment Confirmed */}
              <div className={`flex items-center justify-center gap-3 mb-6 transition-all duration-500 ${checkmarkAnimating ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-8 h-8">
                  <HandDrawnCheckmark 
                    animate={checkmarkAnimating && !prefersReducedMotion} 
                    className="w-full h-full"
                  />
                </div>
                <span className="text-[#77DD77] font-medium">
                  Pago recibido
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mb-6" />

              {/* Step 2: FINAL STEP */}
              <div className="text-center mb-6">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
                  Paso final
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Cree su cuenta
                </h1>
                <p className="text-white/60 text-sm">
                  Esto toma 30 segundos. Necesita esto para acceder a su clase.
                </p>
              </div>

              {/* Purchase Summary */}
              {purchaseDetails && (
                <div className="bg-[#1C1C1C] rounded-xl p-4 mb-6 border border-white/5">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Clase</p>
                      <p className="text-white font-medium">{purchaseDetails.courseName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs mb-1">Total</p>
                      <p className="text-[#77DD77] font-bold">{purchaseDetails.amount}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Form */}
              <div className={`transition-all duration-500 ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                
                {success ? (
                  <div className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-[#77DD77]/20 rounded-full">
                      <svg className="w-7 h-7 text-[#77DD77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white text-lg font-semibold mb-1">Cuenta creada!</p>
                    <p className="text-white/60 text-sm">Redirigiendo a su clase...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Display */}
                    {purchaseDetails && (
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                          Correo electronico
                        </label>
                        <div className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-3 text-white/70">
                          {purchaseDetails.email}
                        </div>
                      </div>
                    )}

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                        Crear contrasena
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#1C1C1C] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#7EC8E3] focus:ring-1 focus:ring-[#7EC8E3] transition-colors pr-12"
                          placeholder="Minimo 6 caracteres"
                          disabled={isSubmitting}
                          autoComplete="new-password"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-1"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      
                      {/* Password strength indicator */}
                      {password.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                password.length >= 12 ? 'w-full bg-[#77DD77]' :
                                password.length >= 8 ? 'w-2/3 bg-[#FFE566]' :
                                password.length >= 6 ? 'w-1/3 bg-[#77DD77]' :
                                'w-1/4 bg-[#FF9999]'
                              }`}
                            />
                          </div>
                          <span className={`text-xs ${passwordLength ? 'text-[#77DD77]' : 'text-white/40'}`}>
                            {passwordLength ? String.fromCharCode(10003) : `${6 - password.length} mas`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                        Confirmar contrasena
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full bg-[#1C1C1C] border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors pr-12 ${
                            confirmPassword.length > 0 
                              ? passwordsMatch 
                                ? 'border-[#77DD77] focus:border-[#77DD77] focus:ring-1 focus:ring-[#77DD77]' 
                                : 'border-[#FF9999] focus:border-[#FF9999] focus:ring-1 focus:ring-[#FF9999]'
                              : 'border-white/15 focus:border-[#7EC8E3] focus:ring-1 focus:ring-[#7EC8E3]'
                          }`}
                          placeholder="Repita su contrasena"
                          disabled={isSubmitting}
                          autoComplete="new-password"
                        />
                        {confirmPassword.length > 0 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {passwordsMatch ? (
                              <svg className="w-5 h-5 text-[#77DD77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-[#FF9999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="mt-1 text-xs text-[#FF9999]">Las contrasenas no coinciden</p>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 rounded-xl px-4 py-3">
                        <p className="text-[#FF9999] text-sm">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                        canSubmit
                          ? 'bg-[#77DD77] text-[#1C1C1C] hover:bg-[#88EE88] hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner />
                          <span>Creando cuenta...</span>
                        </>
                      ) : (
                        <>
                          <span>Acceder a Mi Clase</span>
                          <svg 
                            className="w-5 h-5" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Fallback hint */}
          <p className={`text-white/30 text-xs text-center mt-4 transition-all duration-500 delay-300 ${showForm ? 'opacity-100' : 'opacity-0'}`}>
            Necesita salir? Revise su correo - le enviamos instrucciones de acceso.
          </p>

          {/* Trust Reassurance */}
          <div className={`mt-4 text-center transition-all duration-500 delay-500 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-white/30 text-xs flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Conexion segura
            </p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        .checkmark-circle-path {
          stroke-dasharray: 3200;
          stroke-dashoffset: 3200;
          animation: drawCircle 0.6s ease-out forwards;
        }
        
        .checkmark-check-path {
          stroke-dasharray: 2400;
          stroke-dashoffset: 2400;
          animation: drawCheck 0.5s ease-out 0.4s forwards;
        }
        
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .checkmark-circle-path,
          .checkmark-check-path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}

// ============================================
// ICONS
// ============================================

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg 
      className="w-5 h-5 animate-spin" 
      viewBox="0 0 24 24" 
      fill="none"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="3"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
