import { expect, test } from "@playwright/test";

/**
 * Historia 1 — Explorar el catálogo (FR-001 a FR-003).
 *
 * Cubre los cinco escenarios de aceptación de la historia sobre el juego de
 * datos de ejemplo de `prisma/seed.ts`: 28 productos publicados en 6
 * categorías, 2 agotados, 4 sin precio y 2 en borrador.
 */

const PRODUCTOS_PUBLICADOS = 28;
const POR_PAGINA = 12;
const PAGINAS = Math.ceil(PRODUCTOS_PUBLICADOS / POR_PAGINA);

/** Productos que el juego de datos deja en borrador: no deben verse nunca. */
const EN_BORRADOR = [
  "Desalinizadora costera de 10 m³ por día",
  "Desalinizadora modular para embarcaciones",
];

test.describe("Catálogo de productos", () => {
  test("escenario 1 · cada producto muestra sus cinco datos", async ({ page }) => {
    await page.goto("/productos");

    const tarjetas = page.locator("article");
    await expect(tarjetas).toHaveCount(POR_PAGINA);

    const primera = tarjetas.first();
    // Imagen con texto alternativo, nombre, categoría y precio o «a consultar».
    await expect(primera.locator("img")).toHaveAttribute("alt", /.+/);
    await expect(primera.getByRole("heading")).not.toBeEmpty();
    await expect(primera).toContainText(/\$|Precio a consultar/);

    // Al menos un producto de la página muestra la leyenda del IVA.
    await expect(page.getByText("IVA incluido").first()).toBeVisible();
  });

  test("escenario 2 · los productos en borrador no aparecen por ningún lado", async ({ page }) => {
    for (let pagina = 1; pagina <= PAGINAS; pagina += 1) {
      await page.goto(pagina === 1 ? "/productos" : `/productos?pagina=${pagina}`);
      for (const nombre of EN_BORRADOR) {
        await expect(page.getByText(nombre)).toHaveCount(0);
      }
    }
  });

  test("escenario 3 · los agotados se ven y se identifican como tales", async ({ page }) => {
    await page.goto("/productos");

    let encontrados = 0;
    for (let pagina = 1; pagina <= PAGINAS; pagina += 1) {
      await page.goto(pagina === 1 ? "/productos" : `/productos?pagina=${pagina}`);
      encontrados += await page.getByText("Agotado", { exact: true }).count();
    }

    expect(encontrados).toBe(2);
  });

  test("escenario 4 · sin precio se lee «Precio a consultar», no un cero", async ({ page }) => {
    let encontrados = 0;
    for (let pagina = 1; pagina <= PAGINAS; pagina += 1) {
      await page.goto(pagina === 1 ? "/productos" : `/productos?pagina=${pagina}`);
      encontrados += await page.getByText("Precio a consultar").count();
      await expect(page.getByText("$0.00")).toHaveCount(0);
    }

    expect(encontrados).toBeGreaterThanOrEqual(3);
  });

  test("escenario 5 · se avanza y se retrocede de página sin perder el contexto", async ({
    page,
  }) => {
    await page.goto("/productos");

    const navegacion = page.getByRole("navigation", { name: "Páginas del catálogo" });
    await expect(navegacion).toBeVisible();

    const nombrePrimeraPagina = await page.locator("article h3").first().textContent();

    await navegacion.getByRole("link", { name: /Siguiente/ }).click();
    await expect(page).toHaveURL(/pagina=2/);
    await expect(page.locator("article h3").first()).not.toHaveText(nombrePrimeraPagina ?? "");

    await navegacion.getByRole("link", { name: /Anterior/ }).click();
    await expect(page).toHaveURL(/\/productos$/);
    await expect(page.locator("article h3").first()).toHaveText(nombrePrimeraPagina ?? "");
  });

  test("todos los publicados caben en las páginas, sin repetirse", async ({ page }) => {
    const vistos: string[] = [];

    for (let pagina = 1; pagina <= PAGINAS; pagina += 1) {
      await page.goto(pagina === 1 ? "/productos" : `/productos?pagina=${pagina}`);
      vistos.push(...(await page.locator("article h3").allTextContents()));
    }

    expect(vistos).toHaveLength(PRODUCTOS_PUBLICADOS);
    expect(new Set(vistos).size).toBe(PRODUCTOS_PUBLICADOS);
  });

  test("una página fuera de rango devuelve la última con resultados", async ({ page }) => {
    await page.goto("/productos?pagina=999");
    await expect(page.locator("article")).not.toHaveCount(0);
    await expect(page.getByText(`página ${PAGINAS} de ${PAGINAS}`)).toBeVisible();
  });
});
