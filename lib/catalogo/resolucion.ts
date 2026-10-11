/**
 * Qué hacer cuando llega una dirección de ficha de producto.
 *
 * La decisión se expresa aparte de la consulta para poder comprobarla sin base
 * de datos. Implementa el contrato de `contracts/rutas-publicas.md`:
 *
 * - el identificador de un producto publicado responde con la ficha (200);
 * - un identificador histórico redirige al vigente (301);
 * - cualquier otro caso —inexistente o en borrador— no se encuentra (404),
 *   y ambos son indistinguibles desde fuera (FR-012).
 */

export type Resolucion<T> =
  | { tipo: "ficha"; producto: T }
  | { tipo: "redireccion"; slug: string }
  | { tipo: "no-encontrado" };

export function decidirResolucion<T>(
  productoVigente: T | null,
  slugVigenteDelHistorico: string | null,
): Resolucion<T> {
  if (productoVigente !== null) {
    return { tipo: "ficha", producto: productoVigente };
  }
  if (slugVigenteDelHistorico !== null) {
    return { tipo: "redireccion", slug: slugVigenteDelHistorico };
  }
  return { tipo: "no-encontrado" };
}
