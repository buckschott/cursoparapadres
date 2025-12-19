import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Curso Para Padres Aceptado por la Corte",
  description: "Respuestas a las preguntas más comunes sobre el curso para padres: precio, duración, certificado, aceptación por la corte, y más.",
  alternates: {
    canonical: "https://cursoparapadres.org/preguntas-frecuentes",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
