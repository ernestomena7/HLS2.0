# Implementation Plan: Catálogo y detalle de producto

**Branch**: `001-catalogo-productos` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-catalogo-productos/spec.md`

## Summary

Convertir el sitio de marketing estático en una aplicación Next.js servida por Node, y añadir
sobre esa base la parte pública del catálogo: listado con filtro por categoría, búsqueda y
paginación, y ficha de producto con galería, especificaciones técnicas, precio y relacionados.
Los datos viven en MySQL a través de Prisma con migraciones versionadas y un juego de datos de
ejemplo; no hay administración todavía. El sitio de marketing actual se migra sin cambiar su
diseño ni sus direcciones.

El enfoque técnico: una sola aplicación Next.js con App Router en la raíz del repositorio,
renderizado en servidor con componentes de servidor para catálogo y ficha, consultas tipadas con
Prisma, validación de parámetros con Zod, precios en decimal exacto, y empaquetado
`output: "standalone"` para que arranque con el runtime de Node de Hostinger.

## Technical Context

**Language/Version**: TypeScript 7.0 en modo estricto, sobre Node.js 22 LTS

**Primary Dependencies**: Next.js 16.4 (App Router) con React 19.3; Prisma 7.10 y
`@prisma/client` 7.10 (se fija la línea 7 estable: la etiqueta `latest` de `prisma` apunta hoy a
una candidata 8.0.0-rc); Zod 4.6 para validación en los límites; `sharp` 0.35 para optimización
de imágenes en el servidor

**Storage**: MySQL 8.0 (o MariaDB 10.6+, que es lo que suele ofrecer Hostinger), accedido
únicamente por Prisma, con migraciones versionadas. Precios en `DECIMAL(10,2)`

**Testing**: Vitest 5 para unidad (precio, normalización de búsqueda, paginación, resolución de
slugs) y Playwright 1.64 para extremo a extremo (catálogo → filtro → ficha, y continuidad del
sitio de marketing)

**Target Platform**: alojamiento Hostinger con ejecución de Node. La aplicación se construye con
`output: "standalone"` y se arranca con el servidor de Next. No se usan funciones edge ni
servicios propietarios

**Project Type**: aplicación web renderizada en servidor, una sola unidad desplegable

**Performance Goals**: contenido principal visible en menos de 2,5 s en 4G de gama media
(SC-004); desplazamiento acumulado de diseño por debajo de 0,1; se mantiene con 200 productos y
10 categorías (SC-007)

**Constraints**: el sitio de marketing existente no puede romperse ni cambiar de aspecto
(FR-022, FR-023); accesibilidad AA y operación por teclado (FR-024, FR-025); español salvadoreño
y dólares (FR-027); precio final con IVA incluido y precio opcional (FR-028, FR-029); ningún
secreto en el repositorio

**Scale/Scope**: ~200 productos, ~10 categorías, 2 pantallas nuevas (catálogo y ficha) más la
migración de la portada de marketing y sus 6 secciones

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluado contra la constitución v1.0.0.

| Principio | Cómo lo cumple este plan | Estado |
|-----------|--------------------------|--------|
| I. Seguridad por defecto | Sin secretos en el repositorio: `DATABASE_URL` y demás variables se validan al arrancar con Zod y se documentan vacías en `.env.example`. Los parámetros de catálogo (`q`, `categoria`, `pagina`) se validan en servidor antes de consultar. No hay rutas de administración en esta entrega, así que no hay superficie de autorización todavía; tampoco se tocan datos de pago. Cabeceras de seguridad configuradas en la aplicación | PASA |
| II. Tipado estricto | `strict: true` en TypeScript 7; tipos de datos derivados de Prisma; parámetros de entrada derivados de esquemas Zod; prohibido `any` y `@ts-ignore` en producción | PASA |
| III. Esquema versionado | Todo el esquema nace como migración de Prisma; acceso a datos solo por Prisma; precios en `DECIMAL(10,2)` manipulados como decimal, nunca como flotante | PASA |
| IV. Accesibilidad y rendimiento | Marcado semántico, navegación por teclado y foco visible; contraste AA heredado de los tokens aprobados; imágenes con dimensiones declaradas vía `next/image`; se conserva el respeto a `prefers-reduced-motion` del sitio actual | PASA |
| V. Pruebas proporcionales al riesgo | Unidad sobre precio, normalización de búsqueda, paginación y resolución de slug; extremo a extremo sobre el recorrido de compra consultiva y sobre la continuidad del sitio de marketing | PASA |
| VI. Localización | Idioma único español salvadoreño, moneda única USD, formato con `Intl.NumberFormat("es-SV")` | PASA |

**Resultado: PASA, sin violaciones que justificar.** Dos cosas que el plan vigila explícitamente
por estar en el filo de un principio:

- La optimización de imágenes de Next requiere `sharp` instalado en el servidor. Si el
  alojamiento no lo permitiera, la alternativa documentada es servir imágenes preoptimizadas sin
  el optimizador, manteniendo dimensiones declaradas para no incumplir FR-026.
- El plan de Hostinger **debe** ejecutar Node. Es el riesgo abierto R-1 de
  [research.md](./research.md); no invalida el diseño, pero sí condiciona el despliegue.

### Re-evaluación posterior al diseño (Fase 1)

Revisado de nuevo tras producir `research.md`, `data-model.md`, los contratos y `quickstart.md`.
**Sigue pasando, sin violaciones.** El diseño refuerza tres principios en puntos concretos:

- **Principio I**: el contrato de parámetros canonicaliza toda entrada inválida en vez de
  confiar en ella, y las variables de entorno se validan al arrancar. No hay superficie de
  autorización en esta entrega porque no hay administración.
- **Principio III**: el modelo fija `DECIMAL(10,2)` para el precio y lo declara **opcional**, de
  modo que «Precio a consultar» se expresa con ausencia de dato y no con un valor centinela que
  alguien acabaría mostrando como «$0.00». El historial de slugs evita romper direcciones ya
  publicadas.
- **Principio V**: `quickstart.md` enumera siete escenarios de validación trazados a las
  historias y a los requisitos, que son los mismos que cubrirán las pruebas de extremo a extremo.

Ninguna decisión de diseño obligó a desviarse de la constitución, así que la tabla de complejidad
sigue vacía.

## Project Structure

### Documentation (this feature)

```text
specs/001-catalogo-productos/
├── plan.md              # Este archivo
├── research.md          # Fase 0: decisiones técnicas y riesgos
├── data-model.md        # Fase 1: entidades, reglas y migraciones
├── quickstart.md        # Fase 1: cómo levantar y validar
├── contracts/           # Fase 1: contrato de rutas y de parámetros
│   ├── rutas-publicas.md
│   └── parametros-catalogo.md
├── checklists/
│   └── requirements.md  # Validación de la especificación (16/16)
└── tasks.md             # Fase 2: lo genera /speckit-tasks, no este comando
```

### Source Code (repository root)

```text
app/
├── layout.tsx                   # idioma es-SV, tipografías, metadatos base
├── page.tsx                     # portada de marketing migrada
├── globals.css                  # tokens y estilos actuales, sin rediseño
├── not-found.tsx                # "no encontrado" en español
├── sitemap.ts                   # FR-016
├── robots.ts
└── productos/
    ├── page.tsx                 # catálogo: historias 1 y 3
    └── [slug]/
        └── page.tsx             # ficha: historia 2

