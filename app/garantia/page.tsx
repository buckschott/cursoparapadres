'use client';

export default function Garantia() {
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white sticky top-0 z-[110]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
            <a href="/" className="header-title text-lg font-semibold text-gray-900 tracking-tight font-brand">
              Putting Kids First <sup className="text-xs">®</sup>
            </a>
            <a href="/#precios" className="bg-blue-600 text-white px-3 md:px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-semibold text-[10px] md:text-sm whitespace-nowrap">
              Obtener Mi Certificado
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-600 via-sky-400 to-sky-200 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Garantía de Aceptación del 100%
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Si su corte no acepta su certificado, recibe un reembolso completo.
            </p>
          </div>
        </section>

        {/* Body Section */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-gray-700 text-lg leading-relaxed mb-12">
              Respaldamos nuestro certificado. En más de 30 años, cortes en todo el país han aceptado los certificados de <span className="font-brand">Putting Kids First®</span>. 
            </p>

            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cómo Funciona
              </h2>
              <p className="text-gray-600 text-lg">
                Envíe documentación oficial de su corte mostrando la no aceptación. Procesaremos su reembolso completo. Sin complicaciones. Sin rodeos.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <a 
              href="/#precios"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all hover:shadow-xl text-lg"
            >
              Obtener Mi Certificado
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center text-xs text-gray-600">
              <p>© 2025 <span className="font-brand">Putting Kids First ®</span>.<br className="md:hidden" /> Todos los derechos reservados.</p>
              <p className="mt-2">info@cursoparapadres.org • 888-777-2298</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
