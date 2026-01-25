'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Site Header with Mobile Menu
 * 
 * Features:
 * - Responsive navigation (desktop/mobile)
 * - Animated hamburger icon
 * - Focus trapping in mobile menu (accessibility)
 * - Body scroll lock when menu open
 * - Focus-visible styling (no blue box on tap)
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);
  const lastFocusableRef = useRef<HTMLAnchorElement>(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Focus management for accessibility
  useEffect(() => {
    if (menuOpen && firstFocusableRef.current) {
      // Focus first menu item when menu opens
      firstFocusableRef.current.focus();
    }
  }, [menuOpen]);

  // Handle keyboard navigation for focus trapping
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!menuOpen) return;

    // Close on Escape
    if (e.key === 'Escape') {
      closeMenu();
      menuButtonRef.current?.focus();
      return;
    }

    // Trap focus with Tab
    if (e.key === 'Tab') {
      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [menuOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Shared focus classes for mobile menu links
  const menuLinkFocusClasses = "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7EC8E3] rounded-lg";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background z-[200] border-b border-[#FFFFFF]/20">
        <nav className="max-w-7xl mx-auto px-6 h-[73px] flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="relative z-[210] flex items-center gap-2">
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
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={toggleMenu}
            className="xl:hidden relative z-[210] w-10 h-10 flex items-center justify-center focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7EC8E3] rounded-lg"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <div className="relative w-6 h-5">
              <span 
                style={{ transition: 'all 300ms ease-out' }}
                className={`absolute left-0 w-full h-0.5 bg-white rounded ${menuOpen ? 'top-2 rotate-45' : 'top-0'}`} 
              />
              <span 
                style={{ transition: 'all 300ms ease-out' }}
                className={`absolute left-0 top-2 w-full h-0.5 bg-white rounded ${menuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} 
              />
              <span 
                style={{ transition: 'all 300ms ease-out' }}
                className={`absolute left-0 w-full h-0.5 bg-white rounded ${menuOpen ? 'top-2 -rotate-45' : 'top-4'}`} 
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Header spacer */}
      <div className="h-[73px]" aria-hidden="true" />

      {/* Mobile Menu */}
      <div 
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`xl:hidden fixed inset-0 top-[73px] bg-background z-[100] ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{
          transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 600ms ease-in-out'
        }}
      >
        <div className="h-full overflow-y-auto px-6 py-8">
          <nav className="flex flex-col gap-2" aria-label="Navegación principal">
            <a 
              ref={firstFocusableRef}
              href="/aceptacion-de-la-corte" 
              onClick={closeMenu} 
              className={`py-4 border-b border-[#FFFFFF]/20 ${menuLinkFocusClasses}`}
            >
              <span className="text-white font-semibold text-xl">Aceptación de la Corte</span>
            </a>
            <a 
              href="/preguntas-frecuentes" 
              onClick={closeMenu} 
              className={`py-4 border-b border-[#FFFFFF]/20 ${menuLinkFocusClasses}`}
            >
              <span className="text-white font-semibold text-xl">Preguntas Frecuentes</span>
            </a>
            <a 
              href="mailto:info@claseparapadres.com" 
              onClick={closeMenu} 
              className={`py-4 border-b border-[#FFFFFF]/20 ${menuLinkFocusClasses}`}
            >
              <span className="text-white font-semibold text-xl">Contáctenos</span>
            </a>
          </nav>

          <div className="mt-auto pt-12 space-y-4">
            <a 
              href="#precios" 
              onClick={closeMenu} 
              className={`block w-full bg-[#77DD77] text-[#1C1C1C] text-center px-6 py-4 rounded-xl font-semibold hover:bg-[#88EE88] transition-colors text-lg ${menuLinkFocusClasses}`}
            >
              Inscríbase Ahora
            </a>
            <a 
              ref={lastFocusableRef}
              href="/iniciar-sesion" 
              onClick={closeMenu} 
              className={`block w-full bg-transparent text-white text-center px-6 py-4 rounded-xl font-semibold border-2 border-white hover:bg-white/10 transition-colors text-lg ${menuLinkFocusClasses}`}
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    </>
  );
}