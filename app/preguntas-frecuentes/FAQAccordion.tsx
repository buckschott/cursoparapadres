'use client';

import { useState } from 'react';

// FAQ Data organized by category
const faqData = [
  {
    category: "Aceptación",
    id: "aceptacion",
    questions: [
      {
        q: "¿Esta clase es aceptada en mi estado?",
        a: `Sí. Nuestras clases son aceptadas en todo el país.

Putting Kids First® es el nombre más reconocido en educación parental — líderes en educación parental desde hace décadas. Miles de padres han completado nuestras clases y presentado sus certificados exitosamente en los 50 estados.

También puede verificar con su tribunal la aceptación de los certificados de Putting Kids First.

El Original. El Certificado Más Aceptado.`
      },
      {
        q: "¿Qué clase necesito tomar?",
        a: `Si su orden judicial es por divorcio, custodia, separación, o modificación de una orden existente, necesita la Clase de Co-Parenting.

Si su orden dice habilidades para padres o clase general de crianza, necesita la Clase de Crianza.

Revise sus documentos del tribunal o pregunte a su abogado si no está seguro.`
      },
      {
        q: "¿Necesito verificar con mi corte antes de tomar la clase?",
        a: `No es necesario. Nuestra clase cumple con los requisitos estándar de educación parental aceptados en todo el país.

Sin embargo, si su orden judicial especifica un proveedor particular o requisitos muy específicos, le recomendamos verificar primero.`
      }
    ]
  },
  {
    category: "Precio y Pago",
    id: "precio",
    questions: [
      {
        q: "¿Cuánto cuesta la clase?",
        a: `Clase de Co-Parenting: $60 (4 horas)
Clase de Crianza: $60 (4 horas)
Paquete Combinado: $80 (8 horas)`
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
        q: "¿Puedo obtener el precio del paquete después de comprar una clase?",
        a: `No. El precio especial del Paquete Completo ($80 por ambas clases) solo está disponible antes de su primera compra.

Si decide tomar la segunda clase después, el precio será $60.`
      },
      {
        q: "¿Ofrecen reembolsos?",
        a: `Sí. Ofrecemos reembolso completo del 100% si su tribunal no acepta el certificado con no-aceptación comprobada.

Si su tribunal rechaza nuestro certificado, le devolvemos todo su dinero.`
      }
    ]
  },
  {
    category: "Duración y Formato",
    id: "duracion",
    questions: [
      {
        q: "¿Cuánto tiempo toma completar la clase?",
        a: `La clase toma aproximadamente 4 horas para completar.

Puede completar la clase a su propio ritmo. No tiene que terminar todo en una sesión.`
      },
      {
        q: "¿Puedo pausar y continuar después?",
        a: `Sí. Su progreso se guarda automáticamente. Puede cerrar el navegador y regresar después, cambiar de dispositivo, tomar descansos cuando los necesite, y completar la clase en varios días si lo prefiere.

Cuando regrese, simplemente inicie sesión y continúe donde lo dejó.`
      },
      {
        q: "¿Puedo tomar la clase en mi teléfono?",
        a: `Sí. Nuestra clase funciona perfectamente en teléfonos móviles (iPhone, Android), tabletas (iPad, Android), y computadoras (Windows, Mac).

El diseño se adapta automáticamente a su pantalla. Puede comenzar en un dispositivo y continuar en otro sin perder su progreso.`
      }
    ]
  },
  {
    category: "Certificado",
    id: "certificado",
    questions: [
      {
        q: "¿Cuándo recibo mi certificado?",
        a: `Recibe su certificado inmediatamente después de completar la clase.

El certificado se genera como un archivo PDF que puede descargar a su dispositivo, imprimir en casa, enviar por correo electrónico a su abogado, o presentar directamente al tribunal.

No tiene que esperar días ni pagar por envío.`
      },
      {
        q: "¿El certificado está en español?",
        a: `La clase está 100% en español, pero el certificado se emite en inglés.

Esto es estándar y necesario para que los tribunales de Estados Unidos lo acepten.`
      },
      {
        q: "¿Cómo verifican la autenticidad del certificado?",
        a: `Cada certificado incluye un código QR que enlaza a una página de verificación. Al escanear el código o visitar el enlace, cualquier persona puede confirmar que el certificado es auténtico.`
      }
    ]
  },
  {
    category: "Contenido de la Clase",
    id: "contenido",
    questions: [
      {
        q: "¿Esta clase es solo para divorcios?",
        a: `No. La clase es útil para cualquier situación donde dos padres necesitan coordinar la crianza de sus hijos desde hogares separados, incluyendo divorcio, separación legal, padres que nunca estuvieron casados, casos de custodia, y modificaciones de custodia.

El contenido se aplica a cualquier situación de coparentalidad.`
      },
      {
        q: "¿Ambos padres tienen que tomar la clase?",
        a: `Depende de lo que requiera su tribunal. Algunos tribunales requieren que ambos padres completen la clase; otros solo requieren que uno la tome.

Cada padre debe comprar y completar la clase por separado. No pueden compartir una cuenta ni un certificado.`
      }
    ]
  },
  {
    category: "Soporte",
    id: "soporte",
    questions: [
      {
        q: "¿Hay ayuda disponible en español?",
        a: `Sí. Todo nuestro soporte está disponible en español:

• Sitio web completo en español
• Clase completa en español
• Soporte por correo electrónico en español
• Preguntas frecuentes en español`
      },
      {
        q: "¿Cómo puedo contactarlos si tengo problemas?",
        a: `Puede contactarnos por correo electrónico: info@claseparapadres.com

Respondemos a los correos electrónicos lo más pronto posible, generalmente dentro de 24 horas en días laborales.`
      },
      {
        q: "¿Qué hago si tengo problemas técnicos?",
        a: `Si experimenta problemas técnicos:

1. Intente actualizar la página
2. Intente otro navegador (Chrome, Safari, Firefox, o Edge)
3. Verifique su conexión a internet
4. Limpie la caché de su navegador

Si el problema persiste, contáctenos en info@claseparapadres.com con una descripción del problema, qué dispositivo y navegador está usando, y capturas de pantalla si es posible.`
      }
    ]
  },
  {
    category: "Sobre Nosotros",
    id: "nosotros",
    questions: [
      {
        q: "¿Quién es Putting Kids First?",
        a: `Putting Kids First® es el nombre más reconocido en educación parental — líderes en educación parental desde hace décadas.

El Original. El Certificado Más Aceptado. Miles de padres han completado nuestras clases y presentado sus certificados exitosamente en tribunales de todo el país.`
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
    <div className="border-b border-white/15 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-5 px-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-5 text-white/70 whitespace-pre-line">
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
      {/* Category Navigation - Horizontal scroll on mobile, wrapped on tablet+ */}
      <nav className="mb-10 flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center pb-2 -mb-2 md:pb-0 md:mb-10">
        {faqData.map(category => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border border-white/30 text-white/80 hover:border-[#7EC8E3] hover:text-[#7EC8E3] hover:bg-[#7EC8E3]/10 transition-all"
          >
            {category.category}
          </a>
        ))}
      </nav>

      {/* FAQ Categories */}
      {faqData.map(category => (
        <div key={category.id} id={category.id} className="mb-10 scroll-mt-24">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4">
            {category.category}
          </h2>
          <div className="bg-background rounded-xl overflow-hidden border border-[#FFFFFF]/15 shadow-xl shadow-black/40">
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
