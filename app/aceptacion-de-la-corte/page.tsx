'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Court Acceptance Page (/aceptacion-de-la-corte)
 * 
 * Purpose: Address the #1 customer fear - "Will my court accept this?"
 */
export default function AceptacionDeLaCorte() {
  const courtSystems = [
    "Cortes de Distrito (Texas, Kansas, Nevada, Oklahoma, Minnesota, Nebraska, Iowa)",
    "Cortes Superiores (California, Arizona, Georgia, Washington, North Carolina, Alaska)",
    "Cortes de Circuito (Florida, Illinois, Michigan, Virginia, Maryland, Oregon, Missouri)",
    "Cortes de Familia (Delaware, Rhode Island, South Carolina)",
    "Cortes de Sucesiones y Familia (Massachusetts)",
    "Cortes de Primera Instancia (Pennsylvania, Ohio)",
    "Cortes de Equidad (Mississippi)",
    "Corte Suprema (Nueva York)"
  ];

  const caseTypes = [
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
    <>
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-background py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-[#77DD77]/20 text-[#77DD77] px-6 py-3 rounded-full text-lg md:text-xl font-bold mb-6">
              <CheckCircleIcon className="w-6 h-6" />
              <span>Aceptado por Cortes en Todo el País</span>
            </div>
            
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              El Original. El Certificado Más Aceptado. En todo el país.
            </p>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="border-t border-[#FFFFFF]/10 py-12 bg-background">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: '4', label: 'Horas Para Completar' },
                { value: '100%', label: 'Aceptado en Todo el País' },
                { value: '24/7', label: 'Acceso a la Clase' },
              ].map((stat, index) => (
                <div key={index} className="p-4">
                  <div className="text-3xl md:text-4xl font-bold text-[#7EC8E3] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Court Systems */}
        <section className="border-t border-[#FFFFFF]/10 py-16 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Todos los Sistemas de Cortes
            </h2>
            <p className="text-white/70 mb-8">
              Las cortes tienen diferentes nombres en diferentes estados. Somos aceptados por todas:
            </p>
            <ul className="space-y-3">
              {courtSystems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7EC8E3]" />
                  <span className="text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Case Types */}
        <section className="border-t border-[#FFFFFF]/10 py-16 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Todo Tipo de Caso
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {caseTypes.map((item, i) => (
                <div 
                  key={i} 
                  className="bg-background rounded-xl p-6 border border-[#FFFFFF]/15 hover:border-[#7EC8E3]/30 transition-colors"
                >
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Courts See - Certificate Details */}
        <section className="border-t border-[#FFFFFF]/10 py-16 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Lo Que las Cortes Ven
            </h2>
            <p className="text-white/70 mb-8">
              Su certificado incluye todo lo que las cortes necesitan:
            </p>
            
            <ul className="space-y-3">
              {certIncludes.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#77DD77]" />
                  <span className="text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// ============================================
// ICONS
// ============================================

function CheckCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  );
}