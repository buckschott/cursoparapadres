import type { Metadata } from "next";
import { pageMetadata } from '../seo-metadata-config';

export const metadata: Metadata = pageMetadata.privacidad;

export default function PrivacidadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}