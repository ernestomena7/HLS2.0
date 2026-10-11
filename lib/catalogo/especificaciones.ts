import { z } from "zod";

/**
 * Especificaciones técnicas de un producto.
 *
 * Viajan como JSON en la base, así que al leerlas vuelven como dato sin forma:
 * se validan antes de pintarlas (constitución, principio II). Si el dato está
 * corrupto se devuelve una lista vacía y la ficha sigue siendo útil, en vez de
 * romper la página entera por una tabla.
 */

export const esquemaEspecificacion = z.object({
  nombre: z.string().min(1).max(60),
  valor: z.string().min(1).max(120),
});

export const esquemaEspecificaciones = z.array(esquemaEspecificacion);

export type Especificacion = z.infer<typeof esquemaEspecificacion>;

export function leerEspecificaciones(crudo: unknown): Especificacion[] {
  const resultado = esquemaEspecificaciones.safeParse(crudo);
  return resultado.success ? resultado.data : [];
}
