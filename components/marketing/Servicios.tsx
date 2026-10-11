import { retraso } from "@/components/marketing/retraso";

/**
 * Sección «Servicios» con las diez tarjetas aprobadas, en el mismo orden y con
 * las mismas viñetas.
 */
export default function Servicios() {
  return (
    <section className="section section--services" id="servicios">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow reveal">Servicios</p>
          <h2 className="h2 reveal" style={retraso(60)}>Tecnología para cada necesidad</h2>
          <p className="lead lead--center reveal" style={retraso(120)}>
            Ofrecemos un catálogo completo de soluciones técnicas para garantizar la calidad del agua
            en cualquier entorno.
          </p>
        </div>
        <div className="cards">
            <article className="card reveal" style={retraso(0)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">01</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2.7c3.4 4 5.6 6.9 5.6 9.7A5.6 5.6 0 0 1 12 18a5.6 5.6 0 0 1-5.6-5.6c0-2.8 2.2-5.7 5.6-9.7Z"/><path d="M9.3 12.4a2.7 2.7 0 0 0 2.7 2.7"/><path d="M5 21h14"/></svg>
              <h3 className="card__title">Purificación residencial y comercial</h3>
              <ul className="card__list">
                <li>Soluciones de filtración para aplicaciones residenciales y comerciales</li>
                <li>Purificadores para hogares, oficinas, comercios y restaurantes</li>
                <li>Sistemas comerciales e industriales para agua</li>
                <li>Filtración avanzada, carbón activado, membranas, UV y ozono</li>
                <li>Mejora de sabor, olor y calidad</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(60)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">02</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4.5h18l-7 8.2V21l-4-2.4v-5.9Z"/><path d="M7.5 8.6h9"/></svg>
              <h3 className="card__title">Filtración industrial</h3>
              <ul className="card__list">
                <li>Filtros multimedia para remoción de sedimentos y turbidez</li>
                <li>Filtros de carbón activado para cloro, olor y compuestos orgánicos</li>
                <li>Filtración especializada para hierro, manganeso y partículas finas</li>
                <li>Pretratamiento para ósmosis inversa y ultrafiltración</li>
                <li>Aplicaciones en calderas, torres de enfriamiento e industria</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(120)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">03</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16"/><path d="M6.4 6l1 13.2A1.8 1.8 0 0 0 9.2 21h5.6a1.8 1.8 0 0 0 1.8-1.8L17.6 6"/><path d="M8.6 6V3.6h6.8V6"/><path d="M8.2 13.6c1.6-1.2 3-1.2 3.8 0s2.2 1.2 3.8 0"/></svg>
              <h3 className="card__title">Tratamiento de agua potable</h3>
              <ul className="card__list">
                <li>Filtración multimedia (arena sílica, antracita, zeolita)</li>
                <li>Suavizadores de agua</li>
                <li>Sistemas de desinfección (UV, cloración y ozono)</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(0)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">04</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4.4" width="18" height="15.2" rx="2.4"/><path d="M9 4.4v15.2M15 4.4v15.2"/><path d="M5.6 9.2h1.6M5.6 12h1.6M5.6 14.8h1.6"/><path d="M17 12h2.2"/></svg>
              <h3 className="card__title">Ósmosis inversa</h3>
              <ul className="card__list">
                <li>Sistemas comerciales e industriales</li>
                <li>Plantas para hospitales, calderas y procesos industriales</li>
                <li>Rehabilitación, ampliación y optimización de sistemas</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(60)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">05</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 16.6c1.7 0 1.7 1.6 3.4 1.6s1.7-1.6 3.4-1.6 1.7 1.6 3.4 1.6 1.7-1.6 3.4-1.6 1.7 1.6 3.4 1.6"/><path d="M2.5 20.4c1.7 0 1.7 1.2 3.4 1.2"/><path d="M12 3.2 14.1 8l5.1.5-3.9 3.4 1.2 5-4.5-2.7-4.5 2.7 1.2-5L4.8 8.5 9.9 8Z"/></svg>
              <h3 className="card__title">Sistemas de desalinización</h3>
              <ul className="card__list">
                <li>Desaladoras para agua de mar y agua salobre</li>
                <li>Soluciones para zonas costeras, hoteles y comunidades</li>
                <li>Pretratamiento especializado y control de incrustaciones</li>
                <li>Bombas de alta presión y recuperación de energía</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(120)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">06</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.6 8.2 5 12.6l3.1 1.8"/><path d="M12 3.6 14.6 8l-3.1 1.8"/><path d="M19.2 14.2 16.6 18.6H13"/><path d="M4.8 14.2 4 18.6h4.6"/><path d="M12 3.6 9.4 8"/><path d="M19.2 14.2 16.4 9.6"/></svg>
              <h3 className="card__title">Aguas de proceso y residuales</h3>
              <ul className="card__list">
                <li>Coagulación y floculación</li>
                <li>Filtración avanzada y ultrafiltración</li>
                <li>Reducción de DQO, sólidos y contaminantes específicos</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(0)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">07</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 2.8h4v2.6c0 1 .5 1.4 1.1 2 .8.8 1.3 1.6 1.3 3V18a3 3 0 0 1-3 3h-2.8a3 3 0 0 1-3-3v-7.6c0-1.4.5-2.2 1.3-3 .6-.6 1.1-1 1.1-2Z"/><path d="M7.6 13.6h8.8"/></svg>
              <h3 className="card__title">Maquinaria para embotelladoras</h3>
              <ul className="card__list">
                <li>Líneas de llenado y envasado para agua purificada</li>
                <li>Botellas PET, garrafones y presentaciones especiales</li>
                <li>Lavado, llenado, taponado, etiquetado y empaque</li>
                <li>Integración total con sistemas de tratamiento</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(60)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">08</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.1"/><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/></svg>
              <h3 className="card__title">Ingeniería, instalación y automatización</h3>
              <ul className="card__list">
                <li>Diseño y dimensionamiento de sistemas</li>
                <li>Integración de bombas, variadores y tableros de control</li>
                <li>Puesta en marcha y capacitación operativa</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(120)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">09</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2.9 20 7v10l-8 4.1L4 17V7Z"/><path d="m4 7 8 4.1L20 7"/><path d="M12 11.1V21.1"/></svg>
              <h3 className="card__title">Repuestos y consumibles</h3>
              <ul className="card__list">
                <li>Membranas de ósmosis inversa</li>
                <li>Cartuchos y elementos filtrantes</li>
                <li>Carbón activado, resinas y medios filtrantes</li>
                <li>Lámparas UV y mangas de cuarzo</li>
                <li>Químicos para tratamiento (antiescalantes, desinfectantes)</li>
              </ul>
            </article>
            <article className="card reveal" style={retraso(0)}>
              <span className="card__glow" aria-hidden="true"></span>
              <span className="card__badge">10</span>
              <svg className="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15.2 3.4a5.2 5.2 0 0 0-5.9 6.7L3.6 15.8a2 2 0 0 0 2.8 2.8l5.7-5.7a5.2 5.2 0 0 0 6.7-5.9l-3 3-2.7-.7-.7-2.7Z"/><path d="M6.2 17.2h.01"/></svg>
              <h3 className="card__title">Mantenimiento y servicio técnico</h3>
              <ul className="card__list">
                <li>Mantenimiento preventivo y correctivo</li>
                <li>Diagnóstico de plantas</li>
                <li>Programas de mantenimiento y suministro continuo</li>
              </ul>
            </article>
        </div>
      </div>
    </section>
  );
}
