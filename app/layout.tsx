import type { Metadata } from "next";
import { Courier_Prime, Short_Stack } from "next/font/google";
import "./globals.css";
import AuthRedirectHandler from "./page-wrapper";
import { Providers } from '@/components/Providers';

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  variable: "--font-courier-prime",
  subsets: ["latin"],
});

const shortStack = Short_Stack({
  weight: "400",
  variable: "--font-short-stack",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curso Para Padres Aceptado por la Corte | $60 | Certificado Instantáneo",
  description: "Curso para padres aceptado por la corte en todos los estados. $60, 4 horas, certificado instantáneo. 100% en línea 24/7. Garantía de Aceptación del 100%. De confianza desde 1993.",
  alternates: {
    canonical: "https://cursoparapadres.org",
    languages: {
      "es": "https://cursoparapadres.org",
      "en": "https://puttingkidsfirst.org",
      "x-default": "https://puttingkidsfirst.org",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${courierPrime.variable} ${shortStack.variable} antialiased`}>
        <Providers>
          <AuthRedirectHandler>
            {children}
          </AuthRedirectHandler>
        </Providers>
      </body>
    </html>
  );
}