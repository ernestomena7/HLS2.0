import { chromium } from "playwright";

/**
 * Mide los criterios de éxito SC-004 y SC-007 sobre el servidor ya levantado.
 *
 * Simula una conexión 4G de gama media (1.6 Mb/s de bajada, 150 ms de ida y
 * vuelta) y un procesador cuatro veces más lento, que es lo que se parece a un
 * teléfono de gama media. De cada página informa:
 *
 *   · LCP — cuándo se ve el contenido principal. SC-004 pide menos de 2,5 s.
 *   · CLS — cuánto salta el diseño mientras carga. SC-004 pide menos de 0,1.
 *
 * Uso: node scripts/medir-rendimiento.mjs [direccion-base]
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const EJECUTABLE = process.env.CHROMIUM_EXECUTABLE;

const PAGINAS = [
  ["portada", "/"],
  ["catálogo", "/productos"],
  ["catálogo, página 2", "/productos?pagina=2"],
  ["ficha", "/productos/osmosis-inversa-residencial-75-gpd"],
];

const LIMITE_LCP = 2500;
const LIMITE_CLS = 0.1;

const navegador = await chromium.launch(
  EJECUTABLE === undefined ? {} : { executablePath: EJECUTABLE },
);

/** Devuelve { lcp, cls } de una carga en frío. */
async function medir(direccion) {
  const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  const pagina = await contexto.newPage();
  const cdp = await contexto.newCDPSession(pagina);

  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await pagina.addInitScript(() => {
    window.__metricas = { lcp: 0, cls: 0 };
    new PerformanceObserver((lista) => {
      for (const entrada of lista.getEntries()) {
        window.__metricas.lcp = entrada.startTime;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((lista) => {
      for (const entrada of lista.getEntries()) {
        if (!entrada.hadRecentInput) {
          window.__metricas.cls += entrada.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await pagina.goto(BASE + direccion, { waitUntil: "load" });
  await pagina.waitForTimeout(3000);

  const metricas = await pagina.evaluate(() => window.__metricas);
  await contexto.close();
  return metricas;
}

console.log(`Midiendo contra ${BASE} · 4G de gama media, procesador 4× más lento\n`);
console.log("página                  LCP        CLS");
console.log("──────────────────────────────────────────");

let todoBien = true;

for (const [nombre, direccion] of PAGINAS) {
  // Una carga previa para no medir el arranque en frío del servidor.
  await medir(direccion);
  const { lcp, cls } = await medir(direccion);

  const lcpOk = lcp > 0 && lcp < LIMITE_LCP;
  const clsOk = cls < LIMITE_CLS;
  todoBien &&= lcpOk && clsOk;

  console.log(
    `${nombre.padEnd(22)} ${`${Math.round(lcp)} ms`.padEnd(9)} ${cls.toFixed(4).padEnd(8)}` +
      ` ${lcpOk ? "✓" : "✗"} ${clsOk ? "✓" : "✗"}`,
  );
}

console.log("──────────────────────────────────────────");
console.log(`Umbrales: LCP < ${LIMITE_LCP} ms · CLS < ${LIMITE_CLS}`);
console.log(todoBien ? "SC-004: se cumple." : "SC-004: NO se cumple.");

await navegador.close();
process.exitCode = todoBien ? 0 : 1;
