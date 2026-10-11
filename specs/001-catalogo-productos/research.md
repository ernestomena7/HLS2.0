# Fase 0 — Investigación y decisiones técnicas

**Feature**: 001 Catálogo y detalle de producto · **Fecha**: 2026-10-11

Las versiones citadas se comprobaron contra el registro de npm el 2026-10-11, no de memoria.

---

## D-1 · Base de la aplicación: Next.js con App Router

**Decisión**: Next.js 16.4 con App Router y React 19.3, renderizado en servidor, empaquetado con
`output: "standalone"`.

**Razón**: el catálogo necesita leer de MySQL y producir metadatos por página para buscadores
(FR-014, FR-015), lo que exige servidor. El App Router permite que las páginas de catálogo y
ficha sean componentes de servidor que consultan la base directamente, sin inventar una capa de
API intermedia que nadie más consume. `standalone` produce un servidor autocontenido que arranca
con `node server.js`, que es exactamente lo que ofrece un alojamiento con Node.

**Alternativas consideradas**:

- *Export estático más API aparte*: rechazada. Obligaría a alojar y pagar dos cosas, y el
  catálogo dejaría de ser renderizable en servidor, perdiendo buena parte del beneficio de SEO.
- *Pages Router*: rechazada. Es el camino heredado; el App Router es el soportado para
  componentes de servidor y metadatos generados.

---

## D-2 · Acceso a datos: Prisma 7.10 sobre MySQL

**Decisión**: Prisma como único camino a la base de datos. Se fija **la línea 7 estable**
(`prisma` y `@prisma/client` en 7.10.0), no la etiqueta `latest`.

**Razón**: hoy la etiqueta `latest` del paquete `prisma` apunta a `8.0.0-rc.22`, una candidata de
versión, mientras que `@prisma/client` estable está en `7.10.0`. Instalar con `latest` dejaría
CLI y cliente descuadrados y metería una versión no estable en un proyecto de cliente. La
constitución exige migraciones versionadas y prohíbe SQL concatenado (principio III); Prisma da
ambas cosas con tipos derivados del esquema.

**Alternativas consideradas**:

- *Prisma 8 RC*: rechazada por no estable.
- *Drizzle o SQL a mano*: rechazada. Drizzle es razonable, pero Prisma tiene mejor soporte de
  migraciones reversibles y el equipo no gana nada cambiando de herramienta a mitad de proyecto.

---

## D-3 · Búsqueda insensible a mayúsculas y acentos

**Decisión**: guardar en la tabla de producto una columna derivada `nombre_normalizado` (minúsculas
y sin diacríticos, calculada en la aplicación al escribir) y buscar sobre ella con `LIKE`, con
índice propio.

**Razón**: FR-005 exige que "ósmosis", "OSMOSIS" y "osmosis" devuelvan lo mismo. Delegar eso a la
intercalación de la base ata el resultado al motor concreto: MySQL 8 trae
`utf8mb4_0900_ai_ci` (insensible a acentos) pero MariaDB —muy común en Hostinger— no la tiene, y
el comportamiento cambiaría entre el entorno local y producción. Normalizar en la aplicación
produce el mismo resultado en cualquier motor y es verificable con pruebas unitarias.

**Alternativas consideradas**:

- *Depender de la intercalación de la base*: rechazada por no ser portátil entre MySQL y MariaDB.
- *Índice de texto completo (`FULLTEXT`)*: rechazada por ahora. Aporta relevancia y búsqueda por
  palabras, pero la especificación solo pide coincidencia por nombre, y `FULLTEXT` se comporta
  distinto entre MySQL y MariaDB. Queda como mejora si el catálogo crece mucho.

---

## D-4 · Direcciones estables y cambios de nombre

**Decisión**: tabla `ProductSlugHistory` con los identificadores legibles antiguos apuntando al
producto. Si una dirección no corresponde al slug actual pero sí a uno histórico, se responde con
una redirección permanente al slug vigente.

**Razón**: FR-013 y SC-006 exigen que una dirección publicada no se rompa cuando el producto
cambia de nombre. Guardar el histórico es la forma barata de cumplirlo sin perder el valor que la
dirección ya acumuló en buscadores.

