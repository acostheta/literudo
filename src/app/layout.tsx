import type { Metadata } from "next";
import Providers from "@/components/Providers";
import { Lora, Inter, Cinzel, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Literudo | Blog de la Agrupación Estudiantil",
  description: "Blog de la Agrupación Estudiantil Literudo. Artículos, poesía, narrativa y galería de imágenes y videos.",
  icons: {
    icon: "/Logo_UDO.svg",
    apple: "/Logo_UDO.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable} ${cinzel.variable} ${playfair.variable}`}>
      <body className={lora.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}