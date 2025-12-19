import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio | Curso Para Padres",
  description: "Términos y condiciones de uso del Curso Para Padres. Información sobre reembolsos, acceso al curso y certificados.",
  alternates: {
    canonical: "https://cursoparapadres.org/terminos-de-servicio",
  },
};

export default function TerminosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
