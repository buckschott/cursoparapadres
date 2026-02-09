// ============================================
// SEO METADATA CONFIGURATION - claseparapadres.com
// ============================================
// Ready for Next.js App Router implementation
// Last updated: February 2026
// ============================================

import type { Metadata } from 'next'
import {
  COMPANY_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SITE_URL,
  FOUNDED_YEAR,
  COURSE,
} from '@/constants/site'

// ============================================
// SITE-WIDE CONSTANTS
// ============================================
// Derives from @/constants/site (single source of truth)
// Only SEO-specific values are defined here.

export const SITE_CONFIG = {
  name: 'Clases para Padres',
  legalName: COMPANY_NAME,
  url: SITE_URL.ES,
  englishUrl: SITE_URL.EN,
  locale: 'es_US',
  language: 'es',
  themeColor: '#2563eb',
  foundedYear: String(FOUNDED_YEAR), // Structured data only â€” never in visible copy
  phone: SUPPORT_PHONE,
  phoneFormatted: `+1-${SUPPORT_PHONE}`,
  email: SUPPORT_EMAIL,
  prices: {
    coparenting: COURSE.COPARENTING.price,
    parenting: COURSE.PARENTING.price,
    bundle: COURSE.BUNDLE.price,
  },
  duration: COURSE.COPARENTING.duration,
  durationISO: 'PT4H',
} as const

// ============================================
// SUBPAGE METADATA GENERATOR
// ============================================

export function generatePageMetadata(
  title: string,
  description: string,
  path: string,
  noIndex: boolean = false
): Metadata {
  const url = `${SITE_CONFIG.url}${path}`

  return {
    title: `${title} | Clases para Padres`,
    description,

    openGraph: {
      type: 'website',
      locale: 'es_US',
      url,
      siteName: 'Clases para Padres',
      title: `${title} | Clases para Padres`,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Clases para Padres - El Certificado MÃ¡s Aceptado',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${title} | Clases para Padres`,
      description,
      images: [`${SITE_CONFIG.url}/og-image.png`],
    },

    alternates: {
      canonical: url,
    },

    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
    },
  }
}

// ============================================
// PREDEFINED SUBPAGE METADATA
// ============================================

export const pageMetadata = {
  // Public pages
  aceptacionCorte: generatePageMetadata(
    'AceptaciÃ³n por la Corte',
    'El Certificado MÃ¡s Aceptado. Nuestra clase de coparentalidad es aceptada por tribunales en todo el paÃ­s.',
    '/aceptacion-de-la-corte'
  ),

  preguntasFrecuentes: generatePageMetadata(
    'Preguntas Frecuentes',
    'Preguntas frecuentes sobre la clase para padres en línea. Precio, certificado, duración, aceptación por la corte, y cómo empezar hoy.',
    '/preguntas-frecuentes'
  ),

  privacidad: generatePageMetadata(
    'PolÃ­tica de Privacidad',
    'CÃ³mo protegemos su informaciÃ³n personal. PolÃ­tica de privacidad de Clases para Padres / Putting Kids FirstÂ®.',
    '/politica-de-privacidad'
  ),

  terminos: generatePageMetadata(
    'TÃ©rminos y Condiciones',
    'TÃ©rminos y condiciones de uso de la clase de coparentalidad en lÃ­nea de Putting Kids FirstÂ®.',
    '/terminos-de-servicio'
  ),

  // Auth pages (noIndex)
  iniciarSesion: generatePageMetadata(
    'Iniciar SesiÃ³n',
    'Acceda a su cuenta para continuar su clase de coparentalidad.',
    '/iniciar-sesion',
    true // noIndex
  ),

  recuperarContrasena: generatePageMetadata(
    'Recuperar ContraseÃ±a',
    'Restablezca su contraseÃ±a para acceder a su cuenta.',
    '/recuperar-contrasena',
    true // noIndex
  ),

  restablecerContrasena: generatePageMetadata(
    'Restablecer ContraseÃ±a',
    'Cree una nueva contraseÃ±a para su cuenta.',
    '/restablecer-contrasena',
    true // noIndex
  ),

  // User pages (noIndex)
  panel: generatePageMetadata(
    'Mi Panel',
    'Acceda a sus clases y certificados.',
    '/panel',
    true // noIndex
  ),

  completarPerfil: generatePageMetadata(
    'Completar Perfil',
    'Complete su informaciÃ³n para generar su certificado.',
    '/completar-perfil',
    true // noIndex
  ),

  exito: generatePageMetadata(
    'Compra Exitosa',
    'Su compra ha sido procesada exitosamente.',
    '/exito',
    true // noIndex
  ),
}

