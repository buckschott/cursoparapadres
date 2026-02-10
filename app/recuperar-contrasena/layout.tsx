import type { Metadata } from 'next';
import { pageMetadata } from '../seo-metadata-config';

export const metadata: Metadata = pageMetadata.recuperarContrasena;

export default function RecuperarContrasenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
