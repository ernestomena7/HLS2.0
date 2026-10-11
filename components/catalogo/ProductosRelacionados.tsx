import TarjetaProducto from "@/components/catalogo/TarjetaProducto";
import type { ProductoResumen } from "@/lib/catalogo/consultas";

import estilos from "@/app/productos/productos.module.css";

type Props = {
  productos: ProductoResumen[];
  categoria: string;
};

/** Hasta cuatro productos de la misma categoría al final de la ficha (FR-010). */
export default function ProductosRelacionados({ productos, categoria }: Props) {
  if (productos.length === 0) {
    return null;
  }

  return (
    <section className={estilos.relacionados} aria-labelledby="relacionados-titulo">
      <h2 className={estilos.relacionadosTitulo} id="relacionados-titulo">
        Más de {categoria}
      </h2>
      <ul className={estilos.rejilla}>
        {productos.map((producto) => (
          <li key={producto.id}>
            <TarjetaProducto producto={producto} />
          </li>
        ))}
      </ul>
    </section>
  );
}
