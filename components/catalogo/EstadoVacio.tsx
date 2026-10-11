import Link from "next/link";

import estilos from "@/app/productos/productos.module.css";

export type MotivoVacio = "catalogo-en-preparacion" | "categoria-sin-productos";

const MENSAJES: Record<MotivoVacio, { titulo: string; texto: string }> = {
  "catalogo-en-preparacion": {
    titulo: "El catálogo está en preparación",
    texto:
      "Estamos cargando nuestros equipos y consumibles. Mientras tanto, contanos qué necesitás y te asesoramos sin compromiso.",
  },
  "categoria-sin-productos": {
    titulo: "Todavía no hay productos en esta categoría",
    texto:
      "Esta línea está en preparación. Podés ver el catálogo completo o escribirnos para consultar disponibilidad.",
  },
};

type Props = {
  motivo: MotivoVacio;
};

/** Mensaje para cuando no hay nada que listar. Nunca una pantalla en blanco. */
export default function EstadoVacio({ motivo }: Props) {
  const mensaje = MENSAJES[motivo];

  return (
    <div className={estilos.vacio}>
      <h2 className={estilos.vacioTitulo}>{mensaje.titulo}</h2>
      <p className={estilos.vacioTexto}>{mensaje.texto}</p>
      <div className={estilos.vacioAcciones}>
        {motivo === "categoria-sin-productos" && (
          <Link className="btn btn--primary" href="/productos">
            Ver el catálogo completo
          </Link>
        )}
        <Link className="btn btn--ghost" href="/#contacto">
          Solicitar asesoría
        </Link>
      </div>
    </div>
  );
}
