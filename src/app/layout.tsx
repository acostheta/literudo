import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Literudo Blog - Explora el Mundo a través de la Literatura",
  description: "Un proyecto web moderno dedicado a la literatura, reflexiones y arte de escribir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${lora.variable}`} suppressHydrationWarning>
        <Sidebar />
        <div style={{
          marginLeft: '280px',
          minHeight: '100vh',
          background: 'var(--background)'
        }} className="main-wrapper">
          <Navbar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <style jsx>{`
          @media (max-width: 900px) {
            .main-wrapper {
              margin-left: 0 !important;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
