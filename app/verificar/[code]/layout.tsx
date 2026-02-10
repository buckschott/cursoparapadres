import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Certificado | Clases para Padres',
  description: 'Verifique la autenticidad de un certificado de Putting Kids First®. Página de verificación para tribunales, abogados, y empleadores.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function VerificarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
