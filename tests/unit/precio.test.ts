import { describe, expect, it } from "vitest";

import {
  LEYENDA_IVA,
  PRECIO_A_CONSULTAR,
  esPrecioAConsultar,
  formatearPrecio,
  presentarPrecio,
} from "@/lib/precio";

describe("formatearPrecio", () => {
  it("formatea con símbolo de dólar y dos decimales", () => {
    const texto = formatearPrecio("1299.9");
    expect(texto).toContain("1,299.90");
    expect(texto).toContain("$");
  });

  it("conserva los dos decimales cuando el precio es redondo", () => {
    expect(formatearPrecio(450)).toContain("450.00");
  });

  it("devuelve «Precio a consultar» cuando el precio es nulo", () => {
    expect(formatearPrecio(null)).toBe(PRECIO_A_CONSULTAR);
    expect(formatearPrecio(undefined)).toBe(PRECIO_A_CONSULTAR);
  });

  it("trata un precio de 0 como dato inválido, no como «a consultar»", () => {
    expect(() => formatearPrecio(0)).toThrowError(/mayor que 0/);
    expect(() => formatearPrecio("0.00")).toThrowError(/mayor que 0/);
  });

  it("rechaza precios negativos y no numéricos", () => {
    expect(() => formatearPrecio(-10)).toThrowError(/mayor que 0/);
    expect(() => formatearPrecio("abc")).toThrowError(/no es un número/);
  });
});

describe("esPrecioAConsultar", () => {
  it("solo es verdadero ante la ausencia de precio", () => {
    expect(esPrecioAConsultar(null)).toBe(true);
    expect(esPrecioAConsultar(undefined)).toBe(true);
    expect(esPrecioAConsultar(0)).toBe(false);
    expect(esPrecioAConsultar("199.99")).toBe(false);
  });
});

describe("presentarPrecio", () => {
  it("acompaña la cifra con la leyenda «IVA incluido»", () => {
    const presentacion = presentarPrecio("199.99");
    expect(presentacion.aConsultar).toBe(false);
    expect(presentacion.leyenda).toBe(LEYENDA_IVA);
    expect(presentacion.texto).toContain("199.99");
  });

  it("no añade leyenda de IVA cuando no hay cifra", () => {
    const presentacion = presentarPrecio(null);
    expect(presentacion.aConsultar).toBe(true);
    expect(presentacion.texto).toBe(PRECIO_A_CONSULTAR);
    expect(presentacion.leyenda).toBeNull();
  });
});
