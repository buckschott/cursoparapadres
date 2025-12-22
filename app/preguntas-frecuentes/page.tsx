import { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../seo-metadata-config';
import FAQAccordion from './FAQAccordion';

export const metadata: Metadata = pageMetadata.preguntasFrecuentes;

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 px-4 border-b border-[#FFFFFF]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-white/70">
            Respuestas claras a las preguntas más comunes sobre nuestro curso de coparentalidad.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-divider py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion />
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-divider py-16 px-4 bg-background">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-white/70 mb-8">
            Complete su curso de coparentalidad hoy y reciba su certificado al instante.
          </p>
          <Link
            href="/#precios"
            className="inline-block px-10 py-4 rounded-full text-xl font-bold transition-all hover:scale-105 bg-[#77DD77] text-[#1C1C1C] hover:bg-[#88EE88]"
          >
            Obtener Mi Certificado
          </Link>
          <p className="mt-4 text-white/60">
            $60 • 4 horas • Certificado instantáneo • Garantía 100%
          </p>
        </div>
      </section>
    </div>
  );
}
