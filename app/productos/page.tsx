import type { Metadata } from "next";

import EstadoVacio from "@/components/catalogo/EstadoVacio";
import Paginacion from "@/components/catalogo/Paginacion";
import TarjetaProducto from "@/components/catalogo/TarjetaProducto";
import { listarProductos } from "@/lib/catalogo/consultas";

import estilos from "./productos.module.css";

/**
 * Catálogo de productos (historia 1).
 *
 * Componente de servidor: consulta la base directamente y entrega HTML ya
 * renderizado, que es lo que esta entrega necesita para buscadores y para el
 * tiempo de primer contenido.
 *
 * Se regenera cada diez minutos (decisión D-6): el catálogo cambia poco y se
 * lee mucho.
 */
export const revalidate = 600;

const TITULO = "Catálogo de productos";
const DESCRIPCION =
  "Equipos de ósmosis inversa, filtración industrial, tratamiento de agua potable y " +
  "repuestos de Hidrosal. Precios con IVA incluido y asesoría técnica en El Salvador.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/productos" },
  openGraph: {
    title: `${TITULO} · Hidrosal`,
    description: DESCRIPCION,
    url: "/productos",
  },
};

/** Las dos primeras filas de la rejilla se cargan con prioridad. */
const TARJETAS_PRIORITARIAS = 6;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function PaginaCatalogo({ searchParams }: Props) {
  const parametros = await searchParams;
  const paginaPedida = Number.parseInt(primerValor(parametros["pagina"]) ?? "1", 10);

  const { productos, paginacion } = await listarProductos({ pagina: paginaPedida });

  const direccionDePagina = (pagina: number): string =>
    pagina === 1 ? "/productos" : `/productos?pagina=${pagina}`;

  return (
    <section className="section" id="catalogo">
      <div className="wrap">
        <header className={estilos.encabezado}>
          <p className="eyebrow">Catálogo</p>
          <h1 className="h2">Equipos y consumibles para cada necesidad</h1>
          <p className="lead lead--center">
            Desde el purificador de una casa hasta una planta industrial. Todos los precios
            publicados son finales, con IVA incluido.
          </p>
        </header>

        {productos.length === 0 ? (
          <EstadoVacio motivo="catalogo-en-preparacion" />
        ) : (
          <>
            <p className={estilos.resumen} role="status">
              {paginacion.total === 1
                ? "1 producto publicado"
                : `${paginacion.total} productos publicados`}
              {paginacion.totalPaginas > 1 &&
                ` · página ${paginacion.pagina} de ${paginacion.totalPaginas}`}
            </p>

            <ul className={estilos.rejilla}>
              {productos.map((producto, indice) => (
                <li key={producto.id}>
                  <TarjetaProducto
                    producto={producto}
                    prioridad={paginacion.pagina === 1 && indice < TARJETAS_PRIORITARIAS}
                  />
                </li>
              ))}
            </ul>

            <Paginacion paginacion={paginacion} direccionDePagina={direccionDePagina} />
          </>
        )}
      </div>
    </section>
  );
}
