import Image from "next/image";
import Link from "next/link";

import { imagenPrincipal, type ProductoResumen } from "@/lib/catalogo/consultas";
import { presentarPrecio } from "@/lib/precio";

import estilos from "@/app/productos/productos.module.css";

/** Imagen de reserva para los productos que todavía no tienen fotografía. */
export const IMAGEN_DE_RESERVA = {
  ruta: "/img/sin-imagen.webp",
  textoAlternativo: "Fotografía pendiente: este producto aún no tiene imagen publicada",
} as const;

/**
 * Ancho y alto declarados para que nada salte mientras cargan las imágenes
 * (FR-026, SC-004). Las fotografías del catálogo son de proporción 4:3.
 */
const ANCHO = 400;
const ALTO = 300;

type Props = {
  producto: ProductoResumen;
  /** `true` solo en las primeras tarjetas, para no retrasar el contenido principal. */
  prioridad?: boolean;
};

export default function TarjetaProducto({ producto, prioridad = false }: Props) {
  const imagen = imagenPrincipal(producto) ?? IMAGEN_DE_RESERVA;
  const precio = presentarPrecio(producto.precio);

  return (
    <article className={estilos.tarjeta}>
      <Link className={estilos.tarjetaEnlace} href={`/productos/${producto.slug}`}>
        <div className={estilos.tarjetaImagen}>
          <Image
            src={imagen.ruta}
            alt={imagen.textoAlternativo}
            width={ANCHO}
            height={ALTO}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={prioridad}
          />
          {!producto.disponible && <span className={estilos.insignia}>Agotado</span>}
        </div>

        <div className={estilos.tarjetaCuerpo}>
          <p className={estilos.tarjetaCategoria}>{producto.categoria.nombre}</p>
          <h3 className={estilos.tarjetaNombre}>{producto.nombre}</h3>
          <p className={precio.aConsultar ? estilos.precioConsultar : estilos.precio}>
            {precio.texto}
            {precio.leyenda !== null && (
              <span className={estilos.precioLeyenda}>{precio.leyenda}</span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
