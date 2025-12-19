import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garantía de Aceptación del 100% | Reembolso Completo | Curso Para Padres",
  description: "Si su corte no acepta su certificado, recibe un reembolso completo. Sin preguntas. Respaldado por más de 30 años de aceptación en cortes de todo el país.",
  alternates: {
    canonical: "https://cursoparapadres.org/garantia",
  },
};

export default function GarantiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
