# Hidrosal (HLS) — Sitio y tienda en línea

Aplicación de **Hidrosal**, empresa salvadoreña de purificación y tratamiento de
agua por ósmosis inversa (residencial, comercial, industrial e institucional).

Reúne el sitio corporativo —pensado para generar contactos y leads— y el
catálogo público de productos. Es la **entrega 1 de 3**: las siguientes añaden
carrito y pago, y después la administración de productos y usuarios.

## Qué incluye hoy

- **Portada** con las seis secciones aprobadas: quiénes somos, qué hacemos,
  servicios (10 tarjetas), nuestro enfoque, marcas y contacto.
- **Hero con parallax**: fotografía de un río con montañas boscosas
  (`public/img/hero.webp`, 1600×898). La imagen está recortada para que la línea
  del agua caiga al **60 %** de su altura y se ancla con
  `background-position: 50% 60%`, de modo que queda al **60 %** del hero en
  cualquier pantalla; desde ahí un difuminado la funde con el fondo al **90 %**.
- **Formulario de contacto** con validación en español (nombre, correo,
  teléfono, compañía opcional y mensaje) y campo trampa anti-spam. Si se llega
  desde la ficha de un producto, el mensaje arranca con su referencia.
- **Catálogo** en `/productos`: rejilla paginada de doce en doce, filtro por
  categoría y búsqueda que no distingue mayúsculas ni acentos.
- **Ficha de producto** en `/productos/{slug}`: galería, descripción, tabla de
  especificaciones, precio o «Precio a consultar», relacionados y llamada a la
  acción. Las direcciones antiguas siguen funcionando mediante redirección.
- **Descubrimiento**: metadatos propios por página, mapa del sitio sin
  borradores y `robots.txt`.
- **Tema claro**: fondo blanco, tipografía azul marino y acentos de agua. Toda
  la paleta vive en los tokens de `:root` en `app/globals.css`.

## Pila técnica

| Pieza | Elección |
|-------|----------|
| Aplicación | Next.js 16 (App Router) con React 19, renderizado en servidor |
| Lenguaje | TypeScript 6 en modo estricto, sobre Node.js 22 LTS |
| Base de datos | MySQL 8 o MariaDB 10.6+, solo a través de Prisma 7 |
| Validación | Zod 4 en los límites: parámetros de la dirección y variables de entorno |
| Pruebas | Vitest (unidad) y Playwright (extremo a extremo) |
| Empaquetado | `output: "standalone"`, para arrancar con el runtime de Node del alojamiento |

Las decisiones y sus alternativas están razonadas en
[`specs/001-catalogo-productos/research.md`](specs/001-catalogo-productos/research.md),
y las reglas que el proyecto no negocia, en
[`.specify/memory/constitution.md`](.specify/memory/constitution.md).

## Estructura

```text
app/                  Rutas: portada, catálogo, ficha, mapa del sitio y robots
components/
  marketing/          Secciones de la portada, navegación y pie de página
  catalogo/           Tarjeta, filtros, buscador, paginación, galería…
lib/                  Acceso a datos, validación, precio y normalización de texto
prisma/               Esquema, migraciones versionadas y datos de ejemplo
public/img/           Fotografías servidas tal cual
scripts/              Preparación de la salida standalone
tests/unit/           Vitest
tests/e2e/            Playwright
specs/                Especificación, plan, contratos y tareas de cada entrega
```

## Puesta en marcha

```bash
npm install

cp .env.example .env         # y completar DATABASE_URL y NEXT_PUBLIC_SITE_URL
npx prisma migrate dev       # crea el esquema
npx prisma db seed           # datos de ejemplo: 6 categorías y 30 productos

npm run dev                  # http://localhost:3000
```

Ningún secreto se versiona: `.env` está ignorado y `.env.example` documenta las
variables con el valor vacío.

## Puertas de calidad

```bash
npm run typecheck   # TypeScript estricto
npm run lint        # ESLint: prohíbe any y @ts-ignore en app/, components/ y lib/
npm run test        # Vitest
npm run test:e2e    # Playwright (necesita la base sembrada)
npm run build       # compilación de producción
```

Las cinco deben pasar antes de fusionar.

> En una máquina sin acceso a la descarga de navegadores de Playwright, se puede
> apuntar a un Chromium ya instalado con `CHROMIUM_EXECUTABLE=/ruta/al/chrome`.

## Despliegue

El plan de alojamiento **debe ejecutar Node**; un hosting compartido solo con
PHP no puede servir esta aplicación. Es el riesgo R-1 de `research.md` y
conviene confirmarlo antes que nada.

```bash
npm ci
npx prisma migrate deploy    # paso explícito y previo: nunca al arrancar la app
npm run build                # compila y prepara .next/standalone
npm start                    # node .next/standalone/server.js
```

`npm run build` deja en `.next/standalone` un servidor autocontenido, y el paso
`postbuild` le copia `public/` y `.next/static`, que Next no copia por su
cuenta. El proceso escucha en el puerto de la variable `PORT` (3000 por
defecto).

El orden importa: las migraciones van **antes** de compilar y arrancar, nunca
disparadas por el arranque de la aplicación (decisión D-12). Así el paso es
revisable y reversible, y no puede ejecutarse dos veces en paralelo.

El mapa del sitio se genera al compilar y se refresca cada hora, así que
conviene que la base ya tenga su contenido cuando se ejecuta `npm run build`.

### Medir el rendimiento

```bash
node scripts/medir-rendimiento.mjs          # contra el servidor ya levantado
SEMILLA_CARGA=1 npx prisma db seed          # 200 productos y 10 categorías
```

Simula una conexión 4G de gama media y un procesador cuatro veces más lento, e
informa del tiempo hasta el contenido principal y del desplazamiento acumulado.
Las cifras de la última medición están en
[`specs/001-catalogo-productos/quickstart.md`](specs/001-catalogo-productos/quickstart.md).

### Imágenes

La optimización de imágenes de Next necesita **`sharp`** instalado en el
servidor; ya está entre las dependencias. Si el alojamiento no lo admitiera, el
plan B documentado (decisión D-7) es servir imágenes preoptimizadas sin el
optimizador, conservando ancho y alto declarados para que nada salte mientras
cargan.

### Seguridad

Las cabeceras fijas se emiten desde `next.config.ts` y la política de contenido,
con un `nonce` distinto por petición, desde `proxy.ts`. Por eso las páginas se
renderizan en cada petición en lugar de hornearse en la compilación: un HTML
horneado llevaría un `nonce` caducado y el navegador bloquearía todos los
guiones (decisión D-14).

## Lo que falta

- Sustituir los datos de ejemplo por el catálogo real, con sus fotografías.
- Reemplazar los marcadores `Marca 01…08` por los logotipos reales.
- Conectar el formulario a un servicio de recepción: hoy, sin `FORM_ENDPOINT`
  configurado, abre el correo del visitante hacia ventas@hidrosal.com.
- Confirmar el motor y la versión de base de datos del alojamiento (riesgo R-2).

## Contacto de la empresa

+503 7398 2967 · ventas@hidrosal.com
