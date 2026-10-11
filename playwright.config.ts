import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3000";

/**
 * Ruta a un Chromium ya instalado en la máquina. Se usa en entornos sin acceso
 * a la descarga de navegadores de Playwright; si no se define, Playwright usa
 * el suyo, que es lo normal en desarrollo y en integración continua.
 */
const chromium = process.env.CHROMIUM_EXECUTABLE;
const navegador = chromium === undefined ? {} : { launchOptions: { executablePath: chromium } };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    locale: "es-SV",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], ...navegador } },
    { name: "movil", use: { ...devices["Pixel 7"], ...navegador } },
  ],
  webServer: {
    command: "npm run start",
    // Se comprueba el catálogo y no la raíz: es la ruta que de verdad indica
    // que el servidor está listo, porque además toca la base de datos.
    url: `${baseURL}/productos`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
