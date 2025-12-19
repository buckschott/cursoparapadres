// ============================================
// SITEMAP - cursoparapadres.org
// ============================================
// Next.js App Router auto-generates sitemap.xml from this file

import { MetadataRoute } from 'next'

const BASE_URL = 'https://cursoparapadres.org'

// State slugs for dynamic state pages
const stateSlugs = [
  'florida',
  'texas',
  'california',
  'nueva-york',
  'georgia',
  'arizona',
  'illinois',
  'nueva-jersey',
  'carolina-del-norte',
  'colorado',
  'nevada',
  'nuevo-mexico',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/garantia`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/aceptacion-de-la-corte`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/preguntas-frecuentes`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/politica-de-privacidad`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos-de-servicio`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // State pages
  const statePages: MetadataRoute.Sitemap = stateSlugs.map(slug => ({
    url: `${BASE_URL}/estados/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...corePages, ...statePages]
}
