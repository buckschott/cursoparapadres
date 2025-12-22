'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError('Hubo un error al enviar el correo. Por favor, intente de nuevo.');
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-8 border border-[#FFFFFF]/15">
          <h2 className="text-2xl font-bold text-white mb-2">
            Recuperar Contraseña
          </h2>
          
          {!sent ? (
            <>
              <p className="text-white/70 mb-6">
                Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
              </p>

              {error && (
                <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 text-[#FF9999] px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] transition-colors text-white bg-background"
                    placeholder="nombre@ejemplo.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#77DD77] text-white py-3 rounded-lg font-bold hover:bg-[#66CC66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace'}
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
              <p className="text-white mb-2">¡Correo enviado!</p>
              <p className="text-white/70 text-sm">
                Revise su bandeja de entrada y siga las instrucciones para restablecer su contraseña.
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
