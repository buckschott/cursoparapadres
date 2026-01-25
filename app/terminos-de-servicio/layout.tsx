import type { Metadata } from "next";
import { pageMetadata } from '../seo-metadata-config';

export const metadata: Metadata = pageMetadata.terminos;

export default function TerminosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}