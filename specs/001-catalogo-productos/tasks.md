---

description: "Desglose ejecutable de la entrega 001"
---

# Tasks: Catálogo y detalle de producto

**Input**: Documentos de diseño en `/specs/001-catalogo-productos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: SÍ se incluyen. No es una elección de estilo: la constitución (principio V) obliga a
pruebas automatizadas sobre precios, autenticación y autorización, y a pruebas de extremo a
extremo sobre los recorridos de compra. En esta entrega eso se traduce en unidad para precio,
normalización, paginación, canonicalización de parámetros y resolución de slug, y extremo a
extremo para los cinco recorridos de la especificación.

**Organization**: las tareas se agrupan por historia de usuario para poder implementarlas y
probarlas de forma independiente.

## Format: `[ID] [P?] [Story] Descripción`

- **[P]**: se puede ejecutar en paralelo (archivo distinto, sin depender de tareas incompletas)
- **[Story]**: historia a la que pertenece (US1…US5)
- Toda tarea indica su ruta exacta

## Path Conventions

Aplicación única Next.js en la raíz del repositorio, según la decisión de estructura de
[plan.md](./plan.md): `app/`, `components/`, `lib/`, `prisma/`, `public/`, `tests/`.

---

## Phase 1: Setup (infraestructura compartida)

**Purpose**: dejar el proyecto inicializado y con las puertas de calidad ejecutables.

- [X] T001 Crear el esqueleto de directorios en la raíz: `app/`, `components/marketing/`, `components/catalogo/`, `lib/catalogo/`, `prisma/`, `public/img/`, `tests/unit/`, `tests/e2e/`
- [X] T002 Crear `package.json` con Next.js 16.4.0, React 19.3.0, TypeScript 6.0.3 (decisión D-13), `@prisma/client` 7.10.0, `prisma` 7.10.0 (desarrollo), Zod 4.6.6, `sharp` 0.35.5, Vitest 5.0.3 y `@playwright/test` 1.64.0, y los scripts `dev`, `build`, `start`, `typecheck`, `lint`, `test` y `test:e2e`. Fijar la línea 7 de Prisma de forma explícita: la etiqueta `latest` apunta hoy a una candidata 8.0 (decisión D-2)
- [X] T003 [P] Configurar `tsconfig.json` con `"strict": true`, `"noUncheckedIndexedAccess": true` y el alias `@/*` hacia la raíz
- [X] T004 [P] Configurar `next.config.ts` con `output: "standalone"` (decisión D-1) y cabeceras de seguridad para todas las rutas; la política de contenido va en `middleware.ts` porque necesita un `nonce` por petición
- [X] T005 [P] Configurar ESLint y Prettier en `eslint.config.mjs` y `.prettierrc`, con la regla que prohíbe `any` y `@ts-ignore` en `app/`, `components/` y `lib/`
- [X] T006 [P] Configurar Vitest en `vitest.config.ts` para ejecutar `tests/unit/**/*.test.ts`
- [X] T007 [P] Configurar Playwright en `playwright.config.ts` con `baseURL` en `http://localhost:3000` y arranque automático del servidor
- [X] T008 [P] Crear `.env.example` con `DATABASE_URL` y `NEXT_PUBLIC_SITE_URL` vacías y documentadas, y añadir `.env` y `node_modules/` a `.gitignore`. Ningún secreto se versiona (constitución, principio I)

---

## Phase 2: Foundational (prerrequisitos bloqueantes)

**Purpose**: esquema de datos, utilidades compartidas y armazón visual que todas las historias
necesitan.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta que esta fase esté completa.

