import { describe, expect, it } from "vitest";

import { generarSlug, normalizar } from "@/lib/texto";

describe("normalizar", () => {
  it("hace que «Ósmosis» y «OSMOSIS» normalicen igual", () => {
    expect(normalizar("Ósmosis")).toBe("osmosis");
    expect(normalizar("OSMOSIS")).toBe("osmosis");
    expect(normalizar("osmosis")).toBe("osmosis");
    expect(normalizar("Ósmosis")).toBe(normalizar("OSMOSIS"));
  });

  it("quita todos los diacríticos del español", () => {
    expect(normalizar("Filtración de Agua Potable")).toBe("filtracion de agua potable");
    expect(normalizar("Ósmosis Inversa — Añejo Ñ")).toBe("osmosis inversa — anejo n");
  });

  it("recorta los espacios de los extremos y colapsa los interiores", () => {
    expect(normalizar("  Ósmosis   inversa  ")).toBe("osmosis inversa");
  });

  it("deja igual un texto ya normalizado", () => {
    expect(normalizar("membrana 500 gpd")).toBe("membrana 500 gpd");
  });
});

describe("generarSlug", () => {
  it("genera el slug esperado de «Ósmosis inversa 500 GPD»", () => {
    expect(generarSlug("Ósmosis inversa 500 GPD")).toBe("osmosis-inversa-500-gpd");
  });

  it("no deja guiones repetidos ni al principio ni al final", () => {
    expect(generarSlug("  --Ósmosis   //  inversa--  ")).toBe("osmosis-inversa");
    expect(generarSlug("¡¡Planta industrial!!")).toBe("planta-industrial");
  });

  it("solo produce letras sin acentos, números y guiones", () => {
    expect(generarSlug("Suavizador 1½\" · Serie «Pro» (2026)")).toMatch(/^[a-z0-9-]+$/);
    expect(generarSlug("Cartucho CTO 10×2.5")).toBe("cartucho-cto-10-2-5");
  });

  it("es idempotente: el slug de un slug es el mismo slug", () => {
    const slug = generarSlug("Tratamiento de agua potable");
    expect(generarSlug(slug)).toBe(slug);
  });

  it("devuelve cadena vacía cuando no queda nada utilizable", () => {
    expect(generarSlug("¿¡—!?")).toBe("");
  });
});
