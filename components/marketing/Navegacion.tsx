"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Barra de navegación fija del sitio.
 *
 * Conserva los enlaces, las anclas y los identificadores del sitio aprobado
 * (FR-022): se compacta al desplazarse, abre el menú en móvil, se cierra con
 * Escape y resalta la sección visible.
 *
 * Las anclas se emiten relativas en la portada —para que el desplazamiento
 * suave siga siendo el de antes— y absolutas en el resto de páginas, donde
 * hace falta volver a la portada antes de bajar a la sección.
 */

const ENLACES = [
  { ancla: "quienes-somos", texto: "Quiénes somos" },
  { ancla: "que-hacemos", texto: "Qué hacemos" },
  { ancla: "servicios", texto: "Servicios" },
  { ancla: "enfoque", texto: "Enfoque" },
  { ancla: "marcas", texto: "Marcas" },
] as const;

const ANCLA_CONTACTO = "contacto";

export default function Navegacion() {
  const ruta = usePathname();
  const enPortada = ruta === "/";
  const [compacta, setCompacta] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);

  const href = useCallback(
    (ancla: string) => (enPortada ? `#${ancla}` : `/#${ancla}`),
    [enPortada],
  );

  const cerrarMenu = useCallback(() => {
    setMenuAbierto(false);
  }, []);

  // Barra compacta a partir de 24 píxeles de desplazamiento, igual que antes.
  useEffect(() => {
    const alDesplazar = () => {
      setCompacta(window.scrollY > 24);
    };
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alDesplazar);
    };
  }, []);

  // El menú de móvil se cierra con Escape.
  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        cerrarMenu();
      }
    };
    document.addEventListener("keydown", alPulsar);
    return () => {
      document.removeEventListener("keydown", alPulsar);
    };
  }, [cerrarMenu]);

  // Resalta el enlace de la sección visible. Mismos márgenes que el sitio
  // aprobado, para que el cambio ocurra en el mismo punto del recorrido.
  useEffect(() => {
    const secciones = document.querySelectorAll<HTMLElement>("main section[id]");
    if (secciones.length === 0) {
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            setSeccionActiva(entrada.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    for (const seccion of secciones) {
      observador.observe(seccion);
    }
    return () => {
      observador.disconnect();
      // Al cambiar de página no queda ninguna sección resaltada hasta que la
      // nueva vuelva a observarse.
      setSeccionActiva(null);
    };
  }, [ruta]);

  return (
    <header className={`nav${compacta ? " is-scrolled" : ""}`} id="nav">
      <div className="nav__inner">
        <a className="brand" href={enPortada ? "#inicio" : "/"} aria-label="Hidrosal, inicio">
          <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
            <defs>
              <linearGradient id="dropGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#19b8a6" />
                <stop offset="1" stopColor="#1266b8" />
              </linearGradient>
            </defs>
            <path
              d="M16 2.6c6.2 7.3 9.3 11.4 9.3 15A9.3 9.3 0 0 1 6.7 17.6C6.7 14 9.8 9.9 16 2.6Z"
              fill="url(#dropGrad)"
            />
            <path
              d="M12.4 17.9a3.6 3.6 0 0 0 3.6 3.6"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity=".7"
            />
          </svg>
          <span className="brand__text">
            <strong>HIDROSAL</strong>
            <em>Water Treatment Solutions</em>
          </span>
        </a>

        <nav
          className={`nav__links${menuAbierto ? " is-open" : ""}`}
          id="navLinks"
          aria-label="Navegación principal"
        >
          {ENLACES.map(({ ancla, texto }) => (
            <a
              key={ancla}
              href={href(ancla)}
              className={seccionActiva === ancla ? "is-active" : undefined}
              onClick={cerrarMenu}
            >
              {texto}
            </a>
          ))}
          <a
            className={`nav__cta${seccionActiva === ANCLA_CONTACTO ? " is-active" : ""}`}
            href={href(ANCLA_CONTACTO)}
            onClick={cerrarMenu}
          >
            Contáctanos
          </a>
        </nav>

        <button
          className="nav__toggle"
          id="navToggle"
          type="button"
          aria-expanded={menuAbierto}
          aria-controls="navLinks"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => {
            setMenuAbierto((abierto) => !abierto);
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
