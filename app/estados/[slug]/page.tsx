import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StatePageContent from './StatePageContent';
import { getStateData, getAllStateSlugs } from '@/lib/stateData';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateData(slug);
  
  if (!state) return {};
  
  return {
    title: `Clase para Padres en ${state.nameEs} | El Certificado Más Aceptado`,
    description: `Clase para Padres en ${state.nameEs} — aceptada por tribunales en los ${state.countyCount} condados. 4 horas, $60, certificado instantáneo. 100% en español.`,
    alternates: {
      canonical: `https://claseparapadres.com/estados/${state.slug}`,
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