- [ ] T009 Configurar `prisma/schema.prisma` con `provider = "mysql"` y `url = env("DATABASE_URL")`
- [ ] T010 Definir el modelo `Categoria` en `prisma/schema.prisma`: `slug` cadena(80) **única y obligatoria** en minúsculas sin acentos, `nombre` cadena(120) obligatorio de 2 a 120 caracteres, `descripcion` texto opcional, `orden` entero obligatorio por defecto 0, marcas de tiempo, e índice en `orden`. Borrar una categoría con productos asociados debe quedar impedido por integridad referencial
- [ ] T011 Definir el modelo `Producto` en `prisma/schema.prisma`: `sku` cadena(60) **única**, `slug` cadena(140) **única**, `nombre` cadena(140) de 3 a 140, `nombreNormalizado` cadena(140) obligatorio y derivado, `descripcion` texto, `especificaciones` JSON, `precio` `DECIMAL(10,2)` **opcional** (nulo significa «Precio a consultar»; si existe debe ser mayor que 0 y con dos decimales), `moneda` cadena(3) por defecto `USD`, `estado` enumerado `BORRADOR | PUBLICADO` por defecto `BORRADOR`, `disponible` booleano por defecto `true`, `categoriaId` obligatorio, y marcas de tiempo. Índices: `nombreNormalizado`, `(estado, categoriaId)` y `(estado, creadoEn)`
- [ ] T012 Definir `ImagenProducto` e `HistorialSlugProducto` en `prisma/schema.prisma`: la imagen con `ruta` cadena(255), `textoAlternativo` cadena(255) **obligatorio** de 3 a 255, `orden` entero por defecto 0, `esPrincipal` booleano por defecto `false`, borrado en cascada e índice `(productoId, orden)`; el historial con `slug` cadena(140) **única** y borrado en cascada
- [ ] T013 Generar la migración inicial con `prisma migrate dev --name inicial` y versionarla en `prisma/migrations/`
- [ ] T014 [P] Crear el cliente único de Prisma por proceso en `lib/db.ts`
- [ ] T015 [P] Validar las variables de entorno con Zod al arrancar en `lib/env.ts`, fallando con mensaje legible si falta `DATABASE_URL`
- [ ] T016 [P] Implementar en `lib/texto.ts` la normalización (minúsculas y sin diacríticos) y la generación de slug: sin guiones repetidos, ni al principio ni al final
- [ ] T017 [P] Implementar en `lib/precio.ts` el formato con `Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" })`, la leyenda «IVA incluido» y la regla de «Precio a consultar» cuando el precio es nulo
- [ ] T018 [P] Escribir las pruebas unitarias de normalización y slug en `tests/unit/texto.test.ts`: «Ósmosis» y «OSMOSIS» normalizan igual; el slug de «Ósmosis inversa 500 GPD» es `osmosis-inversa-500-gpd`
- [ ] T019 [P] Escribir las pruebas unitarias de precio en `tests/unit/precio.test.ts`: formato con dos decimales y símbolo, precio nulo devuelve «Precio a consultar», y un precio de 0 se trata como dato inválido, no como «a consultar»
- [ ] T020 Migrar `assets/css/styles.css` a `app/globals.css` conservando intactos los tokens de `:root`, el bloque de movimiento reducido y el resto de reglas
- [ ] T021 Crear `app/layout.tsx` con `lang="es-SV"`, las tipografías Outfit e Inter servidas desde la propia aplicación (decisión D-8) y los metadatos base del sitio
- [ ] T022 [P] Extraer la navegación y el pie de página a `components/marketing/Navegacion.tsx` y `components/marketing/PieDePagina.tsx`, conservando enlaces y anclas actuales
- [ ] T023 [P] Crear `app/not-found.tsx` con el diseño del sitio, texto en español y enlaces al catálogo y a la portada
- [ ] T024 Implementar `prisma/seed.ts` con el juego de datos de ejemplo descrito en `data-model.md`: 6 categorías, entre 24 y 30 productos, al menos 3 sin precio, 2 agotados, 2 en borrador, 1 sin imagen, 1 categoría sin productos publicados y nombres con acentos

**Checkpoint**: base lista. A partir de aquí las historias pueden avanzar.

---

## Phase 3: User Story 1 - Explorar el catálogo (Priority: P1) 🎯 MVP

