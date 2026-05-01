import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Literudo",
  description: "Blog para Agrupación Estudiantil Literudo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}