**Alternativas consideradas**:

- *Slug inmutable*: rechazada. Obliga a vivir con erratas y nombres viejos para siempre.
- *Redirecciones a mano en configuración*: rechazada. No escala y se olvida; además, la
  administración de la entrega 3 renombrará productos sin tocar código.

---

## D-5 · Dinero

**Decisión**: `DECIMAL(10,2)` en la base, tipo decimal de Prisma en el dominio, y formato de
presentación con `Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" })`. El valor
guardado es el precio final con IVA incluido (FR-028) y es **opcional** (FR-029).

**Razón**: el principio III prohíbe flotantes para dinero. `DECIMAL(10,2)` cubre hasta
99.999.999,99 dólares, de sobra para equipos industriales. La nulabilidad del campo es la que
expresa "Precio a consultar", sin inventar un valor centinela como 0 o -1 que alguien acabaría
mostrando por error.

**Alternativas consideradas**:

- *Enteros en centavos*: válida y usada en muchos comercios, pero obliga a convertir en cada
  lectura y escritura; `DECIMAL` ya es exacto y se lee igual que en la factura.
- *Campo `precio` con 0 para "a consultar"*: rechazada. Un cero es un precio válido y confundirlo
  con la ausencia de precio es exactamente la clase de error que la especificación quiere evitar.

---

## D-6 · Estrategia de renderizado y caché

**Decisión**: catálogo y ficha como componentes de servidor. La ficha y el listado sin parámetros
se regeneran por tiempo (revalidación periódica); el listado con filtro, búsqueda o página se
resuelve en cada petición.

> **Matizada por la decisión D-14**: la política de seguridad de contenido obliga a renderizar
> cada página por petición, así que la revalidación periódica actúa sobre los datos y no sobre el
> HTML completo. El ahorro contra la base de datos se mantiene; la caché de página entera, no.

**Razón**: el catálogo cambia poco y se lee mucho: regenerar por tiempo da páginas rápidas y
metadatos correctos. Las combinaciones de filtro y búsqueda son demasiadas para precalcularlas y
baratas de resolver. En un servidor Node propio la caché de regeneración vive en el disco del
servidor, lo que funciona siempre que el proceso tenga un directorio escribible y persistente —
verificado como parte del riesgo R-1.

**Alternativas consideradas**:

- *Todo dinámico*: más simple, pero desperdicia trabajo repetido en las páginas más visitadas.
- *Todo estático en compilación*: rechazada. Obligaría a recompilar y desplegar cada vez que la
  entrega 3 cambie un producto.

---

## D-7 · Imágenes

**Decisión**: `next/image` con los archivos en `public/img/`, siempre con dimensiones declaradas
y `sizes` acorde a la rejilla; `sharp` instalado en el servidor para la optimización.

**Razón**: FR-026 y SC-004 exigen que el contenido no salte durante la carga, lo que se consigue
reservando el espacio con ancho y alto conocidos. `sharp` es la dependencia que Next usa para
redimensionar en un servidor propio.

**Alternativas consideradas**:

- *Etiquetas `img` sin optimizador*: queda como plan B documentado si el alojamiento no admite
  `sharp`; mantiene las dimensiones declaradas y, por tanto, el cumplimiento de FR-026, a costa
  de servir imágenes más pesadas.
- *Servicio externo de imágenes*: rechazada. Añade proveedor y coste, y la constitución pide no
  atarse a servicios propietarios sin necesidad.

---

## D-8 · Tipografías

**Decisión**: servir Outfit e Inter desde la propia aplicación con el cargador de fuentes de Next,
en lugar del enlace a Google Fonts que usa el sitio estático actual.

**Razón**: elimina una petición a un tercero en la ruta crítica, mejora el tiempo de primer
contenido y evita que el sitio dependa de la disponibilidad de un dominio externo. El aspecto no
cambia: son las mismas familias y los mismos pesos.

**Alternativas consideradas**:

