export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 relative z-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 pb-12 border-b border-gray-200">
          <a href="#precios" className="bg-blue-600 text-white text-center px-8 py-4 rounded-xl font-bold md:hover:bg-blue-700 transition-all md:hover:shadow-xl text-lg">
            Obtener Mi Certificado
          </a>
          <a href="/iniciar-sesion" className="bg-white text-gray-900 text-center px-8 py-4 rounded-xl font-bold border-2 border-gray-900 hover:bg-gray-50 transition-colors text-lg">
            Iniciar Sesión
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 font-brand">Putting Kids First ®</h3>
            <p className="text-sm text-gray-600">Poniendo el Futuro de Su Hijo Primero desde 1993.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/preguntas-frecuentes" className="hover:text-blue-600 transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="mailto:info@cursoparapadres.org" className="hover:text-blue-600 transition-colors">Contáctenos</a></li>
              <li><a href="/aceptacion-de-la-corte" className="hover:text-blue-600 transition-colors">Aceptación de la Corte</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/politica-de-privacidad" className="hover:text-blue-600 transition-colors">Política de Privacidad</a></li>
              <li><a href="/terminos-de-servicio" className="hover:text-blue-600 transition-colors">Términos de Servicio</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-xs text-gray-600">
          <p>© 2025 <span className="font-brand">Putting Kids First ®</span>.<br className="md:hidden" /> Todos los derechos reservados.</p>
          <p className="mt-2">Poniendo el Futuro de Su Hijo Primero desde 1993.</p>
          <p className="mt-2">info@cursoparapadres.org • 888-777-2298</p>
        </div>
      </div>
    </footer>
  );
}
