import { existsSync } from "node:fs";

import { defineConfig, env } from "@prisma/config";

// Prisma 7 ya no carga `.env` por su cuenta. Node 22 sabe hacerlo sin
// dependencias, y la aplicación lo sigue cargando por su cuenta en `next dev`.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

/**
 * Configuración de la CLI de Prisma.
 *
 * Desde Prisma 7 la cadena de conexión ya no vive en `schema.prisma`: las
 * órdenes de migración la toman de aquí, y la aplicación en ejecución la recibe
 * a través del adaptador de `lib/db.ts`. `DATABASE_URL` sigue siendo la única
 * variable que la aporta, y nunca se versiona (constitución, principio I).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
