'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Garantía (Guarantee) Page
 * 
 * Explains the 100% Court Acceptance Guarantee.
 * CTA is in the universal Footer.
 */
export default function Garantia() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-background py-16 md:py-24 border-b border-[#FFFFFF]/10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Garantía de Aceptación del 100%
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              Si su corte no acepta su certificado, recibe un reembolso completo.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="border-t border-[#FFFFFF]/10 py-16 bg-background">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-white text-lg leading-relaxed mb-12">
              Respaldamos nuestro certificado. En más de 30 años, cortes en todo el país han aceptado los certificados de{' '}
              <span className="font-brand">Putting Kids First®</span>.
            </p>
            
            {/* How It Works Card */}
            <div className="bg-background rounded-xl p-8 border border-[#FFFFFF]/15 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Cómo Funciona</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Envíe documentación oficial de su corte mostrando la no aceptación. 
                Procesaremos su reembolso completo. Sin complicaciones. Sin rodeos.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Proceso de Reembolso</h3>
              <ol className="space-y-4">
                {[
                  'Complete el curso y reciba su certificado',
                  'Presente el certificado a su corte',
                  'Si la corte no lo acepta, contáctenos con la documentación oficial',
                  'Reciba su reembolso completo en 5-7 días hábiles'
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#77DD77]/20 text-[#77DD77] flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-white/70 text-lg pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="border-t border-[#FFFFFF]/10 py-16 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 text-center max-w-2xl mx-auto">
              <div className="p-6">
                <div className="text-4xl font-bold text-[#77DD77] mb-2">30+</div>
                <div className="text-white/70">Años de Experiencia</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-[#FFE566] mb-2">100%</div>
                <div className="text-white/70">Garantía de Reembolso</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}