import { expect, test } from "@playwright/test";

/**
 * Historia 2 — Consultar la ficha de un producto (FR-008 a FR-013).
 *
 * Los identificadores vienen del juego de datos de `prisma/seed.ts`.
 */

const PUBLICADO = "osmosis-inversa-residencial-75-gpd";
const SLUG_HISTORICO = "osmosis-inversa-domestica-75-gpd";
const AGOTADO = "osmosis-inversa-portatil-para-laboratorio";
const SIN_IMAGEN = "microfiltracion-de-cartuchos-en-acero-inoxidable";
const SIN_PRECIO = "planta-de-osmosis-inversa-industrial-4000-gpd";
const EN_BORRADOR = "desalinizadora-costera-de-10-m-por-dia";

test.describe("Ficha de producto", () => {
  test("escenario 1 · galería, descripción y especificaciones", async ({ page }) => {
    await page.goto(`/productos/${PUBLICADO}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Ósmosis inversa residencial 75 GPD",
    );

    // Galería navegable: tres fotografías, con miniaturas accionables.
    const miniaturas = page.getByRole("button", { name: /Ver fotografía/ });
    await expect(miniaturas).toHaveCount(3);
    await miniaturas.nth(1).click();
    await expect(miniaturas.nth(1)).toHaveAttribute("aria-pressed", "true");

    // Tabla de especificaciones con nombre y valor.
    const tabla = page.getByRole("table");
    await expect(tabla).toBeVisible();
    await expect(tabla.getByRole("row")).toHaveCount(4);
    await expect(tabla.getByRole("rowheader", { name: "Producción" })).toBeVisible();
    await expect(tabla.getByRole("cell", { name: "75 galones por día" })).toBeVisible();

    // Precio con la leyenda del IVA.
    await expect(page.getByText("$389.00")).toBeVisible();
    await expect(page.getByText("IVA incluido").first()).toBeVisible();
  });

  test("escenario 2 · la llamada a la acción lleva al contacto con la referencia", async ({
    page,
  }) => {
    await page.goto(`/productos/${PUBLICADO}`);

    const accion = page.getByRole("link", { name: "Solicitar asesoría" });
    await expect(accion).toHaveAttribute("href", "/?producto=HLS-OSI-001#contacto");
    await expect(page.getByText("HLS-OSI-001")).toBeVisible();
  });

  test("escenario 3 · hay relacionados de la misma categoría y se abren", async ({ page }) => {
    await page.goto(`/productos/${PUBLICADO}`);

    const relacionados = page.getByRole("region", { name: /Más de/ });
    await expect(relacionados).toBeVisible();

    const tarjetas = relacionados.locator("article");
    const cuantos = await tarjetas.count();
    expect(cuantos).toBeGreaterThan(0);
    expect(cuantos).toBeLessThanOrEqual(4);

    await tarjetas.first().getByRole("link").click();
    await expect(page).toHaveURL(/\/productos\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("escenario 4 · un producto agotado muestra aviso, no un error", async ({ page }) => {
    const respuesta = await page.goto(`/productos/${AGOTADO}`);
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByText(/Agotado/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Consultar disponibilidad" })).toBeVisible();
  });

  test("escenario 5 · sin precio se lee «Precio a consultar» y se pide cotización", async ({
    page,
  }) => {
    await page.goto(`/productos/${SIN_PRECIO}`);
    await expect(page.getByText("Precio a consultar")).toBeVisible();
    await expect(page.getByRole("link", { name: "Solicitar cotización" })).toBeVisible();
  });

  test("un producto sin imagen usa la de reserva con texto alternativo", async ({ page }) => {
    const respuesta = await page.goto(`/productos/${SIN_IMAGEN}`);
    expect(respuesta?.status()).toBe(200);

    const imagen = page.locator("img").first();
    await expect(imagen).toHaveAttribute("alt", /Fotografía pendiente/);
  });

  test("un identificador histórico redirige de forma permanente al vigente", async ({
    page,
    request,
  }) => {
    // 308 es la redirección permanente que emite Next, equivalente al 301 del
    // contrato para una petición GET.
    const sinSeguir = await request.get(`/productos/${SLUG_HISTORICO}`, { maxRedirects: 0 });
    expect(sinSeguir.status()).toBe(308);
    expect(sinSeguir.headers()["location"]).toContain(`/productos/${PUBLICADO}`);

    const respuesta = await page.goto(`/productos/${SLUG_HISTORICO}`);
    expect(respuesta?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/productos/${PUBLICADO}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Ósmosis inversa residencial 75 GPD",
    );
  });

  test("un producto en borrador responde como inexistente", async ({ page }) => {
    const respuesta = await page.goto(`/productos/${EN_BORRADOR}`);
    expect(respuesta?.status()).toBe(404);
    await expect(page.getByText("No encontramos esta página")).toBeVisible();
  });

  test("un identificador inventado responde 404 con enlace al catálogo", async ({ page }) => {
    const respuesta = await page.goto("/productos/esto-no-existe-en-ningun-sitio");
    expect(respuesta?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Ver el catálogo" })).toBeVisible();
  });
});
