import { EstadoProducto, type Prisma } from "@prisma/client";

import {
  ORDEN_CATALOGO,
  calcularPaginacion,
  type Paginacion,
} from "@/lib/catalogo/paginacion";
import { leerEspecificaciones, type Especificacion } from "@/lib/catalogo/especificaciones";
import { decidirResolucion, type Resolucion } from "@/lib/catalogo/resolucion";
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

/** Columnas que necesita la ficha completa de un producto. */
const SELECCION_FICHA = {
  id: true,
  sku: true,
  slug: true,
  nombre: true,
  descripcion: true,
  especificaciones: true,
  precio: true,
  disponible: true,
  actualizadoEn: true,
  categoria: { select: { slug: true, nombre: true } },
  imagenes: {
    orderBy: [{ esPrincipal: "desc" }, { orden: "asc" }],
    select: { id: true, ruta: true, textoAlternativo: true },
  },
} satisfies Prisma.ProductoSelect;

type ProductoFichaCrudo = Prisma.ProductoGetPayload<{ select: typeof SELECCION_FICHA }>;

/** Ficha lista para pintar: las especificaciones ya vienen validadas. */
export type ProductoFicha = Omit<ProductoFichaCrudo, "especificaciones"> & {
  especificaciones: Especificacion[];
};

/**
 * Resuelve una dirección de ficha según el contrato de rutas públicas: ficha,
 * redirección permanente o no encontrado.
 *
 * El historial solo se consulta si el identificador no corresponde a ningún
 * producto publicado, que es el camino raro; el caso normal cuesta una sola
 * consulta.
 */
export async function obtenerProductoPublicado(slug: string): Promise<Resolucion<ProductoFicha>> {
  const crudo = await db.producto.findFirst({
    where: { slug, ...SOLO_PUBLICADOS },
    select: SELECCION_FICHA,
  });

  if (crudo !== null) {
    return decidirResolucion<ProductoFicha>(
      { ...crudo, especificaciones: leerEspecificaciones(crudo.especificaciones) },
      null,
    );
  }

  return decidirResolucion<ProductoFicha>(null, await resolverSlugHistorico(slug));
}

/**
 * Identificador vigente de un producto publicado a partir de uno histórico, o
 * `null` si esa dirección antigua no lleva a ningún sitio visible. Un histórico
 * que apunta a un borrador se comporta como inexistente.
 */
export async function resolverSlugHistorico(slug: string): Promise<string | null> {
  const historico = await db.historialSlugProducto.findUnique({
    where: { slug },
    select: { producto: { select: { slug: true, estado: true } } },
  });

  if (historico === null || historico.producto.estado !== EstadoProducto.PUBLICADO) {
    return null;
  }

  return historico.producto.slug;
}

/** Cuántos productos relacionados se muestran al final de una ficha (FR-010). */
export const MAXIMO_RELACIONADOS = 4;

/**
 * Otros productos publicados de la misma categoría, excluyendo el que se está
 * consultando, los más recientes primero y como mucho cuatro.
 */
export async function obtenerRelacionados(
  categoriaSlug: string,
  productoIdExcluido: number,
): Promise<ProductoResumen[]> {
  return db.producto.findMany({
    where: {
      ...SOLO_PUBLICADOS,
      categoria: { slug: categoriaSlug },
      id: { not: productoIdExcluido },
    },
    select: SELECCION_RESUMEN,
    orderBy: [...ORDEN_CATALOGO],
    take: MAXIMO_RELACIONADOS,
  });
}
