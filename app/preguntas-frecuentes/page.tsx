import { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../seo-metadata-config';
import FAQAccordion from './FAQAccordion';

export const metadata: Metadata = pageMetadata.preguntasFrecuentes;

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-[#1a2421]">
      {/* Hero */}
      <section className="bg-[#1a2421] py-16 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-400">
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
      <section className="section-divider py-16 px-4 bg-[#1a2421]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-gray-400 mb-8">
            Complete su curso de coparentalidad hoy y reciba su certificado al instante.
          </p>
          <Link
            href="/#precios"
            className="inline-block px-10 py-4 rounded-full text-xl font-bold transition-all hover:scale-105 bg-white text-black hover:bg-gray-200"
          >
            Obtener Mi Certificado
          </Link>
          <p className="mt-4 text-gray-500">
            $60 • 4 horas • Certificado instantáneo • Garantía 100%
          </p>
        </div>
      </section>
    </div>
  );
}