// ============================================
// STATE PAGE METADATA GENERATOR
// ============================================

interface StateInfo {
  name: string
  nameEs: string
  slug: string
  hasStateApproval?: boolean
  stateCredential?: string
}

export const states: StateInfo[] = [
  { name: 'Florida', nameEs: 'Florida', slug: 'florida', hasStateApproval: true, stateCredential: 'Aprobado por el Estado de Florida' },
  { name: 'Texas', nameEs: 'Texas', slug: 'texas' },
  { name: 'California', nameEs: 'California', slug: 'california' },
  { name: 'New York', nameEs: 'Nueva York', slug: 'nueva-york' },
  { name: 'Georgia', nameEs: 'Georgia', slug: 'georgia' },
  { name: 'Arizona', nameEs: 'Arizona', slug: 'arizona' },
  { name: 'Illinois', nameEs: 'Illinois', slug: 'illinois' },
  { name: 'New Jersey', nameEs: 'Nueva Jersey', slug: 'nueva-jersey' },
  { name: 'North Carolina', nameEs: 'Carolina del Norte', slug: 'carolina-del-norte' },
  { name: 'Colorado', nameEs: 'Colorado', slug: 'colorado' },
  { name: 'Nevada', nameEs: 'Nevada', slug: 'nevada' },
  { name: 'New Mexico', nameEs: 'Nuevo MÃ©xico', slug: 'nuevo-mexico' },
  // Tier 1 expansion - High Hispanic population
  { name: 'Puerto Rico', nameEs: 'Puerto Rico', slug: 'puerto-rico' },
  { name: 'Washington', nameEs: 'Washington', slug: 'washington' },
  { name: 'Oregon', nameEs: 'OregÃ³n', slug: 'oregon' },
  { name: 'Massachusetts', nameEs: 'Massachusetts', slug: 'massachusetts' },
  { name: 'Connecticut', nameEs: 'Connecticut', slug: 'connecticut' },
  { name: 'Maryland', nameEs: 'Maryland', slug: 'maryland' },
  { name: 'Virginia', nameEs: 'Virginia', slug: 'virginia' },
  { name: 'Pennsylvania', nameEs: 'Pensilvania', slug: 'pensilvania' },
  // Tier 2 expansion - Medium Hispanic population
  { name: 'Michigan', nameEs: 'MÃ­chigan', slug: 'michigan' },
  { name: 'Ohio', nameEs: 'Ohio', slug: 'ohio' },
  { name: 'Indiana', nameEs: 'Indiana', slug: 'indiana' },
  { name: 'Wisconsin', nameEs: 'Wisconsin', slug: 'wisconsin' },
  { name: 'Minnesota', nameEs: 'Minnesota', slug: 'minnesota' },
  { name: 'Tennessee', nameEs: 'Tennessee', slug: 'tennessee' },
  { name: 'Oklahoma', nameEs: 'Oklahoma', slug: 'oklahoma' },
  { name: 'Utah', nameEs: 'Utah', slug: 'utah' },
  // Tier 3 expansion - Complete coverage
  { name: 'Alabama', nameEs: 'Alabama', slug: 'alabama' },
  { name: 'Alaska', nameEs: 'Alaska', slug: 'alaska' },
  { name: 'Arkansas', nameEs: 'Arkansas', slug: 'arkansas' },
  { name: 'Delaware', nameEs: 'Delaware', slug: 'delaware' },
  { name: 'Hawaii', nameEs: 'HawÃ¡i', slug: 'hawai' },
  { name: 'Idaho', nameEs: 'Idaho', slug: 'idaho' },
  { name: 'Iowa', nameEs: 'Iowa', slug: 'iowa' },
  { name: 'Kansas', nameEs: 'Kansas', slug: 'kansas' },
  { name: 'Kentucky', nameEs: 'Kentucky', slug: 'kentucky' },
  { name: 'Louisiana', nameEs: 'Luisiana', slug: 'luisiana' },
  { name: 'Maine', nameEs: 'Maine', slug: 'maine' },
  { name: 'Mississippi', nameEs: 'Misisipi', slug: 'misisipi' },
  { name: 'Missouri', nameEs: 'Misuri', slug: 'misuri' },
  { name: 'Montana', nameEs: 'Montana', slug: 'montana' },
  { name: 'Nebraska', nameEs: 'Nebraska', slug: 'nebraska' },
  { name: 'New Hampshire', nameEs: 'Nuevo Hampshire', slug: 'nuevo-hampshire' },
  { name: 'North Dakota', nameEs: 'Dakota del Norte', slug: 'dakota-del-norte' },
  { name: 'Rhode Island', nameEs: 'Rhode Island', slug: 'rhode-island' },
  { name: 'South Carolina', nameEs: 'Carolina del Sur', slug: 'carolina-del-sur' },
  { name: 'South Dakota', nameEs: 'Dakota del Sur', slug: 'dakota-del-sur' },
  { name: 'Vermont', nameEs: 'Vermont', slug: 'vermont' },
  { name: 'West Virginia', nameEs: 'Virginia Occidental', slug: 'virginia-occidental' },
  { name: 'Wyoming', nameEs: 'Wyoming', slug: 'wyoming' },
  { name: 'District of Columbia', nameEs: 'Washington D.C.', slug: 'washington-dc' },
]

