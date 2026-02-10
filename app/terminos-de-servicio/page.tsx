'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TerminosDeServicio() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Content */}
        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Términos de Servicio
            </h1>
            
            <p className="text-white/70 mb-8">
              Última actualización: 9 de diciembre de 2025
            </p>

            <div className="space-y-8 text-white">
              
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Aceptación de los Términos</h2>
                <p className="text-white/80">
                  Al acceder y utilizar los servicios de Putting Kids First® a través de claseparapadres.com, usted acepta estos términos de servicio en su totalidad. Si no está de acuerdo con estos términos, no utilice nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Descripción del Servicio</h2>
                <p className="mb-4 text-white/80">
                  Putting Kids First® proporciona clases de educación para padres en línea diseñados para cumplir con los requisitos de las cortes. Nuestros servicios incluyen:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Acceso a clases de coparentalidad y crianza en línea.</li>
                  <li>Exámenes de finalización de la clase.</li>
                  <li>Certificados de finalización con verificación electrónica.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Elegibilidad del Usuario</h2>
                <p className="text-white/80">
                  Esta clase está destinada a padres, tutores legales o cuidadores de hijos menores de edad.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Registro y Cuenta</h2>
                <p className="mb-4 text-white/80">Para utilizar nuestros servicios, usted debe:</p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Proporcionar información veraz y completa al registrarse.</li>
                  <li>Mantener la confidencialidad de su contraseña.</li>
                  <li>Ser responsable de todas las actividades bajo su cuenta.</li>
                  <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</li>
                </ul>
                <p className="mt-4 text-white/80">
                  <strong className="text-white">Una compra, un certificado:</strong> Cada compra da derecho a una (1) persona a completar la clase y recibir un (1) certificado. Las credenciales de inicio de sesión son para uso personal únicamente y no pueden compartirse. Cada persona que requiera un certificado debe realizar una compra por separado.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Información del Certificado</h2>
                <p className="text-white/80">
                  Usted es responsable de proporcionar información precisa para su certificado, incluyendo su nombre legal, estado, condado y número de caso. Los certificados se emiten basándose en la información que usted proporciona. No nos hacemos responsables de errores causados por información incorrecta proporcionada por el usuario.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Pagos y Política de Reembolso</h2>
                <p className="mb-4 text-white/80">
                  <strong className="text-white">Precio:</strong> Todos los precios se muestran en dólares estadounidenses. El pago se procesa de forma segura a través de Stripe.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Política de Reembolsos:</strong> Todos los pagos son finales una vez que se accede al contenido de la clase. Si tiene problemas técnicos que le impiden completar la clase, contáctenos en <a href="mailto:info@claseparapadres.com" className="text-[#7EC8E3] hover:underline">info@claseparapadres.com</a> para asistencia.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Acceso a la Clase</h2>
                <p className="text-white/80">
                  Una vez que complete su compra, tendrá acceso inmediato a la clase. Puede completar la clase a su propio ritmo. Su progreso se guarda automáticamente. El acceso a la clase permanece disponible mientras su cuenta esté activa.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Requisitos de Finalización</h2>
                <p className="text-white/80">
                  Para recibir su certificado, debe completar todas las lecciones de la clase y aprobar el examen final con una puntuación mínima del 80%. Puede retomar el examen si no aprueba en el primer intento.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Aviso sobre Salud Mental</h2>
                <p className="text-white/80">
                  Los componentes de la clase para padres tienen fines educativos únicamente. La presentación de este material no pretende constituir terapia de salud mental, proporcionar información sobre trastornos de salud mental específicos ni sobre medicamentos para tratar trastornos de salud mental. Se recomienda a los participantes que discutan preguntas específicas sobre salud mental con un terapeuta de salud licenciado de su elección.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Aviso Legal</h2>
                <p className="text-white/80">
                  Los componentes legales de la clase para padres proporcionan principios generales del derecho de familia. La presentación de este material no pretende constituir asesoramiento legal, y el material de la clase indica al participante que consulte con un abogado licenciado para obtener respuestas a preguntas legales específicas.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Propiedad Intelectual</h2>
                <p className="text-white/80">
                  Todo el contenido de la clase, incluyendo textos, videos, imágenes y materiales, es propiedad de Putting Kids First® y está protegido por derechos de autor. Usted no puede copiar, distribuir, modificar o crear obras derivadas de nuestro contenido sin autorización escrita.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Uso Aceptable</h2>
                <p className="mb-4 text-white/80">Usted acepta no:</p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Compartir su cuenta o credenciales de acceso con otros.</li>
                  <li>Permitir que otra persona complete la clase en su nombre.</li>
                  <li>Proporcionar información falsa para obtener un certificado.</li>
                  <li>Intentar manipular o evadir los requisitos de la clase.</li>
                  <li>Usar el servicio para cualquier propósito ilegal.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Limitación de Responsabilidad</h2>
                <p className="text-white/80">
                  Putting Kids First® proporciona clases educativas y certificados de finalización. No garantizamos resultados específicos en procedimientos legales. La aceptación final del certificado queda a discreción de cada corte o juez individual.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Modificaciones al Servicio</h2>
                <p className="text-white/80">
                  Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del servicio en cualquier momento. Haremos esfuerzos razonables para notificar a los usuarios sobre cambios significativos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Cambios a los Términos</h2>
                <p className="text-white/80">
                  Podemos actualizar estos términos ocasionalmente. Publicaremos cualquier cambio en esta página con una nueva fecha de actualización. El uso continuado del servicio después de los cambios constituye su aceptación de los nuevos términos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Ley Aplicable</h2>
                <p className="text-white/80">
                  Estos Términos de Servicio se regirán e interpretarán de acuerdo con las leyes del Estado de Texas, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Contáctenos</h2>
                <p className="text-white/80">
                  Si tiene preguntas sobre estos términos de servicio, contáctenos:
                </p>
                <p className="mt-4 text-white/80">
                  <strong className="text-white">Putting Kids First®</strong><br />
                  Correo electrónico: <a href="mailto:info@claseparapadres.com" className="text-[#7EC8E3] hover:underline">info@claseparapadres.com</a>
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