**Goal**: que un visitante vea en una rejilla todos los productos publicados con imagen, nombre,
categoría, precio y disponibilidad, paginados de 12 en 12.

**Independent Test**: entrar a `/productos` con los datos de ejemplo cargados y comprobar que se
listan todos los publicados con sus cinco datos, que los borradores no aparecen, que los agotados
salen marcados y que los productos sin precio muestran «Precio a consultar».

### Tests for User Story 1

- [ ] T025 [P] [US1] Escribir las pruebas unitarias de paginación en `tests/unit/paginacion.test.ts`: cálculo de total de páginas, desplazamiento por página y que el desempate por identificador impide que un producto aparezca en dos páginas
- [ ] T026 [P] [US1] Escribir la prueba de extremo a extremo del catálogo en `tests/e2e/catalogo.spec.ts` cubriendo los cuatro escenarios de aceptación de la historia 1 más el producto sin precio

### Implementation for User Story 1

- [ ] T027 [US1] Implementar `listarProductos` en `lib/catalogo/consultas.ts`: filtra `estado = PUBLICADO`, ordena por `creadoEn` descendente con el identificador como desempate, pagina de 12 en 12 y devuelve también el total de resultados y el número de páginas
- [ ] T028 [P] [US1] Crear `components/catalogo/TarjetaProducto.tsx` con imagen principal mediante `next/image` con dimensiones declaradas y `sizes`, nombre, categoría, aviso de agotado y precio o «Precio a consultar»
- [ ] T029 [P] [US1] Crear `components/catalogo/Paginacion.tsx`, navegable con teclado y con la página vigente anunciada a lectores de pantalla
- [ ] T030 [P] [US1] Crear `components/catalogo/EstadoVacio.tsx` para el catálogo en preparación y para la categoría sin productos
- [ ] T031 [US1] Crear `app/productos/page.tsx` como componente de servidor que consume `listarProductos` y compone la rejilla, con revalidación periódica (decisión D-6)
- [ ] T032 [P] [US1] Crear `app/productos/productos.module.css` consumiendo los tokens de `app/globals.css`, sin introducir colores nuevos
- [ ] T033 [US1] Añadir los metadatos propios del catálogo en `app/productos/page.tsx`, con `/productos` como dirección canónica

**Checkpoint**: la historia 1 es demostrable por sí sola. Es el MVP.

---

## Phase 4: User Story 2 - Consultar la ficha de un producto (Priority: P2)

**Goal**: que el visitante abra un producto por su dirección legible y encuentre galería,
descripción, especificaciones, precio, disponibilidad, relacionados y una vía para pedir asesoría.

**Independent Test**: abrir directamente la dirección de un producto publicado y comprobar los
cinco escenarios de aceptación; abrir un borrador y comprobar que responde como inexistente.

### Tests for User Story 2

- [ ] T034 [P] [US2] Escribir las pruebas unitarias de resolución de slug en `tests/unit/slug.test.ts`: slug vigente resuelve al producto, slug histórico devuelve redirección permanente, slug inexistente no resuelve
- [ ] T035 [P] [US2] Escribir la prueba de extremo a extremo de la ficha en `tests/e2e/ficha-producto.spec.ts` cubriendo producto publicado, agotado, sin imagen, en borrador (404) y slug histórico (301)

### Implementation for User Story 2

