import { describe, expect, it } from "vitest";

import { CATALOGO } from "@/prisma/seed";
import { generarSlug, normalizar } from "@/lib/texto";

/**
 * El juego de datos de ejemplo no es decorativo: existe para ejercitar los
 * casos límite de la especificación. Si alguien lo recorta, estas pruebas
 * avisan antes de que las pruebas de extremo a extremo fallen sin explicación.
 */

const productos = CATALOGO.flatMap((categoria) =>
  categoria.productos.map((producto) => ({ ...producto, categoria: categoria.slug })),
);
const publicados = productos.filter((producto) => producto.estado !== "BORRADOR");

describe("datos de ejemplo del catálogo (FR-020)", () => {
  it("tiene seis categorías", () => {
    expect(CATALOGO).toHaveLength(6);
  });

  it("tiene entre 24 y 30 productos", () => {
    expect(productos.length).toBeGreaterThanOrEqual(24);
    expect(productos.length).toBeLessThanOrEqual(30);
  });

  it("incluye al menos tres productos publicados sin precio, uno de ellos una planta industrial", () => {
    const sinPrecio = publicados.filter((producto) => producto.precio === undefined);
    expect(sinPrecio.length).toBeGreaterThanOrEqual(3);
    expect(sinPrecio.some((producto) => /planta/i.test(producto.nombre))).toBe(true);
  });

  it("incluye exactamente dos productos agotados y dos en borrador", () => {
    expect(publicados.filter((producto) => producto.disponible === false)).toHaveLength(2);
    expect(productos.filter((producto) => producto.estado === "BORRADOR")).toHaveLength(2);
  });

  it("incluye un producto sin imagen", () => {
    expect(productos.filter((producto) => producto.sinImagen === true)).toHaveLength(1);
  });

  it("incluye una categoría sin productos publicados", () => {
    const vacias = CATALOGO.filter((categoria) =>
      categoria.productos.every((producto) => producto.estado === "BORRADOR"),
    );
    expect(vacias).toHaveLength(1);
    expect(vacias[0]?.slug).toBe("desalinizacion");
  });

  it("incluye nombres con acentos, para ejercitar la búsqueda normalizada", () => {
    const conAcentos = productos.filter((producto) => normalizar(producto.nombre) !== producto.nombre.toLowerCase());
    expect(conAcentos.length).toBeGreaterThan(0);
    expect(productos.some((producto) => producto.nombre.includes("Ósmosis"))).toBe(true);
  });

  it("incluye al menos una dirección histórica, para ejercitar la redirección permanente", () => {
    const historicos = productos.flatMap((producto) => producto.slugsHistoricos ?? []);
    expect(historicos.length).toBeGreaterThanOrEqual(1);
  });

  it("tiene suficientes productos publicados para paginar más de una vez", () => {
    expect(publicados.length).toBeGreaterThan(12);
  });
});

describe("integridad del juego de datos", () => {
  it("no repite códigos internos", () => {
    const skus = productos.map((producto) => producto.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("no repite identificadores de dirección, ni entre vigentes e históricos", () => {
    const vigentes = productos.map((producto) => generarSlug(producto.nombre));
    const historicos = productos.flatMap((producto) => producto.slugsHistoricos ?? []);
    const todos = [...vigentes, ...historicos];
    expect(new Set(todos).size).toBe(todos.length);
  });

  it("no repite el slug de ninguna categoría", () => {
    const slugs = CATALOGO.map((categoria) => categoria.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("respeta las longitudes del modelo de datos", () => {
    for (const categoria of CATALOGO) {
      expect(categoria.slug.length).toBeLessThanOrEqual(80);
      expect(categoria.nombre.length).toBeGreaterThanOrEqual(2);
      expect(categoria.nombre.length).toBeLessThanOrEqual(120);
    }
    for (const producto of productos) {
      expect(producto.sku.length).toBeLessThanOrEqual(60);
      expect(producto.nombre.length).toBeGreaterThanOrEqual(3);
      expect(producto.nombre.length).toBeLessThanOrEqual(140);
      expect(generarSlug(producto.nombre).length).toBeLessThanOrEqual(140);
      expect(producto.descripcion.length).toBeGreaterThan(0);
    }
  });

  it("solo publica precios mayores que cero y con dos decimales como mucho", () => {
    for (const producto of productos) {
      if (producto.precio === undefined) {
        continue;
      }
      const valor = Number(producto.precio);
      expect(valor).toBeGreaterThan(0);
      expect(producto.precio).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it("da nombre y valor a cada especificación, sin repetir nombres dentro de un producto", () => {
    for (const producto of productos) {
      const nombres = producto.especificaciones.map((especificacion) => especificacion.nombre);
      expect(new Set(nombres).size).toBe(nombres.length);
      for (const { nombre, valor } of producto.especificaciones) {
        expect(nombre.length).toBeGreaterThanOrEqual(1);
        expect(nombre.length).toBeLessThanOrEqual(60);
        expect(valor.length).toBeGreaterThanOrEqual(1);
        expect(valor.length).toBeLessThanOrEqual(120);
      }
    }
  });
});
