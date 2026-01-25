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
  title: "Clases para Padres | El Certificado Más Aceptado",
  description: "El Original. El Nombre Más Reconocido. Un precio. Aceptado en todo el país. Sin sorpresas.",
  alternates: {
    canonical: "https://www.claseparapadres.com",
    languages: {
      "es": "https://www.claseparapadres.com",
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