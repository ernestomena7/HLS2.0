import { EstadoProducto, type Prisma } from "@prisma/client";

import {
  ORDEN_CATALOGO,
  calcularPaginacion,
  type Paginacion,
} from "@/lib/catalogo/paginacion";
import { db } from "@/lib/db";

/**
 * Lecturas del catálogo público.
 *
 * Todas filtran por `estado = PUBLICADO`: un producto en borrador no existe
 * para el visitante (FR-012). Este módulo es el único sitio donde se decide
 * qué se muestra, para que ninguna página pueda olvidarse del filtro.
 */

const SOLO_PUBLICADOS = { estado: EstadoProducto.PUBLICADO } as const;

/** Columnas que necesita una tarjeta del catálogo, y ninguna más. */
const SELECCION_RESUMEN = {
  id: true,
  slug: true,
  nombre: true,
  precio: true,
  disponible: true,
  categoria: { select: { slug: true, nombre: true } },
  // Regla 7 del modelo de datos: manda la marcada como principal y, si
  // ninguna lo está, la de menor orden.
  imagenes: {
    orderBy: [{ esPrincipal: "desc" }, { orden: "asc" }],
    take: 1,
    select: { ruta: true, textoAlternativo: true },
  },
} satisfies Prisma.ProductoSelect;

export type ProductoResumen = Prisma.ProductoGetPayload<{ select: typeof SELECCION_RESUMEN }>;

export type ResultadoCatalogo = {
  productos: ProductoResumen[];
  paginacion: Paginacion;
};

export type FiltrosCatalogo = {
  pagina: number;
};

/**
 * Productos publicados, paginados de doce en doce y ordenados por fecha de
 * creación descendente con el identificador como desempate.
 *
 * Se cuenta antes de leer para poder acotar la página pedida: pedir una página
 * fuera de rango devuelve la última con resultados, no una lista vacía.
 */
export async function listarProductos(filtros: FiltrosCatalogo): Promise<ResultadoCatalogo> {
  const donde: Prisma.ProductoWhereInput = { ...SOLO_PUBLICADOS };

  const total = await db.producto.count({ where: donde });
  const paginacion = calcularPaginacion(total, filtros.pagina);

  if (total === 0) {
    return { productos: [], paginacion };
  }

  const productos = await db.producto.findMany({
    where: donde,
    select: SELECCION_RESUMEN,
    orderBy: [...ORDEN_CATALOGO],
    skip: paginacion.desplazamiento,
    take: paginacion.tamanio,
  });

  return { productos, paginacion };
}

/** Imagen principal de un producto, o `null` si todavía no tiene fotografías. */
export function imagenPrincipal(
  producto: Pick<ProductoResumen, "imagenes">,
): { ruta: string; textoAlternativo: string } | null {
  return producto.imagenes[0] ?? null;
}
