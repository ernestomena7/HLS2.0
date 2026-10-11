import type { Metadata } from "next";

import AvisoCategoria from "@/components/catalogo/AvisoCategoria";
import Buscador from "@/components/catalogo/Buscador";
import EstadoVacio, { type MotivoVacio } from "@/components/catalogo/EstadoVacio";
import FiltroCategorias from "@/components/catalogo/FiltroCategorias";
import Paginacion from "@/components/catalogo/Paginacion";
import TarjetaProducto from "@/components/catalogo/TarjetaProducto";
import { listarCategorias, listarProductos } from "@/lib/catalogo/consultas";
import {
  construirDireccion,
  leerParametros,
  type ParametrosCrudos,
} from "@/lib/catalogo/parametros";

import estilos from "./productos.module.css";

/**
 * Catálogo de productos (historias 1 y 3).
 *
 * Componente de servidor: consulta la base directamente y entrega HTML ya
 * renderizado, que es lo que esta entrega necesita para buscadores y para el
 * tiempo de primer contenido.
 *
 * Se regenera cada diez minutos (decisión D-6): el catálogo cambia poco y se
 * lee mucho. Las combinaciones de filtro y búsqueda se resuelven en cada
 * petición, porque son demasiadas para precalcularlas y baratas de resolver.
 */
export const revalidate = 600;

const TITULO = "Catálogo de productos";
const DESCRIPCION =
  "Equipos de ósmosis inversa, filtración industrial, tratamiento de agua potable y " +
  "repuestos de Hidrosal. Precios con IVA incluido y asesoría técnica en El Salvador.";

/** Las dos primeras filas de la rejilla se cargan con prioridad. */
const TARJETAS_PRIORITARIAS = 6;

type Props = {
  searchParams: Promise<ParametrosCrudos>;
};

/**
 * Título y descripción propios de cada vista de categoría (FR-014), para que
 * «/productos?categoria=osmosis-inversa» no compita con el catálogo completo.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const categorias = await listarCategorias();
  const { categoria, q } = leerParametros(
    await searchParams,
    categorias.map((c) => c.slug),
  );

  const elegida = categorias.find((c) => c.slug === categoria);

  // Las vistas filtradas o buscadas no se indexan por su cuenta: su contenido
  // ya está en el catálogo y su dirección canónica apunta allí.
  if (elegida === undefined) {
    return {
      title: TITULO,
      description: DESCRIPCION,
      alternates: { canonical: "/productos" },
      openGraph: { title: `${TITULO} · Hidrosal`, description: DESCRIPCION, url: "/productos" },
      ...(q === undefined ? {} : { robots: { index: false, follow: true } }),
    };
  }

  const descripcion =
    `Equipos y consumibles de ${elegida.nombre.toLocaleLowerCase("es-SV")} de Hidrosal. ` +
    "Precios con IVA incluido y asesoría técnica en El Salvador.";
  const direccion = construirDireccion({ categoria: elegida.slug });

  return {
    title: elegida.nombre,
    description: descripcion,
    alternates: { canonical: direccion },
    openGraph: {
      title: `${elegida.nombre} · Hidrosal`,
      description: descripcion,
      url: direccion,
    },
    ...(q === undefined ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function PaginaCatalogo({ searchParams }: Props) {
  const categorias = await listarCategorias();
  const parametros = leerParametros(
    await searchParams,
    categorias.map((categoria) => categoria.slug),
  );

  const { productos, paginacion } = await listarProductos({
    pagina: parametros.pagina,
    categoria: parametros.categoria,
    qNormalizado: parametros.qNormalizado,
  });

  const hayFiltro = parametros.categoria !== undefined || parametros.q !== undefined;
  const motivoVacio: MotivoVacio =
    parametros.q !== undefined
      ? "sin-coincidencias"
      : parametros.categoria !== undefined
        ? "categoria-sin-productos"
        : "catalogo-en-preparacion";

  const direccionDePagina = (pagina: number): string =>
    construirDireccion({ categoria: parametros.categoria, q: parametros.q, pagina });

  const elegida = categorias.find((categoria) => categoria.slug === parametros.categoria);

  return (
    <section className="section" id="catalogo">
      <div className="wrap">
        <header className={estilos.encabezado}>
          <p className="eyebrow">Catálogo</p>
          <h1 className="h2">
            {elegida === undefined ? "Equipos y consumibles para cada necesidad" : elegida.nombre}
          </h1>
          <p className="lead lead--center">
            Desde el purificador de una casa hasta una planta industrial. Todos los precios
            publicados son finales, con IVA incluido.
          </p>
        </header>

        {parametros.categoriaInexistente && <AvisoCategoria />}

        <div className={estilos.controles}>
          <FiltroCategorias
            categorias={categorias}
            vigente={parametros.categoria}
            q={parametros.q}
          />
          <Buscador q={parametros.q} categoria={parametros.categoria} />
        </div>

        {productos.length === 0 ? (
          <EstadoVacio motivo={motivoVacio} q={parametros.q} />
        ) : (
          <>
            <p className={estilos.resumen} role="status">
              {paginacion.total === 1
                ? "1 producto"
                : `${paginacion.total} productos`}
              {hayFiltro ? " que coinciden con tu búsqueda" : " publicados"}
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
