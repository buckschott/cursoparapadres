'use client';

export default function TerminosDeServicio() {
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
              Términos de Servicio
            </h1>
            
            <p className="text-gray-600 mb-8">
              Última actualización: 9 de diciembre de 2025
            </p>

            <div className="space-y-8 text-gray-700">
              
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Aceptación de los Términos</h2>
                <p>
                  Al acceder y utilizar los servicios de Putting Kids First® a través de cursoparapadres.org, usted acepta estos términos de servicio en su totalidad. Si no está de acuerdo con estos términos, no utilice nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción del Servicio</h2>
                <p className="mb-4">
                  Putting Kids First® proporciona cursos de educación para padres en línea diseñados para cumplir con los requisitos de las cortes. Nuestros servicios incluyen:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acceso a cursos de coparentalidad y crianza en línea.</li>
                  <li>Exámenes de finalización del curso.</li>
                  <li>Certificados de finalización con verificación electrónica.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Elegibilidad del Usuario</h2>
                <p>
                  Este curso está destinado a padres, tutores legales o cuidadores de hijos menores de edad.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Registro y Cuenta</h2>
                <p className="mb-4">Para utilizar nuestros servicios, usted debe:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proporcionar información veraz y completa al registrarse.</li>
                  <li>Mantener la confidencialidad de su contraseña.</li>
                  <li>Ser responsable de todas las actividades bajo su cuenta.</li>
                  <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</li>
                </ul>
                <p className="mt-4">
                  <strong>Una compra, un certificado:</strong> Cada compra da derecho a una (1) persona a completar el curso y recibir un (1) certificado. Las credenciales de inicio de sesión son para uso personal únicamente y no pueden compartirse. Cada persona que requiera un certificado debe realizar una compra por separado.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Certificado</h2>
                <p>
                  Usted es responsable de proporcionar información precisa para su certificado, incluyendo su nombre legal, estado, condado y número de caso. Los certificados se emiten basándose en la información que usted proporciona. No nos hacemos responsables de errores causados por información incorrecta proporcionada por el usuario.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pagos y Política de Reembolso</h2>
                <p className="mb-4">
                  <strong>Precio:</strong> Todos los precios se muestran en dólares estadounidenses. El pago se procesa de forma segura a través de Stripe.
                </p>
                <p className="mb-4">
                  <strong>Garantía de Aceptación del 100%:</strong> Si su corte no acepta su certificado, tiene derecho a un reembolso completo dentro de un (1) año a partir de la fecha de compra. Para solicitar un reembolso, debe presentar documentación oficial de su corte que demuestre la no aceptación. Las solicitudes de reembolso sin documentación oficial de la corte no serán procesadas.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acceso al Curso</h2>
                <p>
                  Una vez que complete su compra, tendrá acceso inmediato al curso. Puede completar el curso a su propio ritmo. Su progreso se guarda automáticamente. El acceso al curso permanece disponible mientras su cuenta esté activa.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos de Finalización</h2>
                <p>
                  Para recibir su certificado, debe completar todas las lecciones del curso y aprobar el examen final con una puntuación mínima del 80%. Puede retomar el examen si no aprueba en el primer intento.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Aviso sobre Salud Mental</h2>
                <p>
                  Los componentes del curso para padres tienen fines educativos únicamente. La presentación de este material no pretende constituir terapia de salud mental, proporcionar información sobre trastornos de salud mental específicos ni sobre medicamentos para tratar trastornos de salud mental. Se recomienda a los participantes que discutan preguntas específicas sobre salud mental con un terapeuta de salud licenciado de su elección.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Aviso Legal</h2>
                <p>
                  Los componentes legales del curso para padres proporcionan principios generales del derecho de familia. La presentación de este material no pretende constituir asesoramiento legal, y el material del curso indica al participante que consulte con un abogado licenciado para obtener respuestas a preguntas legales específicas.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Propiedad Intelectual</h2>
                <p>
                  Todo el contenido del curso, incluyendo textos, videos, imágenes y materiales, es propiedad de Putting Kids First® y está protegido por derechos de autor. Usted no puede copiar, distribuir, modificar o crear obras derivadas de nuestro contenido sin autorización escrita.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Uso Aceptable</h2>
                <p className="mb-4">Usted acepta no:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Compartir su cuenta o credenciales de acceso con otros.</li>
                  <li>Permitir que otra persona complete el curso en su nombre.</li>
                  <li>Proporcionar información falsa para obtener un certificado.</li>
                  <li>Intentar manipular o evadir los requisitos del curso.</li>
                  <li>Usar el servicio para cualquier propósito ilegal.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Limitación de Responsabilidad</h2>
                <p>
                  Putting Kids First® proporciona cursos educativos y certificados de finalización. No garantizamos resultados específicos en procedimientos legales. La aceptación final del certificado queda a discreción de cada corte o juez individual. Nuestra garantía de reembolso cubre casos donde el certificado no es aceptado.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Modificaciones al Servicio</h2>
                <p>
                  Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del servicio en cualquier momento. Haremos esfuerzos razonables para notificar a los usuarios sobre cambios significativos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cambios a los Términos</h2>
                <p>
                  Podemos actualizar estos términos ocasionalmente. Publicaremos cualquier cambio en esta página con una nueva fecha de actualización. El uso continuado del servicio después de los cambios constituye su aceptación de los nuevos términos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ley Aplicable</h2>
                <p>
                  Estos Términos de Servicio se regirán e interpretarán de acuerdo con las leyes del Estado de Texas, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contáctenos</h2>
                <p>
                  Si tiene preguntas sobre estos términos de servicio, contáctenos:
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
