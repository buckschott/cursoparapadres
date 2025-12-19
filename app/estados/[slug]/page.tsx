import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ============================================
// STATE DATA
// ============================================

interface StatePageData {
  slug: string
  name: string
  nameEs: string
  countyCount: string
  majorCounties: string[]
  additionalContent: string
  faqs: { q: string; a: string }[]
}

const stateData: Record<string, StatePageData> = {
  texas: {
    slug: 'texas',
    name: 'Texas',
    nameEs: 'Texas',
    countyCount: '254',
    majorCounties: [
      'Fort Bend',
      'Brazos',
      'Harris (Houston)',
      'Bexar (San Antonio)',
      'El Paso',
      'Nueces (Corpus Christi)',
      'Lubbock',
    ],
    additionalContent: `Texas tiene una de las poblaciones hispanas más grandes de Estados Unidos, con comunidades vibrantes en Houston, San Antonio, El Paso, y el Valle del Río Grande. Muchos tribunales de familia en Texas requieren o recomiendan cursos de coparentalidad para padres en proceso de divorcio o disputas de custodia. Nuestro curso 100% en español está diseñado para servir a las familias hispanas de Texas.`,
    faqs: [
      {
        q: '¿Este curso es aceptado en Houston / Harris County?',
        a: 'Sí. Nuestro curso es aceptado en Harris County y todos los 254 condados de Texas. Ofrecemos garantía de aceptación del 100%.',
      },
      {
        q: '¿El certificado cumple con los requisitos de los tribunales de Texas?',
        a: 'Sí. Nuestro certificado incluye toda la información requerida por los tribunales de Texas: su nombre completo, número de caso, fechas de finalización, y código de verificación.',
      },
      {
        q: '¿Cuánto tiempo tengo para completar el curso?',
        a: 'No hay límite de tiempo. Puede completar el curso a su ritmo. La mayoría de las personas lo terminan en 1-3 días.',
      },
    ],
  },
  florida: {
    slug: 'florida',
    name: 'Florida',
    nameEs: 'Florida',
    countyCount: '67',
    majorCounties: [
      'Miami-Dade',
      'Broward',
      'Palm Beach',
      'Hillsborough (Tampa)',
      'Orange (Orlando)',
      'Duval (Jacksonville)',
      'Brevard',
    ],
    additionalContent: `Florida requiere que los padres en casos de divorcio con hijos menores completen un curso de educación parental bajo el Estatuto de Florida 61.21. Nuestro curso cumple con los requisitos de la Regla Administrativa de Florida 65C-32. Con una gran comunidad hispana en Miami, Tampa, Orlando y Jacksonville, ofrecemos nuestro curso completamente en español para servir mejor a las familias de Florida.`,
    faqs: [
      {
        q: '¿Este curso cumple con los requisitos del Estatuto de Florida 61.21?',
        a: 'Sí. Nuestro curso está diseñado para cumplir con los requisitos de educación parental de Florida, incluyendo todos los componentes requeridos por la Regla Administrativa 65C-32.',
      },
      {
        q: '¿Es aceptado en Miami-Dade County?',
        a: 'Sí. Nuestro curso es aceptado en Miami-Dade y todos los 67 condados de Florida. Ofrecemos garantía de aceptación del 100%.',
      },
      {
        q: '¿Cuántas horas requiere Florida para el curso de padres?',
        a: 'Florida requiere un mínimo de 4 horas de instrucción. Nuestro curso cumple con este requisito.',
      },
      {
        q: '¿El certificado está en inglés o español?',
        a: 'El curso está 100% en español, pero el certificado se emite en inglés para su aceptación por los tribunales de Florida. Esto es estándar para todos los cursos de coparentalidad.',
      },
    ],
  },
  georgia: {
    slug: 'georgia',
    name: 'Georgia',
    nameEs: 'Georgia',
    countyCount: '159',
    majorCounties: [
      'Fulton (Atlanta)',
      'Gwinnett',
      'Cobb',
      'DeKalb',
      'Clayton',
      'Cherokee',
      'Fayette',
      'Liberty',
    ],
    additionalContent: `Georgia tiene una comunidad hispana en rápido crecimiento, especialmente en el área metropolitana de Atlanta. Los tribunales de familia en Georgia frecuentemente ordenan o recomiendan cursos de coparentalidad para ayudar a los padres durante el proceso de divorcio o disputas de custodia. Nuestro curso 100% en español ayuda a las familias hispanas de Georgia a cumplir con estos requisitos mientras aprenden en su idioma.`,
    faqs: [
      {
        q: '¿Este curso es aceptado en Fulton County / Atlanta?',
        a: 'Sí. Nuestro curso es aceptado en Fulton County y todos los 159 condados de Georgia. Ofrecemos garantía de aceptación del 100%.',
      },
      {
        q: '¿El certificado cumple con los requisitos de Georgia?',
        a: 'Sí. Nuestro certificado incluye toda la información requerida por los tribunales de Georgia: su nombre completo, número de caso, fechas de finalización, y código de verificación.',
      },
      {
        q: '¿Puedo tomar el curso desde cualquier lugar de Georgia?',
        a: 'Sí. El curso es 100% en línea. Puede completarlo desde cualquier lugar con conexión a internet — Atlanta, Savannah, Augusta, o cualquier otra ciudad de Georgia.',
      },
    ],
  },
}

