import type { Metadata } from 'next';
import { pageMetadata } from '../seo-metadata-config';

export const metadata: Metadata = pageMetadata.restablecerContrasena;

export default function RestablecerContrasenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
