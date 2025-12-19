'use client';

export default function AceptacionDeLaCorte() {
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
              Aceptado por Cortes en Todo el País
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Sin importar cómo se llame su corte o por qué está aquí, nuestros certificados son aceptados.
            </p>
          </div>
        </section>

        {/* Section 1: Todos los Sistemas de Cortes */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Todos los Sistemas de Cortes
            </h2>
            <p className="text-gray-600 mb-8">
              Las cortes tienen diferentes nombres en diferentes estados. Somos aceptados por todas:
            </p>
            <ul className="space-y-3">
              {[
                "District Courts (Texas, Kansas, Nevada, Oklahoma, Minnesota, Nebraska, Iowa)",
                "Superior Courts (California, Arizona, Georgia, Washington, North Carolina, Alaska)",
                "Circuit Courts (Florida, Illinois, Michigan, Virginia, Maryland, Oregon, Missouri)",
                "Family Courts (Delaware, Rhode Island, South Carolina)",
                "Probate & Family Courts (Massachusetts)",
                "Courts of Common Pleas (Pennsylvania, Ohio)",
                "Chancery Courts (Mississippi)",
                "Supreme Court (New York)"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 2: Todo Tipo de Caso */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Todo Tipo de Caso
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Corte de Familia / Relaciones Domésticas",
                  text: "Divorcio, custodia, planes de crianza. Nuestra Clase de Coparentalidad le ayuda a comunicarse con su ex y proteger a sus hijos del conflicto."
                },
                {
                  title: "Dependencia Juvenil (CPS)",
                  text: "Planes de reunificación, planes de servicio. Nuestra Clase de Crianza cubre los fundamentos que las cortes requieren — disciplina, desarrollo infantil, seguridad."
                },
                {
                  title: "Justicia Juvenil",
                  text: "Libertad condicional de adolescentes, órdenes de supervisión. Las cortes ordenan a los padres aprender a establecer límites y manejar comportamientos difíciles."
                },
                {
                  title: "Corte Criminal",
                  text: "Acuerdos de culpabilidad, cargos reducidos. La educación para padres frecuentemente es parte de los requisitos de rehabilitación."
                }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Lo Que las Cortes Ven */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Lo Que las Cortes Ven
            </h2>
            <p className="text-gray-600 mb-8">
              Su certificado incluye todo lo que las cortes necesitan:
            </p>
            <ul className="space-y-3">
              {[
                "Nombre legal completo del participante",
                "Estado y condado donde se presentó el caso",
                "Número de caso/expediente",
                "Fecha de registro y fecha de finalización",
                "Firma del Director Ejecutivo",
                "Número de certificado único",
                "Código QR para verificación instantánea"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 4: Más de 30 Años */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Más de 30 Años de Confianza
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Hemos servido a familias desde 1993. Cuando su futuro está en juego, confíe en el original.
            </p>
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
