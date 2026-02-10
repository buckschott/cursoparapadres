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
  themeColor: '#1C1C1C',
  foundedYear: String(FOUNDED_YEAR), // Structured data only — never in visible copy
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
          alt: 'Clases para Padres - El Certificado Más Aceptado',
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
      follow: true,
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
    'Aceptación por la Corte',
    'El Certificado Más Aceptado. Nuestra clase de coparentalidad es aceptada por tribunales en todo el país.',
    '/aceptacion-de-la-corte'
  ),
  
  preguntasFrecuentes: generatePageMetadata(
    'Preguntas Frecuentes',
    'Clases para padres en línea — preguntas frecuentes. Certificado instantáneo. Aceptada por tribunales en todo el país. Putting Kids First®.',
    '/preguntas-frecuentes'
  ),
  
  privacidad: generatePageMetadata(
    'Política de Privacidad',
    'Cómo protegemos su información personal. Política de privacidad de Clases para Padres / Putting Kids First®.',
    '/politica-de-privacidad'
  ),
  
  terminos: generatePageMetadata(
    'Términos y Condiciones',
    'Términos y condiciones de uso de la clase de coparentalidad en línea de Putting Kids First®.',
    '/terminos-de-servicio'
  ),

  // Auth pages (noIndex)
  iniciarSesion: generatePageMetadata(
    'Iniciar Sesión',
    'Acceda a su cuenta para continuar su clase de coparentalidad.',
    '/iniciar-sesion',
    true // noIndex
  ),
  
  recuperarContrasena: generatePageMetadata(
    'Recuperar Contraseña',
    'Restablezca su contraseña para acceder a su cuenta.',
    '/recuperar-contrasena',
    true // noIndex
  ),
  
  restablecerContrasena: generatePageMetadata(
    'Restablecer Contraseña',
    'Cree una nueva contraseña para su cuenta.',
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
    'Complete su información para generar su certificado.',
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
  { name: 'New Mexico', nameEs: 'Nuevo México', slug: 'nuevo-mexico' },
  // Tier 1 expansion - High Hispanic population
  { name: 'Puerto Rico', nameEs: 'Puerto Rico', slug: 'puerto-rico' },
  { name: 'Washington', nameEs: 'Washington', slug: 'washington' },
  { name: 'Oregon', nameEs: 'Oregón', slug: 'oregon' },
  { name: 'Massachusetts', nameEs: 'Massachusetts', slug: 'massachusetts' },
  { name: 'Connecticut', nameEs: 'Connecticut', slug: 'connecticut' },
  { name: 'Maryland', nameEs: 'Maryland', slug: 'maryland' },
  { name: 'Virginia', nameEs: 'Virginia', slug: 'virginia' },
  { name: 'Pennsylvania', nameEs: 'Pensilvania', slug: 'pensilvania' },
  // Tier 2 expansion - Medium Hispanic population
  { name: 'Michigan', nameEs: 'Míchigan', slug: 'michigan' },
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
  { name: 'Hawaii', nameEs: 'Hawái', slug: 'hawai' },
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
  const title = `Clases para Padres en ${state.nameEs} | El Certificado Más Aceptado`
  const description = `Clase de coparentalidad aceptada por tribunales en ${state.nameEs}. Certificado instantáneo. 100% en español. Líderes en educación parental desde hace décadas.`
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
      `parenting class ${state.name} español`,
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
  description: 'Clase de coparentalidad en línea aceptada por tribunales en todo el país. Diseñada para padres en proceso de divorcio o separación. 100% en español.',
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

// ============================================
// FAQ SCHEMA — Must match FAQAccordion.tsx exactly
// ============================================
// Source of truth: /app/preguntas-frecuentes/FAQAccordion.tsx
// 15 questions across 5 categories
// ============================================

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // ---- Aceptación (3) ----
    {
      '@type': 'Question',
      name: '¿Esta clase es aceptada en mi estado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Nuestras clases son aceptadas por tribunales en todo el país. Putting Kids First® es el nombre más reconocido en educación parental — líderes en educación parental desde hace décadas. Miles de padres han completado nuestras clases y presentado sus certificados exitosamente. El Original. El Certificado Más Aceptado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué clase necesito tomar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si su orden judicial es por divorcio, custodia, separación, o modificación de una orden existente, necesita la Clase de Co-Parenting. Si su orden dice habilidades para padres o clase general de crianza, necesita la Clase de Crianza. La mayoría de los padres necesitan la Clase de Co-Parenting.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién es Putting Kids First?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Putting Kids First® es el nombre más reconocido en educación parental en Estados Unidos — líderes desde hace más de tres décadas. El Original. El Certificado Más Aceptado.',
      },
    },
    // ---- Certificado (3) ----
    {
      '@type': 'Question',
      name: '¿Cuándo recibo mi certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Inmediatamente. Su certificado se genera en el momento que completa la clase. Es un archivo PDF que puede descargar, imprimir, o enviar directamente a su abogado o al tribunal. Sin esperas. Sin cargos de envío.',
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
      name: '¿Cómo puede la corte verificar mi certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada certificado incluye un código QR y un código de verificación único. La corte, su abogado, o cualquier persona puede confirmar la autenticidad en segundos.',
      },
    },
    // ---- Precio y Pago (4) ----
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Clase de Co-Parenting: $60 (4 horas). Clase de Crianza: $60 (4 horas). Paquete Completo: $80 (ambas clases — ahorra $40). Un precio. Sin cargos adicionales. Incluye la clase completa, el examen, y su certificado instantáneo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué formas de pago aceptan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aceptamos todas las tarjetas de crédito y débito principales — Visa, Mastercard, American Express, y Discover. El pago se procesa de forma segura a través de Stripe, uno de los procesadores de pago más confiables del mundo.',
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
        text: 'Sí. Si su tribunal no acepta el certificado, le devolvemos el 100% de su dinero. En más de tres décadas, nuestros certificados han sido aceptados por tribunales en todo el país.',
      },
    },
    // ---- Duración y Formato (3) ----
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo toma completar la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clase es de 4 horas. Puede completarla a su propio ritmo — no tiene que terminar en una sola sesión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo pausar y continuar después?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Su progreso se guarda automáticamente. Puede cerrar el navegador, tomar descansos, o completar la clase en varios días. Cuando regrese, inicie sesión y continúe donde lo dejó.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo tomar la clase en mi teléfono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La clase funciona en teléfonos, tabletas, y computadoras. Puede comenzar en un dispositivo y continuar en otro sin perder su progreso.',
      },
    },
    // ---- Requisitos (2) ----
    {
      '@type': 'Question',
      name: '¿Esta clase es solo para divorcios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La clase aplica a cualquier situación donde dos padres crían a sus hijos desde hogares separados — divorcio, separación legal, custodia, modificaciones de custodia, o padres que nunca estuvieron casados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Ambos padres tienen que tomar la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Revise su orden judicial — la mayoría de los tribunales requieren que ambos padres completen la clase. Cada padre debe inscribirse y completar la clase por separado. No se puede compartir una cuenta ni un certificado.',
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
