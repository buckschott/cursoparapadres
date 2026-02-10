'use client';

import { useEffect, useState } from 'react';

interface BrowserInfo {
  name: string;
  isSafari: boolean;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({ name: '', isSafari: false });
  const [linkCopied, setLinkCopied] = useState(false);
  const [errorReported, setErrorReported] = useState(false);

  useEffect(() => {
    // Log error for debugging
    console.error('Application error:', error);

    // Detect browser
    const ua = navigator.userAgent;
    let name = 'Desconocido';
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

  // Build pre-filled support email with all context
  const buildSupportEmail = () => {
    const subject = `Error en el sitio${error.digest ? ` - ${error.digest}` : ''}`;
    
    const body = [
      'Hola,',
      '',
      'Tuve un problema en el sitio y necesito ayuda.',
      '',
      '--- Información técnica (no borrar) ---',
      `Página: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
      `Código de error: ${error.digest || 'No disponible'}`,
      `Navegador: ${browserInfo.name}`,
      `Fecha: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Chicago' })}`,
      '--- Fin información técnica ---',
      '',
      'Descripción del problema:',
      '(Escriba aquí qué estaba intentando hacer)',
      '',
    ].join('\n');

    return `mailto:hola@claseparapadres.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Copy link for Safari users to open in another browser
  const copyLinkForBrowser = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  // Track when user clicks report button
  const handleReportClick = () => {
    setErrorReported(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background rounded-2xl border border-[#FFFFFF]/15 shadow-xl shadow-black/40 p-8 md:p-12 max-w-lg w-full text-center">
        
        {/* Icon */}
        <div className="w-16 h-16 bg-[#FF9999]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-8 h-8 text-[#FF9999]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Algo salió mal
        </h1>

        {/* Message */}
        <p className="text-white/70 mb-6">
          Lo sentimos, hubo un problema al cargar esta página. Por favor, intente de nuevo.
        </p>

        {/* Safari Warning - Now with actionable guidance */}
        {browserInfo.isSafari && (
          <div className="bg-[#FFB347]/10 border border-[#FFB347]/30 rounded-xl p-4 mb-6 text-left">
            <p className="text-[#FFB347] text-sm font-semibold mb-2">
              ¿Usando Safari?
            </p>
            <p className="text-white/70 text-sm mb-3">
              Algunos usuarios tienen mejor experiencia con Chrome o Firefox. 
              Copie el enlace para abrir esta página en otro navegador:
            </p>
            <button
              onClick={copyLinkForBrowser}
              className="w-full bg-[#FFB347]/20 text-[#FFB347] py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#FFB347]/30 transition-all flex items-center justify-center gap-2"
            >
              {linkCopied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Enlace copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar enlace
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary: Try Again */}
          <button 
            onClick={reset} 
            className="w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all"
          >
            Intentar de Nuevo
          </button>

          {/* Secondary: Report Problem (pre-filled email) */}
          <a 
            href={buildSupportEmail()}
            onClick={handleReportClick}
            className="w-full bg-transparent text-white py-4 rounded-xl font-bold border border-white/15 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            {errorReported ? (
              <>
                <svg className="w-5 h-5 text-[#77DD77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ¡Gracias por reportar!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Reportar Problema
              </>
            )}
          </a>

          {/* Tertiary: Go Home */}
          <a 
            href="/" 
            className="w-full bg-transparent text-white py-4 rounded-xl font-bold border border-white/15 hover:bg-white/5 transition-all block text-center"
          >
            Volver al Inicio
          </a>
        </div>

        {/* Reassurance message */}
        <p className="text-white/50 text-sm mt-6">
          Si el problema continúa, estamos aquí para ayudar.
        </p>
      </div>
    </div>
  );
}
