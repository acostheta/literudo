import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Literudo",
  description: "Blog para Agrupación Estudiantil Literudo",
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}