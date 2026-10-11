import { expect, test } from "@playwright/test";

/**
 * Historia 4 — Encontrar los productos desde un buscador externo
 * (FR-014 a FR-016).
 */

const FICHA_A = "/productos/osmosis-inversa-residencial-75-gpd";
const FICHA_B = "/productos/membrana-de-osmosis-inversa-400-gpd";
const EN_BORRADOR = "desalinizadora-costera-de-10-m-por-dia";

const meta = (pagina: import("@playwright/test").Page, nombre: string) =>
  pagina.locator(`meta[name="${nombre}"]`).getAttribute("content");

const metaPropiedad = (pagina: import("@playwright/test").Page, propiedad: string) =>
  pagina.locator(`meta[property="${propiedad}"]`).first().getAttribute("content");

test.describe("Metadatos de las fichas", () => {
  test("escenario 1 · dos fichas tienen título y descripción propios", async ({ page }) => {
    await page.goto(FICHA_A);
    const tituloA = await page.title();
    const descripcionA = await meta(page, "description");

    await page.goto(FICHA_B);
    const tituloB = await page.title();
    const descripcionB = await meta(page, "description");

    expect(tituloA).toContain("Ósmosis inversa residencial 75 GPD");
    expect(tituloB).toContain("Membrana de ósmosis inversa 400 GPD");
    expect(tituloA).not.toBe(tituloB);

    expect(descripcionA).toBeTruthy();
    expect(descripcionB).toBeTruthy();
    expect(descripcionA).not.toBe(descripcionB);
  });

  test("escenario 2 · la vista previa al compartir lleva nombre e imagen principal", async ({
    page,
  }) => {
    await page.goto(FICHA_A);

    expect(await metaPropiedad(page, "og:title")).toContain("Ósmosis inversa residencial 75 GPD");
    const imagen = await metaPropiedad(page, "og:image");
    expect(imagen).toBeTruthy();
    expect(imagen).toMatch(/^https?:\/\//);
  });

  test("cada ficha declara su dirección canónica", async ({ page }) => {
    await page.goto(FICHA_A);
    const canonica = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonica).toContain(FICHA_A);
  });

  test("la vista de categoría tiene título propio, distinto del catálogo", async ({ page }) => {
    await page.goto("/productos");
    const tituloCatalogo = await page.title();

    await page.goto("/productos?categoria=osmosis-inversa");
    const tituloCategoria = await page.title();

    expect(tituloCategoria).toContain("Ósmosis inversa");
    expect(tituloCategoria).not.toBe(tituloCatalogo);
  });
});

test.describe("Mapa del sitio", () => {
  test("escenario 3 · incluye portada, catálogo y fichas publicadas, y ningún borrador", async ({
    request,
  }) => {
    const respuesta = await request.get("/sitemap.xml");
    expect(respuesta.status()).toBe(200);

    const xml = await respuesta.text();
    const direcciones = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((coincidencia) =>
      coincidencia[1] ?? "",
    );

    expect(direcciones.some((d) => d.endsWith("/"))).toBe(true);
    expect(direcciones.some((d) => d.endsWith("/productos"))).toBe(true);
    expect(direcciones.some((d) => d.includes("categoria=osmosis-inversa"))).toBe(true);

    // Las 28 fichas publicadas del juego de datos.
    const fichas = direcciones.filter((d) => /\/productos\/[^?]+$/.test(d));
    expect(fichas).toHaveLength(28);

    // Ningún borrador, y tampoco la categoría que solo contiene borradores.
    expect(xml).not.toContain(EN_BORRADOR);
    expect(xml).not.toContain("categoria=desalinizacion");
  });

  test("robots.txt permite el rastreo y apunta al mapa del sitio", async ({ request }) => {
    const respuesta = await request.get("/robots.txt");
    expect(respuesta.status()).toBe(200);

    const texto = await respuesta.text();
    expect(texto).toContain("Allow: /");
    expect(texto).toContain("Sitemap:");
    expect(texto).toContain("/sitemap.xml");
  });
});
