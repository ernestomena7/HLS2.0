import type { Especificacion } from "@/lib/catalogo/especificaciones";

import estilos from "@/app/productos/productos.module.css";

type Props = {
  especificaciones: Especificacion[];
};

/**
 * Tabla de especificaciones técnicas. Conserva el orden en que se guardaron,
 * que es el que da sentido a la ficha, y usa marcado semántico de tabla para
 * que un lector de pantalla relacione cada valor con su característica.
 */
export default function TablaEspecificaciones({ especificaciones }: Props) {
  if (especificaciones.length === 0) {
    return (
      <p className={estilos.sinEspecificaciones}>
        Las especificaciones técnicas de este producto están en preparación. Escribinos y te las
        enviamos.
      </p>
    );
  }

  return (
    <table className={estilos.especificaciones}>
      <caption className={estilos.especificacionesTitulo}>Especificaciones técnicas</caption>
      <tbody>
        {especificaciones.map((especificacion) => (
          <tr key={especificacion.nombre}>
            <th scope="row">{especificacion.nombre}</th>
            <td>{especificacion.valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