- *Mantener el enlace externo*: funciona, pero penaliza SC-004 y añade una dependencia de red que
  no hace falta.

---

## D-9 · Estilos

**Decisión**: trasladar `assets/css/styles.css` tal cual a `app/globals.css`, conservando los
tokens de `:root`, y escribir los estilos nuevos del catálogo en módulos CSS que consuman esos
mismos tokens.

**Razón**: el diseño ya está aprobado por el cliente (FR-023). Introducir un framework de
utilidades obligaría a reescribir lo aprobado y a revisarlo de nuevo, con riesgo de desviación
visual y cero beneficio funcional.

**Alternativas consideradas**:

- *Tailwind u otro framework de utilidades*: rechazada por lo anterior. Si el proyecto crece
  mucho, es una migración posible más adelante, no ahora.

---

## D-10 · Validación de entrada y de entorno

**Decisión**: Zod 4.6 para los parámetros de catálogo (`q`, `categoria`, `pagina`) y para las
variables de entorno, validadas al arrancar el proceso.

**Razón**: principios I y II. Los parámetros llegan de la dirección, es decir, de fuera, y hay que
tratarlos como no confiables: limitar longitud, descartar páginas no numéricas y categorías
inexistentes antes de tocar la base. Validar el entorno al arrancar convierte un
`DATABASE_URL` mal puesto en un fallo inmediato y legible, no en un error a medianoche.

---

## D-11 · Pruebas

**Decisión**: Vitest 5 para unidad y Playwright 1.64 para extremo a extremo.

**Razón**: el principio V pide concentrar el esfuerzo donde duele. Unidad sobre formato de precio,
regla de "Precio a consultar", normalización de búsqueda, cálculo de paginación y resolución de
slug histórico. Extremo a extremo sobre dos recorridos: catálogo → filtro → ficha → llamada a la
acción, y la continuidad del sitio de marketing. Playwright ya está instalado en el entorno de
trabajo de este repositorio.

---

## D-12 · Despliegue y migraciones

**Decisión**: compilar con `output: "standalone"`, arrancar con el servidor de Node, y aplicar
migraciones con `prisma migrate deploy` como paso explícito previo al arranque, nunca
automáticamente al iniciar la aplicación.

**Razón**: una migración disparada por el arranque puede ejecutarse varias veces en paralelo o a
destiempo. Como paso explícito, es revisable y reversible, que es lo que pide el principio III.

---

## D-13 · Versión de TypeScript: línea 6 estable, no la 7

**Decisión**: fijar `typescript` en **6.0.3** en lugar de la 7.0.2 que la etiqueta `latest`
sirve hoy.

**Razón**: descubierto al configurar las puertas de calidad (tarea T005). `typescript-eslint`
8.71.1 —el analizador que arrastra `eslint-config-next` 16.4.0— declara
`typescript: ">=4.8.4 <6.1.0"` y aborta con «typescript-eslint does not support TS 7.0». Con
TypeScript 7 instalado, `npm run lint` no arranca siquiera, así que la prohibición de `any` y de
`@ts-ignore` que el principio II exige dejaría de ser verificable. Entre tener el compilador más
nuevo sin análisis estático, y tener la última línea estable con todo el encadenado funcionando,
el principio II decide: la regla tiene que ser ejecutable, no solo escrita.

**Consecuencia**: el modo estricto, `noUncheckedIndexedAccess` y el resto de la configuración de
`tsconfig.json` son idénticos en la línea 6; no se pierde ninguna garantía de tipado. Lo que se
posterga es el compilador nativo de la 7, que es una mejora de velocidad, no de seguridad de
tipos.

**Cuándo revisarlo**: cuando `typescript-eslint` publique soporte de TypeScript ≥ 7.1
(seguimiento en el incidente 10940 de su repositorio). Subir entonces es cambiar una línea de
`package.json`.

**Alternativas consideradas**:

- *Quedarse en TypeScript 7 y renunciar a `typescript-eslint`*: rechazada. Dejaría `any` sin
  vigilancia, que es exactamente lo que el principio II prohíbe.
