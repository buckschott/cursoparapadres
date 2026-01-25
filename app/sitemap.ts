// ============================================
// SITEMAP - claseparapadres.com
// ============================================
// Next.js App Router auto-generates sitemap.xml from this file

import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.claseparapadres.com'

// All 50 states + DC + Puerto Rico (matches seo-metadata-config.tsx)
const stateSlugs = [
  // Original 12
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
  // Tier 1 - High Hispanic population
  'puerto-rico',
  'washington',
  'oregon',
  'massachusetts',
  'connecticut',
  'maryland',
  'virginia',
  'pensilvania',
  // Tier 2 - Medium Hispanic population
  'michigan',
  'ohio',
  'indiana',
  'wisconsin',
  'minnesota',
  'tennessee',
  'oklahoma',
  'utah',
  // Tier 3 - Complete coverage
  'alabama',
  'alaska',
  'arkansas',
  'delaware',
  'hawai',
  'idaho',
  'iowa',
  'kansas',
  'kentucky',
  'luisiana',
  'maine',
  'misisipi',
  'misuri',
  'montana',
  'nebraska',
  'nuevo-hampshire',
  'dakota-del-norte',
  'rhode-island',
  'carolina-del-sur',
  'dakota-del-sur',
  'vermont',
  'virginia-occidental',
  'wyoming',
  'washington-dc',
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

  // State pages (52 total: 50 states + DC + Puerto Rico)
  const statePages: MetadataRoute.Sitemap = stateSlugs.map(slug => ({
    url: `${BASE_URL}/estados/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...corePages, ...statePages]
}