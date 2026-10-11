import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Auditoría automática de accesibilidad (FR-024, FR-025, SC-003).
 *
 * Una auditoría automática no sustituye a una revisión a mano —no sabe si el
 * texto alternativo de una foto es útil, solo si existe—, pero sí impide que
 * vuelva a colarse un problema ya corregido. Se exige cero incidencias en los
 * niveles A y AA.
 */

const PAGINAS = [
  { nombre: "portada", direccion: "/" },
  { nombre: "catálogo", direccion: "/productos" },
  { nombre: "catálogo filtrado", direccion: "/productos?categoria=osmosis-inversa" },
  { nombre: "catálogo sin resultados", direccion: "/productos?q=zzzzznoexiste" },
  { nombre: "ficha de producto", direccion: "/productos/osmosis-inversa-residencial-75-gpd" },
  { nombre: "ficha sin imagen", direccion: "/productos/microfiltracion-de-cartuchos-en-acero-inoxidable" },
  { nombre: "no encontrado", direccion: "/esto-no-existe" },
] as const;

for (const { nombre, direccion } of PAGINAS) {
  test(`${nombre} no tiene incidencias de accesibilidad A ni AA`, async ({ page }) => {
    await page.goto(direccion);

    const resultado = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const detalle = resultado.violations.map(
      (incidencia) =>
        `${incidencia.id} (${incidencia.impact ?? "sin impacto"}): ${incidencia.help} — ` +
        incidencia.nodes.map((nodo) => nodo.target.join(" ")).join(", "),
    );

    expect(detalle, detalle.join("\n")).toHaveLength(0);
  });
}

test.describe("Operación por teclado (FR-025)", () => {
  test("el salto al contenido es lo primero que recibe el foco", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const enfocado = await page.evaluate(() => document.activeElement?.className ?? "");
    expect(enfocado).toContain("skip-link");
  });

  test("el catálogo se recorre entero con el tabulador", async ({ page }) => {
    await page.goto("/productos");

    const alcanzables = await page.evaluate(() => {
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((elemento) => {
        const estilo = window.getComputedStyle(elemento);
        return estilo.display !== "none" && estilo.visibility !== "hidden";
      }).length;
    });

    // Navegación, filtros, buscador, doce tarjetas, paginación y pie.
    expect(alcanzables).toBeGreaterThan(25);
  });

  test("las miniaturas de la galería se activan con el teclado", async ({ page }) => {
    await page.goto("/productos/osmosis-inversa-residencial-75-gpd");

    const segunda = page.getByRole("button", { name: "Ver fotografía 2 de 3" });
    await segunda.focus();
    await page.keyboard.press("Enter");

    await expect(segunda).toHaveAttribute("aria-pressed", "true");
  });
});
