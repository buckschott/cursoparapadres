'use client';

export default function Garantia() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-[#FFFFFF]/10 bg-background sticky top-0 z-[110]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
          <a href="/" className="header-title text-lg font-semibold text-white tracking-tight font-brand">
            Putting Kids First <sup className="text-xs">®</sup>
          </a>
          <a href="/#precios" className="bg-[#77DD77] text-[#1C1C1C] px-3 md:px-6 py-2 rounded-full hover:bg-[#88EE88] transition-colors font-semibold text-[10px] md:text-sm whitespace-nowrap">
            Obtener Mi Certificado
          </a>
        </div>
      </header>

      <section className="bg-background py-16 md:py-24 border-b border-[#FFFFFF]/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Garantía de Aceptación del 100%
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Si su corte no acepta su certificado, recibe un reembolso completo.
          </p>
        </div>
      </section>

      <section className="section-divider py-16 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-white text-lg leading-relaxed mb-12">
            Respaldamos nuestro certificado. En más de 30 años, cortes en todo el país han aceptado los certificados de <span className="font-brand">Putting Kids First®</span>.
          </p>
          <div className="bg-background rounded-xl p-8 border border-[#FFFFFF]/15">
            <h2 className="text-2xl font-bold text-white mb-4">Cómo Funciona</h2>
            <p className="text-white/70 text-lg">
              Envíe documentación oficial de su corte mostrando la no aceptación. Procesaremos su reembolso completo. Sin complicaciones. Sin rodeos.
            </p>
          </div>
        </div>
      </section>

      <section className="section-divider py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <a href="/#precios" className="inline-block bg-[#77DD77] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all text-lg">
            Obtener Mi Certificado
          </a>
        </div>
      </section>

      <footer className="section-divider border-t border-[#FFFFFF]/10 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-xs text-white/70">
            <p>© 2025 <span className="font-brand">Putting Kids First ®</span>. Todos los derechos reservados.</p>
            <p className="mt-2">info@cursoparapadres.org • 888-777-2298</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
