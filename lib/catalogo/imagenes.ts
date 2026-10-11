/**
 * Imagen de reserva para los productos que todavía no tienen fotografía
 * (FR-019: ninguna imagen sin texto alternativo).
 *
 * Vive en su propio módulo, sin dependencias de servidor, para que los
 * componentes de cliente puedan usarla sin arrastrar el cliente de base de
 * datos al paquete del navegador.
 */
export const IMAGEN_DE_RESERVA = {
  ruta: "/img/sin-imagen.webp",
  textoAlternativo: "Fotografía pendiente: este producto aún no tiene imagen publicada",
} as const;
