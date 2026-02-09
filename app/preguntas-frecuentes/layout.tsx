import type { Metadata } from 'next';
import { pageMetadata, faqSchema, JsonLd } from '../seo-metadata-config';

export const metadata: Metadata = pageMetadata.preguntasFrecuentes;

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={faqSchema} />
      {children}
    </>
  );
}
