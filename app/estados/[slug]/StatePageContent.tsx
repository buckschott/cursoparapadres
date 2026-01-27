'use client';

import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTAButton from '@/components/CTAButton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getStateData, getAllStateSlugs } from '@/lib/stateData';
import { STATE_FEATURES } from '@/components/StateFeatureIcons';

interface StatePageContentProps {
  slug: string;
}

export default function StatePageContent({ slug }: StatePageContentProps) {
  const state = getStateData(slug);
  
  if (!state) {
    notFound();
  }

  const mainRef = useScrollReveal();
  const otherStates = getAllStateSlugs().filter((s) => s !== slug);

  return (
    <>
      <Header />
      
      <main ref={mainRef as React.RefObject<HTMLElement>} className="min-h-screen bg-background">
        {/* HERO SECTION - Matches homepage structure */}
        <section className="relative w-full overflow-hidden bg-background hero-section flex justify-center z-0">
          <div className="relative w-full max-w-6xl mx-auto px-4 text-center z-10 flex flex-col justify-between hero-content">
            
            {/* H1 - State-specific text with homepage sizes */}
            <div className="flex justify-center">
              <h1 className="hero-title text-[22px] md:text-[40px] xl:text-[64px] font-bold text-white leading-[1.1] tracking-wide">
                <span className="hero-line-1">Clase para Padres</span><br />
                <span className="hero-line-2">en {state.nameEs}</span>
              </h1>
            </div>

            {/* State-specific subtitle - unique per state */}
            <div className="flex justify-center mt-4 md:mt-6">
              <p className="text-base md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto">
                Aceptado por los tribunales en los {state.countyCount} condados de {state.nameEs}.<br />
                4 horas • $60 • Certificado instantáneo.
              </p>
            </div>

            {/* Core messaging - animated subtext lines */}
            <div className="flex justify-center">
              <p className="hero-subheadline text-base md:text-2xl lg:text-3xl font-normal text-white max-w-4xl mx-auto leading-relaxed">
                <span className="subtext-line subtext-line-1 inline-block">El Original.</span><br />
                <span className="subtext-line subtext-line-2 inline-block">El Nombre Más Reconocido.</span><br />
                <span className="subtext-line subtext-line-3 inline-block">El Certificado Más Aceptado.</span>
              </p>
            </div>

            {/* Rotating trust badge */}
            <div className="flex justify-center">
              <span className="trust-badge-text font-semibold text-white whitespace-nowrap">
                {/* Invisible spacer - longest text sets the width */}
                <span className="invisible">Aceptado en todo el país.</span>
                {/* All three texts absolutely positioned */}
                <span className="trust-text-1 absolute inset-0">Un precio.</span>
                <span className="trust-text-2 absolute inset-0">Aceptado en todo el país.</span>
                <span className="trust-text-3 absolute inset-0">Sin sorpresas.</span>
              </span>
            </div>

            {/* CTA with hand-drawn arrow */}
            <div className="flex justify-center">
              <CTAButton href="/#precios" showArrow={true}>
                Inscríbase Ahora
              </CTAButton>
            </div>
          </div>
        </section>

        {/* COUNTIES SECTION */}
        <section className="section-divider py-16 md:py-24 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-6 text-center">
              {state.sectionHeading || `Aceptado en Todos los Condados de ${state.nameEs}`}
            </h2>
            
            <p className="scroll-reveal text-lg text-white/70 mb-10 text-center max-w-2xl mx-auto">
              {state.additionalContent}
            </p>

            {/* Expandable County List */}
            <details className="scroll-reveal bg-background border-2 border-[#FFFFFF]/15 rounded-xl overflow-hidden group mb-10 shadow-xl shadow-black/40">
              <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-white text-lg select-none hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-3">
                  <span className="text-[#77DD77]">✓</span>
                  Aceptado en los {state.countyCount} condados — ver lista
                </span>
                <ChevronIcon className="w-6 h-6 text-white/70 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6 pt-2 border-t border-[#FFFFFF]/10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
                  {state.counties.map((county, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 py-2 text-sm"
                    >
                      <span className="text-[#77DD77] flex-shrink-0">✓</span>
                      <span className="text-white/80">
                        {county.name}
                        {county.city && county.name !== county.city && (
                          <span className="text-white/50"> ({county.city})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            {/* Confidence Callout */}
            <div className="scroll-reveal bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-2xl p-6 md:p-8 text-center">
              <p className="text-[#77DD77] font-medium text-sm sm:text-base md:text-lg flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0">
                <span>El Original</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>El Nombre Más Reconocido</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>El Certificado Más Aceptado</span>
              </p>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS SECTION - 4 cards with animated icons */}
        <section className="section-divider py-16 md:py-24 px-4 bg-background">
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

        {/* FAQ SECTION */}
        <section className="section-divider py-16 md:py-24 px-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-12 text-center">
              Preguntas Frecuentes — Clase para Padres en {state.nameEs}
            </h2>

            <div className="space-y-4">
              {state.faqs.map((faq, i) => (
                <details 
                  key={i} 
                  className="scroll-reveal bg-background border-2 border-[#FFFFFF]/15 rounded-xl overflow-hidden group shadow-xl shadow-black/40 hover:border-[#7EC8E3]/30 transition-colors"
                >
                  <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-white text-lg select-none">
                    <span className="pr-4">{faq.question}</span>
                    <ChevronIcon className="w-6 h-6 text-white/70 transition-transform group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
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
        <section className="section-divider py-16 md:py-24 px-4 bg-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-4">
              Comience Su Clase para Padres en {state.nameEs} Hoy
            </h2>
            <p className="scroll-reveal text-xl text-white/70 mb-10">
              Únase a miles de padres en {state.nameEs} que han completado nuestra clase.
            </p>

            <div className="scroll-reveal flex justify-center mb-6">
              <CTAButton href="/#precios">
                Inscríbase Ahora
              </CTAButton>
            </div>

            <p className="scroll-reveal text-white/60 text-sm">
              $60 • 4 horas • Certificado instantáneo • Desde 1993
            </p>
          </div>
        </section>

        {/* RELATED STATES SECTION */}
        <section className="py-12 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/60 mb-4">Clase para Padres — también disponible en:</p>
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
