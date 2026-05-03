import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Lora, Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "Literudo | Admin",
  description: "Blog para Agrupación Estudiantil Literudo",
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
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}