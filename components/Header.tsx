'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#1a2421] z-[200] border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-6 h-[73px] flex items-center justify-between">
          <a href="/" className="relative z-[210]">
            <div className="header-title text-lg font-semibold text-white tracking-tight font-brand">
              Putting Kids First<sup className="text-[10px] relative -top-2">®</sup>
            </div>
          </a>
          
          <div className="hidden xl:flex items-center gap-8">
            <a href="/aceptacion-de-la-corte" className="text-gray-400 hover:text-white transition-colors">Aceptación de la Corte</a>
            <a href="/garantia" className="text-gray-400 hover:text-white transition-colors">Nuestra Garantía</a>
            <a href="mailto:info@cursoparapadres.org" className="text-gray-400 hover:text-white transition-colors">Contáctenos</a>
            <a href="#precios" className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Inscríbete Ahora</a>
            <a href="/iniciar-sesion" className="text-gray-400 hover:text-white transition-colors">Iniciar Sesión</a>
          </div>

          <button
            onClick={toggleMenu}
            className="xl:hidden relative z-[210] w-10 h-10 flex items-center justify-center"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
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

      <div className="h-[73px]" />

      <div 
        className="xl:hidden fixed inset-0 top-[73px] bg-[#1a2421] z-[100]"
        style={{
          transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 600ms ease-in-out'
        }}
      >
        <div className="h-full overflow-y-auto px-6 py-8">
          <nav className="flex flex-col gap-2">
            <a href="/aceptacion-de-la-corte" onClick={closeMenu} className="py-4 border-b border-gray-800">
              <span className="text-white font-semibold text-xl">Aceptación de la Corte</span>
            </a>
            <a href="/garantia" onClick={closeMenu} className="py-4 border-b border-gray-800">
              <span className="text-white font-semibold text-xl">Nuestra Garantía</span>
            </a>
            <a href="mailto:info@cursoparapadres.org" onClick={closeMenu} className="py-4 border-b border-gray-800">
              <span className="text-white font-semibold text-xl">Contáctenos</span>
            </a>
          </nav>

          <div className="mt-auto pt-12 space-y-4">
            <a href="#precios" onClick={closeMenu} className="block w-full bg-white text-black text-center px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-lg">
              Inscríbete Ahora
            </a>
            <a href="/iniciar-sesion" onClick={closeMenu} className="block w-full bg-transparent text-white text-center px-6 py-4 rounded-xl font-semibold border-2 border-white hover:bg-white/10 transition-colors text-lg">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
