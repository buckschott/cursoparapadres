'use client';

import { useState } from 'react';

// FAQ Data organized by category
const faqData = [
  {
    category: "Aceptación y Legitimidad",
    id: "aceptacion",
    questions: [
      {
        q: "¿Este curso es aceptado en mi estado?",
        a: `Sí. Nuestro curso de coparentalidad es aceptado por tribunales en los 50 estados de Estados Unidos.

Putting Kids First® ha ofrecido cursos de coparentalidad desde 1993 y fue pionero en la educación parental en línea en el año 2000. Miles de padres han completado nuestro curso y presentado sus certificados exitosamente en tribunales de todo el país.

Ofrecemos una garantía de aceptación del 100%: si su tribunal no acepta nuestro certificado por cualquier razón, le devolvemos el 100% de su dinero.`
      },
      {
        q: "¿Cómo sé que mi corte aceptará este certificado?",
        a: `Nuestros certificados incluyen toda la información que los tribunales requieren:

• Su nombre completo
• El estado y condado de su caso
• Su número de caso
• La fecha de registro y finalización
• Un número de certificado único
• Un código QR de verificación
• Firma del Director Ejecutivo

Además, cualquier persona puede verificar la autenticidad de su certificado en línea usando el código de verificación.`
      },
      {
        q: "¿Necesito verificar con mi corte antes de tomar el curso?",
        a: `En la mayoría de los casos, no es necesario. Nuestro curso cumple con los requisitos estándar de educación parental aceptados en todo el país.

Sin embargo, si su orden judicial especifica un proveedor particular o requisitos muy específicos, le recomendamos verificar primero. Puede contactarnos en info@cursoparapadres.org y con gusto revisamos su situación.`
      }
    ]
  },
  {
    category: "Precio y Pago",
    id: "precio",
    questions: [
      {
        q: "¿Cuánto cuesta el curso?",
        a: `Curso de Coparentalidad: $60 (4 horas)
Curso de Crianza: $60 (4 horas)
Paquete Combinado: $80 (4 horas)

El paquete combinado incluye ambos cursos por un precio reducido. Usted completa el mismo contenido una vez y recibe ambos certificados.

No hay costos ocultos, cuotas de procesamiento, ni cargos por el certificado. El precio que ve es el precio que paga.`
      },
      {
        q: "¿Qué formas de pago aceptan?",
        a: `Aceptamos todas las tarjetas de crédito y débito principales:
• Visa
• Mastercard
• American Express
• Discover

El pago se procesa de forma segura a través de Stripe, uno de los procesadores de pago más confiables del mundo.`
      },
      {
        q: "¿Es seguro pagar en línea aquí?",
        a: `Absolutamente. Utilizamos Stripe para procesar todos los pagos. Stripe cumple con los estándares de seguridad PCI más estrictos, encripta toda su información financiera, y es utilizado por millones de empresas en todo el mundo.

Nosotros nunca vemos ni almacenamos los datos de su tarjeta de crédito.`
      },
      {
        q: "¿Ofrecen reembolsos?",
        a: `Sí. Ofrecemos reembolso completo si:

1. Su tribunal no acepta el certificado — Garantía de aceptación del 100%. Si su tribunal rechaza nuestro certificado, le devolvemos todo su dinero.

2. Problemas técnicos no resueltos — Si experimenta problemas técnicos que no podemos resolver y que le impiden completar el curso, procesaremos un reembolso.

Para solicitar un reembolso, contáctenos en info@cursoparapadres.org.`
      }
    ]
  },
  {
    category: "Duración y Formato",
    id: "duracion",
    questions: [
      {
        q: "¿Cuánto tiempo toma completar el curso?",
        a: `El curso toma aproximadamente 4 horas para completar, incluyendo:

• 15 lecciones de contenido educativo
• Ejercicios de reflexión

Puede completar el curso a su propio ritmo. No tiene que terminar todo en una sesión.`
      },
      {
        q: "¿Puedo pausar y continuar después?",
        a: `Sí. Su progreso se guarda automáticamente. Puede cerrar el navegador y regresar después, cambiar de dispositivo, tomar descansos cuando los necesite, y completar el curso en varios días si lo prefiere.

Cuando regrese, simplemente inicie sesión y continúe donde lo dejó.`
      },
      {
        q: "¿Puedo tomar el curso en mi teléfono?",
        a: `Sí. Nuestro curso funciona perfectamente en teléfonos móviles (iPhone, Android), tabletas (iPad, Android), y computadoras (Windows, Mac).

El diseño se adapta automáticamente a su pantalla. Puede comenzar en un dispositivo y continuar en otro sin perder su progreso.`
      },
      {
        q: "¿El curso tiene límite de tiempo para completarlo?",
        a: `No hay fecha límite estricta. Una vez que paga, tiene acceso al curso hasta que lo complete.

Sin embargo, le recomendamos completar el curso antes de su fecha de corte si tiene una audiencia programada. La mayoría de las personas lo terminan en 1-3 días.`
      }
    ]
  },
  {
    category: "Certificado",
    id: "certificado",
    questions: [
      {
        q: "¿Cuándo recibo mi certificado?",
        a: `Recibe su certificado inmediatamente después de completar el curso.

El certificado se genera como un archivo PDF que puede descargar a su dispositivo, imprimir en casa, enviar por correo electrónico a su abogado, o presentar directamente al tribunal.

No tiene que esperar días ni pagar por envío.`
      },
      {
        q: "¿El certificado está en español?",
        a: `El curso está 100% en español, pero el certificado se emite en inglés.

Esto es estándar y necesario para que los tribunales de Estados Unidos lo acepten. Todos los cursos de coparentalidad emiten certificados en inglés, independientemente del idioma del curso.`
      },
      {
        q: "¿Qué información aparece en el certificado?",
        a: `Su certificado incluye:

• Su nombre completo (como lo ingresó)
• El estado donde reside
• El condado donde se presenta su caso
• Su número de caso
• Fecha de registro y finalización
• Número de certificado único (PKF-XXXXXX)
• Código de verificación de 8 caracteres
• Código QR para verificación instantánea
• Firma del Director Ejecutivo
• Logo de Putting Kids First®`
      },
      {
        q: "¿Cómo verifican la autenticidad del certificado?",
        a: `Cada certificado incluye:

1. Código QR — El tribunal puede escanearlo para verificar instantáneamente
2. Código de verificación — Puede ingresarse en nuestro sitio web para confirmar autenticidad
3. Número de certificado único — Registrado en nuestra base de datos

La verificación muestra el nombre, fechas y estado de finalización del curso.`
      },
      {
        q: "¿Qué información necesito para obtener mi certificado?",
        a: `Antes de poder generar su certificado, necesitará proporcionar:

• Nombre completo — Exactamente como aparece en sus documentos legales
• Estado — Donde reside actualmente
• Condado — Donde se presenta su caso de familia
• Número de caso — El número asignado por el tribunal

Asegúrese de que esta información sea correcta, ya que aparecerá en su certificado oficial.`
      }
    ]
  },
  {
    category: "Contenido del Curso",
    id: "contenido",
    questions: [
      {
        q: "¿Qué temas cubre el curso?",
        a: `El Curso de Coparentalidad incluye 15 lecciones:

1. Entendiendo lo que Está Pasando
2. Comunicándose con Sus Hijos
3. Preguntas Comunes de los Niños
4. Apoyando el Bienestar Emocional
5. Manejando Sus Propias Emociones
6. Trabajando con el Otro Padre
7. Seguridad y Apoyo
8. Realidades Financieras
9. Haciendo que el Tiempo de Crianza Funcione
10. Ayudando a los Niños a Través de las Transiciones
11. Días Festivos, Hitos y Ocasiones Especiales
12. El Primer Año y las Primeras Veces
13. Cuando un Padre Se Desconecta
14. Recursos Adicionales
15. Cierre - Avanzando`
      },
      {
        q: "¿Este curso es solo para divorcios?",
        a: `No. El curso es útil para cualquier situación donde dos padres necesitan coordinar la crianza de sus hijos desde hogares separados, incluyendo divorcio, separación legal, padres que nunca estuvieron casados, casos de custodia, y modificaciones de custodia.

El contenido se aplica a cualquier situación de coparentalidad.`
      },
      {
        q: "¿Ambos padres tienen que tomar el curso?",
        a: `Depende de lo que requiera su tribunal. Algunos tribunales requieren que ambos padres completen el curso; otros solo requieren que uno lo tome.

Cada padre debe comprar y completar el curso por separado. No pueden compartir una cuenta ni un certificado.`
      }
    ]
  },
  {
    category: "Soporte y Ayuda",
    id: "soporte",
    questions: [
      {
        q: "¿Hay ayuda disponible en español?",
        a: `Sí. Todo nuestro soporte está disponible en español:

• Sitio web completo en español
• Curso completo en español
• Soporte por correo electrónico en español
• Preguntas frecuentes en español

Puede contactarnos en español en cualquier momento.`
      },
      {
        q: "¿Cómo puedo contactarlos si tengo problemas?",
        a: `Puede contactarnos de las siguientes maneras:

• Correo electrónico: info@cursoparapadres.org
• Teléfono: 888-777-2298

Respondemos a los correos electrónicos lo más pronto posible, generalmente dentro de 24 horas en días laborales.`
      },
      {
        q: "¿Qué hago si tengo problemas técnicos?",
        a: `Si experimenta problemas técnicos:

1. Intente actualizar la página
2. Intente otro navegador (Chrome, Safari, Firefox, o Edge)
3. Verifique su conexión a internet
4. Limpie la caché de su navegador

Si el problema persiste, contáctenos en info@cursoparapadres.org con una descripción del problema, qué dispositivo y navegador está usando, y capturas de pantalla si es posible.`
      }
    ]
  },
  {
    category: "Sobre Nosotros",
    id: "nosotros",
    questions: [
      {
        q: "¿Quién es Putting Kids First?",
        a: `Putting Kids First® es una organización dedicada a la educación parental desde 1993.

Somos pioneros — creamos el primer curso de coparentalidad en línea en el año 2000. Tenemos más de 30 años de experiencia ayudando a familias. Miles de certificados han sido aceptados por tribunales en todo el país.

Somos una empresa familiar que entiende los desafíos que enfrentan las familias durante la separación.`
      },
      {
        q: "¿Por qué debería elegir este curso sobre otros?",
        a: `Experiencia: Llevamos más de 30 años en esto. Fuimos los primeros en ofrecer este tipo de educación en línea.

Precio justo: $60, sin costos ocultos. Muchos competidores cobran más y agregan cargos por el certificado.

Garantía: 100% de garantía de aceptación. Si su tribunal no acepta el certificado, le devolvemos su dinero.

En español: Curso completo en español, no una traducción automática. Diseñado para la comunidad hispanohablante.

Soporte: Ayuda real disponible en español si la necesita.`
      }
    ]
  }
];

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-gray-700">
      <button
        onClick={onClick}
        className="w-full py-5 px-4 flex justify-between items-center text-left hover:bg-[#1a2421] transition-colors"
      >
        <span className="font-semibold text-white pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-5 text-gray-400 whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      {/* Category Navigation */}
      <nav className="mb-8 flex flex-wrap gap-2 justify-center">
        {faqData.map(category => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="px-4 py-2 bg-[#1a2421] rounded-full text-sm font-medium text-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm shadow-black/20"
          >
            {category.category}
          </a>
        ))}
      </nav>

      {/* FAQ Categories */}
      {faqData.map(category => (
        <div key={category.id} id={category.id} className="mb-10 scroll-mt-8">
          <h2 className="text-2xl font-bold text-white mb-4 px-4">
            {category.category}
          </h2>
          <div className="bg-[#1a2421] rounded-xl shadow-sm shadow-black/20 overflow-hidden">
            {category.questions.map((item, index) => (
              <FAQItem
                key={index}
                question={item.q}
                answer={item.a}
                isOpen={openItems[`${category.id}-${index}`] || false}
                onClick={() => toggleItem(category.id, index)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
