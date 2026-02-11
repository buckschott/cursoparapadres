'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTAButton from '@/components/CTAButton';
import StateFAQAccordion from '@/components/StateFAQAccordion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getStateData, getAllStateSlugs } from '@/lib/stateData';
import { STATE_FEATURES } from '@/components/StateFeatureIcons';

interface StatePageContentProps {
  slug: string;
}

export default function StatePageContent({ slug }: StatePageContentProps) {
  const state = getStateData(slug);
  const [countySearch, setCountySearch] = useState('');
  
  if (!state) {
    notFound();
  }

  const mainRef = useScrollReveal();
  const otherStates = getAllStateSlugs().filter((s) => s !== slug);

  // Filter counties based on search
  const filteredCounties = state.counties.filter((county) => {
    const searchLower = countySearch.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      county.name.toLowerCase().includes(searchLower) ||
      (county.city && county.city.toLowerCase().includes(searchLower))
    );
  });

  // Check if exact match found (for confirmation message)
  const hasExactMatch = countySearch.trim().length > 0 && filteredCounties.length > 0;

  // Split intro content into paragraphs
  const introParagraphs = state.introContent?.split('\n\n').filter(Boolean) || [];

  return (
    <>
      <Header />
      
      <main ref={mainRef as React.RefObject<HTMLElement>} className="min-h-screen bg-background">
        {/* HERO SECTION - Tight, state-focused, CTA above fold */}
        <section className="relative w-full overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* H1 - State-specific */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Clase para Padres<br />
              <span className="text-[#77DD77]">en {state.nameEs}</span>
            </h1>

            {/* Subtitle - All key info in one line */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/70 mb-10 max-w-2xl mx-auto">
              Aceptado en los {state.countyCount} condados • 4 horas • $60 • Certificado instantáneo
            </p>

            {/* CTA - Scrolls to on-page pricing */}
            <CTAButton href="#precios" showArrow={true}>
              Inscríbase Ahora
            </CTAButton>
          </div>
        </section>

        {/* INTRO CONTENT SECTION - Unique state content for SEO */}
        {introParagraphs.length > 0 && (
          <section className="py-16 md:py-24 px-4 bg-background border-t border-[#FFFFFF]/10">
            <article className="max-w-3xl mx-auto">
              {introParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="scroll-reveal text-lg text-white/70 leading-relaxed mb-6 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}

              {/* Court context callout */}
              {state.courtContext && (
                <div className="scroll-reveal mt-8 p-6 bg-[#7EC8E3]/10 border border-[#7EC8E3]/30 rounded-xl">
                  <p className="text-white/80 leading-relaxed">
                    {state.courtContext}
                  </p>
                </div>
              )}
            </article>
          </section>
        )}

        {/* PRICING SECTION - On-page, no redirect to homepage */}
        <section id="precios" className="py-16 md:py-24 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-5xl mx-auto">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-4 text-center">
              Elija Su Clase
            </h2>
            <p className="scroll-reveal text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Ambas clases son aceptadas por los tribunales en {state.nameEs}. Elija la que necesita.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Co-Parenting Class */}
              <div className="scroll-reveal bg-background border-2 border-[#FFFFFF]/15 rounded-2xl p-6 shadow-xl shadow-black/40 hover:border-[#77DD77]/50 transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">Clase de Coparentalidad</h3>
                <p className="text-white/60 text-sm mb-4">Para padres separados o divorciándose</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$60</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> 4 horas a su ritmo
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> Certificado instantáneo
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> Aceptado en {state.nameEs}
                  </li>
                </ul>
                <a
                  href={`/checkout?course=coparenting&state=${slug}`}
                  className="block w-full py-3 px-6 bg-[#77DD77] hover:bg-[#88EE88] text-[#1C1C1C] font-bold text-center rounded-full transition-colors"
                >
                  Inscríbase
                </a>
              </div>

              {/* Bundle - Featured */}
              <div className="scroll-reveal bg-background border-2 border-[#77DD77] rounded-2xl p-6 shadow-xl shadow-black/40 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#77DD77] text-[#1C1C1C] text-xs font-bold px-3 py-1 rounded-full">
                  AHORRE $40
                </div>
                <h3 className="text-xl font-bold text-white mb-2">El Paquete Completo</h3>
                <p className="text-white/60 text-sm mb-4">Ambas clases incluidas</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$80</span>
                  <span className="text-white/50 line-through ml-2">$120</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> Clase de Coparentalidad
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> Clase de Crianza
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> Certificados instantáneos
                  </li>
                </ul>
                <a
                  href={`/checkout?course=bundle&state=${slug}`}
                  className="block w-full py-3 px-6 bg-[#77DD77] hover:bg-[#88EE88] text-[#1C1C1C] font-bold text-center rounded-full transition-colors"
                >
                  Inscríbase
                </a>
              </div>

              {/* Parenting Class */}
              <div className="scroll-reveal bg-background border-2 border-[#FFFFFF]/15 rounded-2xl p-6 shadow-xl shadow-black/40 hover:border-[#77DD77]/50 transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">Clase de Crianza</h3>
                <p className="text-white/60 text-sm mb-4">Mejore sus habilidades de crianza</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$60</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> 4 horas a su ritmo
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> Certificado instantáneo
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <span className="text-[#77DD77]">✔</span> Aceptado en {state.nameEs}
                  </li>
                </ul>
                <a
                  href={`/checkout?course=parenting&state=${slug}`}
                  className="block w-full py-3 px-6 bg-[#77DD77] hover:bg-[#88EE88] text-[#1C1C1C] font-bold text-center rounded-full transition-colors"
                >
                  Inscríbase
                </a>
              </div>
            </div>

            {/* Trust reinforcement */}
            <p className="scroll-reveal text-center text-white/50 text-sm mt-8">
              El Original • El Nombre Más Reconocido • El Certificado Más Aceptado
            </p>
          </div>
        </section>

        {/* COUNTIES SECTION */}
        <section className="py-16 md:py-24 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-6 text-center">
              {state.sectionHeading || `Aceptado en Todos los Condados de ${state.nameEs}`}
            </h2>
            
            <p className="scroll-reveal text-lg text-white/70 mb-10 text-center max-w-2xl mx-auto">
              {state.additionalContent}
            </p>

            {/* Searchable County List */}
            <details className="scroll-reveal bg-background border-2 border-[#FFFFFF]/15 rounded-xl overflow-hidden group shadow-xl shadow-black/40">
              <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-white text-lg select-none hover:bg-white/5 transition-colors">
                <span className="pr-4">Ver los {state.countyCount} condados</span>
                <ChevronIcon className="w-6 h-6 text-white/70 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6">
                {/* Search Input */}
                <div className="relative mb-4">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    placeholder="Buscar su condado..."
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#7EC8E3]/50"
                  />
                  {countySearch && (
                    <button
                      onClick={() => setCountySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                      aria-label="Limpiar búsqueda"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Confirmation Message */}
                {hasExactMatch && (
                  <div className="mb-4 p-4 bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-lg">
                    <p className="text-[#77DD77] font-medium">
                      ¡Sí! Su condado está cubierto. Nuestra clase es aceptada aquí.
                    </p>
                  </div>
                )}

                {/* No Results Message */}
                {countySearch.trim().length > 0 && filteredCounties.length === 0 && (
                  <div className="mb-4 p-4 bg-[#7EC8E3]/10 border border-[#7EC8E3]/30 rounded-lg">
                    <p className="text-white/70">
                      No encontramos &ldquo;{countySearch}&rdquo; — pero nuestra clase es aceptada en <strong className="text-white">todos los {state.countyCount} condados</strong> de {state.nameEs}.
                    </p>
                  </div>
                )}

                {/* County Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
                  {filteredCounties.map((county, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 py-2 text-sm"
                    >
                      <span className="text-[#77DD77] flex-shrink-0">✔</span>
                      <span className="text-white/80">
                        {county.name}
                        {county.city && county.name !== county.city && (
                          <span className="text-white/50"> ({county.city})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Results count when searching */}
                {countySearch.trim().length > 0 && filteredCounties.length > 0 && (
                  <p className="mt-4 text-white/50 text-sm">
                    Mostrando {filteredCounties.length} de {state.countyCount} condados
                  </p>
                )}
              </div>
            </details>
          </div>
        </section>

        {/* FEATURE CARDS SECTION - 4 cards with animated icons */}
        <section className="py-16 md:py-24 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATE_FEATURES.map((feature, i) => (
                <article 
                  key={i} 
                  className="scroll-reveal group p-6 bg-background rounded-2xl border border-[#FFFFFF]/15 shadow-xl shadow-black/40 hover:border-[#7EC8E3]/30 hover:shadow-2xl transition-all duration-300"
                >
                  <feature.Icon className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#7EC8E3] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION - Matches perfect-rated FAQAccordion style */}
        <section className="py-16 md:py-24 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-12 text-center">
              Preguntas Frecuentes
            </h2>

            <div className="scroll-reveal">
              <StateFAQAccordion faqs={state.faqs} />
            </div>

            <div className="scroll-reveal mt-10 text-center">
              <a 
                href="/preguntas-frecuentes" 
                className="text-[#7EC8E3] hover:text-[#9DD8F3] font-medium underline underline-offset-4 transition-colors"
              >
                Ver todas las preguntas frecuentes →
              </a>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-16 md:py-24 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-4">
              Comience Hoy
            </h2>
            <p className="scroll-reveal text-xl text-white/70 mb-10">
              Únase a miles de padres en {state.nameEs} que han completado nuestra clase.
            </p>

            <div className="scroll-reveal flex justify-center">
              <CTAButton href="#precios">
                Inscríbase Ahora
              </CTAButton>
            </div>
          </div>
        </section>

        {/* RELATED STATES SECTION */}
        <section className="py-12 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/60 mb-4">También disponible en:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {otherStates.map((otherSlug) => {
                const otherState = getStateData(otherSlug);
                if (!otherState) return null;
                return (
                  <a
                    key={otherSlug}
                    href={`/estados/${otherSlug}`}
                    className="text-[#7EC8E3] hover:text-[#9DD8F3] font-medium transition-colors"
                  >
                    {otherState.nameEs}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// ============================================
// INLINE ICONS
// ============================================

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
