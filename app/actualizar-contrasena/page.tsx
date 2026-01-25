'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<{ message: string; showRecoveryLink: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Check for valid session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setSessionValid(false);
        } else {
          setSessionValid(true);
        }
      } catch (err) {
        setSessionValid(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [supabase.auth]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError({
        message: 'Las contraseñas no coinciden.',
        showRecoveryLink: false,
      });
      return;
    }

    if (password.length < 6) {
      setError({
        message: 'La contraseña debe tener al menos 6 caracteres.',
        showRecoveryLink: false,
      });
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        // Check for session-related errors
        const errorMessage = updateError.message.toLowerCase();
        const isSessionError = 
          errorMessage.includes('session') ||
          errorMessage.includes('token') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('not authenticated');

        if (isSessionError) {
          setError({
            message: 'Su sesión ha expirado. Por favor, solicite un nuevo enlace para restablecer su contraseña.',
            showRecoveryLink: true,
          });
        } else {
          setError({
            message: 'Hubo un error al actualizar la contraseña. Por favor, intente de nuevo.',
            showRecoveryLink: false,
          });
        }
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/panel');
        }, 3000);
      }
    } catch (err) {
      setError({
        message: 'Hubo un error inesperado. Por favor, solicite un nuevo enlace.',
        showRecoveryLink: true,
      });
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white">Verificando sesión...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // No valid session - show recovery message
  if (!sessionValid) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-[#FFE566]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FFE566]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Enlace Expirado
              </h2>
              <p className="text-white/70 mb-6">
                El enlace para restablecer su contraseña ha expirado o no es válido. Los enlaces expiran después de 1 hora por seguridad.
              </p>

              <Link
                href="/recuperar-contrasena"
                className="inline-block w-full bg-[#77DD77] text-[#1C1C1C] py-3 rounded-lg font-bold hover:bg-[#66CC66] transition-colors text-center"
              >
                Solicitar Nuevo Enlace
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/iniciar-sesion"
              className="text-white/70 hover:text-white text-sm"
            >
              ← Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
          <h2 className="text-2xl font-bold text-white mb-2">
            Nueva Contraseña
          </h2>
          
          {!success ? (
            <>
              <p className="text-white/70 mb-6">
                Ingrese su nueva contraseña.
              </p>

              {error && (
                <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 text-[#FF9999] px-4 py-3 rounded-lg mb-6">
                  <p>{error.message}</p>
                  {error.showRecoveryLink && (
                    <Link 
                      href="/recuperar-contrasena" 
                      className="inline-block mt-2 text-sm font-medium underline hover:text-white"
                    >
                      Solicitar nuevo enlace →
                    </Link>
                  )}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] transition-colors text-white bg-background"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none"
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
                  <p className="text-white/50 text-xs mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] transition-colors text-white bg-background"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-[#77DD77] text-white py-3 rounded-lg font-bold hover:bg-[#66CC66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#77DD77]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#77DD77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white text-lg font-medium mb-2">¡Contraseña actualizada!</p>
              <p className="text-white/70 text-sm">
                Redirigiendo a iniciar sesión...
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/iniciar-sesion"
            className="text-white/70 hover:text-white text-sm"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}