'use client';

import { useState } from 'react';

// FAQ Data organized by category
// Category order: Acceptance → Certificate → Price → Duration → Requirements
const faqData = [
  {
    category: "Aceptación",
    id: "aceptacion",
    questions: [
      {
        q: "¿Esta clase es aceptada en mi estado?",
        a: `Sí. Nuestras clases son aceptadas por tribunales en todo el país.

Putting Kids First® es el nombre más reconocido en educación parental — líderes en educación parental desde hace décadas. Miles de padres han completado nuestras clases y presentado sus certificados exitosamente.

El Original. El Certificado Más Aceptado.`
      },
      {
        q: "¿Qué clase necesito tomar?",
        a: `Si su orden judicial es por divorcio, custodia, separación, o modificación de una orden existente, necesita la Clase de Co-Parenting.

Si su orden dice habilidades para padres o clase general de crianza, necesita la Clase de Crianza.

La mayoría de los padres necesitan la Clase de Co-Parenting.`
      },
      {
        q: "¿Quién es Putting Kids First?",
        a: `Putting Kids First® es el nombre más reconocido en educación parental en Estados Unidos — líderes desde hace más de tres décadas.

El Original. El Certificado Más Aceptado.`
      }
    ]
  },
  {
    category: "Certificado",
    id: "certificado",
    questions: [
      {
        q: "¿Cuándo recibo mi certificado?",
        a: `Inmediatamente. Su certificado se genera en el momento que completa la clase.

Es un archivo PDF que puede descargar, imprimir, o enviar directamente a su abogado o al tribunal. Sin esperas. Sin cargos de envío.`
      },
      {
        q: "¿El certificado está en español?",
        a: `La clase está 100% en español, pero el certificado se emite en inglés.

Esto es estándar y necesario para que los tribunales de Estados Unidos lo acepten.`
      },
      {
        q: "¿Cómo puede la corte verificar mi certificado?",
        a: `Cada certificado incluye un código QR y un código de verificación único. La corte, su abogado, o cualquier persona puede confirmar la autenticidad en segundos.`
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
Paquete Completo: $80 (ambas clases — ahorra $40)

Un precio. Sin cargos adicionales. Incluye la clase completa, el examen, y su certificado instantáneo.`
      },
      {
        q: "¿Qué formas de pago aceptan?",
        a: `Aceptamos todas las tarjetas de crédito y débito principales — Visa, Mastercard, American Express, y Discover.

El pago se procesa de forma segura a través de Stripe, uno de los procesadores de pago más confiables del mundo.`
      },
      {
        q: "¿Puedo obtener el precio del paquete después de comprar una clase?",
        a: `No. El precio especial del Paquete Completo ($80 por ambas clases) solo está disponible antes de su primera compra.

Si decide tomar la segunda clase después, el precio será $60.`
      },
      {
        q: "¿Ofrecen reembolsos?",
        a: `Sí. Si su tribunal no acepta el certificado, le devolvemos el 100% de su dinero.

En más de tres décadas, nuestros certificados han sido aceptados por tribunales en todo el país.`
      }
    ]
  },
  {
    category: "Duración y Formato",
    id: "duracion",
    questions: [
      {
        q: "¿Cuánto tiempo toma completar la clase?",
        a: `La clase es de 4 horas. Puede completarla a su propio ritmo — no tiene que terminar en una sola sesión.`
      },
      {
        q: "¿Puedo pausar y continuar después?",
        a: `Sí. Su progreso se guarda automáticamente.

Puede cerrar el navegador, tomar descansos, o completar la clase en varios días. Cuando regrese, inicie sesión y continúe donde lo dejó.`
      },
      {
        q: "¿Puedo tomar la clase en mi teléfono?",
        a: `Sí. La clase funciona en teléfonos, tabletas, y computadoras.

Puede comenzar en un dispositivo y continuar en otro sin perder su progreso.`
      }
    ]
  },
  {
    category: "Requisitos",
    id: "requisitos",
    questions: [
      {
        q: "¿Esta clase es solo para divorcios?",
        a: `No. La clase aplica a cualquier situación donde dos padres crían a sus hijos desde hogares separados — divorcio, separación legal, custodia, modificaciones de custodia, o padres que nunca estuvieron casados.`
      },
      {
        q: "¿Ambos padres tienen que tomar la clase?",
        a: `Revise su orden judicial — la mayoría de los tribunales requieren que ambos padres completen la clase.

Cada padre debe inscribirse y completar la clase por separado. No se puede compartir una cuenta ni un certificado.`
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
        aria-expanded={isOpen}
        className="w-full py-5 px-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 text-white/70 whitespace-pre-line">
            {answer}
          </div>
        </div>
      </div>
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
