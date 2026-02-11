'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTAButton from '@/components/CTAButton';
import PricingCard from '@/components/PricingCard';
import CheckoutOverlay from '@/components/CheckoutOverlay';
import BundleInterstitial from '@/components/BundleInterstitial';
import StateFAQAccordion from '@/components/StateFAQAccordion';
import { useToast } from '@/components/Toast';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getStateData } from '@/lib/stateData';
import { STATE_FEATURES } from '@/components/StateFeatureIcons';
import { ANIMATION } from '@/constants/animation';

interface StatePageContentProps {
  slug: string;
}

export default function StatePageContent({ slug }: StatePageContentProps) {
  const state = getStateData(slug);
  const [countySearch, setCountySearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { showToast } = useToast();

  // Bundle interstitial state
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<'coparenting' | 'parenting' | null>(null);
  
  if (!state) {
    notFound();
  }

  const mainRef = useScrollReveal();

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

  // ============================================
  // CHECKOUT HANDLER — Identical to homepage
  // ============================================

  const handleCheckout = async (priceId: string, productName: string) => {
    setLoading(productName);

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.url) {
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = data.url;
        }, ANIMATION.CHECKOUT_REDIRECT_DELAY);
      } else {
        showToast(
          'error',
          'No pudimos conectar con el sistema de pago',
          'Por favor, intente de nuevo en unos segundos.'
        );
        setLoading(null);
      }
    } catch (error) {
      showToast(
        'error',
        'Algo salió mal de nuestro lado',
        'Su información está segura. Por favor, intente de nuevo.'
      );
      setLoading(null);
    }
  };

  // ============================================
  // SINGLE CLASS HANDLERS — Open interstitial first
  // ============================================

  const handleCoparentingClick = () => {
    setPendingCourse('coparenting');
    setIsInterstitialOpen(true);
  };

  const handleParentingClick = () => {
    setPendingCourse('parenting');
    setIsInterstitialOpen(true);
  };

  // ============================================
  // INTERSTITIAL HANDLERS
  // ============================================

  const handleChooseBundle = () => {
    setIsInterstitialOpen(false);
    setPendingCourse(null);

    const priceId = process.env.NEXT_PUBLIC_PRICE_BUNDLE;
    if (!priceId) {
      showToast(
        'error',
        'Error de configuración',
        'Por favor, contáctenos para completar su inscripción.'
      );
      return;
    }
    handleCheckout(priceId, 'bundle');
  };

  const handleContinueSingle = () => {
    setIsInterstitialOpen(false);

    if (!pendingCourse) return;

    const priceId = pendingCourse === 'coparenting'
      ? process.env.NEXT_PUBLIC_PRICE_COPARENTING
      : process.env.NEXT_PUBLIC_PRICE_PARENTING;

    if (!priceId) {
      showToast(
        'error',
        'Error de configuración',
        'Por favor, contáctenos para completar su inscripción.'
      );
      setPendingCourse(null);
      return;
    }

    handleCheckout(priceId, pendingCourse);
    setPendingCourse(null);
  };

  const handleCloseInterstitial = () => {
    setIsInterstitialOpen(false);
    setPendingCourse(null);
  };

  // ============================================
  // BUNDLE HANDLER — Direct checkout (no interstitial)
  // ============================================

  const handleBundleCheckout = () => {
    const priceId = process.env.NEXT_PUBLIC_PRICE_BUNDLE;
    if (!priceId) {
      showToast(
        'error',
        'Error de configuración',
        'Por favor, contáctenos para completar su inscripción.'
      );
      return;
    }
    handleCheckout(priceId, 'bundle');
  };

  return (
    <>
      <CheckoutOverlay isVisible={isRedirecting} />

      {/* Bundle Upgrade Interstitial */}
      <BundleInterstitial
        isOpen={isInterstitialOpen}
        originalCourse={pendingCourse || 'coparenting'}
        onChooseBundle={handleChooseBundle}
        onContinueSingle={handleContinueSingle}
        onClose={handleCloseInterstitial}
      />

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

            {/* Subtitle — No price. Authority first. */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/70 mb-20 max-w-2xl mx-auto">
              Aceptado en los {state.countyCount} condados • 100% en español • Certificado instantáneo
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

        {/* PRICING SECTION — Matches homepage perfect rating */}
        <section
          id="precios"
          className="section-divider relative bg-background z-20 overflow-hidden py-24 border-t border-[#FFFFFF]/10"
          aria-labelledby="precios-heading"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="precios-heading" className="scroll-reveal text-lg md:text-4xl font-bold text-white mb-4">
                Elija Su Clase. Cumpla Su Requisito.
              </h2>
              <p className="scroll-reveal text-lg md:text-xl lg:text-2xl text-white/70">
                Ambas clases son aceptadas por los tribunales en {state.nameEs}.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Coparenting Course */}
              <PricingCard
                title="Clase de Coparentalidad"
                subtitle="¿El juez ordenó una clase de coparentalidad?"
                price="$60"
                requirements={[
                  "Procedimientos de divorcio",
                  "Disputas de custodia",
                  "Casos de derechos parentales",
                  "Modificaciones de custodia",
                ]}
                loadingKey="coparenting"
                loading={loading}
                onEnroll={handleCoparentingClick}
              />

              {/* Parenting Course */}
              <PricingCard
                title="Clase de Crianza"
                subtitle="¿CPS o la corte requiere una clase de crianza?"
                price="$60"
                requirements={[
                  "Casos de crianza ordenados por la corte",
                  "Procedimientos de adopción o cuidado temporal",
                  "Demostrar capacidad parental ante el tribunal",
                  "Requisitos de reunificación familiar",
                ]}
                loadingKey="parenting"
                loading={loading}
                onEnroll={handleParentingClick}
              />
            </div>

            {/* Bundle - Enhanced with glow and strikethrough pricing */}
            <div className="max-w-4xl mx-auto mt-16 mb-14">
              <article className="relative bg-background rounded-2xl border-2 border-[#77DD77]/50 p-8 shadow-xl shadow-[#77DD77]/20 transition-all md:hover:shadow-2xl md:hover:shadow-[#77DD77]/30 md:hover:border-[#77DD77]/70">
                {/* Best Value Badge */}
                <div className="absolute -top-3 right-6 bg-[#77DD77] text-[#1C1C1C] px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  ⭐ Mejor Valor
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1">El Paquete Completo</h3>
                  <p className="text-sm text-white/70">Ambas Clases. Un Precio.</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold text-white">$80</span>
                    <span className="text-2xl text-white/40 line-through">$120</span>
                  </div>
                  <p className="text-sm text-[#77DD77] font-semibold mt-2">Ahorre $40</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Incluye ambas clases:</h4>
                  <ul className="space-y-2">
                    {["Clase de Coparentalidad + Clase de Crianza", "Dos Certificados Verificables", "Notificamos a Su Abogado al Completar Cada Clase", "Cumple Requisitos Combinados o de Nivel Superior"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#77DD77]" />
                        <span className="text-white text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleBundleCheckout}
                  disabled={loading === 'bundle'}
                  className="group w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold transition-all duration-200 hover:bg-[#88EE88] hover:shadow-lg hover:shadow-[#77DD77]/30 active:scale-[0.98] active:bg-[#88EE88] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading === 'bundle' ? (
                    <>
                      <LoadingSpinner />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <span>Inscríbase Ahora</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </article>
            </div>

            {/* Security badge */}
            <div className="text-center mt-12">
              <p className="flex items-center justify-center gap-2 text-sm text-white/65">
                <LockIcon className="w-4 h-4" />
                Transacción SSL 100% Segura
              </p>
            </div>

            {/* Military/Indigent discount line */}
            <p className="text-center mt-4 text-sm text-white/60">
              ¿Servicio militar o dificultad financiera? Escríbanos a{' '}
              <a
                href="mailto:info@claseparapadres.com?subject=Solicitud%20de%20descuento"
                className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
              >
                info@claseparapadres.com
              </a>
            </p>
          </div>
        </section>

        {/* COUNTY VERIFICATION SECTION - Searchable county list */}
        <section className="py-16 md:py-24 px-4 bg-background border-t border-[#FFFFFF]/10">
          <div className="max-w-4xl mx-auto">
            <details className="group">
              <summary className="scroll-reveal cursor-pointer list-none flex items-center justify-center gap-3 text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-white">
                  Aceptado en los {state.countyCount} Condados
                </h2>
                <ChevronIcon className="w-6 h-6 text-white/60 transition-transform duration-300 group-open:rotate-180" />
              </summary>

              <div className="mt-8">
                {/* County Search */}
                <div className="relative mb-6 max-w-md mx-auto">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Busque su condado o ciudad..."
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
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
      </main>

      <Footer />
    </>
  );
}

// ============================================
// INLINE ICONS
// ============================================

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="w-5 h-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

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
