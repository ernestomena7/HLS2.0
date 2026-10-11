import { describe, expect, it } from "vitest";

import {
  ORDEN_CATALOGO,
  TAMANIO_PAGINA,
  calcularPaginacion,
  compararCatalogo,
  type Ordenable,
} from "@/lib/catalogo/paginacion";

describe("calcularPaginacion · total de páginas", () => {
  it("usa páginas de doce productos", () => {
    expect(TAMANIO_PAGINA).toBe(12);
  });

  it("cuenta bien las páginas de un total exacto y de uno con resto", () => {
    expect(calcularPaginacion(24, 1).totalPaginas).toBe(2);
    expect(calcularPaginacion(25, 1).totalPaginas).toBe(3);
    expect(calcularPaginacion(28, 1).totalPaginas).toBe(3);
  });

  it("un catálogo vacío tiene una sola página", () => {
    const paginacion = calcularPaginacion(0, 1);
    expect(paginacion.totalPaginas).toBe(1);
    expect(paginacion.total).toBe(0);
    expect(paginacion.desplazamiento).toBe(0);
    expect(paginacion.hayAnterior).toBe(false);
    expect(paginacion.haySiguiente).toBe(false);
  });
});

describe("calcularPaginacion · desplazamiento", () => {
  it("salta doce resultados por cada página anterior", () => {
    expect(calcularPaginacion(28, 1).desplazamiento).toBe(0);
    expect(calcularPaginacion(28, 2).desplazamiento).toBe(12);
    expect(calcularPaginacion(28, 3).desplazamiento).toBe(24);
  });

  it("devuelve la última página con resultados cuando la pedida se pasa de rango", () => {
    const paginacion = calcularPaginacion(28, 999);
    expect(paginacion.pagina).toBe(3);
    expect(paginacion.desplazamiento).toBe(24);
    expect(paginacion.haySiguiente).toBe(false);
  });

  it("trata como página 1 cualquier valor menor que uno o no numérico", () => {
    expect(calcularPaginacion(28, 0).pagina).toBe(1);
    expect(calcularPaginacion(28, -4).pagina).toBe(1);
    expect(calcularPaginacion(28, Number.NaN).pagina).toBe(1);
  });

  it("marca el vecindario de la página vigente", () => {
    expect(calcularPaginacion(28, 2)).toMatchObject({ hayAnterior: true, haySiguiente: true });
    expect(calcularPaginacion(28, 1)).toMatchObject({ hayAnterior: false, haySiguiente: true });
  });
});

describe("orden del catálogo", () => {
  it("ordena por fecha de creación descendente con el identificador como desempate", () => {
    expect(ORDEN_CATALOGO).toEqual([{ creadoEn: "desc" }, { id: "desc" }]);
  });

  it("el desempate impide que un producto aparezca en dos páginas", () => {
    // Todos creados en el mismo instante: sin desempate, el orden sería
    // arbitrario y un producto podría repetirse entre páginas o perderse.
    const mismoInstante = new Date("2026-09-01T12:00:00.000Z");
    const productos: Ordenable[] = Array.from({ length: 28 }, (_, indice) => ({
      id: indice + 1,
      creadoEn: mismoInstante,
    }));

    const ordenados = [...productos].sort(compararCatalogo);
    const vistos: number[] = [];

    for (let pagina = 1; pagina <= calcularPaginacion(28, 1).totalPaginas; pagina += 1) {
      const { desplazamiento, tamanio } = calcularPaginacion(28, pagina);
      vistos.push(...ordenados.slice(desplazamiento, desplazamiento + tamanio).map((p) => p.id));
    }

    expect(vistos).toHaveLength(28);
    expect(new Set(vistos).size).toBe(28);
  });

  it("antepone lo más reciente aunque los identificadores digan lo contrario", () => {
    const viejo: Ordenable = { id: 99, creadoEn: new Date("2026-01-01T00:00:00.000Z") };
    const nuevo: Ordenable = { id: 1, creadoEn: new Date("2026-09-01T00:00:00.000Z") };
    expect([viejo, nuevo].sort(compararCatalogo)).toEqual([nuevo, viejo]);
  });
});
