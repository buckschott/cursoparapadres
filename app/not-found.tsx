'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [failedUrl, setFailedUrl] = useState<string>('');

  useEffect(() => {
    setFailedUrl(window.location.href);
  }, []);

  const buildContactEmail = () => {
    const subject = 'Página no encontrada';
    const body = [
      'Hola,',
      '',
      'Intenté acceder a esta página pero no existe:',
      failedUrl || '(URL no disponible)',
      '',
      '¿Pueden ayudarme a encontrar lo que busco?',
      '',
    ].join('\n');

    return `mailto:info@claseparapadres.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background rounded-2xl border border-[#FFFFFF]/15 shadow-xl shadow-black/40 p-8 md:p-12 max-w-md w-full text-center">
        
        {/* Info Icon */}
        <div className="w-20 h-20 mx-auto mb-6">
          <img 
            src="/info.svg" 
            alt="" 
            className="w-full h-full"
            aria-hidden="true"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Página No Encontrada
        </h1>

        {/* Message */}
        <p className="text-white/70 mb-6">
          Lo sentimos, esta página no existe o ha sido movida.
        </p>

        {/* Reassurance */}
        <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-4 mb-8">
          <p className="text-[#77DD77] text-sm">
            <strong>¿Estaba en su clase?</strong> No se preocupe — su progreso está guardado.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all block"
          >
            Volver al Inicio
          </Link>
          
          <Link
            href="/panel"
            className="w-full bg-[#1C1C1C] text-white py-4 rounded-xl font-medium border border-[#FFFFFF]/20 hover:border-[#FFFFFF]/40 transition-all block"
          >
            Ir a Mi Clase
          </Link>
        </div>

        {/* Contact */}
        <p className="text-white/50 text-sm mt-8">
          ¿Necesita ayuda?{' '}
          <a 
            href={buildContactEmail()} 
            className="text-[#7EC8E3] hover:underline"
          >
            Contáctenos
          </a>
        </p>
      </div>
    </main>
  );
}