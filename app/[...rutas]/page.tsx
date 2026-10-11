import { notFound } from "next/navigation";

/**
 * Captura cualquier dirección que no corresponda a una ruta real y responde
 * «no encontrado» (contrato de rutas públicas).
 *
 * Existe por la misma razón que `dynamic` en la portada: sin ella, Next
 * serviría la página de error horneada en la compilación, con un `nonce`
 * caducado, y quedaría sin hidratar (sin menú en móvil, por ejemplo).
 */
export const dynamic = "force-dynamic";

export default function RutaInexistente(): never {
  notFound();
}
