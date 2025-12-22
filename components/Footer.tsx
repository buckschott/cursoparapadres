export default function Footer() {
  return (
    <footer className="border-t border-[#FFFFFF]/10 bg-background relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-2xl font-bold text-white mb-4">¿Listo para completar su requisito de la corte?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#precios" className="bg-[#77DD77] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-colors text-lg">Comenzar Ahora</a>
            <a href="/iniciar-sesion" className="bg-background text-white text-center px-8 py-4 rounded-xl font-bold border-2 border-white hover:bg-[#2A2A2A] transition-colors text-lg">
              Iniciar Sesión
            </a>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-[#FFFFFF]/10">
          <div>
            <h3 className="font-bold text-white mb-4 font-brand">Putting Kids First ®</h3>
            <p className="text-white/70 text-sm">Cursos de crianza aceptados por tribunales en todo Estados Unidos.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="mailto:info@cursoparapadres.org" className="hover:text-white transition-colors">info@cursoparapadres.org</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/politica-de-privacidad" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="/terminos-de-servicio" className="hover:text-white transition-colors">Términos de Servicio</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#FFFFFF]/10 text-center text-sm text-white/60">
          <p>© 2025 Putting Kids First®. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
