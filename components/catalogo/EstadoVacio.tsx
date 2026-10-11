import Link from "next/link";

import estilos from "@/app/productos/productos.module.css";

export type MotivoVacio =
  | "catalogo-en-preparacion"
  | "categoria-sin-productos"
  | "sin-coincidencias";

type Props = {
  motivo: MotivoVacio;
  /** Búsqueda que no dio resultados, para repetírsela al visitante. */
  q?: string | undefined;
};

/** Mensaje para cuando no hay nada que listar. Nunca una pantalla en blanco. */
export default function EstadoVacio({ motivo, q }: Props) {
  const contenido = {
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
    "sin-coincidencias": {
      titulo: "No encontramos coincidencias",
      texto:
        q === undefined
          ? "Ningún producto publicado cumple lo que buscás. Probá con otro término o volvé al catálogo completo."
          : `Ningún producto publicado coincide con «${q}». Probá con otro término o volvé al catálogo completo.`,
    },
  }[motivo];

  return (
    <div className={estilos.vacio}>
      <h2 className={estilos.vacioTitulo}>{contenido.titulo}</h2>
      <p className={estilos.vacioTexto}>{contenido.texto}</p>
      <div className={estilos.vacioAcciones}>
        {motivo !== "catalogo-en-preparacion" && (
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
