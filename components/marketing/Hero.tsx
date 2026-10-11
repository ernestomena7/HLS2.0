import { retraso } from "@/components/marketing/retraso";

/**
 * Hero de la portada.
 * 
 * Conserva el encuadre aprobado: la línea del agua está al 60 % de la altura de
 * la imagen y `background-position: 50% 60%` la ancla al 60 % del hero, de modo
 * que coincide en cualquier pantalla. La capa de la fotografía va
 * sobredimensionada para que el desplazamiento del parallax nunca descubra sus
 * bordes, y el difuminado se completa al 90 %.
 */
export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero__scene" aria-hidden="true">
        {/* Paisaje de río y montañas boscosas. La línea del agua está al 60% de la
             altura de la imagen, y background-position la ancla al 60% del hero. */}
        <div className="hero__sky"></div>
        <div className="hero__photo" data-parallax="0.07"></div>
        <div className="hero__glow"></div>
        <div className="hero__fade"></div>
      </div>

      <div className="hero__content">
        <p className="hero__eyebrow reveal">Hidrosal &middot; El Salvador</p>
        <h1 className="hero__title reveal" style={retraso(80)}>Agua pura,<br /><span>ingeniería confiable</span></h1>
        <p className="hero__lead reveal" style={retraso(160)}>
          Diseñamos, suministramos e instalamos sistemas de purificación y tratamiento de agua
          por ósmosis inversa para residencias, comercios e industrias.
        </p>
        <div className="hero__actions reveal" style={retraso(240)}>
          <a className="btn btn--primary" href="#contacto">Solicitar asesoría</a>
          <a className="btn btn--ghost" href="#servicios">Ver servicios</a>
        </div>
      </div>

      <a className="hero__scroll" href="#quienes-somos" aria-label="Desplazarse a la siguiente sección">
        <span className="hero__mouse"><span></span></span>
        <span className="hero__scrollText">Desliza</span>
      </a>
    </section>
  );
}
