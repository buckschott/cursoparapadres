'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

/**
 * Site Header - No Hamburger Menu
 * 
 * Features:
 * - Auth-aware: Shows different CTAs based on login state
 * - Mobile: Logo + visible CTAs (no hidden menu)
 * - Desktop: Full nav with links
 * 
 * Logged out: "Inscríbase Ahora" + "Iniciar Sesión"
 * Logged in: "Mi Panel"
 */
export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background z-[200] border-b border-[#FFFFFF]/20">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 h-[73px] flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="Putting Kids First logo" 
              className="h-[32px] md:h-[34px] lg:h-[38px] w-auto" 
            />
            <div className="text-[14px] md:text-xl font-semibold text-white tracking-tight font-brand">
              Putting Kids First<sup className="text-[10px] relative -top-1.5 md:-top-2">®</sup>
            </div>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-8">
            <a 
              href="/aceptacion-de-la-corte" 
              className="text-white/70 hover:text-white transition-colors"
            >
              Aceptación de la Corte
            </a>
            <a 
              href="/preguntas-frecuentes" 
              className="text-white/70 hover:text-white transition-colors"
            >
              Preguntas Frecuentes
            </a>
            <a 
              href="mailto:info@claseparapadres.com" 
              className="text-white/70 hover:text-white transition-colors"
            >
              Contáctenos
            </a>
            
            {/* Auth-aware CTAs - Desktop */}
            {!isLoading && (
              isLoggedIn ? (
                <a 
                  href="/panel" 
                  className="bg-[#77DD77] text-[#1C1C1C] px-6 py-2 rounded-lg font-semibold hover:bg-[#88EE88] transition-colors"
                >
                  Mi Panel
                </a>
              ) : (
                <>
                  <a 
                    href="#precios" 
                    className="bg-[#77DD77] text-[#1C1C1C] px-6 py-2 rounded-lg font-semibold hover:bg-[#88EE88] transition-colors"
                  >
                    Inscríbase Ahora
                  </a>
                  <a 
                    href="/iniciar-sesion" 
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Iniciar Sesión
                  </a>
                </>
              )
            )}
          </div>

          {/* Mobile CTA - Always visible, no hamburger */}
          <div className="flex xl:hidden items-center">
            {!isLoading && (
              isLoggedIn ? (
                <a 
                  href="/panel" 
                  className="bg-[#77DD77] text-[#1C1C1C] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#88EE88] transition-colors"
                >
                  Mi Panel
                </a>
              ) : (
                <a 
                  href="#precios" 
                  className="bg-[#77DD77] text-[#1C1C1C] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#88EE88] transition-colors"
                >
                  Inscríbase
                </a>
              )
            )}
          </div>
        </nav>
      </header>

      {/* Header spacer */}
      <div className="h-[73px]" aria-hidden="true" />
    </>
  );
}
