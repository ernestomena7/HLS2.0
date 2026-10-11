import Link from "next/link";

import type { CategoriaFiltro } from "@/lib/catalogo/consultas";
import { construirDireccion } from "@/lib/catalogo/parametros";

import estilos from "@/app/productos/productos.module.css";

type Props = {
  categorias: CategoriaFiltro[];
  /** Slug de la categoría vigente, o `undefined` si se ve el catálogo completo. */
  vigente: string | undefined;
  /** Búsqueda vigente, que se conserva al cambiar de categoría. */
  q: string | undefined;
};

/**
 * Filtro por categoría. Son enlaces, de modo que funcionan sin JavaScript y se
 * recorren con el tabulador; la categoría vigente se marca con `aria-current`.
 *
 * Cambiar de categoría **reinicia la paginación**: mantener la página 3 al
 * cambiar de filtro deja al visitante mirando una lista vacía sin entender por
 * qué.
 */
export default function FiltroCategorias({ categorias, vigente, q }: Props) {
  return (
    <nav className={estilos.filtros} aria-label="Filtrar por categoría">
      <Link
        className={`${estilos.filtro} ${vigente === undefined ? estilos.filtroVigente : ""}`}
        href={construirDireccion({ q })}
        aria-current={vigente === undefined ? "true" : undefined}
      >
        Todas
      </Link>

      {categorias.map((categoria) => {
        const activa = categoria.slug === vigente;
        return (
          <Link
            key={categoria.slug}
            className={`${estilos.filtro} ${activa ? estilos.filtroVigente : ""}`}
            href={construirDireccion({ categoria: categoria.slug, q })}
            aria-current={activa ? "true" : undefined}
          >
            {categoria.nombre}
            <span className={estilos.filtroCuenta} aria-hidden="true">
              {categoria.publicados}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
