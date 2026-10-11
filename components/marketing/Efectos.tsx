"use client";

import { useEffect } from "react";

/**
 * Comportamientos visuales de la portada: animación de entrada y parallax del
 * hero.
 *
 * No pinta nada: solo observa el desplazamiento y marca los elementos que ya
 * entraron en pantalla, igual que hacía `assets/js/main.js`. Respeta
 * `prefers-reduced-motion`: con movimiento reducido todo aparece de una vez y
 * el parallax no se activa.
 *
 * Los otros comportamientos del sitio estático viven donde les corresponde:
 * la barra y el menú en `Navegacion.tsx`, la validación en
 * `FormularioContacto.tsx`, el año en `PieDePagina.tsx` y la duplicación de la
 * marquesina en `Marcas.tsx`, ya resuelta en el servidor.
 */
export default function Efectos() {
  useEffect(() => {
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const aparecibles = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    // ---------------------------------------------- Animaciones de entrada --
    let observador: IntersectionObserver | null = null;

    if (movimientoReducido || !("IntersectionObserver" in window)) {
      for (const elemento of aparecibles) {
        elemento.classList.add("is-visible");
      }
    } else {
      observador = new IntersectionObserver(
        (entradas, instancia) => {
          for (const entrada of entradas) {
            if (entrada.isIntersecting) {
              entrada.target.classList.add("is-visible");
              instancia.unobserve(entrada.target);
            }
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
      );
      for (const elemento of aparecibles) {
        observador.observe(elemento);
      }
    }

    // ------------------------------------------------- Parallax del hero ---
    const hero = document.querySelector<HTMLElement>(".hero");
    const capas = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const contenido = document.querySelector<HTMLElement>(".hero__content");

    if (movimientoReducido || hero === null) {
      return () => {
        observador?.disconnect();
      };
    }

    let pendiente = false;

    const pintar = (): void => {
      pendiente = false;
      const desplazamiento = window.scrollY;
      const alto = hero.offsetHeight;
      if (desplazamiento > alto) {
        return; // Fuera de vista: nada que pintar.
      }
      const avance = Math.min(desplazamiento / alto, 1);

      for (const capa of capas) {
        const velocidad = Number.parseFloat(capa.dataset["parallax"] ?? "0");
        capa.style.transform = `translate3d(0,${(desplazamiento * velocidad).toFixed(2)}px,0)`;
      }

      if (contenido !== null) {
        contenido.style.transform = `translate3d(0,${(desplazamiento * -0.16).toFixed(2)}px,0)`;
        contenido.style.opacity = String(Math.max(0, 1 - avance * 1.35));
      }
    };

    const pedirPintado = (): void => {
      if (!pendiente) {
        pendiente = true;
        window.requestAnimationFrame(pintar);
      }
    };

    window.addEventListener("scroll", pedirPintado, { passive: true });
    window.addEventListener("resize", pedirPintado, { passive: true });
    pintar();

    return () => {
      observador?.disconnect();
      window.removeEventListener("scroll", pedirPintado);
      window.removeEventListener("resize", pedirPintado);
    };
  }, []);

  return null;
}
