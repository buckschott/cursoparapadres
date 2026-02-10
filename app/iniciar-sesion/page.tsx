'use client';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ============================================
// MAIN COMPONENT (with Suspense boundary)
// ============================================

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}

// ============================================
// LOADING STATE
// ============================================

function LoginLoading() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
          <div className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">Cargando...</span>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// HAND-DRAWN WELCOME BRACKETS
// ============================================

function WelcomeBrackets({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    // Small delay before starting animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Hand-drawn bracket paths (slightly wobbly for organic feel)
  // Left bracket: draws from top-left corner down and around
  const leftBracketPath = "M 24 8 Q 22 8 20 10 Q 14 14 12 24 Q 10 34 12 44 Q 14 54 20 58 Q 22 60 24 60";
  // Right bracket: draws from bottom-right corner up and around  
  const rightBracketPath = "M 8 60 Q 10 60 12 58 Q 18 54 20 44 Q 22 34 20 24 Q 18 14 12 10 Q 10 8 8 8";

  const pathLength = 80; // Approximate path length

  return (
    <div className="relative flex items-center justify-center gap-3 mb-2">
      {/* Left Bracket */}
      <svg 
        width="32" 
        height="68" 
        viewBox="0 0 32 68" 
        fill="none" 
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d={leftBracketPath}
          stroke="#77DD77"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: prefersReducedMotion ? 0 : (isVisible ? 0 : pathLength),
            transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 0.6s ease-out',
          }}
        />
      </svg>

      {/* Welcome Text */}
      <div className="text-center">
        {children}
      </div>

      {/* Right Bracket */}
      <svg 
        width="32" 
        height="68" 
        viewBox="0 0 32 68" 
        fill="none" 
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d={rightBracketPath}
          stroke="#77DD77"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: prefersReducedMotion ? 0 : (isVisible ? 0 : pathLength),
            transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 0.6s ease-out 0.15s', // Slight delay for right bracket
          }}
        />
      </svg>
    </div>
  );
}

// ============================================
// LOGIN CONTENT
// ============================================

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<{ message: string; showRecoveryLink: boolean } | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const supabase = createClient();
  const searchParams = useSearchParams();

  // Handle auth callback errors from URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    
    if (errorParam === 'invalid_token') {
      setAuthError({
        message: 'El enlace ha expirado o no es válido. Por favor, solicite uno nuevo.',
        showRecoveryLink: true,
      });
    } else if (errorParam === 'auth') {
      setAuthError({
        message: 'Hubo un problema con la autenticación. Por favor, intente de nuevo.',
        showRecoveryLink: false,
      });
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginAttempts(prev => prev + 1);
      setError('login_failed');
      setLoading(false);
    } else {
      // Redirect to ?next= param if present (e.g., /admin/support), otherwise /panel
      const nextPath = searchParams.get('next') || '/panel';
      window.location.href = nextPath;
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
          
          {/* Welcome Header with Hand-Drawn Brackets */}
          <WelcomeBrackets>
            <h1 className="text-2xl font-bold text-white">
              ¡Bienvenido de nuevo!
            </h1>
          </WelcomeBrackets>
          
          <p className="text-white/70 mb-6 text-center">
            Está a solo un paso de continuar su clase.
          </p>

          {/* Auth callback error (from redirect) */}
          {authError && (
            <div className="bg-[#FFE566]/10 border border-[#FFE566]/30 text-[#FFE566] px-4 py-3 rounded-lg mb-6">
              <p>{authError.message}</p>
              {authError.showRecoveryLink && (
                <Link 
                  href="/recuperar-contrasena" 
                  className="inline-block mt-2 text-sm font-medium underline hover:text-white"
                >
                  Solicitar nuevo enlace
                </Link>
              )}
            </div>
          )}

          {/* Login error (from form submission) - IMPROVED */}
          {error === 'login_failed' && (
            <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 rounded-lg mb-6 overflow-hidden">
              <div className="px-4 py-3">
                <p className="text-[#FF9999] font-medium mb-2">
                  No pudimos iniciar sesión
                </p>
                <p className="text-[#FF9999]/80 text-sm">
                  Verifique que su correo y contraseña estén correctos.
                </p>
              </div>
              
              {/* Helpful hints after failed attempts */}
              <div className="bg-[#1C1C1C] px-4 py-3 border-t border-[#FF9999]/20">
                <p className="text-white/60 text-sm mb-2">Sugerencias:</p>
                <ul className="text-white/50 text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-[#7EC8E3]">•</span>
                    <span>Revise que no haya espacios extra en el correo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7EC8E3]">•</span>
                    <span>Verifique mayúsculas y minúsculas en la contraseña</span>
                  </li>
                  {loginAttempts >= 2 && (
                    <li className="flex items-start gap-2">
                      <span className="text-[#FFB347]">•</span>
                      <span className="text-[#FFB347]">
                        Si no recuerda su contraseña, puede{' '}
                        <Link 
                          href="/recuperar-contrasena" 
                          className="underline hover:text-white"
                        >
                          restablecerla aquí
                        </Link>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#77DD77] focus:border-[#77DD77] transition-colors text-white bg-background"
                placeholder="nombre@ejemplo.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#77DD77] focus:border-[#77DD77] transition-colors text-white bg-background"
                  placeholder="Su contraseña"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password reset link - ALWAYS VISIBLE */}
            <div className="flex justify-end">
              <Link
                href="/recuperar-contrasena"
                className="text-sm text-[#7EC8E3] hover:text-[#FFFFFF] font-medium transition-colors"
              >
                ¿Olvidó su contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-[#77DD77] text-[#1C1C1C] py-3 rounded-lg font-bold hover:bg-[#88EE88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
