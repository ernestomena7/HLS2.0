import type { MetadataRoute } from "next";

import { entornoPublico } from "@/lib/env";

/**
 * Permite el rastreo del sitio público y apunta al mapa del sitio.
 *
 * Las vistas con búsqueda se desaconsejan: su contenido ya está en el catálogo
 * y sus combinaciones son infinitas.
 */
export default function robots(): MetadataRoute.Robots {
  const base = entornoPublico().NEXT_PUBLIC_SITE_URL;

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/productos?*q=", "/_next/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
