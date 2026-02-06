import type { Metadata, Viewport } from "next";
import { Courier_Prime, Short_Stack } from "next/font/google";
import "./globals.css";
import AuthRedirectHandler from "./page-wrapper";
import { Providers } from '@/components/Providers';
import Script from 'next/script';

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

export const viewport: Viewport = {
  themeColor: '#1C1C1C',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Clases para Padres | El Certificado Más Aceptado",
  description: "El Original. El Nombre Más Reconocido. Un precio. Aceptado en todo el país. Sin sorpresas.",
  alternates: {
    canonical: "https://claseparapadres.com",
    languages: {
      "es": "https://claseparapadres.com",
      "en": "https://puttingkidsfirst.org",
      "x-default": "https://puttingkidsfirst.org",
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-167x167.png', sizes: '167x167', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Clase Padres',
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
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            }
          `}
        </Script>
      </body>
    </html>
  );
}
