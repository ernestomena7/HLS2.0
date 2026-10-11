import estilos from "@/app/productos/productos.module.css";

import { LARGO_MAXIMO_BUSQUEDA } from "@/lib/catalogo/parametros";

type Props = {
  /** Texto vigente, para que el campo conserve lo que el visitante escribió. */
  q: string | undefined;
  /** Categoría vigente, que se conserva al buscar. */
  categoria: string | undefined;
};

/**
 * Buscador por nombre de producto.
 *
 * Es un formulario GET de verdad: funciona sin JavaScript, el estado viaja en
 * la dirección y recargar o compartir reproduce los mismos resultados (FR-006).
 * No lleva campo `pagina`, de modo que buscar reinicia la paginación.
 */
export default function Buscador({ q, categoria }: Props) {
  return (
    <form className={estilos.buscador} action="/productos" method="get" role="search">
      {categoria !== undefined && <input type="hidden" name="categoria" value={categoria} />}

      <label className={estilos.buscadorEtiqueta} htmlFor="q">
        Buscar un producto
      </label>

      <div className={estilos.buscadorCampo}>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q ?? ""}
          maxLength={LARGO_MAXIMO_BUSQUEDA}
          placeholder="Por ejemplo: ósmosis, membrana, cartucho"
          autoComplete="off"
        />
        <button className="btn btn--primary" type="submit">
          Buscar
        </button>
      </div>
    </form>
  );
}
