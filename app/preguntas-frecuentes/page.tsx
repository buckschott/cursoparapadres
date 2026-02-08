import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { pageMetadata, faqSchema, JsonLd } from '../seo-metadata-config';
import FAQAccordion from './FAQAccordion';

export const metadata: Metadata = pageMetadata.preguntasFrecuentes;

export default function PreguntasFrecuentesPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <Header />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-background py-16 px-4 border-b border-[#FFFFFF]/10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-[28px] md:text-[40px] lg:text-[46px] font-bold text-white mb-4">
              Preguntas Frecuentes<br />
              Clases para Padres
            </h1>
            <p className="text-[18px] md:text-[20px] lg:text-[22px] text-white/70">
              Todo lo que necesita saber sobre la Clase de Co-Parenting y la Clase de Crianza.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="section-divider py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <FAQAccordion />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