- [ ] T036 [US2] Implementar `obtenerProductoPublicado` y `resolverSlugHistorico` en `lib/catalogo/consultas.ts` según el contrato de [rutas-publicas.md](./contracts/rutas-publicas.md): 200 para publicado, 301 desde slug histórico, 404 para inexistente y para borrador
- [ ] T037 [US2] Implementar `obtenerRelacionados` en `lib/catalogo/consultas.ts`: misma categoría, publicados, excluyendo el actual, máximo 4, orden por `creadoEn` descendente
- [ ] T038 [P] [US2] Crear `components/catalogo/GaleriaProducto.tsx` navegable con teclado, con imagen de reserva y texto alternativo cuando el producto no tiene imágenes
- [ ] T039 [P] [US2] Crear `components/catalogo/TablaEspecificaciones.tsx` que renderice los pares nombre/valor conservando su orden, con marcado semántico de tabla
- [ ] T040 [P] [US2] Crear `components/catalogo/ProductosRelacionados.tsx` reutilizando `TarjetaProducto`
- [ ] T041 [P] [US2] Crear `components/catalogo/LlamadaAsesoria.tsx` que enlace al formulario de contacto trasladando la referencia del producto consultado (FR-011)
- [ ] T042 [US2] Crear `app/productos/[slug]/page.tsx` componiendo lo anterior y aplicando las reglas de 404 y 301 de T036
- [ ] T043 [US2] Implementar `generateMetadata` en `app/productos/[slug]/page.tsx` con título y descripción propios del producto

**Checkpoint**: historias 1 y 2 funcionando juntas: ya hay recorrido de catálogo a ficha.

---

## Phase 5: User Story 3 - Filtrar y buscar (Priority: P3)

**Goal**: reducir el catálogo por categoría y por texto, con el estado reflejado en la dirección.

**Independent Test**: aplicar cada filtro y varias búsquedas comprobando el conjunto esperado, el
mensaje de «sin resultados», y que recargar o compartir la dirección reproduce los resultados.

### Tests for User Story 3

- [ ] T044 [P] [US3] Escribir las pruebas unitarias de canonicalización en `tests/unit/parametros.test.ts` cubriendo **toda** la tabla de [parametros-catalogo.md](./contracts/parametros-catalogo.md): `q` vacío o de solo espacios se descarta, `q` de más de 80 se recorta, categoría inexistente se descarta, `pagina` no numérica o menor que 1 pasa a 1, `pagina` fuera de rango devuelve la última con resultados, parámetros desconocidos se ignoran y un parámetro repetido toma el primero
- [ ] T045 [P] [US3] Escribir la prueba de extremo a extremo en `tests/e2e/busqueda-filtros.spec.ts`: filtro por categoría, búsqueda con y sin acentos y en mayúsculas, intersección de ambos, sin resultados, `?pagina=999` y `?categoria=inexistente`

### Implementation for User Story 3

- [ ] T046 [US3] Implementar `lib/catalogo/parametros.ts` con el esquema Zod de `q` (1–80 tras recortar), `categoria` (slug existente) y `pagina` (entero positivo), más la canonicalización y el orden canónico `categoria`, `q`, `pagina` omitiendo los valores por defecto
- [ ] T047 [US3] Extender `listarProductos` en `lib/catalogo/consultas.ts` con filtro por categoría y búsqueda sobre `nombreNormalizado`, normalizando el término con la misma función que la columna (decisión D-3)
- [ ] T048 [P] [US3] Crear `components/catalogo/FiltroCategorias.tsx` mostrando el filtro vigente y ordenando por el campo `orden` de la categoría
- [ ] T049 [P] [US3] Crear `components/catalogo/Buscador.tsx` con etiqueta asociada y envío funcional sin JavaScript
- [ ] T050 [US3] Integrar filtros y buscador en `app/productos/page.tsx`, reiniciando a la página 1 cuando cambia el filtro o la búsqueda
- [ ] T051 [P] [US3] Añadir en `components/catalogo/EstadoVacio.tsx` los avisos de «sin coincidencias» con enlace al catálogo completo y de «la categoría pedida no existe»

**Checkpoint**: el catálogo es utilizable de verdad aunque crezca.

---

## Phase 6: User Story 4 - Encontrar los productos desde un buscador externo (Priority: P4)

**Goal**: que cada ficha y cada categoría tengan identidad propia para buscadores y al compartirse.

**Independent Test**: inspeccionar los metadatos de dos fichas distintas y comprobar el mapa del
sitio, verificando que no incluye borradores.

### Tests for User Story 4

