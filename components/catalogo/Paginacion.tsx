import Link from "next/link";

import type { Paginacion as EstadoPaginacion } from "@/lib/catalogo/paginacion";

import estilos from "@/app/productos/productos.module.css";

type Props = {
  paginacion: EstadoPaginacion;
  /** Construye la dirección canónica de una página concreta. */
  direccionDePagina: (pagina: number) => string;
};

/**
 * Navegación entre páginas del catálogo. Son enlaces de verdad, así que
 * funcionan con teclado y sin JavaScript, y la página vigente se anuncia a los
 * lectores de pantalla con `aria-current`.
 */
export default function Paginacion({ paginacion, direccionDePagina }: Props) {
  if (paginacion.totalPaginas <= 1) {
    return null;
  }

  const paginas = Array.from({ length: paginacion.totalPaginas }, (_, indice) => indice + 1);

  return (
    <nav className={estilos.paginacion} aria-label="Páginas del catálogo">
      {paginacion.hayAnterior ? (
        <Link className={estilos.paginaSalto} href={direccionDePagina(paginacion.pagina - 1)}>
          <span aria-hidden="true">&larr;</span> Anterior
        </Link>
      ) : (
        <span className={`${estilos.paginaSalto} ${estilos.paginaInactiva}`} aria-hidden="true">
          &larr; Anterior
        </span>
      )}

      <ol className={estilos.paginaLista}>
        {paginas.map((numero) => {
          const vigente = numero === paginacion.pagina;
          return (
            <li key={numero}>
              <Link
                className={`${estilos.pagina} ${vigente ? estilos.paginaVigente : ""}`}
                href={direccionDePagina(numero)}
                aria-current={vigente ? "page" : undefined}
                aria-label={vigente ? `Página ${numero}, página actual` : `Ir a la página ${numero}`}
              >
                {numero}
              </Link>
            </li>
          );
        })}
      </ol>

      {paginacion.haySiguiente ? (
        <Link className={estilos.paginaSalto} href={direccionDePagina(paginacion.pagina + 1)}>
          Siguiente <span aria-hidden="true">&rarr;</span>
        </Link>
      ) : (
        <span className={`${estilos.paginaSalto} ${estilos.paginaInactiva}`} aria-hidden="true">
          Siguiente &rarr;
        </span>
      )}
    </nav>
  );
}
