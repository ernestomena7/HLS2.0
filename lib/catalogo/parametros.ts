import { z } from "zod";

import { normalizar } from "@/lib/texto";

/**
 * Lectura y canonicalización de los parámetros de `/productos`.
 *
 * Llegan desde la dirección, es decir, de fuera del sistema, así que se validan
 * antes de tocar la base (constitución, principio I). Ninguna entrada inválida
 * produce un error en pantalla: se corrige y se sigue adelante, según la tabla
 * de `contracts/parametros-catalogo.md`.
 */

export const LARGO_MAXIMO_BUSQUEDA = 80;

/** Lo que entrega Next en `searchParams`. */
export type ParametrosCrudos = Record<string, string | string[] | undefined>;

export type ParametrosCatalogo = {
  /** Término de búsqueda ya recortado, o `undefined` si no se filtra por texto. */
  q: string | undefined;
  /** Término normalizado, listo para comparar contra `nombreNormalizado`. */
  qNormalizado: string | undefined;
  /** Slug de categoría existente, o `undefined`. */
  categoria: string | undefined;
  pagina: number;
  /** `true` cuando se pidió una categoría que no existe: hay que avisarlo. */
  categoriaInexistente: boolean;
};

/** Un parámetro repetido (`?q=a&q=b`) se resuelve tomando el primero. */
function primerValor(valor: string | string[] | undefined): string | undefined {
  if (Array.isArray(valor)) {
    return valor[0];
  }
  return valor;
}

const esquemaBusqueda = z
  .string()
  .transform((valor) => valor.trim().slice(0, LARGO_MAXIMO_BUSQUEDA))
  .pipe(z.string().min(1).max(LARGO_MAXIMO_BUSQUEDA));

const esquemaPagina = z
  .string()
  .transform((valor) => Number.parseInt(valor, 10))
  .pipe(z.number().int().positive());

/**
 * Convierte los parámetros crudos en el estado del catálogo.
 *
 * `categoriasExistentes` llega de fuera para que esta función siga siendo pura
 * y comprobable sin base de datos.
 */
export function leerParametros(
  crudos: ParametrosCrudos,
  categoriasExistentes: readonly string[],
): ParametrosCatalogo {
  const busqueda = esquemaBusqueda.safeParse(primerValor(crudos["q"]) ?? "");
  const q = busqueda.success ? busqueda.data : undefined;

  const categoriaPedida = primerValor(crudos["categoria"])?.trim();
  const categoriaValida =
    categoriaPedida !== undefined &&
    categoriaPedida !== "" &&
    categoriasExistentes.includes(categoriaPedida);

  const pagina = esquemaPagina.safeParse(primerValor(crudos["pagina"]) ?? "1");

  return {
    q,
    qNormalizado: q === undefined ? undefined : normalizar(q),
    categoria: categoriaValida ? categoriaPedida : undefined,
    pagina: pagina.success ? pagina.data : 1,
    categoriaInexistente:
      categoriaPedida !== undefined && categoriaPedida !== "" && !categoriaValida,
  };
}

export type DireccionCatalogo = {
  categoria?: string | undefined;
  q?: string | undefined;
  pagina?: number | undefined;
};

/**
 * Dirección canónica del catálogo.
 *
 * Los parámetros se emiten siempre en el orden `categoria`, `q`, `pagina`, y
 * los que valen lo que vale por defecto se omiten: la página 1 del catálogo
 * completo es `/productos`, no `/productos?pagina=1`.
 */
export function construirDireccion({ categoria, q, pagina }: DireccionCatalogo): string {
  const partes = new URLSearchParams();

  if (categoria !== undefined && categoria !== "") {
    partes.set("categoria", categoria);
  }
  if (q !== undefined && q !== "") {
    partes.set("q", q);
  }
  if (pagina !== undefined && pagina > 1) {
    partes.set("pagina", String(pagina));
  }

  const cadena = partes.toString();
  return cadena === "" ? "/productos" : `/productos?${cadena}`;
}
