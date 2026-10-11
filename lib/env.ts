import { z } from "zod";

/**
 * Validación de las variables de entorno (decisión D-10, constitución
 * principio I). Un `DATABASE_URL` mal puesto se convierte en un fallo inmediato
 * y legible, no en un error a medianoche.
 *
 * Se validan en dos grupos para que cada parte de la aplicación exija solo lo
 * que de verdad usa: generar los metadatos de una página no debería requerir
 * una base de datos configurada.
 */

const esquemaServidor = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "es obligatoria: la cadena de conexión a MySQL/MariaDB")
    .refine((valor) => valor.startsWith("mysql://") || valor.startsWith("mariadb://"), {
      message: "debe empezar por mysql:// o mariadb://",
    }),
});

const esquemaPublico = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .min(1, "es obligatoria: la dirección pública del sitio")
    .refine((valor) => URL.canParse(valor), {
      message: "debe ser una dirección absoluta, por ejemplo http://localhost:3000",
    })
    .transform((valor) => valor.replace(/\/+$/, "")),
});

export type EntornoServidor = z.infer<typeof esquemaServidor>;
export type EntornoPublico = z.infer<typeof esquemaPublico>;

function validar<T>(esquema: z.ZodType<T>, valores: unknown): T {
  const resultado = esquema.safeParse(valores);

  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((problema) => `  · ${problema.path.join(".")} ${problema.message}`)
      .join("\n");
    throw new Error(
      "Configuración de entorno inválida. Revisá tu archivo .env " +
        `(hay una plantilla en .env.example):\n${detalle}`,
    );
  }

  return resultado.data;
}

let servidor: EntornoServidor | null = null;
let publico: EntornoPublico | null = null;

/** Variables que solo existen en el servidor. Nunca llegan al navegador. */
export function entornoServidor(): EntornoServidor {
  servidor ??= validar(esquemaServidor, { DATABASE_URL: process.env.DATABASE_URL });
  return servidor;
}

/** Variables que la aplicación puede exponer al navegador. */
export function entornoPublico(): EntornoPublico {
  publico ??= validar(esquemaPublico, {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  return publico;
}
