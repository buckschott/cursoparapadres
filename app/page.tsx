'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';
import CTAButton from '@/components/CTAButton';
import CheckoutOverlay from '@/components/CheckoutOverlay';
import BundleInterstitial from '@/components/BundleInterstitial';
import { FEATURES } from '@/components/FeatureIcons';
import { useScrollReveal, useDeviceAnimation } from '@/hooks/useScrollReveal';
import { ANIMATION } from '@/constants/animation';

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { showToast } = useToast();
  
  // Bundle interstitial state
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<'coparenting' | 'parenting' | null>(null);
  
  // Custom hooks for animations
  const mainRef = useScrollReveal();
  const devicesRef = useDeviceAnimation();

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
        // Show full-page overlay before redirect
        setIsRedirecting(true);
        // Small delay so user sees the overlay
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
  // SINGLE CLASS HANDLERS - Open interstitial first
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
  // BUNDLE HANDLER - Direct checkout (no interstitial)
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
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden bg-background hero-section flex justify-center z-0">
          <div className="relative w-full max-w-6xl mx-auto px-4 text-center z-10 flex flex-col justify-between hero-content">
            
            <div className="flex justify-center">
              <h1 className="hero-title text-[22px] md:text-[40px] xl:text-[64px] font-bold text-white leading-[1.1] tracking-wide">
                <span className="hero-line-1">Clases para Padres</span><br />
                <span className="hero-line-2">Aceptadas en Todo el País</span>
              </h1>
            </div>

            <div className="flex justify-center">
              <p className="hero-subheadline text-base md:text-2xl lg:text-3xl font-normal text-white max-w-4xl mx-auto leading-relaxed">
                <span className="subtext-line subtext-line-1 inline-block">El Original.</span><br />
                <span className="subtext-line subtext-line-2 inline-block">El Nombre Más Reconocido.</span><br />
                <span className="subtext-line subtext-line-3 inline-block">El Certificado Más Aceptado.</span>
              </p>
            </div>

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
              <CTAButton href="#precios" showArrow={true}>
                Inscríbase Ahora
              </CTAButton>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section 
          id="caracteristicas" 
          className="section-divider relative pt-8 pb-24 bg-background overflow-hidden z-20" 
          aria-labelledby="caracteristicas-heading"
        >
          <div className="relative max-w-6xl mx-auto px-4 z-10">
            <div className="text-center mb-16">
              <h2 id="caracteristicas-heading" className="scroll-reveal text-xl md:text-4xl font-bold text-white mb-4">
                La Clase Para Padres Original
              </h2>
              <p className="scroll-reveal text-base md:text-lg text-white/70 max-w-2xl mx-auto">
                Su horario. Su ritmo. Su certificado.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature, i) => (
                <article 
                  key={i} 
                  className="scroll-reveal group p-8 rounded-2xl border border-[#FFFFFF]/15 md:hover:border-[#7EC8E3]/30 md:hover:shadow-xl shadow-black/40 transition-all duration-300 md:hover:-translate-y-1 bg-background"
                >
                  <div className="w-16 h-16 mb-6 relative overflow-visible">
                    <feature.Icon className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 md:group-hover:text-[#7EC8E3] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        
        {/* DEVICES SECTION */}
        <section 
          ref={devicesRef as React.RefObject<HTMLElement>}
          id="dispositivos"
          className="section-divider relative bg-background overflow-hidden z-20 py-24 pt-32" 
          aria-labelledby="dispositivos-heading"
        >
          <div className="relative max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="dispositivos-heading" className="scroll-reveal text-[22px] md:text-4xl font-bold text-white mb-4">
                Donde Esté. Cuando Pueda.
              </h2>
              <p className="scroll-reveal text-base md:text-lg text-white/70 max-w-2xl mx-auto">
                Teléfono. Tableta. Computadora. Su progreso siempre guardado.
              </p>
            </div>

            <div className="flex justify-center gap-4 md:gap-12 max-w-4xl mx-auto">
              {[
                { name: 'phone', label: 'Teléfono', size: 'w-12 h-12 md:w-[54px] md:h-[54px]', container: 'w-12 md:w-[54px]' },
                { name: 'tablet', label: 'Tableta', size: 'w-16 h-16 md:w-[84px] md:h-[84px]', container: 'w-16 md:w-[84px]' },
                { name: 'laptop', label: 'Portátil', size: 'w-20 h-20 md:w-32 md:h-32', container: 'w-20 md:w-32' },
                { name: 'desktop', label: 'Escritorio', size: 'w-24 h-24 md:w-36 md:h-36', container: 'w-24 md:w-36' }
              ].map((device) => (
                <div key={device.name} className={`device-animate device-${device.name} flex flex-col items-center gap-3`}>
                  <div className={`relative h-28 md:h-40 ${device.container}`}>
                    <img 
                      src={`/${device.name}.svg`} 
                      alt={device.label} 
                      className={`device-img ${device.size} absolute bottom-0 left-0`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section 
          id="precios" 
          className="section-divider relative bg-background z-20 overflow-hidden py-24" 
          aria-labelledby="precios-heading"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="precios-heading" className="scroll-reveal text-lg md:text-4xl font-bold text-white mb-4">
                Clases Para Padres Aceptadas en Todo el País
              </h2>
              <p className="scroll-reveal text-lg md:text-xl lg:text-2xl text-white/70">
                Una clase. Un precio. Listo.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Coparenting Course */}
              <article className="relative bg-background rounded-2xl border-2 border-[#FFFFFF]/20 p-8 transition-all md:hover:shadow-2xl shadow-black/50 md:hover:border-[#FFFFFF]/50">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1">Clase de Coparentalidad</h3>
                  <p className="text-sm text-white/70">Para Divorcio, Separación y Custodia</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$60</span>
                  <p className="text-sm text-white/60 mt-2">Pago único</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Cumple con los requisitos para:</h4>
                  <ul className="space-y-2">
                    {["Procedimientos de divorcio", "Disputas de custodia", "Casos de derechos parentales", "Modificaciones de custodia"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7EC8E3]" />
                        <span className="text-white text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={handleCoparentingClick}
                  disabled={loading === 'coparenting'}
                  className="group w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold transition-all duration-200 hover:bg-[#9DD8F3] hover:shadow-lg hover:shadow-[#7EC8E3]/30 active:scale-[0.98] active:bg-[#9DD8F3] mb-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading === 'coparenting' ? (
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
                
                <div className="mb-6 pt-4 border-t border-[#FFFFFF]/15">
                  <h4 className="text-xs font-semibold text-white mb-2">Incluye:</h4>
                  <ul className="space-y-2">
                    {["Aceptado por Tribunales en Todo el País", "Cumple Requisitos de 4-6 Horas", "Acceso 24/7. A Su Ritmo.", "Certificado Verificable con Código de Seguridad", "Notificamos a Su Abogado al Completar"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#77DD77]" />
                        <span className="text-white/70 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#FFFFFF]/15">
                  <h4 className="text-xs font-semibold text-white mb-2">Nuestra Promesa</h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Su requisito cumplido. Su certificado entregado. Su tiempo respetado.
                  </p>
                </div>
              </article>

              {/* Parenting Course */}
              <article className="relative bg-background rounded-2xl border-2 border-[#FFFFFF]/20 p-8 transition-all md:hover:shadow-2xl shadow-black/50 md:hover:border-[#FFFFFF]/50">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1">Clase de Crianza</h3>
                  <p className="text-sm text-white/70">Para Casos de Reunificación, Adopción y CPS</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$60</span>
                  <p className="text-sm text-white/60 mt-2">Pago único</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Cumple con los requisitos para:</h4>
                  <ul className="space-y-2">
                    {["Casos de crianza ordenados por la corte", "Procedimientos de adopción o cuidado temporal", "Demostrar capacidad parental ante el tribunal", "Requisitos de reunificación familiar"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7EC8E3]" />
                        <span className="text-white text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={handleParentingClick}
                  disabled={loading === 'parenting'}
                  className="group w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold transition-all duration-200 hover:bg-[#9DD8F3] hover:shadow-lg hover:shadow-[#7EC8E3]/30 active:scale-[0.98] active:bg-[#9DD8F3] mb-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading === 'parenting' ? (
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
                
                <div className="mb-6 pt-4 border-t border-[#FFFFFF]/15">
                  <h4 className="text-xs font-semibold text-white mb-2">Incluye:</h4>
                  <ul className="space-y-2">
                    {["Aceptado por Tribunales en Todo el País", "Cumple Requisitos de 4-6 Horas", "Acceso 24/7. A Su Ritmo.", "Certificado Verificable con Código de Seguridad", "Notificamos a Su Abogado al Completar"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#77DD77]" />
                        <span className="text-white/70 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#FFFFFF]/15">
                  <h4 className="text-xs font-semibold text-white mb-2">Nuestra Promesa</h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Su requisito cumplido. Su certificado entregado. Su tiempo respetado.
                  </p>
                </div>
              </article>
            </div>

            {/* Bundle */}
            <div className="max-w-4xl mx-auto mt-16 mb-14">
              <article className="relative bg-background rounded-2xl border-2 border-[#FFFFFF]/20 p-8 transition-all md:hover:shadow-2xl shadow-black/50 md:hover:border-[#FFFFFF]/50">
                {/* Best Value Badge */}
                <div className="absolute -top-3 right-6 bg-[#77DD77] text-[#1C1C1C] px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  ⭐ Mejor Valor
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1">El Paquete Completo</h3>
                  <p className="text-sm text-white/70">Ambas Clases. Un Precio.</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$80</span>
                  <p className="text-sm text-white/60 mt-2">Pago único • Ahorre $40</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Incluye ambas clases:</h4>
                  <ul className="space-y-2">
                    {["Clase de Coparentalidad + Clase de Crianza", "Dos Certificados Verificables", "Notificamos a Su Abogado al Completar Cada Clase", "Cumple Requisitos Combinados o de Nivel Superior"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7EC8E3]" />
                        <span className="text-white text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={handleBundleCheckout}
                  disabled={loading === 'bundle'}
                  className="group w-full bg-[#7EC8E3] text-[#1C1C1C] py-4 rounded-xl font-bold transition-all duration-200 hover:bg-[#9DD8F3] hover:shadow-lg hover:shadow-[#7EC8E3]/30 active:scale-[0.98] active:bg-[#9DD8F3] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <p className="flex items-center justify-center gap-2 text-sm text-white/60">
                <LockIcon className="w-4 h-4" />
                Transacción SSL 100% Segura
              </p>
            </div>

            {/* Military/Indigent discount line */}
            <p className="text-center mt-4 text-sm text-white/50">
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

        {/* TESTIMONIALS SECTION */}
        <section 
          id="testimonios" 
          className="section-divider py-24 bg-background relative z-20" 
          aria-labelledby="testimonios-heading"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="testimonios-heading" className="text-lg md:text-4xl font-bold text-white mb-4">
                Confiado por Padres, Aceptado por Cortes
              </h2>
              <p className="text-lg text-white/70">
                Vea lo que dicen otros padres.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { name: "Roberto Méndez", location: "Houston, Texas", text: "Mi abogado me recomendó esta clase específicamente. Enviaron el certificado a mi abogado por correo electrónico. No tuve que preocuparme más." },
                { name: "Lucía Fernández", location: "Atlanta, Georgia", text: "Como madre soltera con dos trabajos, necesitaba algo flexible. Hice toda la clase en mi teléfono cuando tenía tiempo. El certificado llegó a mi correo al terminar." },
                { name: "Miguel Torres", location: "Jacksonville, Florida", text: "Tenía un requisito del tribunal y necesitaba resolverlo. Fue más fácil de lo que pensé. Requisito cumplido." }
              ].map((review, i) => (
                <article key={i} className="bg-background border-2 border-[#FFFFFF]/15 rounded-2xl p-8 md:hover:border-[#7EC8E3]/30 md:hover:shadow-xl shadow-black/40 transition-all">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, j) => (
                      <StarIcon key={j} className="w-5 h-5 text-[#FFE566]" />
                    ))}
                  </div>
                  <p className="text-white mb-6 leading-relaxed">"{review.text}"</p>
                  <div className="border-t border-[#FFFFFF]/15 pt-4">
                    <p className="font-semibold text-white">{review.name}</p>
                    <p className="text-sm text-white/60">{review.location}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section 
          id="preguntas-frecuentes" 
          className="section-divider py-24 bg-background relative z-20" 
          aria-labelledby="preguntas-frecuentes-heading"
        >
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="preguntas-frecuentes-heading" className="text-lg md:text-4xl font-bold text-white mb-4">
                Su Lista de Verificación Final
              </h2>
              <p className="text-lg text-white/70">
                Detalles clave sobre la aceptación de la corte, su certificado y el acceso a la clase.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { question: "¿Cuándo recibo mi certificado?", answer: "Inmediatamente al completar la clase. Su certificado llega a su correo electrónico y notificamos a su abogado automáticamente." },
                { question: "¿Cuánto tiempo toma la clase?", answer: "La clase está diseñada para cumplir requisitos de 4-6 horas. Es 100% a su ritmo—puede empezar, pausar y continuar cuando quiera." },
                { question: "¿Dónde es aceptado mi certificado?", answer: "En todo el país. Somos el original—el nombre más reconocido y el certificado más aceptado." }
              ].map((faq, i) => (
                <details key={i} className="bg-background border-2 border-[#FFFFFF]/15 rounded-xl overflow-hidden group md:hover:border-[#7EC8E3]/30 transition-colors">
                  <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-white text-lg select-none">
                    <span>{faq.question}</span>
                    <ChevronIcon className="w-6 h-6 text-white/70 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-white/70 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// ============================================
// SMALL INLINE ICONS (not worth extracting to separate file)
// ============================================

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  );
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
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

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
