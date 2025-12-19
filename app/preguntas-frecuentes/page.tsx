import { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../seo-metadata-config';
import FAQAccordion from './FAQAccordion';

export const metadata: Metadata = pageMetadata.preguntasFrecuentes;

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-600 via-sky-400 to-sky-200 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-white/90">
            Respuestas claras a las preguntas más comunes sobre nuestro curso de coparentalidad.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-gray-600 mb-8">
            Complete su curso de coparentalidad hoy y reciba su certificado al instante.
          </p>
          <Link
            href="/#precios"
            className="inline-block px-10 py-4 rounded-full text-xl font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: '#FFC107',
              color: '#1A2B48',
              boxShadow: '0 4px 14px 0 rgba(255, 193, 7, 0.39)'
            }}
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
