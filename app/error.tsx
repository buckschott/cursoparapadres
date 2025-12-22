'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<{ name: string; isSafari: boolean }>({ name: '', isSafari: false });

  useEffect(() => {
    console.error('Application error:', error);

    const ua = navigator.userAgent;
    let name = 'su navegador';
    let isSafari = false;

    if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      isSafari = true;
    } else if (ua.includes('Chrome')) {
      name = 'Chrome';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
    } else if (ua.includes('Edge')) {
      name = 'Edge';
    }

    setBrowserInfo({ name, isSafari });
  }, [error]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background rounded-2xl border border-[#FFFFFF]/10 p-8 md:p-12 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-[#FF9999]/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#FF9999]/100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Algo salió mal</h1>

        <p className="text-white/70 mb-6">Lo sentimos, hubo un problema al cargar esta página. Por favor, intente de nuevo.</p>

        {browserInfo.isSafari && (
          <div className="bg-[#FFB347]/20 border border-[#FFA337]/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-[#FFB347]/30 text-sm">
              <strong>¿Usando Safari?</strong> Algunos usuarios han reportado mejor rendimiento con Chrome o Firefox.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={reset} className="w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all">
            Intentar de Nuevo
          </button>

          <button onClick={copyLink} className="w-full bg-transparent text-white py-4 rounded-xl font-bold border border-[#FFFFFF]/15 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            {copied ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#77DD77]/100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ¡Enlace Copiado!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Enlace
              </span>
            )}
          </button>

          <a href="/" className="w-full bg-transparent text-white py-4 rounded-xl font-bold border border-[#FFFFFF]/15 hover:bg-white/5 transition-all block text-center">
            Volver al Inicio
          </a>
        </div>

        <p className="text-white/60 text-sm mt-6">
          ¿Necesita ayuda? <a href="mailto:info@cursoparapadres.org" className="text-[#7EC8E3] hover:underline">Contáctenos</a>
        </p>

        {error.digest && (
          <p className="text-[#FFFFFF]/40 text-xs mt-4">Código de error: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
