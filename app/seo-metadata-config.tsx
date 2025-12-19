// ============================================
// SEO METADATA CONFIGURATION - cursoparapadres.org
// ============================================
// Ready for Next.js App Router implementation
// Last updated: December 2024
// Approved by: Spanish Market Specialist
// ============================================

import type { Metadata } from 'next'

// ============================================
// SITE-WIDE CONSTANTS
// ============================================

export const SITE_CONFIG = {
  name: 'Curso Para Padres',
  legalName: 'Putting Kids First®',
  url: 'https://cursoparapadres.org',
  englishUrl: 'https://puttingkidsfirst.org',
  locale: 'es_US',
  language: 'es',
  themeColor: '#2563eb',
  foundedYear: '1993',
  phone: '888-777-2298',
  phoneFormatted: '+1-888-777-2298',
  email: 'info@cursoparapadres.org',
  prices: {
    coparenting: 60,
    parenting: 60,
    bundle: 80,
  },
  duration: '4 horas',
  durationISO: 'PT4H',
} as const

// ============================================
// HOMEPAGE METADATA
// ============================================

export const homepageMetadata: Metadata = {
  title: 'Curso Para Padres Aceptado por la Corte | Desde 1993',
  description: 'El curso original de coparentalidad en línea. Aceptado en todos los estados. Certificado instantáneo. $60. Garantía de aceptación del 100%. 100% en español.',
  
  keywords: [
    // Primary - exact match to domain
    'curso para padres',
    // Product keywords
    'curso de coparentalidad',
    'curso de crianza',
    'curso para padres divorciados',
    'curso para padres separados',
    // Search capture variants (users may search "clase")
    'clase de coparentalidad',
    'clase para padres',
    'clase de padres para la corte',
    // Court/legal intent
    'curso para padres ordenado por la corte',
    'curso de padres aceptado por la corte',
    'certificado de coparentalidad',
  ],

  authors: [{ name: 'Putting Kids First®', url: SITE_CONFIG.url }],
  creator: 'Putting Kids First®',
  publisher: 'Putting Kids First®',

  openGraph: {
    type: 'website',
    locale: 'es_US',
    url: SITE_CONFIG.url,
    siteName: 'Curso Para Padres',
    title: 'Curso Para Padres Aceptado por la Corte | Desde 1993',
    description: 'El curso original de coparentalidad en línea. Aceptado en todos los estados. Certificado instantáneo. $60. Garantía de aceptación del 100%.',
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Curso Para Padres - El Curso Original de Coparentalidad Desde 1993',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Curso Para Padres Aceptado por la Corte | Desde 1993',
    description: 'Curso de coparentalidad aceptado por la corte en todos los estados. Certificado instantáneo. $60. 100% en español.',
    images: [`${SITE_CONFIG.url}/og-image.png`],
  },

  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      'es': SITE_CONFIG.url,
      'en': SITE_CONFIG.englishUrl,
      'x-default': SITE_CONFIG.englishUrl,
    },
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    // Add these once accounts are set up
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },

  category: 'education',
}

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
    title: `${title} | Curso Para Padres`,
    description,
    
    openGraph: {
      type: 'website',
      locale: 'es_US',
      url,
      siteName: 'Curso Para Padres',
      title: `${title} | Curso Para Padres`,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Curso Para Padres - El Curso Original de Coparentalidad Desde 1993',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${title} | Curso Para Padres`,
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
  garantia: generatePageMetadata(
    'Garantía de Aceptación del 100%',
    'Si su tribunal no acepta nuestro certificado, le devolvemos el 100% de su dinero. Sin preguntas. Garantía válida por 1 año.',
    '/garantia'
  ),
  
  aceptacionCorte: generatePageMetadata(
    'Aceptación de la Corte en Todos los Estados',
    'Nuestro curso de coparentalidad es aceptado por tribunales en los 50 estados de EE.UU. Confiable desde 1993.',
    '/aceptacion-de-la-corte'
  ),
  
  preguntasFrecuentes: generatePageMetadata(
    'Preguntas Frecuentes',
    'Respuestas a las preguntas más comunes sobre nuestro curso de coparentalidad en línea. Precio, duración, certificado, y más.',
    '/preguntas-frecuentes'
  ),
  
  privacidad: generatePageMetadata(
    'Política de Privacidad',
    'Cómo protegemos su información personal. Política de privacidad de Curso Para Padres / Putting Kids First®.',
    '/politica-de-privacidad'
  ),
  
  terminos: generatePageMetadata(
    'Términos de Servicio',
    'Términos y condiciones de uso del curso de coparentalidad en línea de Putting Kids First®.',
    '/terminos-de-servicio'
  ),

  // Auth pages (noIndex)
  iniciarSesion: generatePageMetadata(
    'Iniciar Sesión',
    'Acceda a su cuenta para continuar su curso de coparentalidad.',
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
    'Acceda a sus cursos y certificados.',
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
}

export const states: StateInfo[] = [
  { name: 'Florida', nameEs: 'Florida', slug: 'florida' },
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
  // Add remaining states as needed
]

export function generateStateMetadata(state: StateInfo): Metadata {
  const title = `Curso Para Padres en ${state.nameEs} | Aceptado por la Corte`
  const description = `Curso de coparentalidad en línea aceptado por tribunales en ${state.nameEs}. Certificado instantáneo. $60. 100% en español. Garantía de aceptación del 100%.`
  const path = `/estados/${state.slug}`
  
  return {
    title,
    description,
    
    keywords: [
      `curso para padres ${state.nameEs}`,
      `curso coparentalidad ${state.nameEs}`,
      `clase padres ${state.nameEs}`,
      `curso padres divorciados ${state.nameEs}`,
      `parenting class ${state.name} español`,
    ],

    openGraph: {
      type: 'website',
      locale: 'es_US',
      url: `${SITE_CONFIG.url}${path}`,
      siteName: 'Curso Para Padres',
      title,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Curso Para Padres en ${state.nameEs}`,
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
  name: 'Putting Kids First®',
  alternateName: 'Curso Para Padres',
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/logo.png`,
  foundingDate: SITE_CONFIG.foundedYear,
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
  name: 'Curso de Coparentalidad Para Padres',
  description: 'Curso de coparentalidad en línea aceptado por tribunales en todos los estados de EE.UU. Diseñado para padres en proceso de divorcio o separación. 100% en español.',
  provider: {
    '@type': 'Organization',
    name: 'Putting Kids First®',
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
    {
      '@type': 'Question',
      name: '¿Este curso es aceptado en mi estado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Nuestro curso es aceptado por tribunales en los 50 estados de EE.UU. Ofrecemos una garantía de aceptación del 100% — si su tribunal no acepta nuestro certificado, le devolvemos su dinero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta el curso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso de coparentalidad cuesta $60. El curso de crianza cuesta $60. El paquete combinado (ambos cursos, ambos certificados) cuesta $80. No hay costos ocultos ni sorpresas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo toma completar el curso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso toma aproximadamente 4 horas para completar. Puede trabajar a su propio ritmo, pausar cuando necesite, y su progreso se guarda automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El certificado está en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso está 100% en español, pero el certificado se emite en inglés para su aceptación por los tribunales de Estados Unidos. Esto es estándar para todos los cursos de coparentalidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo recibo mi certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Recibe su certificado PDF inmediatamente después de completar el curso. Puede descargarlo e imprimirlo al instante. El certificado incluye un código QR para verificación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay ayuda disponible en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Todo nuestro sitio web, curso, y soporte al cliente están disponibles en español. Puede contactarnos en info@cursoparapadres.org o llamar al 888-777-2298.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro pagar en línea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Utilizamos Stripe, uno de los procesadores de pago más seguros del mundo. Su información financiera está encriptada y protegida. Nunca almacenamos los datos de su tarjeta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo tomar el curso en mi teléfono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Nuestro curso funciona perfectamente en teléfonos móviles, tabletas, y computadoras. Puede comenzar en un dispositivo y continuar en otro — su progreso se guarda automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué información necesito para el certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Necesitará su nombre completo (como aparece en documentos legales), su estado, el condado donde se presenta su caso, y su número de caso. Esta información aparecerá en su certificado.',
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
  homepageMetadata, 
  organizationSchema, 
  courseSchema, 
  faqSchema,
  JsonLd 
} from './seo-metadata-config'

export const metadata = homepageMetadata

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
// app/garantia/page.tsx
import { pageMetadata } from '../seo-metadata-config'

export const metadata = pageMetadata.garantia

export default function GarantiaPage() {
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
