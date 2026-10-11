import { describe, expect, it } from "vitest";

import {
  LARGO_MAXIMO_BUSQUEDA,
  construirDireccion,
  leerParametros,
} from "@/lib/catalogo/parametros";

/**
 * Cubre toda la tabla de canonicalización de
 * `specs/001-catalogo-productos/contracts/parametros-catalogo.md`.
 */

const CATEGORIAS = ["osmosis-inversa", "repuestos-y-consumibles", "desalinizacion"] as const;

const leer = (crudos: Record<string, string | string[] | undefined>) =>
  leerParametros(crudos, CATEGORIAS);

describe("parámetro q", () => {
  it("se descarta cuando está vacío o es solo espacios", () => {
    expect(leer({ q: "" }).q).toBeUndefined();
    expect(leer({ q: "    " }).q).toBeUndefined();
    expect(leer({}).q).toBeUndefined();
  });

  it("se recorta de espacios sobrantes", () => {
    expect(leer({ q: "  membrana  " }).q).toBe("membrana");
  });

  it("se recorta a ochenta caracteres cuando es más largo", () => {
    const largo = "a".repeat(120);
    const { q } = leer({ q: largo });
    expect(q).toHaveLength(LARGO_MAXIMO_BUSQUEDA);
  });

  it("se normaliza para comparar sin acentos ni mayúsculas", () => {
    expect(leer({ q: "Ósmosis" }).qNormalizado).toBe("osmosis");
    expect(leer({ q: "OSMOSIS" }).qNormalizado).toBe("osmosis");
    expect(leer({ q: "osmosis" }).qNormalizado).toBe("osmosis");
  });

  it("conserva el texto original para mostrarlo en el buscador", () => {
    const { q, qNormalizado } = leer({ q: "Ósmosis" });
    expect(q).toBe("Ósmosis");
    expect(qNormalizado).toBe("osmosis");
  });
});

describe("parámetro categoria", () => {
  it("acepta el slug de una categoría existente", () => {
    const parametros = leer({ categoria: "osmosis-inversa" });
    expect(parametros.categoria).toBe("osmosis-inversa");
    expect(parametros.categoriaInexistente).toBe(false);
  });

  it("descarta una categoría inexistente y lo señala para avisar en pantalla", () => {
    const parametros = leer({ categoria: "inexistente" });
    expect(parametros.categoria).toBeUndefined();
    expect(parametros.categoriaInexistente).toBe(true);
  });

  it("no avisa de nada cuando no se pidió ninguna categoría", () => {
    expect(leer({}).categoriaInexistente).toBe(false);
    expect(leer({ categoria: "" }).categoriaInexistente).toBe(false);
  });
});

describe("parámetro pagina", () => {
  it("vale 1 por defecto", () => {
    expect(leer({}).pagina).toBe(1);
  });

  it("trata como 1 cualquier valor no numérico, cero o negativo", () => {
    expect(leer({ pagina: "abc" }).pagina).toBe(1);
    expect(leer({ pagina: "0" }).pagina).toBe(1);
    expect(leer({ pagina: "-3" }).pagina).toBe(1);
    expect(leer({ pagina: "" }).pagina).toBe(1);
    expect(leer({ pagina: "2.7" }).pagina).toBe(2);
  });

  it("acepta un entero positivo, aunque se pase de rango: acotarlo es de la paginación", () => {
    expect(leer({ pagina: "2" }).pagina).toBe(2);
    expect(leer({ pagina: "999" }).pagina).toBe(999);
  });
});

describe("parámetros sobrantes y repetidos", () => {
  it("ignora los parámetros desconocidos", () => {
    const parametros = leer({ orden: "precio", utm_source: "correo", q: "uv" });
    expect(parametros.q).toBe("uv");
    expect(parametros.categoria).toBeUndefined();
    expect(parametros.pagina).toBe(1);
  });

  it("toma el primero cuando un parámetro viene repetido", () => {
    expect(leer({ q: ["a", "b"] }).q).toBe("a");
    expect(leer({ categoria: ["osmosis-inversa", "desalinizacion"] }).categoria).toBe(
      "osmosis-inversa",
    );
    expect(leer({ pagina: ["2", "5"] }).pagina).toBe(2);
  });
});

describe("combinaciones", () => {
  it("categoría y búsqueda son acumulativas", () => {
    const parametros = leer({ categoria: "repuestos-y-consumibles", q: "uv", pagina: "2" });
    expect(parametros).toMatchObject({
      categoria: "repuestos-y-consumibles",
      q: "uv",
      pagina: 2,
    });
  });
});

describe("dirección canónica", () => {
  it("la página 1 del catálogo completo es /productos", () => {
    expect(construirDireccion({})).toBe("/productos");
    expect(construirDireccion({ pagina: 1 })).toBe("/productos");
  });

  it("emite los parámetros en el orden categoria, q, pagina", () => {
    expect(
      construirDireccion({ pagina: 2, q: "uv", categoria: "repuestos-y-consumibles" }),
    ).toBe("/productos?categoria=repuestos-y-consumibles&q=uv&pagina=2");
  });

  it("omite los valores por defecto", () => {
    expect(construirDireccion({ categoria: "osmosis-inversa", pagina: 1 })).toBe(
      "/productos?categoria=osmosis-inversa",
    );
    expect(construirDireccion({ q: "membrana" })).toBe("/productos?q=membrana");
  });

  it("escapa los caracteres que lo necesitan", () => {
    expect(construirDireccion({ q: "ósmosis inversa" })).toBe(
      "/productos?q=%C3%B3smosis+inversa",
    );
  });

  it("es estable: leer una dirección canónica y volver a construirla da lo mismo", () => {
    const direccion = construirDireccion({ categoria: "osmosis-inversa", q: "membrana", pagina: 3 });
    const parametros = leer({ categoria: "osmosis-inversa", q: "membrana", pagina: "3" });
    expect(
      construirDireccion({
        categoria: parametros.categoria,
        q: parametros.q,
        pagina: parametros.pagina,
      }),
    ).toBe(direccion);
  });
});