// ============================================
// METADATA
// ============================================

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const state = stateData[slug]
  if (!state) return {}

  return {
    title: `Curso Para Padres en ${state.nameEs} | Aceptado por la Corte`,
    description: `Curso de coparentalidad en línea aceptado por tribunales en ${state.nameEs}. Certificado instantáneo. $60. 100% en español. Garantía de aceptación del 100%.`,
    keywords: [
      `curso para padres ${state.nameEs}`,
      `curso coparentalidad ${state.nameEs}`,
      `clase padres ${state.nameEs}`,
      `curso padres divorciados ${state.nameEs}`,
      `parenting class ${state.name} español`,
    ],
    openGraph: {
      title: `Curso Para Padres en ${state.nameEs} | Aceptado por la Corte`,
      description: `Curso de coparentalidad en línea aceptado por tribunales en ${state.nameEs}. Certificado instantáneo. $60. 100% en español.`,
      url: `https://cursoparapadres.org/estados/${state.slug}`,
      type: 'website',
      locale: 'es_US',
      siteName: 'Curso Para Padres',
      images: [
        {
          url: 'https://cursoparapadres.org/og-image.png',
          width: 1200,
          height: 630,
          alt: `Curso Para Padres en ${state.nameEs}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Curso Para Padres en ${state.nameEs} | Aceptado por la Corte`,
      description: `Curso de coparentalidad en línea aceptado por tribunales en ${state.nameEs}. Certificado instantáneo. $60.`,
    },
    alternates: {
      canonical: `https://cursoparapadres.org/estados/${state.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export async function generateStaticParams() {
  return [{ slug: 'texas' }, { slug: 'florida' }, { slug: 'georgia' }]
}

// ============================================
// BREADCRUMB SCHEMA
// ============================================

function BreadcrumbSchema({ state }: { state: StatePageData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://cursoparapadres.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Curso Para Padres en ${state.nameEs}`,
        item: `https://cursoparapadres.org/estados/${state.slug}`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function StatePage({ params }: Props) {
  const { slug } = await params
  const state = stateData[slug]

  if (!state) {
    notFound()
  }

  return (
    <>
      <BreadcrumbSchema state={state} />

      <main className="min-h-screen">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-blue-600 via-sky-400 to-sky-200 py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm mb-6">
              <span>⭐</span>
              <span>Confiable desde 1993 • El Curso Original en Línea</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Curso Para Padres en {state.nameEs}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Aceptado por tribunales en todo {state.nameEs}. Certificado instantáneo.
            </p>

            <Link
              href="/#precios"
              className="inline-block px-10 py-4 rounded-full text-xl font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: '#FFC107',
                color: '#1A2B48',
                boxShadow: '0 4px 14px 0 rgba(255, 193, 7, 0.39)',
              }}
            >
              Obtener Mi Certificado
            </Link>

            <p className="mt-6">
              <Link
                href="/garantia"
                className="text-white underline hover:text-white/80 transition-colors"
              >
                Garantía de Aceptación del 100%
              </Link>
            </p>
          </div>
        </section>

        {/* ACCEPTANCE SECTION */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Aceptado por Tribunales en {state.nameEs}
            </h2>

            <p className="text-lg text-gray-600 mb-8 text-center">
              Nuestro curso de coparentalidad es aceptado por tribunales de familia en todos los condados de {state.nameEs}, incluyendo:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {state.majorCounties.map((county, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{county}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg col-span-2 md:col-span-4">
                <span className="text-blue-500">+</span>
                <span className="text-blue-700 font-medium">
                  Y todos los demás condados de {state.nameEs}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-8">{state.additionalContent}</p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-800 font-medium">
                <span className="font-bold">Garantía:</span> Si su tribunal en {state.nameEs} no acepta nuestro certificado, le devolvemos el 100% de su dinero. Sin preguntas.
              </p>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US SECTION */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              ¿Por Qué Padres en {state.nameEs} Eligen Nuestro Curso?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🏛️',
                  title: `Aceptado en Todo ${state.nameEs}`,
                  desc: `Tribunales en los ${state.countyCount} condados de ${state.nameEs} aceptan nuestro certificado.`,
                },
                {
                  icon: '🌐',
                  title: '100% en Español',
                  desc: 'Curso completo en español, no una traducción automática.',
                },
                {
                  icon: '⚡',
                  title: 'Certificado Instantáneo',
                  desc: 'Reciba su certificado PDF inmediatamente al completar el curso.',
                },
                {
                  icon: '💰',
                  title: 'Precio Justo',
                  desc: '$60 — sin costos ocultos ni cargos adicionales.',
                },
                {
                  icon: '🏆',
                  title: 'Desde 1993',
                  desc: `Más de 30 años ayudando a familias en ${state.nameEs} y todo el país.`,
                },
                {
                  icon: '🛡️',
                  title: 'Garantía 100%',
                  desc: 'Si su tribunal no acepta el certificado, le devolvemos su dinero.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Precio del Curso en {state.nameEs}
            </h2>
            <p className="text-center text-gray-600 mb-12">
              El mismo precio para todos los estados. Sin sorpresas.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Co-Parenting Course */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Curso de Coparentalidad
                </h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">$60</div>
                <ul className="space-y-2 mb-8 text-gray-600 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 4 horas de contenido
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Certificado instantáneo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 100% en español
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Garantía de aceptación
                  </li>
                </ul>
                <Link
                  href="/#precios"
                  className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Comenzar Ahora
                </Link>
              </div>

              {/* Bundle - Featured */}
              <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl p-8 text-center transform md:-translate-y-4 shadow-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-blue-900 text-sm font-bold rounded-full">
                  MÁS POPULAR
                </div>
                <h3 className="text-xl font-bold text-white mb-2 mt-2">
                  Paquete Combinado
                </h3>
                <div className="text-4xl font-bold text-white mb-1">$80</div>
                <div className="text-blue-200 text-sm mb-4">Ahorre $40</div>
                <ul className="space-y-2 mb-8 text-blue-100 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">✓</span> Ambos cursos incluidos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">✓</span> Ambos certificados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">✓</span> Complete una vez
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">✓</span> Mayor valor
                  </li>
                </ul>
                <Link
                  href="/#precios"
                  className="block w-full py-3 bg-yellow-400 text-blue-900 rounded-xl font-bold hover:bg-yellow-300 transition-colors"
                >
                  Obtener Paquete
                </Link>
              </div>

              {/* Parenting Course */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Curso de Crianza
                </h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">$60</div>
                <ul className="space-y-2 mb-8 text-gray-600 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 4 horas de contenido
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Certificado instantáneo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 100% en español
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Garantía de aceptación
                  </li>
                </ul>
                <Link
                  href="/#precios"
                  className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Comenzar Ahora
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Cómo Funciona
            </h2>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  num: '1',
                  title: 'Regístrese y Pague',
                  desc: 'Proceso seguro de 2 minutos. $60.',
                },
                {
                  num: '2',
                  title: 'Complete el Curso',
                  desc: '15 lecciones a su propio ritmo. Aproximadamente 4 horas.',
                },
                {
                  num: '3',
                  title: 'Demuestre Su Comprensión',
                  desc: 'Revise el material y complete las lecciones.',
                },
                {
                  num: '4',
                  title: 'Descargue Su Certificado',
                  desc: `PDF instantáneo listo para presentar en su tribunal de ${state.nameEs}.`,
                },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Preguntas Frecuentes — {state.nameEs}
            </h2>

            <div className="space-y-4">
              {state.faqs.map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/preguntas-frecuentes"
                className="text-blue-600 hover:underline font-medium"
              >
                Ver todas las preguntas frecuentes →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comience Su Curso Hoy
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Únase a miles de padres en {state.nameEs} que han completado nuestro curso.
            </p>

            <Link
              href="/#precios"
              className="inline-block px-10 py-4 rounded-full text-xl font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: '#FFC107',
                color: '#1A2B48',
                boxShadow: '0 4px 14px 0 rgba(255, 193, 7, 0.39)',
              }}
            >
              Obtener Mi Certificado
            </Link>

            <p className="mt-6 text-blue-200">
              $60 • 4 horas • Certificado instantáneo • Garantía 100%
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 bg-gray-900 text-gray-400">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <div className="text-white font-bold text-lg mb-1">Curso Para Padres</div>
                <div className="text-sm">
                  © 2025 Putting Kids First®. Todos los derechos reservados.
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/politica-de-privacidad" className="hover:text-white transition-colors">
                  Privacidad
                </Link>
                <Link href="/terminos-de-servicio" className="hover:text-white transition-colors">
                  Términos
                </Link>
                <Link href="/preguntas-frecuentes" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
              <p className="mb-2">También servimos:</p>
              <div className="flex flex-wrap justify-center gap-4">
                {Object.values(stateData)
                  .filter((s) => s.slug !== slug)
                  .map((s) => (
                    <Link
                      key={s.slug}
                      href={`/estados/${s.slug}`}
                      className="hover:text-white transition-colors"
                    >
                      {s.nameEs}
                    </Link>
                  ))}
                <span className="text-gray-600">• Y los 50 estados</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