- [ ] T052 [P] [US4] Escribir la prueba de extremo a extremo en `tests/e2e/descubrimiento.spec.ts`: dos fichas con metadatos distintos, y `/sitemap.xml` con las fichas publicadas y sin ninguna en borrador

### Implementation for User Story 4

- [ ] T053 [US4] Implementar `app/sitemap.ts` incluyendo portada, catálogo, categorías y fichas publicadas, excluyendo borradores (FR-016)
- [ ] T054 [P] [US4] Implementar `app/robots.ts` permitiendo el rastreo y apuntando al mapa del sitio
- [ ] T055 [US4] Añadir los datos de vista previa al compartir en `app/productos/[slug]/page.tsx`, con la imagen principal del producto (FR-015)
- [ ] T056 [P] [US4] Añadir título y descripción propios a las vistas de categoría en `app/productos/page.tsx` cuando hay filtro de categoría aplicado

---

## Phase 7: User Story 5 - Continuidad del sitio de marketing (Priority: P5)

**Goal**: que el sitio aprobado siga igual tras el cambio de base técnica.

**Independent Test**: recorrer cada página y cada ancla comparando con las capturas previas, y
enviar el formulario de contacto.

**⚠️ Nota de secuencia**: esta historia es la última en valor nuevo pero **no puede quedar para
después del primer despliegue a producción**. Hasta que esté completa, el sitio publicado
perdería su portada. Ver la estrategia al final.

### Tests for User Story 5

- [ ] T057 [P] [US5] Escribir la prueba de extremo a extremo en `tests/e2e/continuidad-marketing.spec.ts`: las seis anclas responden, la portada carga, el hero mantiene la línea del agua al 60 % de la imagen, y el formulario de contacto valida y envía igual que antes

### Implementation for User Story 5

- [ ] T058 [US5] Mover `assets/img/hero.webp` a `public/img/hero.webp`
- [ ] T059 [US5] Migrar el hero a `components/marketing/Hero.tsx` conservando `background-position: 50% 60%`, la capa sobredimensionada del parallax y el difuminado que se completa al 90 %
- [ ] T060 [P] [US5] Migrar las secciones «quiénes somos» y «qué hacemos» a `components/marketing/QuienesSomos.tsx` y `components/marketing/QueHacemos.tsx`
- [ ] T061 [P] [US5] Migrar «servicios», «nuestro enfoque» y «marcas» a `components/marketing/Servicios.tsx`, `components/marketing/Enfoque.tsx` y `components/marketing/Marcas.tsx`, conservando las diez tarjetas de servicio
- [ ] T062 [US5] Migrar el formulario a `components/marketing/FormularioContacto.tsx` conservando la validación en español, el campo trampa anti-spam y el comportamiento de envío actual
- [ ] T063 [US5] Trasladar los comportamientos de `assets/js/main.js` a componentes de cliente: barra que se compacta al hacer scroll, menú móvil, resaltado de sección activa, parallax del hero, animaciones de entrada y marquesina de marcas, respetando `prefers-reduced-motion`
- [ ] T064 [US5] Componer `app/page.tsx` con todas las secciones, eliminar `index.html`, `assets/css/`, `assets/js/` y `assets/img/` de la raíz, y actualizar `README.md` para describir la aplicación

**Checkpoint**: el sitio completo vive sobre la nueva base, sin pérdidas.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T065 [P] Pasar una auditoría automática de accesibilidad sobre portada, catálogo y ficha, y corregir lo que reporte como grave (SC-003)
- [ ] T066 [P] Medir SC-004 con la red limitada a 4G: contenido principal por debajo de 2,5 s y desplazamiento acumulado por debajo de 0,1
- [ ] T067 [P] Verificar SC-007 cargando 200 productos y 10 categorías en los datos de ejemplo y repitiendo la medición de T066
- [ ] T068 [P] Revisar que no quede `any` ni `@ts-ignore` en `app/`, `components/` y `lib/` (constitución, principio II)
- [ ] T069 [P] Documentar el despliegue en `README.md`: `prisma migrate deploy` como paso previo explícito, arranque con la salida standalone, necesidad de `sharp`, y el plan B de imágenes sin optimizador (decisiones D-7 y D-12)
- [ ] T070 [P] Verificar que las cabeceras de seguridad de T004 se emiten en todas las rutas
- [ ] T071 Ejecutar las cuatro puertas de calidad en verde: `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build`
- [ ] T072 Recorrer los siete escenarios de validación de [quickstart.md](./quickstart.md) y confirmar con el cliente los riesgos R-1 (plan de Hostinger con Node) y R-2 (motor y versión de base de datos) **antes** de desplegar

