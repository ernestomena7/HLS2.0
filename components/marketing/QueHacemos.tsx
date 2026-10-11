import { retraso } from "@/components/marketing/retraso";

/**
 * Sección «¿Qué hacemos?» con los tres ámbitos: comercial, industrial e
 * institucional.
 */
export default function QueHacemos() {
  return (
    <section className="section" id="que-hacemos">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow reveal">¿Qué hacemos?</p>
          <h2 className="h2 reveal" style={retraso(60)}>De la captación al punto de uso</h2>
          <p className="lead lead--center reveal" style={retraso(120)}>
            Diseñamos e implementamos sistemas completos de tratamiento de agua, desde la captación
            hasta el punto de uso, cumpliendo estándares técnicos y normativos.
          </p>
        </div>
        <div className="pillars">
          <article className="pillar reveal">
            <span className="pillar__num">01</span>
            <h3>Comercial</h3>
            <p>Purificadores y plantas compactas para oficinas, restaurantes, hoteles y comercios que necesitan agua confiable todos los días.</p>
          </article>
          <article className="pillar reveal" style={retraso(80)}>
            <span className="pillar__num">02</span>
            <h3>Industrial</h3>
            <p>Sistemas de alto caudal para procesos productivos, calderas, torres de enfriamiento y líneas de embotellado.</p>
          </article>
          <article className="pillar reveal" style={retraso(160)}>
            <span className="pillar__num">03</span>
            <h3>Institucional</h3>
            <p>Plantas para hospitales, centros educativos, instituciones públicas y comunidades, con operación segura y trazable.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
