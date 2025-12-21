'use client';

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-[110]">
      <input type="checkbox" id="mobile-menu-toggle" className="hidden" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
        <div>
          <div className="header-title text-lg font-semibold text-gray-900 tracking-tight font-brand">
            Putting Kids First <sup className="text-xs">®</sup>
          </div>
        </div>
        
        <nav className="hidden xl:flex items-center gap-8 text-sm" aria-label="Navegación principal">
          <a href="/aceptacion-de-la-corte" className="text-gray-600 hover:text-gray-900 transition-colors">Aceptación de la Corte</a>
          <a href="/garantia" className="text-gray-600 hover:text-gray-900 transition-colors">Nuestra Garantía</a>
          <a href="mailto:info@cursoparapadres.org" className="text-gray-600 hover:text-gray-900 transition-colors">Contáctenos</a>
          <a href="#precios" className="bg-blue-600 text-white px-6 py-2 rounded-full md:hover:bg-blue-700 transition-colors font-semibold">Obtener Mi Certificado</a>
          <a href="/iniciar-sesion" className="text-gray-600 hover:text-gray-900 transition-colors">Iniciar Sesión</a>
        </nav>

        <label 
          htmlFor="mobile-menu-toggle"
          className="xl:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors relative w-10 h-10 flex items-center justify-center cursor-pointer"
          aria-label="Alternar menú"
        >
          <div className="hamburger-icon">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
        </label>
      </div>

      <nav className="mobile-menu-overlay" aria-label="Navegación móvil">
        <div className="mobile-menu-content">
          <div className="max-w-7xl mx-auto px-6 py-6" style={{paddingTop: 'max(1.5rem, env(safe-area-inset-top))'}}>
            <div className="flex items-center justify-between mb-12">
              <div className="header-title text-lg font-semibold text-gray-900 font-brand">
                Putting Kids First <sup className="text-xs">®</sup>
              </div>
              <label 
                htmlFor="mobile-menu-toggle"
                className="p-2 text-gray-600 hover:text-gray-900 relative w-10 h-10 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Cerrar menú"
              >
                <div className="hamburger-icon">
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                </div>
              </label>
            </div>

            <div className="space-y-6 mb-12">
              <div className="menu-item" style={{'--item-index': 0} as React.CSSProperties}>
                <a href="/aceptacion-de-la-corte" className="block py-2">
                  <span className="text-gray-900" style={{fontWeight: 600, fontSize: '22px'}}>Aceptación de la Corte</span>
                </a>
              </div>
              <div className="menu-item" style={{'--item-index': 1} as React.CSSProperties}>
                <a href="/garantia" className="block py-2">
                  <span className="text-gray-900" style={{fontWeight: 600, fontSize: '22px'}}>Nuestra Garantía</span>
                </a>
              </div>
              <div className="menu-item" style={{'--item-index': 2} as React.CSSProperties}>
                <a href="mailto:info@cursoparapadres.org" className="block py-2">
                  <span className="text-gray-900" style={{fontWeight: 600, fontSize: '22px'}}>Contáctenos</span>
                </a>
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-gray-200">
              <a href="#precios" className="block w-full bg-gray-900 text-white text-center px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-lg">
                Obtener Mi Certificado
              </a>
              <a href="/iniciar-sesion" className="block w-full bg-white text-gray-900 text-center px-6 py-4 rounded-xl font-semibold border-2 border-gray-900 hover:bg-gray-50 transition-colors text-lg">
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
