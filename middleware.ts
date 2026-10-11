import { NextResponse, type NextRequest } from "next/server";

/**
 * Política de seguridad de contenido con `nonce` por petición.
 *
 * Next inserta en línea el guion de arranque y los datos de hidratación de cada
 * página. Firmarlos con un `nonce` permite mantener `script-src` sin
 * `unsafe-inline`, que es la vía por la que de verdad se explota una inyección.
 * El coste es que las páginas se renderizan de forma dinámica: matiza la
 * revalidación periódica de la decisión D-6, y queda documentado en el README.
 *
 * Los estilos sí llevan `unsafe-inline`: el sitio de marketing aprobado usa
 * atributos `style` en línea y `next/font` inyecta su propia hoja.
 */
export function middleware(peticion: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const politica = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const cabeceras = new Headers(peticion.headers);
  cabeceras.set("x-nonce", nonce);
  cabeceras.set("Content-Security-Policy", politica);

  const respuesta = NextResponse.next({ request: { headers: cabeceras } });
  respuesta.headers.set("Content-Security-Policy", politica);
  return respuesta;
}

export const config = {
  matcher: [
    // Todas las rutas de página; se excluyen los recursos estáticos y las
    // peticiones de prefetch, que no ejecutan guiones.
    {
      source: "/((?!_next/static|_next/image|favicon.ico|img/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
