import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-sky-400 to-sky-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-blue-600">404</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Página No Encontrada
        </h1>

        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que busca no existe o ha sido movida.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all block"
          >
            Volver al Inicio
          </Link>

          <Link
            href="/#precios"
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all block"
          >
            Ver Cursos Disponibles
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          ¿Necesita ayuda?{' '}
          <a href="mailto:info@cursoparapadres.org" className="text-blue-600 hover:underline">
            Contáctenos
          </a>
        </p>
      </div>
    </div>
  );
}
