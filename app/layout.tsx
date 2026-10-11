import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";

import Navegacion from "@/components/marketing/Navegacion";
import PieDePagina from "@/components/marketing/PieDePagina";
import { entornoPublico } from "@/lib/env";

import "./globals.css";

/**
 * Tipografías servidas por la propia aplicación (decisión D-8): mismas familias
 * y mismos pesos que el sitio aprobado, sin petición a un tercero en la ruta
 * crítica.
 */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--fuente-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--fuente-inter",
  display: "swap",
});

const DESCRIPCION =
  "Hidrosal (HLS) diseña, instala y mantiene sistemas de purificación de agua por ósmosis " +
  "inversa para residencias, comercios e industrias en El Salvador.";

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(entornoPublico().NEXT_PUBLIC_SITE_URL),
    title: {
      default: "Hidrosal · Purificación de agua por ósmosis inversa en El Salvador",
      template: "%s · Hidrosal",
    },
    description: DESCRIPCION,
    applicationName: "Hidrosal",
    openGraph: {
      type: "website",
      locale: "es_SV",
      siteName: "Hidrosal",
      title: "Hidrosal · Purificación de agua por ósmosis inversa",
      description: DESCRIPCION,
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-SV" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <Navegacion />
        <main id="contenido">{children}</main>
        <PieDePagina />
      </body>
    </html>
  );
}
