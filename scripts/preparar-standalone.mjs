import { cp, access } from "node:fs/promises";
import { join } from "node:path";

/**
 * Completa la salida `standalone` de Next.
 *
 * `next build` deja en `.next/standalone` el servidor y sus dependencias, pero
 * no copia ni `public/` ni `.next/static`: es responsabilidad de quien
 * despliega. Este paso lo hace, de modo que `node .next/standalone/server.js`
 * sirva el sitio completo tanto en local como en el alojamiento.
 */

const RAIZ = process.cwd();
const DESTINO = join(RAIZ, ".next", "standalone");

try {
  await access(join(DESTINO, "server.js"));
} catch {
  console.error(
    'No existe .next/standalone/server.js. ¿Se ejecutó "next build" con output: "standalone"?',
  );
  process.exit(1);
}

await cp(join(RAIZ, "public"), join(DESTINO, "public"), { recursive: true });
await cp(join(RAIZ, ".next", "static"), join(DESTINO, ".next", "static"), { recursive: true });

console.warn("Salida standalone lista: node .next/standalone/server.js");
