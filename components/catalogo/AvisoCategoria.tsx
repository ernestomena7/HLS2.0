import estilos from "@/app/productos/productos.module.css";

/**
 * Aviso de que la categoría pedida en la dirección no existe. No es un error:
 * se muestra el catálogo completo y se explica por qué (contrato de
 * parámetros).
 */
export default function AvisoCategoria() {
  return (
    <p className={estilos.aviso} role="status">
      La categoría que pediste no existe. Te mostramos el catálogo completo.
    </p>
  );
}
