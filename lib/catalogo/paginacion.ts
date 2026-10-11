/**
 * Reglas de paginación del catálogo.
 *
 * El orden y el tamaño de página viven aquí y no esparcidos por las consultas,
 * porque son contrato: el contrato de parámetros fija 12 por página, y el
 * modelo de datos fija el orden por fecha de creación descendente con el
 * identificador como desempate.
 */

export const TAMANIO_PAGINA = 12;

/**
 * Orden del catálogo tal como lo pide la base. El desempate por identificador
 * no es cosmético: sin él, dos productos creados en el mismo instante pueden
 * salir en distinto orden en cada consulta y aparecer en dos páginas a la vez,
 * o en ninguna.
 */
export const ORDEN_CATALOGO = [{ creadoEn: "desc" }, { id: "desc" }] as const;

export type Paginacion = {
  /** Página efectiva, ya acotada al rango disponible. */
  pagina: number;
  totalPaginas: number;
  total: number;
  /** Cuántos resultados saltarse para llegar a esta página. */
  desplazamiento: number;
  tamanio: number;
  hayAnterior: boolean;
  haySiguiente: boolean;
};

/**
 * Acota la página pedida al rango que de verdad existe.
 *
 * Una página mayor que el total devuelve la **última con resultados**, nunca
 * una lista vacía (contrato de parámetros, caso límite de página fuera de
 * rango). Un catálogo vacío tiene una sola página, también vacía.
 */
export function calcularPaginacion(total: number, paginaPedida: number): Paginacion {
  const totalSeguro = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const totalPaginas = Math.max(1, Math.ceil(totalSeguro / TAMANIO_PAGINA));

  const pedida = Number.isFinite(paginaPedida) ? Math.floor(paginaPedida) : 1;
  const pagina = Math.min(Math.max(pedida, 1), totalPaginas);

  return {
    pagina,
    totalPaginas,
    total: totalSeguro,
    desplazamiento: (pagina - 1) * TAMANIO_PAGINA,
    tamanio: TAMANIO_PAGINA,
    hayAnterior: pagina > 1,
    haySiguiente: pagina < totalPaginas,
  };
}

/** Lo mínimo que hace falta para ordenar un producto como lo hace el catálogo. */
export type Ordenable = { id: number; creadoEn: Date };

/**
 * Misma regla de orden que `ORDEN_CATALOGO`, expresada como comparador. Es la
 * versión ejecutable de la regla: permite comprobar en pruebas, sin base de
 * datos, que el desempate hace el trabajo que se espera de él.
 */
export function compararCatalogo(a: Ordenable, b: Ordenable): number {
  const diferencia = b.creadoEn.getTime() - a.creadoEn.getTime();
  return diferencia !== 0 ? diferencia : b.id - a.id;
}
