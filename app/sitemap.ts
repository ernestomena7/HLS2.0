import type { MetadataRoute } from "next";

import { listarCategorias, listarProductosParaMapa } from "@/lib/catalogo/consultas";
import { construirDireccion } from "@/lib/catalogo/parametros";
import { entornoPublico } from "@/lib/env";

/**
 * Mapa del sitio (FR-016).
 *
 * Incluye la portada, el catálogo, las categorías que tienen algo que mostrar
 * y todas las fichas publicadas. **No** incluye ningún producto en borrador:
 * el filtro vive en `lib/catalogo/consultas.ts` y es el mismo que usa el
 * catálogo, así que no puede desincronizarse.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = entornoPublico().NEXT_PUBLIC_SITE_URL;
  const [categorias, productos] = await Promise.all([
    listarCategorias(),
    listarProductosParaMapa(),
  ]);

  const masReciente = productos[0]?.actualizadoEn ?? new Date();

  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    {
      url: `${base}/productos`,
      lastModified: masReciente,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Solo las categorías que de verdad tienen algo publicado: enviar a un
    // buscador a una lista vacía no ayuda a nadie.
    ...categorias
      .filter((categoria) => categoria.publicados > 0)
      .map((categoria) => ({
        url: `${base}${construirDireccion({ categoria: categoria.slug })}`,
        lastModified: masReciente,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...productos.map((producto) => ({
      url: `${base}/productos/${producto.slug}`,
      lastModified: producto.actualizadoEn,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
