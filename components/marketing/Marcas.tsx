import { retraso } from "@/components/marketing/retraso";

/**
 * Marcas con las que trabaja Hidrosal.
 *
 * Los nombres son marcadores de posición: se sustituyen por los logotipos
 * reales cuando el cliente los entregue, cambiando cada `<span>` por una
 * imagen con su texto alternativo.
 *
 * El listado se emite **dos veces** para que el desplazamiento de la
 * marquesina sea continuo. El sitio estático lo conseguía duplicando el HTML
 * desde JavaScript; aquí se renderiza ya duplicado en el servidor, que evita
 * un salto al cargar y deja la copia fuera del árbol de accesibilidad.
 */
const MARCAS = [
  "Marca 01",
  "Marca 02",
  "Marca 03",
  "Marca 04",
  "Marca 05",
  "Marca 06",
  "Marca 07",
  "Marca 08",
] as const;

export default function Marcas() {
  return (
    <section className="section section--brands" id="marcas">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow reveal">Alianzas</p>
          <h2 className="h2 reveal" style={retraso(60)}>
            Trabajamos con las mejores marcas
          </h2>
          <p className="lead lead--center reveal" style={retraso(120)}>
            Integramos equipos y consumibles de fabricantes reconocidos internacionalmente para
            asegurar desempeño, repuestos y respaldo a largo plazo.
          </p>
        </div>

        <div className="brands reveal">
          <ul className="brands__track">
            {MARCAS.map((marca) => (
              <li className="brands__item" key={marca}>
                <span>{marca}</span>
              </li>
            ))}
            {MARCAS.map((marca) => (
              <li className="brands__item" key={`copia-${marca}`} aria-hidden="true">
                <span>{marca}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
