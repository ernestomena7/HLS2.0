/**
 * Pie de página del sitio. Conserva los enlaces y los datos de contacto del
 * sitio aprobado (FR-022). El año se calcula al renderizar, en lugar de
 * escribirse con JavaScript en el navegador como hacía el sitio estático.
 */

const ENLACES = [
  { ancla: "quienes-somos", texto: "Quiénes somos" },
  { ancla: "servicios", texto: "Servicios" },
  { ancla: "enfoque", texto: "Enfoque" },
  { ancla: "contacto", texto: "Contacto" },
] as const;

export default function PieDePagina() {
  const anio = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <a className="brand brand--footer" href="/" aria-label="Hidrosal, inicio">
          <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
            <defs>
              <linearGradient id="dropGradPie" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#19b8a6" />
                <stop offset="1" stopColor="#1266b8" />
              </linearGradient>
            </defs>
            <path
              d="M16 2.6c6.2 7.3 9.3 11.4 9.3 15A9.3 9.3 0 0 1 6.7 17.6C6.7 14 9.8 9.9 16 2.6Z"
              fill="url(#dropGradPie)"
            />
          </svg>
          <span className="brand__text">
            <strong>HIDROSAL</strong>
            <em>Water Treatment Solutions</em>
          </span>
        </a>

        <nav className="footer__links" aria-label="Navegación del pie de página">
          {ENLACES.map(({ ancla, texto }) => (
            <a key={ancla} href={`/#${ancla}`}>
              {texto}
            </a>
          ))}
        </nav>

        <p className="footer__meta">
          <span>&copy; {anio} Hidrosal. Todos los derechos reservados.</span>
          <span>
            <a href="tel:+50373982967">+503 7398 2967</a> &middot;{" "}
            <a href="mailto:ventas@hidrosal.com">ventas@hidrosal.com</a>
          </span>
        </p>
      </div>
    </footer>
  );
}
