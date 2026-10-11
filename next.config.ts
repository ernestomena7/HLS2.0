import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad fijas, aplicadas a todas las rutas (constitución,
 * principio I). La política de contenido NO va aquí: necesita un `nonce`
 * distinto por petición y se emite desde `middleware.ts`.
 */
const cabecerasDeSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // Salida autocontenida para arrancar con el runtime de Node del alojamiento (decisión D-1).
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: cabecerasDeSeguridad }];
  },
};

export default nextConfig;
