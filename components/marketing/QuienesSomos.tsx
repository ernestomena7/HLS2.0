import { retraso } from "@/components/marketing/retraso";

/**
 * Sección «Quiénes somos», migrada sin cambios de contenido ni de diseño.
 */
export default function QuienesSomos() {
  return (
    <section className="section section--about" id="quienes-somos">
      <div className="wrap about">
        <div className="about__copy">
          <p className="eyebrow reveal">Quiénes somos</p>
          <h2 className="h2 reveal" style={retraso(60)}>Más de 15 años tratando el agua de El Salvador</h2>
          <p className="lead reveal" style={retraso(120)}>
            Somos una empresa salvadoreña especializada en soluciones integrales para el tratamiento y
            purificación de agua. Desde hace más de 15 años diseñamos, suministramos e instalamos
            sistemas de alta eficiencia.
          </p>
          <ul className="stats reveal" style={retraso(180)}>
            <li><strong>+15</strong><span>años de experiencia</span></li>
            <li><strong>100%</strong><span>salvadoreña</span></li>
            <li><strong>360&deg;</strong><span>de la captación al punto de uso</span></li>
          </ul>
        </div>
        <div className="about__panel reveal" style={retraso(140)} aria-hidden="true">
          <div className="panel">
            <div className="panel__ring"></div>
            <div className="panel__ring panel__ring--2"></div>
            <svg className="panel__drop" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#19b8a6"/><stop offset="1" stopColor="#1266b8"/>
                </linearGradient>
              </defs>
              <path d="M60 12c22 26 33 40 33 53a33 33 0 0 1-66 0c0-13 11-27 33-53Z" fill="none" stroke="url(#panelGrad)" strokeWidth="1.6"/>
              <path d="M60 30c15 18 23 28 23 37a23 23 0 0 1-46 0c0-9 8-19 23-37Z" fill="none" stroke="url(#panelGrad)" strokeWidth="1" opacity=".55"/>
              <circle cx="60" cy="70" r="7" fill="url(#panelGrad)" opacity=".85"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
