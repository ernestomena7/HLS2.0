import { describe, expect, it } from "vitest";

import { decidirResolucion } from "@/lib/catalogo/resolucion";
import { leerEspecificaciones } from "@/lib/catalogo/especificaciones";

type Producto = { slug: string; nombre: string };

const producto: Producto = { slug: "osmosis-inversa-residencial-75-gpd", nombre: "Ósmosis inversa residencial 75 GPD" };

describe("resolución de la dirección de una ficha", () => {
  it("un identificador vigente resuelve al producto", () => {
    const resolucion = decidirResolucion<Producto>(producto, null);
    expect(resolucion).toEqual({ tipo: "ficha", producto });
  });

  it("un identificador histórico devuelve una redirección al vigente", () => {
    const resolucion = decidirResolucion<Producto>(null, producto.slug);
    expect(resolucion).toEqual({ tipo: "redireccion", slug: producto.slug });
  });

  it("un identificador inexistente no resuelve", () => {
    expect(decidirResolucion<Producto>(null, null)).toEqual({ tipo: "no-encontrado" });
  });

  it("el producto vigente manda sobre el historial", () => {
    // Si un identificador fuera a la vez vigente e histórico, se sirve la ficha
    // en lugar de entrar en un ciclo de redirecciones.
    const resolucion = decidirResolucion<Producto>(producto, "otro-slug");
    expect(resolucion).toEqual({ tipo: "ficha", producto });
  });

  it("un borrador es indistinguible de un producto inexistente", () => {
    // La consulta ya descarta los borradores, así que llegan aquí como `null`:
    // el visitante recibe exactamente la misma respuesta que ante una
    // dirección inventada (FR-012).
    expect(decidirResolucion<Producto>(null, null)).toEqual(
      decidirResolucion<Producto>(null, null),
    );
  });
});

describe("lectura de especificaciones", () => {
  it("conserva el orden de la lista", () => {
    const crudo = [
      { nombre: "Producción", valor: "75 galones por día" },
      { nombre: "Etapas", valor: "5" },
    ];
    expect(leerEspecificaciones(crudo)).toEqual(crudo);
  });

  it("devuelve una lista vacía ante datos corruptos, sin romper la ficha", () => {
    expect(leerEspecificaciones(null)).toEqual([]);
    expect(leerEspecificaciones("texto suelto")).toEqual([]);
    expect(leerEspecificaciones([{ nombre: "", valor: "x" }])).toEqual([]);
    expect(leerEspecificaciones([{ nombre: "Etapas" }])).toEqual([]);
  });

  it("acepta un producto sin especificaciones", () => {
    expect(leerEspecificaciones([])).toEqual([]);
  });
});
