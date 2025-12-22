import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a2421] flex items-center justify-center px-4">
      <div className="bg-[#1a2421] rounded-2xl border border-gray-800 p-8 md:p-12 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-white">404</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Página No Encontrada
        </h1>

        <p className="text-gray-400 mb-8">
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
            className="w-full bg-transparent text-gray-300 py-4 rounded-xl font-bold border border-gray-700 hover:bg-white/5 transition-all block"
          >
            Ver Cursos Disponibles
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          ¿Necesita ayuda?{' '}
          <a href="mailto:info@cursoparapadres.org" className="text-blue-400 hover:underline">
            Contáctenos
          </a>
        </p>
      </div>
    </div>
  );
}