- *Instalar las dos líneas en paralelo*: rechazada por complejidad sin beneficio: dos
  compiladores en el proyecto para ganar velocidad de compilación en local.

---

## D-14 · La política de seguridad obliga a renderizar en cada petición

**Decisión**: todas las páginas se renderizan por petición. La caché deja de
estar en la página entera y pasa a estar en los datos.

**Razón**: descubierto al migrar la portada (tarea T064). La política de
seguridad de contenido firma los guiones de Next con un `nonce` distinto en
cada petición, que es lo que permite prohibir `unsafe-inline` en `script-src`.
Una página horneada en la compilación lleva dentro el `nonce` de aquel momento,
que ya no coincide con el de la cabecera: el navegador rechazó los doce guiones
de la portada y la página quedó **sin hidratar**, es decir, sin menú en móvil,
sin validación del formulario, sin galería y sin parallax. Medido, no supuesto:
doce errores de política en la consola y `window.next` ausente.

Las rutas de catálogo y ficha ya se resolvían por petición —llevan parámetros y
dirección variable— y hidrataban sin un solo bloqueo. Solo había que alinear la
portada y la página de «no encontrado», y por eso existe también la ruta
comodín `app/[...rutas]/page.tsx`: sin ella Next serviría la página de error
horneada en la compilación.

**Qué se pierde y qué no**: se pierde la caché de HTML completo que proponía la
decisión D-6. No se pierde el ahorro de trabajo contra la base de datos: las
consultas conservan su revalidación, así que el catálogo no vuelve a consultar
MySQL en cada visita. La portada no consulta nada: es marcado puro y
renderizarla cuesta microsegundos.

**Alternativas consideradas**:

- *Permitir `unsafe-inline` en `script-src` y mantener las páginas estáticas*:
  rechazada. Es justamente la vía por la que se explota una inyección, y el
  principio I no es negociable. El beneficio —servir HTML ya horneado de una
  portada sin datos— no compensa.
- *Firmar los guiones con hashes en lugar de `nonce`*: inviable. Los guiones en
  línea de Next incluyen los datos de hidratación de cada página, así que su
  hash cambia con el contenido.
- *Poner la política en el servidor de delante en lugar de en la aplicación*:
  rechazada. Ataría la seguridad a una configuración de alojamiento que no
  viaja con el repositorio y que nadie revisaría al desplegar.

---

## Riesgos abiertos

| Id | Riesgo | Impacto | Mitigación |
|----|--------|---------|------------|
| **R-1** | El plan contratado en Hostinger podría no ejecutar Node (hosting compartido solo con PHP) | Bloqueante para el despliegue: ninguna parte de este diseño funciona sin Node | Confirmarlo con el cliente **antes** de implementar el despliegue. El desarrollo y las pruebas no dependen de ello. Si el plan no lo soporta, la decisión es subir a un plan con Node o a VPS; replantear a sitio estático supondría renegociar el alcance de la tienda entera |
| **R-2** | El motor podría ser MariaDB en lugar de MySQL | Medio: cambia el comportamiento de intercalaciones y de `FULLTEXT` | Ya mitigado por D-3: la normalización ocurre en la aplicación. Conviene confirmar motor y versión para fijar el proveedor de Prisma |
| **R-3** | `sharp` podría no estar disponible en el alojamiento | Bajo | Plan B de D-7: imágenes preoptimizadas sin el optimizador, manteniendo dimensiones declaradas |
| **R-4** | Las fotografías reales de producto aún no existen | Bajo, pero visible | Los datos de ejemplo incluyen imágenes de reserva con texto alternativo; el caso límite de "producto sin imagen" ya está especificado |
| **R-5** | El catálogo real de Hidrosal (nombres, precios, fichas técnicas) no está entregado | Medio para la fecha de publicación, no para construir | Se construye con datos de ejemplo representativos (FR-020) y se sustituyen antes de publicar |

## Pendientes de la especificación

Ninguno. Los dos marcadores de la especificación (FR-028 sobre el IVA y FR-029 sobre productos
sin precio) fueron resueltos por el cliente antes de planificar, y la validación quedó en 16 de
16.
