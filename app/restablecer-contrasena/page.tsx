'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();

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
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-semibold text-white">
              Putting Kids First <sup className="text-xs">®</sup>
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
          {success ? (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#77DD77]/20 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="inline-block bg-[#7EC8E3] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors"
                 
                >
                  Iniciar Sesión
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">
                Nueva Contraseña
              </h2>
              <p className="text-white/70 mb-6">
                Ingrese su nueva contraseña a continuación.
              </p>

              {error && (
                <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 text-[#FF9999] px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] transition-colors text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] transition-colors text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  onClick={handleReset}
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-[#7EC8E3] text-white py-3 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
      `}</style>
    </main>
  );
}
