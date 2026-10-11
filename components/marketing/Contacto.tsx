import FormularioContacto from "@/components/marketing/FormularioContacto";
import { retraso } from "@/components/marketing/retraso";

/**
 * Sección de contacto. Los datos y el texto son los del sitio aprobado; el
 * formulario vive aparte porque necesita comportarse en el navegador.
 */
export default function Contacto() {
  return (
    <section className="section section--contact" id="contacto">
      <div className="wrap contact">
        <div className="contact__info">
              <p className="eyebrow reveal">Contacto</p>
              <h2 className="h2 reveal" style={retraso(60)}>Hablemos de tu proyecto</h2>
              <p className="lead reveal" style={retraso(120)}>
                Estamos listos para diseñar la solución perfecta para tu empresa o proyecto.
                Contáctanos y recibe asesoría experta.
              </p>

              <ul className="contact__list reveal" style={retraso(180)}>
                <li>
                  <span className="contact__ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.2 3.6h3.1l1.6 4-2 1.3a12.4 12.4 0 0 0 6.2 6.2l1.3-2 4 1.6v3.1a1.8 1.8 0 0 1-2 1.8A16.6 16.6 0 0 1 4.4 5.6a1.8 1.8 0 0 1 1.8-2Z"/>
                    </svg>
                  </span>
                  <div>
                    <strong>Llámanos</strong>
                    <a href="tel:+50373982967">+503 7398 2967</a>
                  </div>
                </li>
                <li>
                  <span className="contact__ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5.2" width="18" height="13.6" rx="2.4"/><path d="m3.6 6.6 8.4 6 8.4-6"/>
                    </svg>
                  </span>
                  <div>
                    <strong>Correo electrónico</strong>
                    <a href="mailto:ventas@hidrosal.com">ventas@hidrosal.com</a>
                  </div>
                </li>
                <li>
                  <span className="contact__ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7.4v5l3.2 1.9"/>
                    </svg>
                  </span>
                  <div>
                    <strong>Atención</strong>
                    <span className="contact__plain">Lunes a viernes, 8:00 a.m. &ndash; 5:00 p.m.</span>
                  </div>
                </li>
              </ul>
            </div>

        <FormularioContacto />
      </div>
    </section>
  );
}
