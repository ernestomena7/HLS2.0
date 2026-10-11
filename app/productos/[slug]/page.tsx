import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import GaleriaProducto from "@/components/catalogo/GaleriaProducto";
import LlamadaAsesoria from "@/components/catalogo/LlamadaAsesoria";
import ProductosRelacionados from "@/components/catalogo/ProductosRelacionados";
import TablaEspecificaciones from "@/components/catalogo/TablaEspecificaciones";
import {
  obtenerProductoPublicado,
  obtenerRelacionados,
  type ProductoFicha,
} from "@/lib/catalogo/consultas";
import { presentarPrecio } from "@/lib/precio";

import estilos from "../productos.module.css";

/**
 * Ficha de producto (historia 2).
 *
 * Aplica el contrato de `contracts/rutas-publicas.md`: 200 para un producto
 * publicado, 301 desde un identificador histórico y 404 tanto para los
 * inexistentes como para los borradores, sin que se distingan entre sí.
 */
export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
};

/** Resuelve la dirección o corta la petición con la respuesta que corresponda. */
async function resolverFicha(slug: string): Promise<ProductoFicha> {
  const resolucion = await obtenerProductoPublicado(slug);

  if (resolucion.tipo === "redireccion") {
    permanentRedirect(`/productos/${resolucion.slug}`);
  }
  if (resolucion.tipo === "no-encontrado") {
    notFound();
  }

  return resolucion.producto;
}

/** Descripción recortada en un límite de palabra, para buscadores y vistas previas. */
function resumir(texto: string, maximo = 160): string {
  if (texto.length <= maximo) {
    return texto;
  }
  const recortado = texto.slice(0, maximo);
  const corte = recortado.lastIndexOf(" ");
  return `${(corte > 60 ? recortado.slice(0, corte) : recortado).trimEnd()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolucion = await obtenerProductoPublicado(slug);

  if (resolucion.tipo !== "ficha") {
    return { title: "Producto no encontrado", robots: { index: false, follow: true } };
  }

  const producto = resolucion.producto;
  const descripcion = resumir(producto.descripcion);
  const imagen = producto.imagenes[0];

  return {
    title: producto.nombre,
    description: descripcion,
    alternates: { canonical: `/productos/${producto.slug}` },
    openGraph: {
      type: "website",
      title: `${producto.nombre} · Hidrosal`,
      description: descripcion,
      url: `/productos/${producto.slug}`,
      ...(imagen === undefined
        ? {}
        : { images: [{ url: imagen.ruta, alt: imagen.textoAlternativo }] }),
    },
  };
}

export default async function PaginaFicha({ params }: Props) {
  const { slug } = await params;
  const producto = await resolverFicha(slug);
  const relacionados = await obtenerRelacionados(producto.categoria.slug, producto.id);
  const precio = presentarPrecio(producto.precio);

  return (
    <section className="section" id="ficha-producto">
      <div className="wrap">
        <nav className={estilos.miga} aria-label="Ruta de navegación">
          <Link href="/productos">Catálogo</Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/productos?categoria=${producto.categoria.slug}`}>
            {producto.categoria.nombre}
          </Link>
        </nav>

        <div className={estilos.ficha}>
          <GaleriaProducto nombre={producto.nombre} imagenes={producto.imagenes} />

          <div className={estilos.fichaDatos}>
            <p className="eyebrow">{producto.categoria.nombre}</p>
            <h1 className={estilos.fichaNombre}>{producto.nombre}</h1>

            <p className={estilos.fichaDisponibilidad}>
              {producto.disponible ? (
                <span className={estilos.disponible}>Disponible</span>
              ) : (
                <span className={estilos.agotado}>Agotado · consultá el tiempo de entrega</span>
              )}
            </p>

            <p className={precio.aConsultar ? estilos.fichaPrecioConsultar : estilos.fichaPrecio}>
              {precio.texto}
              {precio.leyenda !== null && (
                <span className={estilos.precioLeyenda}>{precio.leyenda}</span>
              )}
            </p>

            <p className={estilos.fichaDescripcion}>{producto.descripcion}</p>

            <LlamadaAsesoria
              nombre={producto.nombre}
              sku={producto.sku}
              disponible={producto.disponible}
              aConsultar={precio.aConsultar}
            />
          </div>
        </div>

        <TablaEspecificaciones especificaciones={producto.especificaciones} />

        <ProductosRelacionados
          productos={relacionados}
          categoria={producto.categoria.nombre.toLocaleLowerCase("es-SV")}
        />
      </div>
    </section>
  );
}