---

## Dependencies

```text
Phase 1 (Setup)
   │
   ▼
Phase 2 (Foundational)  ← bloquea todo
   │
   ├──► Phase 3 · US1 (P1) ─────┐
   │                            ├──► Phase 5 · US3 (P3)   (necesita el listado de US1)
   │                            │
   ├──► Phase 4 · US2 (P2) ◄────┘   (reutiliza la tarjeta de US1)
   │
   ├──► Phase 6 · US4 (P4)           (necesita las fichas de US2)
   │
   └──► Phase 7 · US5 (P5)           (independiente de US1–US4)
                │
                ▼
          Phase 8 (Polish)
```

Dependencias reales entre historias:

- **US1** no depende de ninguna otra. Es el MVP.
- **US2** reutiliza `TarjetaProducto` de US1 para los relacionados; podría construirse antes, pero
  duplicaría trabajo.
- **US3** extiende la consulta y la página de US1: **requiere US1**.
- **US4** necesita que existan fichas, es decir **US2**.
- **US5** es **independiente** de US1–US4 y puede ir en paralelo desde el final de la fase 2.

---

## Parallel Execution Examples

**Fase 1, tras T002**: T003, T004, T005, T006, T007 y T008 tocan archivos distintos y pueden ir a
la vez.

**Fase 2, tras T013**: T014, T015, T016 y T017 son archivos independientes en `lib/`; T018 y T019
pueden escribirse en cuanto existan T016 y T017.

**Historia 1, tras T027**: T028, T029, T030 y T032 son componentes y estilos independientes.

**Historia 2, tras T037**: T038, T039, T040 y T041 son cuatro componentes sin solape.

**Historia 5, tras T059**: T060 y T061 migran secciones distintas y no se pisan.

**Entre historias**: un segundo par de manos puede llevar la fase 7 (US5) completa mientras otro
avanza US1 → US3, porque no comparten archivos salvo `app/page.tsx`, que solo toca US5.

---

## Implementation Strategy

### Alcance del MVP

**Fases 1, 2 y 3** (T001–T033): el catálogo listando productos reales con precio y disponibilidad.
Es lo mínimo que cambia la conversación comercial de Hidrosal y ya es demostrable al cliente.

### Entrega incremental sugerida

1. **Incremento 1 — MVP interno**: fases 1–3. Se demuestra en local o en un entorno de prueba.
2. **Incremento 2 — recorrido completo**: fase 4 (US2). Catálogo y ficha, que es la pareja que
   de verdad vende.
3. **Incremento 3 — primer despliegue a producción**: fase 7 (US5) **más** lo anterior. Este es
   el orden importante: no se despliega nada a producción hasta que la portada esté migrada, o
   el sitio publicado perdería su página principal. US5 es la última en valor nuevo y la primera
   en ser innegociable para publicar.
4. **Incremento 4 — utilidad y captación**: fases 5 y 6 (US3 y US4).
5. **Incremento 5 — cierre**: fase 8.

### Antes de empezar

Confirmar el riesgo **R-1**: que el plan contratado en Hostinger ejecuta Node. No bloquea
escribir código —las fases 1 a 7 se desarrollan y prueban en local— pero sí bloquea el
incremento 3. Cuanto antes se sepa, menos trabajo queda en el aire.