components/
├── marketing/                   # hero, quiénes somos, servicios, enfoque, marcas, contacto
└── catalogo/                    # tarjeta, filtros, buscador, paginación, galería, relacionados

lib/
├── db.ts                        # cliente Prisma único por proceso
├── env.ts                       # validación de variables de entorno con Zod
├── precio.ts                    # formato de precio y regla de "Precio a consultar"
├── texto.ts                     # normalización de texto para búsqueda
└── catalogo/
    ├── consultas.ts             # lecturas de catálogo, ficha y relacionados
    └── parametros.ts            # esquema y canonicalización de q, categoria, pagina

prisma/
├── schema.prisma
├── migrations/                  # migraciones versionadas
└── seed.ts                      # datos de ejemplo (FR-020)

public/
└── img/                         # hero.webp y fotografías de producto

tests/
├── unit/                        # Vitest
└── e2e/                         # Playwright
```

**Structure Decision**: una sola aplicación Next.js en la raíz del repositorio, no un par
frontend/backend separado. El renderizado en servidor de Next ya es el backend de lectura que
esta entrega necesita, y separar en dos despliegues multiplicaría el coste de alojamiento sin
aportar nada mientras no exista administración. Los archivos estáticos actuales (`index.html`,
`assets/css/styles.css`, `assets/js/main.js`, `assets/img/hero.webp`) se migran a `app/` y
`public/` y desaparecen de la raíz; el contenido y el diseño se conservan intactos.

## Complexity Tracking

> Sin violaciones de la constitución que justificar. Tabla no aplicable en esta entrega.
