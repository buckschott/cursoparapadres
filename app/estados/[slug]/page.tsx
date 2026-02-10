import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StatePageContent from './StatePageContent';
import { getStateData, getAllStateSlugs } from '@/lib/stateData';

type Props = { params: Promise<{ slug: string }> };

const SITE_URL = 'https://claseparapadres.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateData(slug);
  
  if (!state) return {};

  const title = `Clase para Padres en ${state.nameEs} | El Certificado Más Aceptado`;
  const description = `Clase para Padres en ${state.nameEs} — aceptada por tribunales en los ${state.countyCount} condados. 4 horas, $60, certificado instantáneo. 100% en español.`;
  const url = `${SITE_URL}/estados/${state.slug}`;
  
  return {
    title,
    description,

    keywords: [
      `clases para padres ${state.nameEs}`,
      `clase coparentalidad ${state.nameEs}`,
      `clases padres divorciados ${state.nameEs}`,
      `curso para padres ${state.nameEs}`,
      `curso coparentalidad ${state.nameEs}`,
      `parenting class ${state.name} español`,
    ],

    openGraph: {
      type: 'website',
      locale: 'es_US',
      url,
      siteName: 'Clases para Padres',
      title,
      description,
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
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
      images: [`${SITE_URL}/og-image.png`],
    },

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  return getAllStateSlugs().map((slug) => ({ slug }));
}

/**
 * Generate Course schema for rich results
 */
function generateCourseSchema(state: NonNullable<ReturnType<typeof getStateData>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `Clase para Padres en ${state.nameEs}`,
    description: `Clase de coparentalidad aceptada por tribunales en ${state.nameEs}. 4 horas, certificado instantáneo.`,
    provider: {
      '@type': 'Organization',
      name: 'Putting Kids First',
      foundingDate: '1993', // Structured data only — not visible to users
      url: 'https://claseparapadres.com',
    },
    offers: {
      '@type': 'Offer',
      price: '60', // Keep in structured data for rich snippets
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    areaServed: {
      '@type': 'State',
      name: state.name,
    },
    inLanguage: 'es',
    timeRequired: 'PT4H',
  };
}

/**
 * Generate FAQPage schema for rich results
 */
function generateFAQSchema(state: NonNullable<ReturnType<typeof getStateData>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: state.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateData(slug);
  
  if (!state) {
    notFound();
  }
  
  const courseSchema = generateCourseSchema(state);
  const faqSchema = generateFAQSchema(state);
  
  return (
    <>
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <StatePageContent slug={slug} />
    </>
  );
}
