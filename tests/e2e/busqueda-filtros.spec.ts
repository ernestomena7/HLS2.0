import { expect, test } from "@playwright/test";

/**
 * Historia 3 — Filtrar y buscar dentro del catálogo (FR-004 a FR-007).
 *
 * Sobre el juego de datos de `prisma/seed.ts`: 8 productos publicados en
 * ósmosis inversa, 7 en repuestos y consumibles, y la categoría
 * «desalinización» sin ninguno publicado.
 */

type Pagina = import("@playwright/test").Page;

const nombres = (pagina: Pagina) => pagina.locator("article h3").allTextContents();

/** Enlace del filtro de categorías, acotado para no chocar con las tarjetas. */
const filtro = (pagina: Pagina, nombre: RegExp | string) =>
  pagina.getByRole("navigation", { name: "Filtrar por categoría" }).getByRole("link", { name: nombre });

test.describe("Filtro por categoría", () => {
  test("escenario 1 · solo quedan los productos de la categoría, y el filtro se ve aplicado", async ({
    page,
  }) => {
    await page.goto("/productos?categoria=osmosis-inversa");

    await expect(filtro(page, /^Ósmosis inversa/)).toHaveAttribute("aria-current", "true");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ósmosis inversa");
    await expect(page.locator("article")).toHaveCount(8);

    for (const nombre of await nombres(page)) {
      expect(nombre.toLowerCase()).toContain("smosis");
    }
  });

  test("una categoría sin productos publicados avisa, no da error", async ({ page }) => {
    const respuesta = await page.goto("/productos?categoria=desalinizacion");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByText("Todavía no hay productos en esta categoría")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver el catálogo completo" })).toBeVisible();
  });

  test("una categoría inexistente muestra el catálogo completo con aviso", async ({ page }) => {
    const respuesta = await page.goto("/productos?categoria=inexistente");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByText("La categoría que pediste no existe")).toBeVisible();
    await expect(page.locator("article")).toHaveCount(12);
  });
});

test.describe("Búsqueda por texto", () => {
  test("escenario 2 · no distingue mayúsculas ni acentos", async ({ page }) => {
    const resultados: string[][] = [];

    for (const termino of ["osmosis", "OSMOSIS", "ósmosis", "Ósmosis"]) {
      await page.goto(`/productos?q=${encodeURIComponent(termino)}`);
      resultados.push(await nombres(page));
    }

    const [primero] = resultados;
    expect(primero?.length).toBeGreaterThan(0);
    for (const resultado of resultados) {
      expect(resultado).toEqual(primero);
    }
  });

  test("escenario 3 · sin coincidencias hay mensaje y camino de vuelta", async ({ page }) => {
    await page.goto("/productos?q=zzzzznoexiste");
    await expect(page.getByText("No encontramos coincidencias")).toBeVisible();
    await expect(page.getByText("zzzzznoexiste")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver el catálogo completo" })).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);
  });

  test("el buscador funciona como formulario y conserva lo escrito", async ({ page }) => {
    await page.goto("/productos");

    await page.getByLabel("Buscar un producto").fill("membrana");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page).toHaveURL(/q=membrana/);
    await expect(page.getByLabel("Buscar un producto")).toHaveValue("membrana");
    await expect(page.locator("article")).toHaveCount(1);
  });
});

test.describe("Combinación de filtro y búsqueda", () => {
  test("son acumulativos y devuelven la intersección", async ({ page }) => {
    await page.goto("/productos?categoria=repuestos-y-consumibles&q=cartucho");

    const encontrados = await nombres(page);
    expect(encontrados.length).toBeGreaterThan(0);
    for (const nombre of encontrados) {
      expect(nombre.toLowerCase()).toContain("cartucho");
    }

    await expect(filtro(page, /^Repuestos y consumibles/)).toHaveAttribute("aria-current", "true");
  });

  test("cambiar el filtro vuelve a la página 1", async ({ page }) => {
    await page.goto("/productos?pagina=2");
    await filtro(page, /^Ósmosis inversa/).click();

    await expect(page).toHaveURL("/productos?categoria=osmosis-inversa");
    await expect(page).not.toHaveURL(/pagina=/);
  });

  test("escenario 4 · compartir o recargar la dirección da los mismos resultados", async ({
    page,
  }) => {
    const direccion = "/productos?categoria=repuestos-y-consumibles&q=cartucho&pagina=1";

    await page.goto(direccion);
    const primera = await nombres(page);

    await page.reload();
    expect(await nombres(page)).toEqual(primera);

    await page.goto("/productos");
    await page.goto(direccion);
    expect(await nombres(page)).toEqual(primera);
  });

  test("una página fuera de rango con filtro devuelve la última con resultados", async ({
    page,
  }) => {
    await page.goto("/productos?categoria=osmosis-inversa&pagina=999");
    await expect(page.locator("article")).not.toHaveCount(0);
  });
});
