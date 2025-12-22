import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background rounded-2xl border border-[#FFFFFF]/10 p-8 md:p-12 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-white">404</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Página No Encontrada
        </h1>

        <p className="text-white/70 mb-8">
          Lo sentimos, la página que busca no existe o ha sido movida.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all block"
          >
            Volver al Inicio
          </Link>

          <Link
            href="/#precios"
            className="w-full bg-transparent text-white py-4 rounded-xl font-bold border border-[#FFFFFF]/15 hover:bg-white/5 transition-all block"
          >
            Ver Cursos Disponibles
          </Link>
        </div>

        <p className="text-white/60 text-sm mt-6">
          ¿Necesita ayuda?{' '}
          <a href="mailto:info@cursoparapadres.org" className="text-[#7EC8E3] hover:underline">
            Contáctenos
          </a>
        </p>
      </div>
    </div>
  );
}
