'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PoliticaDePrivacidad() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Content */}
        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Política de Privacidad
            </h1>
            
            <p className="text-white/70 mb-8">
              Última actualización: 9 de diciembre de 2025
            </p>

            <div className="space-y-8 text-white">
              
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Información Que Recopilamos</h2>
                <p className="mb-4">Cuando utiliza nuestros servicios, recopilamos la siguiente información:</p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li><strong className="text-white">Información de cuenta:</strong> Correo electrónico y contraseña para crear su cuenta.</li>
                  <li><strong className="text-white">Información personal:</strong> Nombre completo y nombre legal para su certificado.</li>
                  <li><strong className="text-white">Información del caso:</strong> Estado, condado y número de caso/expediente de la corte.</li>
                  <li><strong className="text-white">Progreso de la clase:</strong> Lecciones completadas, respuestas del examen y fechas de finalización.</li>
                  <li><strong className="text-white">Información del certificado:</strong> Número de certificado y código de verificación.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Cómo Usamos Su Información</h2>
                <p className="mb-4">Utilizamos su información para:</p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Proporcionar acceso a nuestras clases en línea.</li>
                  <li>Generar su certificado de finalización oficial.</li>
                  <li>Permitir la verificación de su certificado por las cortes.</li>
                  <li>Comunicarnos con usted sobre su cuenta o clase.</li>
                  <li>Procesar pagos a través de nuestro procesador de pagos.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Procesamiento de Pagos</h2>
                <p className="text-white/80">
                  Utilizamos Stripe para procesar pagos de forma segura. <strong className="text-white">No almacenamos información de tarjetas de crédito en nuestros servidores.</strong> Toda la información de pago es manejada directamente por Stripe, que cumple con los estándares de seguridad PCI-DSS.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Cookies</h2>
                <p className="text-white/80">
                  Utilizamos cookies esenciales únicamente para mantener su sesión de inicio de sesión activa. No utilizamos cookies de seguimiento, publicidad ni análisis de terceros.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Servicios de Terceros</h2>
                <p className="mb-4">Utilizamos los siguientes servicios para operar nuestra plataforma:</p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li><strong className="text-white">Supabase:</strong> Almacenamiento seguro de datos y autenticación.</li>
                  <li><strong className="text-white">Stripe:</strong> Procesamiento de pagos.</li>
                  <li><strong className="text-white">Vercel:</strong> Alojamiento web.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Verificación de Certificados</h2>
                <p className="text-white/80">
                  Su certificado incluye un código QR y un código de verificación que permite a las cortes y abogados confirmar la autenticidad de su certificado. La página de verificación muestra solo su nombre legal, la clase completada, las fechas y la información del caso que usted proporcionó.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Seguridad de Datos</h2>
                <p className="text-white/80">
                  Protegemos su información utilizando conexiones cifradas (SSL/TLS), almacenamiento seguro en la nube y acceso restringido a datos personales. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Sus Derechos</h2>
                <p className="mb-4">Usted tiene derecho a:</p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Acceder a la información personal que tenemos sobre usted.</li>
                  <li>Solicitar la corrección de información incorrecta.</li>
                  <li>Solicitar la eliminación de su cuenta y datos personales.</li>
                </ul>
                <p className="mt-4 text-white/80">
                  Para ejercer estos derechos, contáctenos a <a href="mailto:hola@claseparapadres.com" className="text-[#7EC8E3] hover:underline">hola@claseparapadres.com</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Retención de Datos</h2>
                <p className="text-white/80">
                  Conservamos su información mientras su cuenta esté activa y durante el tiempo necesario para cumplir con obligaciones legales y permitir la verificación de certificados emitidos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Cambios a Esta Política</h2>
                <p className="text-white/80">
                  Podemos actualizar esta política ocasionalmente. Publicaremos cualquier cambio en esta página con una nueva fecha de actualización.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Contáctenos</h2>
                <p className="text-white/80">
                  Si tiene preguntas sobre esta política de privacidad, contáctenos:
                </p>
                <p className="mt-4 text-white/80">
                  <strong className="text-white">Putting Kids First®</strong><br />
                  Correo electrónico: <a href="mailto:hola@claseparapadres.com" className="text-[#7EC8E3] hover:underline">hola@claseparapadres.com</a>
                </p>
              </section>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}