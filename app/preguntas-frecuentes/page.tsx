'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTAButton from '@/components/CTAButton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import FAQAccordion from './FAQAccordion';

export default function PreguntasFrecuentesPage() {
  const mainRef = useScrollReveal();

  return (
    <>
      <Header />
      <div ref={mainRef} className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-background py-16 px-4 border-b border-[#FFFFFF]/10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="scroll-reveal text-[28px] md:text-[40px] lg:text-[46px] font-bold text-white mb-4">
              Preguntas Frecuentes<br />
              Clases para Padres
            </h1>
            <p className="scroll-reveal text-[18px] md:text-[20px] lg:text-[22px] text-white/70">
              Todo lo que necesita saber sobre la Clase de Co-Parenting y la Clase de Crianza.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="section-divider py-12 px-4">
          <div className="scroll-reveal max-w-3xl mx-auto">
            <FAQAccordion />
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="section-divider py-24 bg-background relative z-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="scroll-reveal text-2xl md:text-4xl font-bold text-white mb-4">
              ¿Listo/a para empezar?
            </h2>
            <p className="scroll-reveal text-lg md:text-xl text-white/70 mb-10">
              Online. A su ritmo. Certificado instantáneo.
            </p>
            <CTAButton href="/#precios" showArrow={true}>
              Inscríbase Ahora
            </CTAButton>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
