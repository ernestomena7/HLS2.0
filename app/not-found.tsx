import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La dirección que buscás no existe en el sitio de Hidrosal.",
  robots: { index: false, follow: true },
};

/**
 * Página «no encontrado» (contrato de rutas públicas: 404). Mantiene el diseño
 * del sitio, el texto en español y enlaces al catálogo y a la portada.
 */
export default function NoEncontrado() {
  return (
    <section className="section" id="no-encontrado">
      <div className="wrap section__head">
        <p className="eyebrow">Error 404</p>
        <h1 className="h2">No encontramos esta página</h1>
        <p className="lead lead--center">
          La dirección que abriste no existe o el producto que buscabas ya no está publicado.
          Podés volver a la portada o ver el catálogo completo.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="/productos">
            Ver el catálogo
          </a>
          <a className="btn btn--ghost" href="/">
            Ir a la portada
          </a>
        </div>
      </div>
    </section>
  );
}
