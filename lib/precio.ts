import type { Prisma } from "@prisma/client";

/**
 * Presentación del precio (decisión D-5, FR-027, FR-028, FR-029).
 *
 * El valor guardado es el precio final que paga el comprador, con el IVA del
 * 13 % ya incluido. La ausencia de precio —y solo la ausencia— significa
 * «Precio a consultar»; un 0 es un dato inválido, no un precio a consultar.
 */

export const LEYENDA_IVA = "IVA incluido";
export const PRECIO_A_CONSULTAR = "Precio a consultar";

/** Lo que el precio de un producto puede ser al leerlo de la base. */
export type PrecioCrudo = Prisma.Decimal | number | string | null | undefined;

const formateador = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Convierte el precio a número sin perder exactitud en el rango que
 * `DECIMAL(10,2)` admite. Devuelve `null` cuando no hay precio publicado y
 * lanza cuando el dato es inválido, porque un precio mal guardado es un error
 * de datos que debe salir a la luz y no mostrarse como «a consultar».
 */
function aNumero(precio: PrecioCrudo): number | null {
  if (precio === null || precio === undefined) {
    return null;
  }

  const valor = typeof precio === "number" ? precio : Number(precio.toString());

  if (!Number.isFinite(valor)) {
    throw new Error(`Precio inválido en los datos: «${String(precio)}» no es un número`);
  }
  if (valor <= 0) {
    throw new Error(
      `Precio inválido en los datos: ${valor}. Un precio publicado debe ser mayor que 0; ` +
        "la ausencia de precio se expresa con un valor nulo (FR-029)",
    );
  }

  return valor;
}

/** `true` cuando el producto no tiene precio público. */
export function esPrecioAConsultar(precio: PrecioCrudo): boolean {
  return precio === null || precio === undefined;
}

/**
 * Texto del precio tal como se muestra al visitante: la cifra en dólares con
 * dos decimales, o «Precio a consultar» si no hay precio publicado.
 */
export function formatearPrecio(precio: PrecioCrudo): string {
  const valor = aNumero(precio);
  return valor === null ? PRECIO_A_CONSULTAR : formateador.format(valor);
}

/** Precio con su leyenda, para la ficha y las tarjetas del catálogo. */
export type PrecioPresentable = {
  texto: string;
  /** La leyenda «IVA incluido», o `null` cuando no hay cifra que matizar. */
  leyenda: string | null;
  aConsultar: boolean;
};

export function presentarPrecio(precio: PrecioCrudo): PrecioPresentable {
  if (esPrecioAConsultar(precio)) {
    return { texto: PRECIO_A_CONSULTAR, leyenda: null, aConsultar: true };
  }
  return { texto: formatearPrecio(precio), leyenda: LEYENDA_IVA, aConsultar: false };
}
