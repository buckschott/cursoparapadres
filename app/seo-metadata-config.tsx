// ============================================
// SEO METADATA CONFIGURATION - claseparapadres.com
// ============================================
// Ready for Next.js App Router implementation
// Last updated: January 2026
// ============================================

import type { Metadata } from 'next'

// ============================================
// SITE-WIDE CONSTANTS
// ============================================

export const SITE_CONFIG = {
  name: 'Clases para Padres',
  legalName: 'Putting Kids First®',
  url: 'https://claseparapadres.com',
  englishUrl: 'https://puttingkidsfirst.org',
  locale: 'es_US',
  language: 'es',
  themeColor: '#2563eb',
  foundedYear: '1993', // Structured data only — never in visible copy
  phone: '888-777-2298',
  phoneFormatted: '+1-888-777-2298',
  email: 'info@claseparapadres.com',
  prices: {
    coparenting: 60,
    parenting: 60,
    bundle: 80,
  },
  duration: '4 horas',
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
    'Aceptación por la Corte',
    'El Certificado Más Aceptado. Nuestra clase de coparentalidad es aceptada por tribunales en todo el país.',
    '/aceptacion-de-la-corte'
  ),
  
  preguntasFrecuentes: generatePageMetadata(
    'Preguntas Frecuentes',
    'Respuestas a las preguntas más comunes sobre nuestra clase de coparentalidad en línea. Certificado, duración, y más.',
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
  name: 'Putting Kids First®',
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
      name: '¿Esta clase es aceptada en mi estado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Somos El Original — el nombre más reconocido y el certificado más aceptado por tribunales en todo el país.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo toma completar la clase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clase toma aproximadamente 4 horas para completar. Puede trabajar a su propio ritmo, pausar cuando necesite, y su progreso se guarda automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El certificado está en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clase está 100% en español, pero el certificado se emite en inglés para su aceptación por los tribunales de Estados Unidos. Esto es estándar para todas las clases de coparentalidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo recibo mi certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Recibe su certificado PDF inmediatamente después de completar la clase. Puede descargarlo e imprimirlo al instante. El certificado incluye un código QR para verificación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay ayuda disponible en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Todo nuestro sitio web, clase, y soporte al cliente están disponibles en español. Puede contactarnos en info@claseparapadres.com o llamar al 888-777-2298.',
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
      name: '¿Puedo tomar la clase en mi teléfono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Nuestra clase funciona perfectamente en teléfonos móviles, tabletas, y computadoras. Puede comenzar en un dispositivo y continuar en otro — su progreso se guarda automáticamente.',
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