export function generateStateMetadata(state: StateInfo): Metadata {
  const title = `Clases para Padres en ${state.nameEs} | El Certificado MÃ¡s Aceptado`
  const description = `Clase de coparentalidad aceptada por tribunales en ${state.nameEs}. Certificado instantÃ¡neo. 100% en espaÃ±ol. LÃ­deres en educaciÃ³n parental desde hace dÃ©cadas.`
  const path = `/estados/${state.slug}`

  return {
    title,
    description,

    keywords: [
      // Lead with 'clases' variants
      `clases para padres ${state.nameEs}`,
      `clase coparentalidad ${state.nameEs}`,
      `clases padres divorciados ${state.nameEs}`,
      // Keep 'curso' variants for search capture
      `curso para padres ${state.nameEs}`,
      `curso coparentalidad ${state.nameEs}`,
      `parenting class ${state.name} espaÃ±ol`,
    ],

    openGraph: {
      type: 'website',
      locale: 'es_US',
      url: `${SITE_CONFIG.url}${path}`,
      siteName: 'Clases para Padres',
      title,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Clases para Padres en ${state.nameEs}`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_CONFIG.url}/og-image.png`],
    },

    alternates: {
      canonical: `${SITE_CONFIG.url}${path}`,
    },

    robots: {
      index: true,
      follow: true,
    },
  }
}

