'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();

  // Validation states
  const passwordLength = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = passwordLength && passwordsMatch && !loading;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError('Error al actualizar la contraseña. Por favor, intente de nuevo.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Card - Gold Standard Styling */}
        <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#77DD77]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#77DD77]/30">
                <svg className="w-8 h-8 text-[#77DD77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Contraseña Actualizada
              </h2>
              <p className="text-white/70 mb-6">
                Su contraseña ha sido restablecida exitosamente. Ahora puede iniciar sesión con su nueva contraseña.
              </p>
              <Link 
                href="/iniciar-sesion"
                className="inline-block bg-[#77DD77] text-[#1C1C1C] px-8 py-3 rounded-xl font-bold hover:bg-[#88EE88] hover:shadow-lg hover:shadow-[#77DD77]/25 transition-all active:scale-[0.98]"
              >
                Iniciar Sesión
              </Link>
            </div>
          ) : (
            <>
              {/* Header with hand-drawn key icon */}
              <div className="text-center mb-6">
                <img 
                  src="/key.svg" 
                  alt="" 
                  className="w-16 h-16 mx-auto mb-4"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Nueva Contraseña
                </h2>
                <p className="text-white/70">
                  Ingrese su nueva contraseña a continuación.
                </p>
              </div>

              {error && (
                <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 text-[#FF9999] px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#FFFFFF]/15 rounded-xl focus:ring-1 focus:ring-[#7EC8E3] focus:border-[#7EC8E3] transition-colors text-white placeholder-white/30 pr-12"
                      placeholder="Mínimo 6 caracteres"
                      required
                      autoComplete="new-password"
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
                        {passwordLength ? '✓' : `${6 - password.length} más`}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 bg-[#1C1C1C] border rounded-xl focus:ring-1 transition-colors text-white placeholder-white/30 pr-12 ${
                        confirmPassword.length > 0 
                          ? passwordsMatch 
                            ? 'border-[#77DD77] focus:border-[#77DD77] focus:ring-[#77DD77]' 
                            : 'border-[#FF9999] focus:border-[#FF9999] focus:ring-[#FF9999]'
                          : 'border-[#FFFFFF]/15 focus:border-[#7EC8E3] focus:ring-[#7EC8E3]'
                      }`}
                      placeholder="Repita su contraseña"
                      required
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
                    <p className="mt-1 text-xs text-[#FF9999]">Las contraseñas no coinciden</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    canSubmit
                      ? 'bg-[#7EC8E3] text-[#1C1C1C] hover:bg-[#9DD8F3] hover:shadow-lg hover:shadow-[#7EC8E3]/25 active:scale-[0.98]'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link
            href="/iniciar-sesion"
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
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
