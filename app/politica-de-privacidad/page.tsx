'use client';

export default function PoliticaDePrivacidad() {
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white sticky top-0 z-[110]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
            <a href="/" className="header-title text-lg font-semibold text-gray-900 tracking-tight font-brand">
              Putting Kids First <sup className="text-xs">®</sup>
            </a>
            <a href="/#precios" className="bg-blue-600 text-white px-3 md:px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-semibold text-[10px] md:text-sm whitespace-nowrap">
              Obtener Mi Certificado
            </a>
          </div>
        </header>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Política de Privacidad
            </h1>
            
            <p className="text-gray-600 mb-8">
              Última actualización: 9 de diciembre de 2025
            </p>

            <div className="space-y-8 text-gray-700">
              
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Información Que Recopilamos</h2>
                <p className="mb-4">Cuando utiliza nuestros servicios, recopilamos la siguiente información:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Información de cuenta:</strong> Correo electrónico y contraseña para crear su cuenta.</li>
                  <li><strong>Información personal:</strong> Nombre completo y nombre legal para su certificado.</li>
                  <li><strong>Información del caso:</strong> Estado, condado y número de caso/expediente de la corte.</li>
                  <li><strong>Progreso del curso:</strong> Lecciones completadas, respuestas del examen y fechas de finalización.</li>
                  <li><strong>Información del certificado:</strong> Número de certificado y código de verificación.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cómo Usamos Su Información</h2>
                <p className="mb-4">Utilizamos su información para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proporcionar acceso a nuestros cursos en línea.</li>
                  <li>Generar su certificado de finalización oficial.</li>
                  <li>Permitir la verificación de su certificado por las cortes.</li>
                  <li>Comunicarnos con usted sobre su cuenta o curso.</li>
                  <li>Procesar pagos a través de nuestro procesador de pagos.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Procesamiento de Pagos</h2>
                <p>
                  Utilizamos Stripe para procesar pagos de forma segura. <strong>No almacenamos información de tarjetas de crédito en nuestros servidores.</strong> Toda la información de pago es manejada directamente por Stripe, que cumple con los estándares de seguridad PCI-DSS.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cookies</h2>
                <p>
                  Utilizamos cookies esenciales únicamente para mantener su sesión de inicio de sesión activa. No utilizamos cookies de seguimiento, publicidad ni análisis de terceros.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios de Terceros</h2>
                <p className="mb-4">Utilizamos los siguientes servicios para operar nuestra plataforma:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Supabase:</strong> Almacenamiento seguro de datos y autenticación.</li>
                  <li><strong>Stripe:</strong> Procesamiento de pagos.</li>
                  <li><strong>Vercel:</strong> Alojamiento web.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Verificación de Certificados</h2>
                <p>
                  Su certificado incluye un código QR y un código de verificación que permite a las cortes y abogados confirmar la autenticidad de su certificado. La página de verificación muestra solo su nombre legal, el curso completado, las fechas y la información del caso que usted proporcionó.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Seguridad de Datos</h2>
                <p>
                  Protegemos su información utilizando conexiones cifradas (SSL/TLS), almacenamiento seguro en la nube y acceso restringido a datos personales. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sus Derechos</h2>
                <p className="mb-4">Usted tiene derecho a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acceder a la información personal que tenemos sobre usted.</li>
                  <li>Solicitar la corrección de información incorrecta.</li>
                  <li>Solicitar la eliminación de su cuenta y datos personales.</li>
                </ul>
                <p className="mt-4">
                  Para ejercer estos derechos, contáctenos a <a href="mailto:info@cursoparapadres.org" className="text-blue-600 hover:underline">info@cursoparapadres.org</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Retención de Datos</h2>
                <p>
                  Conservamos su información mientras su cuenta esté activa y durante el tiempo necesario para cumplir con obligaciones legales y permitir la verificación de certificados emitidos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cambios a Esta Política</h2>
                <p>
                  Podemos actualizar esta política ocasionalmente. Publicaremos cualquier cambio en esta página con una nueva fecha de actualización.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contáctenos</h2>
                <p>
                  Si tiene preguntas sobre esta política de privacidad, contáctenos:
                </p>
                <p className="mt-4">
                  <strong>Putting Kids First®</strong><br />
                  Correo electrónico: <a href="mailto:info@cursoparapadres.org" className="text-blue-600 hover:underline">info@cursoparapadres.org</a><br />
                  Teléfono: 888-777-2298
                </p>
              </section>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            <div className="text-center text-xs text-gray-600">
              <p>© 2025 <span className="font-brand">Putting Kids First ®</span>.<br className="md:hidden" /> Todos los derechos reservados.</p>
              <p className="mt-2">info@cursoparapadres.org • 888-777-2298</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