// ============================================
// STRUCTURED DATA (JSON-LD)
// ============================================

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: COMPANY_NAME,
  alternateName: 'Clases para Padres',
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/logo.png`,
  foundingDate: SITE_CONFIG.foundedYear, // Structured data only
  telephone: SITE_CONFIG.phoneFormatted,
  email: SITE_CONFIG.email,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  sameAs: [
    SITE_CONFIG.englishUrl,
  ],
  knowsLanguage: ['es', 'en'],
}

export const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Clase de Coparentalidad Para Padres',
  description: 'Clase de coparentalidad en lÃ­nea aceptada por tribunales en todo el paÃ­s. DiseÃ±ada para padres en proceso de divorcio o separaciÃ³n. 100% en espaÃ±ol.',
  provider: {
    '@type': 'Organization',
    name: COMPANY_NAME,
    url: SITE_CONFIG.url,
  },
  inLanguage: 'es',
  courseMode: 'online',
  timeRequired: SITE_CONFIG.durationISO,
  offers: {
    '@type': 'Offer',
    price: SITE_CONFIG.prices.coparenting.toString(),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: `${SITE_CONFIG.url}/#precios`,
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    courseWorkload: SITE_CONFIG.durationISO,
  },
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // ---- Aceptación ----
    {
      '@type': 'Question',
      name: '¿Esta clase es aceptada en mi estado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Nuestras clases son aceptadas en todo el país. Putting Kids First® es el nombre más reconocido en educación parental — líderes en educación parental desde hace décadas. Miles de padres han presentado sus certificados exitosamente en los 50 estados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué clase necesito tomar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si su orden judicial es por divorcio, custodia, separación, o modificación de una orden existente, necesita la Clase de Co-Parenting. Si su orden dice habilidades para padres o clase general de crianza, necesita la Clase de Crianza. Revise sus documentos del tribunal o pregunte a su abogado si no está seguro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito verificar con mi corte antes de tomar la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No es necesario. Nuestra clase cumple con los requisitos estándar de educación parental aceptados en todo el país. Sin embargo, si su orden judicial especifica un proveedor particular o requisitos muy específicos, le recomendamos verificar primero.',
      },
    },
    // ---- Precio y Pago ----
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Clase de Co-Parenting: $60 (4 horas). Clase de Crianza: $60 (4 horas). Paquete Combinado: $80 (8 horas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué formas de pago aceptan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aceptamos todas las tarjetas de crédito y débito principales: Visa, Mastercard, American Express, y Discover. El pago se procesa de forma segura a través de Stripe.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo obtener el precio del paquete después de comprar una clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El precio especial del Paquete Completo ($80 por ambas clases) solo está disponible antes de su primera compra. Si decide tomar la segunda clase después, el precio será $60.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Ofrecen reembolsos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Ofrecemos reembolso completo del 100% si su tribunal no acepta el certificado con no-aceptación comprobada.',
      },
    },
    // ---- Duración y Formato ----
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo toma completar la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clase toma aproximadamente 4 horas para completar. Puede completar la clase a su propio ritmo. No tiene que terminar todo en una sesión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo pausar y continuar después?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Su progreso se guarda automáticamente. Puede cerrar el navegador y regresar después, cambiar de dispositivo, y completar la clase en varios días si lo prefiere.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo tomar la clase en mi teléfono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Nuestra clase funciona perfectamente en teléfonos móviles, tabletas, y computadoras. Puede comenzar en un dispositivo y continuar en otro sin perder su progreso.',
      },
    },
    // ---- Certificado ----
    {
      '@type': 'Question',
      name: '¿Cuándo recibo mi certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Recibe su certificado inmediatamente después de completar la clase. El certificado se genera como un archivo PDF que puede descargar, imprimir, o enviar por correo electrónico a su abogado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El certificado está en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clase está 100% en español, pero el certificado se emite en inglés. Esto es estándar y necesario para que los tribunales de Estados Unidos lo acepten.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo verifican la autenticidad del certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada certificado incluye un código QR que enlaza a una página de verificación. Al escanear el código o visitar el enlace, cualquier persona puede confirmar que el certificado es auténtico.',
      },
    },
    // ---- Contenido de la Clase ----
    {
      '@type': 'Question',
      name: '¿Esta clase es solo para divorcios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La clase es útil para cualquier situación donde dos padres necesitan coordinar la crianza desde hogares separados, incluyendo divorcio, separación legal, padres que nunca estuvieron casados, casos de custodia, y modificaciones de custodia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Ambos padres tienen que tomar la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de lo que requiera su tribunal. Algunos requieren que ambos padres completen la clase; otros solo requieren uno. Cada padre debe comprar y completar la clase por separado.',
      },
    },
    // ---- Soporte ----
    {
      '@type': 'Question',
      name: '¿Hay ayuda disponible en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Sí. Todo nuestro sitio web, clase, y soporte están disponibles en español. Puede contactarnos en ${SUPPORT_EMAIL} o llamar al ${SUPPORT_PHONE}.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo contactarlos si tengo problemas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Puede contactarnos por correo electrónico: ${SUPPORT_EMAIL}. Respondemos generalmente dentro de 24 horas en días laborales.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hago si tengo problemas técnicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Intente actualizar la página, usar otro navegador, o verificar su conexión a internet. Si el problema persiste, contáctenos en ${SUPPORT_EMAIL} con una descripción del problema y qué dispositivo está usando.`,
      },
    },
    // ---- Sobre Nosotros ----
    {
      '@type': 'Question',
      name: '¿Quién es Putting Kids First?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Putting Kids First® es el nombre más reconocido en educación parental — líderes en educación parental desde hace décadas. Miles de padres han completado nuestras clases y presentado sus certificados exitosamente en tribunales de todo el país.',
      },
    },
  ],
}

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

// ============================================
// COMPONENT: JSON-LD SCRIPT INJECTOR
// ============================================

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================
// USAGE EXAMPLE IN LAYOUT.TSX
// ============================================
/*
import {
  organizationSchema,
  courseSchema,
  faqSchema,
  JsonLd
} from './seo-metadata-config'

// Note: Homepage metadata is defined directly in layout.tsx

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={courseSchema} />
        <JsonLd data={faqSchema} />
      </head>
      <body>{children}</body>
    </html>
  )
}
*/

// ============================================
// USAGE EXAMPLE IN SUBPAGE
// ============================================
/*
// app/aceptacion-de-la-corte/page.tsx
import { pageMetadata } from '../seo-metadata-config'

export const metadata = pageMetadata.aceptacionCorte

export default function AceptacionCortePage() {
  return (...)
}
*/

// ============================================
// USAGE EXAMPLE FOR STATE PAGES
// ============================================
/*
// app/estados/[slug]/page.tsx
import { states, generateStateMetadata } from '../../seo-metadata-config'

export async function generateMetadata({ params }) {
  const state = states.find(s => s.slug === params.slug)
  if (!state) return {}
  return generateStateMetadata(state)
}

export async function generateStaticParams() {
  return states.map(state => ({ slug: state.slug }))
}
*/
