import type { CSSProperties } from "react";

/**
 * Retraso escalonado de la animación de entrada.
 *
 * El CSS aprobado lee la propiedad personalizada `--d`; esta función solo
 * traduce el número a la forma que espera, para no repetir el aserto de tipo
 * en cada sección.
 */
export function retraso(milisegundos: number): CSSProperties {
  return { "--d": `${milisegundos}ms` } as CSSProperties;
}
