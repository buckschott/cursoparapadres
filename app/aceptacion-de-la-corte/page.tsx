'use client';

export default function AceptacionDeLaCorte() {
  const courtSystems = [
    "District Courts (Texas, Kansas, Nevada, Oklahoma, Minnesota, Nebraska, Iowa)",
    "Superior Courts (California, Arizona, Georgia, Washington, North Carolina, Alaska)",
    "Circuit Courts (Florida, Illinois, Michigan, Virginia, Maryland, Oregon, Missouri)",
    "Family Courts (Delaware, Rhode Island, South Carolina)",
    "Probate & Family Courts (Massachusetts)",
    "Courts of Common Pleas (Pennsylvania, Ohio)",
    "Chancery Courts (Mississippi)",
    "Supreme Court (New York)"
  ];

  const caseTypes = [
    { title: "Corte de Familia / Relaciones Domésticas", text: "Divorcio, custodia, planes de crianza. Nuestra Clase de Coparentalidad le ayuda a comunicarse con su ex y proteger a sus hijos del conflicto." },
    { title: "Dependencia Juvenil (CPS)", text: "Planes de reunificación, planes de servicio. Nuestra Clase de Crianza cubre los fundamentos que las cortes requieren — disciplina, desarrollo infantil, seguridad." },
    { title: "Justicia Juvenil", text: "Libertad condicional de adolescentes, órdenes de supervisión. Las cortes ordenan a los padres aprender a establecer límites y manejar comportamientos difíciles." },
    { title: "Corte Criminal", text: "Acuerdos de culpabilidad, cargos reducidos. La educación para padres frecuentemente es parte de los requisitos de rehabilitación." }
  ];

  const certIncludes = [
    "Nombre legal completo del participante",
    "Estado y condado donde se presentó el caso",
    "Número de caso/expediente",
    "Fecha de registro y fecha de finalización",
    "Firma del Director Ejecutivo",
    "Número de certificado único",
    "Código QR para verificación instantánea"
  ];

  return (
    <main className="min-h-screen bg-[#1a2421]">
      <header className="border-b border-gray-800 bg-[#1a2421] sticky top-0 z-[110]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
          <a href="/" className="header-title text-lg font-semibold text-white tracking-tight font-brand">
            Putting Kids First <sup className="text-xs">®</sup>
          </a>
          <a href="/#precios" className="bg-white text-black px-3 md:px-6 py-2 rounded-full hover:bg-gray-200 transition-colors font-semibold text-[10px] md:text-sm whitespace-nowrap">
            Obtener Mi Certificado
          </a>
        </div>
      </header>

      <section className="bg-[#1a2421] py-16 md:py-24 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Aceptado por Cortes en Todo el País</h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">Sin importar cómo se llame su corte o por qué está aquí, nuestros certificados son aceptados.</p>
        </div>
      </section>

      <section className="section-divider py-16 bg-[#1a2421]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Todos los Sistemas de Cortes</h2>
          <p className="text-gray-400 mb-8">Las cortes tienen diferentes nombres en diferentes estados. Somos aceptados por todas:</p>
          <ul className="space-y-3">
            {courtSystems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-divider py-16 bg-[#1a2421]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Todo Tipo de Caso</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {caseTypes.map((item, i) => (
              <div key={i} className="bg-[#1a2421] rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-divider py-16 bg-[#1a2421]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Lo Que las Cortes Ven</h2>
          <p className="text-gray-400 mb-8">Su certificado incluye todo lo que las cortes necesitan:</p>
          <ul className="space-y-3">
            {certIncludes.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-divider py-16 bg-[#1a2421]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Más de 30 Años de Confianza</h2>
          <p className="text-gray-400 text-lg mb-8">Hemos servido a familias desde 1993. Cuando su futuro está en juego, confíe en el original.</p>
          <a href="/#precios" className="inline-block bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all text-lg">
            Obtener Mi Certificado
          </a>
        </div>
      </section>

      <footer className="section-divider border-t border-gray-800 bg-[#1a2421]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-xs text-gray-400">
            <p>© 2025 <span className="font-brand">Putting Kids First ®</span>. Todos los derechos reservados.</p>
            <p className="mt-2">info@cursoparapadres.org • 888-777-2298</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
