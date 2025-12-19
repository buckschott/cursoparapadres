import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Curso Para Padres",
  description: "Política de privacidad de Curso Para Padres. Cómo protegemos su información personal y datos del curso.",
  alternates: {
    canonical: "https://cursoparapadres.org/politica-de-privacidad",
  },
};

export default function PrivacidadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
