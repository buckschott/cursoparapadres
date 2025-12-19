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
    // Log error for debugging
    console.error('Application error:', error);

    // Detect browser
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
      // Fallback for older browsers
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
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-sky-400 to-sky-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Algo salió mal
        </h1>

        <p className="text-gray-600 mb-6">
          Lo sentimos, hubo un problema al cargar esta página. Por favor, intente de nuevo.
        </p>

        {browserInfo.isSafari && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-amber-800 text-sm">
              <strong>¿Usando Safari?</strong> Algunos usuarios han reportado mejor rendimiento con Chrome o Firefox. 
              Puede copiar el enlace abajo y abrirlo en otro navegador.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Intentar de Nuevo
          </button>

          <button
            onClick={copyLink}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ¡Enlace Copiado!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Enlace
              </>
            )}
          </button>

          <a
            href="/"
            className="w-full bg-white text-gray-700 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-gray-300 transition-all block"
          >
            Volver al Inicio
          </a>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          ¿Necesita ayuda?{' '}
          <a href="mailto:info@cursoparapadres.org" className="text-blue-600 hover:underline">
            Contáctenos
          </a>
        </p>

        {error.digest && (
          <p className="text-gray-400 text-xs mt-4">
            Código de error: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
