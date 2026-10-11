import { expect, test } from "@playwright/test";

/**
 * Historia 5 — Continuidad del sitio de marketing (FR-022, FR-023).
 *
 * El sitio aprobado tiene que seguir igual tras el cambio de base técnica:
 * las mismas secciones, las mismas anclas, el mismo hero y el mismo
 * formulario.
 */

const ANCLAS = [
  "inicio",
  "quienes-somos",
  "que-hacemos",
  "servicios",
  "enfoque",
  "marcas",
  "contacto",
] as const;

test.describe("La portada sigue intacta", () => {
  test("carga y conserva las seis secciones con sus anclas", async ({ page }) => {
    const respuesta = await page.goto("/");
    expect(respuesta?.status()).toBe(200);

    for (const ancla of ANCLAS) {
      await expect(page.locator(`#${ancla}`)).toHaveCount(1);
    }
  });

  test("los enlaces de la navegación apuntan a las anclas de la portada", async ({ page }) => {
    await page.goto("/");

    // Por identificador y no por rol: en móvil el menú está plegado y un
    // elemento oculto no aparece en el árbol de accesibilidad.
    const navegacion = page.locator("#navLinks");
    for (const ancla of ANCLAS.filter((a) => a !== "inicio")) {
      await expect(navegacion.locator(`a[href="#${ancla}"]`)).toHaveCount(1);
    }
  });

  test("el menú de móvil se abre, navega y se cierra", async ({ page }) => {
    await page.goto("/");

    const boton = page.locator("#navToggle");
    test.skip(!(await boton.isVisible()), "El menú plegable solo existe en pantallas estrechas");

    await expect(boton).toHaveAttribute("aria-expanded", "false");
    await boton.click();
    await expect(boton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#navLinks")).toHaveClass(/is-open/);

    await page.locator('#navLinks a[href="#servicios"]').click();
    await expect(boton).toHaveAttribute("aria-expanded", "false");

    await boton.click();
    await page.keyboard.press("Escape");
    await expect(boton).toHaveAttribute("aria-expanded", "false");
  });

  test("el hero mantiene la línea del agua al 60 % y el difuminado completo al 90 %", async ({
    page,
  }) => {
    await page.goto("/");

    const foto = page.locator(".hero__photo");
    await expect(foto).toHaveCount(1);

    const estilos = await foto.evaluate((elemento) => {
      const calculado = window.getComputedStyle(elemento);
      return {
        posicion: calculado.backgroundPosition,
        tamanio: calculado.backgroundSize,
        imagen: calculado.backgroundImage,
      };
    });

    expect(estilos.posicion).toBe("50% 60%");
    expect(estilos.tamanio).toBe("cover");
    expect(estilos.imagen).toContain("/img/hero.webp");

    const difuminado = await page.locator(".hero__fade").evaluate((elemento) => {
      return window.getComputedStyle(elemento).backgroundImage;
    });
    expect(difuminado).toContain("90%");
  });

  test("la fotografía del hero se sirve", async ({ request }) => {
    const respuesta = await request.get("/img/hero.webp");
    expect(respuesta.status()).toBe(200);
    expect(respuesta.headers()["content-type"]).toContain("image");
  });

  test("las diez tarjetas de servicio siguen ahí, en orden", async ({ page }) => {
    await page.goto("/");

    const tarjetas = page.locator("#servicios .card");
    await expect(tarjetas).toHaveCount(10);
    await expect(page.getByRole("heading", { name: "Tecnología para cada necesidad" })).toBeVisible();
    await expect(tarjetas.first().getByRole("heading")).toHaveText(
      "Purificación residencial y comercial",
    );
    await expect(tarjetas.last().getByRole("heading")).toHaveText(
      "Mantenimiento y servicio técnico",
    );
  });

  test("los datos de contacto son los de siempre", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('a[href="tel:+50373982967"]').first()).toBeVisible();
    await expect(page.locator('a[href="mailto:ventas@hidrosal.com"]').first()).toBeVisible();
  });
});

test.describe("El formulario de contacto se comporta igual", () => {
  test("valida en español y marca los campos que faltan", async ({ page }) => {
    await page.goto("/#contacto");

    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByText("Escribe tu correo electrónico.")).toBeVisible();
    await expect(page.getByText("Escribe tu teléfono.")).toBeVisible();
    await expect(page.getByText("Cuéntanos qué necesitas.")).toBeVisible();
    await expect(page.getByText("Revisa los campos marcados para continuar.")).toBeVisible();
  });

  test("avisa de un correo o un teléfono mal escritos", async ({ page }) => {
    await page.goto("/#contacto");

    await page.getByLabel("Correo electrónico").fill("esto-no-es-un-correo");
    await page.getByLabel(/^Teléfono/).fill("123");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(page.getByText("El correo no parece válido.")).toBeVisible();
    await expect(page.getByText("El teléfono debe tener al menos 8 dígitos.")).toBeVisible();
  });

  test("la compañía no es obligatoria", async ({ page }) => {
    await page.goto("/#contacto");

    await page.getByLabel("Nombre").fill("Ernesto Mena");
    await page.getByLabel("Correo electrónico").fill("ernesto@ejemplo.com");
    await page.getByLabel(/^Teléfono/).fill("+503 7398 2967");
    await page.getByLabel("Mensaje").fill("Necesito una planta de ósmosis inversa para mi planta.");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(page.getByText("Revisa los campos marcados para continuar.")).toHaveCount(0);
    await expect(page.getByText("Abrimos tu correo con el mensaje listo para enviar.")).toBeVisible();
  });

  test("el campo trampa detiene el envío sin decir nada", async ({ page }) => {
    await page.goto("/#contacto");

    await page.locator("#sitio").fill("soy-un-bot");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(page.getByText("Revisa los campos marcados para continuar.")).toHaveCount(0);
    await expect(page.getByText("Escribe tu nombre.")).toHaveCount(0);
  });

  test("llegar desde una ficha trae la referencia del producto (FR-011)", async ({ page }) => {
    await page.goto("/productos/osmosis-inversa-residencial-75-gpd");
    await page.getByRole("link", { name: "Solicitar asesoría" }).click();

    await expect(page).toHaveURL(/producto=HLS-OSI-001/);
    await expect(page.getByLabel("Mensaje")).toHaveValue(/HLS-OSI-001/);
  });
});
