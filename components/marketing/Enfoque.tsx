import { retraso } from "@/components/marketing/retraso";

/**
 * Sección «Nuestro enfoque» con los tres pilares.
 */
export default function Enfoque() {
  return (
    <section className="section section--focus" id="enfoque">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow reveal">Nuestro enfoque</p>
          <h2 className="h2 reveal" style={retraso(60)}>Excelencia en el tratamiento de agua</h2>
          <p className="lead lead--center reveal" style={retraso(120)}>
            En Hidrosal creemos que la excelencia se logra al integrar tres elementos fundamentales:
            ingeniería aplicada, equipos de calidad internacional y acompañamiento técnico continuo.
            Esta combinación asegura que cada sistema funcione de manera óptima desde su instalación.
          </p>
        </div>
        <div className="focus">
          <article className="focus__item reveal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3.2 17.6 9 11.8l3.2 3.2 8.4-8.4"/><path d="M15.6 6.6h5v5"/><path d="M3.2 20.8h17.6"/>
            </svg>
            <h3>Ingeniería aplicada</h3>
            <p>Diseñamos soluciones técnicas adaptadas a cada necesidad.</p>
          </article>
          <article className="focus__item reveal" style={retraso(80)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2.9 20 6v6.2c0 4.4-3.3 7.7-8 8.9-4.7-1.2-8-4.5-8-8.9V6Z"/><path d="m8.6 12.2 2.4 2.4 4.4-4.8"/>
            </svg>
            <h3>Equipos de calidad internacional</h3>
            <p>Utilizamos componentes reconocidos por su desempeño y durabilidad.</p>
          </article>
          <article className="focus__item reveal" style={retraso(160)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.4 13.2a8.4 8.4 0 1 0-3.1 4.6l3.4 1-1-3.4"/><path d="M9.4 9.6a2.6 2.6 0 0 1 5 .8c0 1.8-2.4 2.2-2.4 3.8"/><path d="M12 17.2h.01"/>
            </svg>
            <h3>Acompañamiento técnico</h3>
            <p>Brindamos soporte continuo para garantizar operación confiable.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
