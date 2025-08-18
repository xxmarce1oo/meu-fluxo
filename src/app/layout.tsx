// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/Sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meu Fluxo",
  description: "Controle seu tempo, domine seu fluxo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          
          {/* Deixamos apenas UM Toaster para as notificações padrão */}
          <Toaster position="bottom-right" />

        </Providers>
      </body>
    </html>
  );
}