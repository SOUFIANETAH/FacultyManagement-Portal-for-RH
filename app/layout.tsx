import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./modules/homepage.css"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Faculté Des Sciences - Système de Gestion",
  description: "Système de gestion pour les étudiants, professeurs et administration de la Faculté Des Sciences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
