import type { Metadata } from "next";
import { pageMetadata } from '../seo-metadata-config';

export const metadata: Metadata = pageMetadata.aceptacionCorte;

export default function AceptacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}