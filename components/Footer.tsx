'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const SUPPORT_EMAIL = 'info@claseparapadres.com';
const COMPANY_NAME = 'Putting Kids First®';
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Site Footer
 * 
 * Universal footer with CTA section.
 * 
 * Features:
 * - Scroll-reveal animation on CTA section
 * - Staggered tagline animation
 * - Next.js Link prefetching for internal routes
 * - SEO authority bridge link to English site
 */
export default function Footer() {
  const footerRef = useScrollReveal();

  return (
    <footer 
      ref={footerRef as React.RefObject<HTMLElement>}
      className="border-t border-[#FFFFFF]/10 bg-background relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* CTA Section */}
        <div className="text-center mb-12 scroll-reveal">
          <h2 className="text-lg md:text-3xl font-bold text-white mb-4">
            <span className="block footer-stagger-1">El Original.</span>
            <span className="block footer-stagger-2">El Nombre Más Reconocido.</span>
            <span className="block footer-stagger-3">El Certificado Más Aceptado.</span>
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Su requisito cumplido.<br />
            Su certificado entregado.<br />
            Su tiempo respetado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/#precios" 
              className="bg-[#77DD77] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold hover:bg-[#88EE88] hover:shadow-lg hover:shadow-[#77DD77]/25 transition-all text-lg"
            >
              Inscríbase Ahora
            </Link>
            <Link 
              href="/iniciar-sesion" 
              className="bg-transparent text-white px-8 py-4 rounded-xl font-bold border-2 border-white/30 hover:border-white/60 hover:bg-white/5 transition-all text-lg"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-[#FFFFFF]/10 scroll-reveal">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/logo.svg" 
                alt="Putting Kids First logo"
                className="h-6 w-auto"
              />
              <h3 className="font-bold text-white font-brand">
                Putting Kids First<sup className="text-[8px] relative -top-2">®</sup>
              </h3>
            </div>
            <p className="text-white/70 text-sm">
              La clase para padres original.
            </p>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-white mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link 
                  href="/preguntas-frecuentes" 
                  className="hover:text-white transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <a 
                  href={`mailto:${SUPPORT_EMAIL}`} 
                  className="hover:text-white transition-colors"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <a 
                  href="https://puttingkidsfirst.org" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  English Site
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link 
                  href="/politica-de-privacidad" 
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/terminos-de-servicio" 
                  className="hover:text-white transition-colors"
                >
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-[#FFFFFF]/10 text-center text-sm text-white/60">
          <p>© {CURRENT_YEAR} {COMPANY_NAME}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
