import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

import { entornoServidor } from "@/lib/env";

/**
 * Cliente único de Prisma por proceso.
 *
 * En desarrollo, Next recarga los módulos en cada cambio; sin esta caché en
 * `globalThis` cada recarga abriría un grupo de conexiones nuevo y agotaría las
 * del servidor de base de datos.
 *
 * Prisma 7 exige un adaptador de controlador: `PrismaMariaDb` sirve tanto para
 * MySQL 8 como para MariaDB 10.6+, que es el riesgo R-2 ya cubierto.
 */
function crearCliente(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaMariaDb(entornoServidor().DATABASE_URL),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const cache = globalThis as typeof globalThis & { prisma?: PrismaClient };

export const db: PrismaClient = cache.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  cache.prisma = db;
}
