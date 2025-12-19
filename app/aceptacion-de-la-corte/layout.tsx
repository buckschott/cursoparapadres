import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curso Aceptado por Cortes en Todo el País | Todos los Estados",
  description: "Nuestro curso para padres es aceptado por cortes de distrito, superiores, de circuito y de familia en los 50 estados. Garantía de Aceptación del 100%.",
  alternates: {
    canonical: "https://cursoparapadres.org/aceptacion-de-la-corte",
  },
};

export default function AceptacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
