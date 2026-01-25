'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [failedUrl, setFailedUrl] = useState<string>('');

  useEffect(() => {
    // Capture the URL that caused the 404
    setFailedUrl(window.location.href);
  }, []);

  // Build pre-filled support email with failed URL
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background rounded-2xl border border-white/10 p-8 md:p-12 max-w-lg w-full text-center">
        
        {/* 404 Badge */}
        <div className="w-20 h-20 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-white">404</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Página No Encontrada
        </h1>

        {/* Message */}
        <p className="text-white/70 mb-6">
          Lo sentimos, la página que busca no existe o ha sido movida.
        </p>

        {/* Reassurance for students */}
        <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-4 mb-6">
          <p className="text-[#77DD77] text-sm">
            <strong>¿Estaba en su clase?</strong> No se preocupe — su progreso está guardado.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="mb-6">
          <p className="text-white/50 text-sm mb-3">Accesos rápidos:</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/iniciar-sesion"
              className="bg-[#2A2A2A] text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-[#3A3A3A] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Iniciar Sesión
            </Link>
            
            <Link
              href="/panel"
              className="bg-[#2A2A2A] text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-[#3A3A3A] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Mi Panel
            </Link>
            
            <Link
              href="/#precios"
              className="bg-[#2A2A2A] text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-[#3A3A3A] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Ver Clases
            </Link>
            
            <Link
              href="/recuperar-contrasena"
              className="bg-[#2A2A2A] text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-[#3A3A3A] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Recuperar Contraseña
            </Link>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all block"
          >
            Volver al Inicio
          </Link>
        </div>

        {/* Contact with context */}
        <p className="text-white/50 text-sm mt-6">
          ¿No encuentra lo que busca?{' '}
          <a 
            href={buildContactEmail()} 
            className="text-[#7EC8E3] hover:underline"
          >
            Contáctenos
          </a>
        </p>
      </div>
    </div>
  );
}
