# Fase 1 — Modelo de datos

**Feature**: 001 Catálogo y detalle de producto · **Fecha**: 2026-10-11

Motor: MySQL 8.0 o MariaDB 10.6+. Acceso exclusivamente por Prisma. Todo el esquema nace como
migración versionada; no se toca la base a mano (constitución, principio III).

---

## Entidades

### Categoria

Agrupación comercial de productos.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `slug` | cadena (80) | **único**, obligatorio, minúsculas, solo letras sin acentos, números y guiones |
| `nombre` | cadena (120) | obligatorio, 2–120 caracteres |
| `descripcion` | texto | opcional |
| `orden` | entero | obligatorio, por defecto 0; ordena la presentación de los filtros |
| `creadoEn` / `actualizadoEn` | marca de tiempo | gestionadas por el ORM |

Índices: único en `slug`; índice en `orden`.

Relación: una categoría agrupa 0..n productos. **No se permite borrar una categoría con productos
asociados** (restricción de integridad referencial); primero se reasignan.

---

### Producto

Equipo o consumible que Hidrosal ofrece.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `sku` | cadena (60) | **único**, obligatorio; código interno |
| `slug` | cadena (140) | **único**, obligatorio; identificador legible de la dirección (FR-008) |
| `nombreNormalizado` | cadena (140) | obligatorio, **derivado** de `nombre`: minúsculas y sin diacríticos. Base de la búsqueda (D-3) |
| `nombre` | cadena (140) | obligatorio, 3–140 caracteres |
| `descripcion` | texto | obligatorio para publicar |
| `especificaciones` | JSON | lista ordenada de pares `{ nombre, valor }`; 0..n. Ver reglas abajo |
| `precio` | `DECIMAL(10,2)` | **opcional**. Si existe: mayor que 0, precio final con IVA incluido (FR-028). Si es nulo: «Precio a consultar» (FR-029) |
| `moneda` | cadena (3) | obligatorio, por ahora siempre `USD` |
| `estado` | enumerado | `BORRADOR` \| `PUBLICADO`. Por defecto `BORRADOR` |
| `disponible` | booleano | obligatorio, por defecto `true`. `false` = agotado |
| `categoriaId` | entero | obligatorio, referencia a `Categoria` |
| `creadoEn` / `actualizadoEn` | marca de tiempo | gestionadas por el ORM |

Índices:

- único en `sku` y en `slug`;
- índice en `nombreNormalizado` (búsqueda, FR-005);
- índice compuesto en `(estado, categoriaId)` (listado filtrado, FR-001 y FR-004);
- índice compuesto en `(estado, creadoEn)` (orden por defecto del catálogo y paginación).

Relaciones: pertenece a una `Categoria`; tiene 0..n `ImagenProducto`; tiene 0..n
`HistorialSlugProducto`.

---

### ImagenProducto

Fotografía asociada a un producto.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `productoId` | entero | obligatorio, referencia a `Producto`; **borrado en cascada** |
| `ruta` | cadena (255) | obligatorio; ubicación del archivo servido por la aplicación |
| `textoAlternativo` | cadena (255) | **obligatorio** (FR-019), 3–255 caracteres |
| `orden` | entero | obligatorio, por defecto 0 |
| `esPrincipal` | booleano | obligatorio, por defecto `false` |

Índices: índice en `(productoId, orden)`; **único parcial lógico**: a lo sumo una imagen principal
por producto. MySQL no tiene índices parciales, así que la unicidad se garantiza en la capa de
escritura y se verifica con una prueba; en la entrega 3 la administración la impondrá en el
formulario.

---

### HistorialSlugProducto

Direcciones antiguas que deben seguir funcionando (D-4, FR-013).

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `slug` | cadena (140) | **único** en toda la tabla y distinto de cualquier `Producto.slug` vigente |
| `productoId` | entero | obligatorio, referencia a `Producto`; **borrado en cascada** |
| `creadoEn` | marca de tiempo | gestionada por el ORM |

---

## Reglas de validación

Se aplican en la capa de escritura (datos de ejemplo hoy, administración en la entrega 3) y se
cubren con pruebas unitarias.

1. **Slug**: generado a partir del nombre; minúsculas, sin diacríticos, separado por guiones, sin
   guiones repetidos ni al principio o al final. Único entre productos.
2. **Cambio de slug**: al cambiar el `slug` de un producto, el anterior se inserta en
   `HistorialSlugProducto`. Si el nuevo slug existía en el historial de ese mismo producto, se
   elimina de allí (deja de ser histórico porque vuelve a ser vigente).
3. **Nombre normalizado**: se recalcula siempre que cambia el nombre. Nunca se escribe a mano.
4. **Precio**: si está presente, debe ser mayor que 0 y tener como mucho dos decimales. Un precio
   de 0 es un error de datos, no un «a consultar».
5. **Publicación**: un producto solo puede pasar a `PUBLICADO` si tiene `nombre`, `descripcion`,
   `categoriaId` y al menos una imagen con texto alternativo. El precio **no** es obligatorio para
   publicar.
6. **Especificaciones**: cada entrada tiene `nombre` (1–60) y `valor` (1–120), ambos obligatorios;
   se conserva el orden de la lista; no se permiten nombres repetidos dentro de un producto.
7. **Imagen principal**: si el producto tiene imágenes, exactamente una es principal. Si ninguna
   se marcó, la de menor `orden` actúa como principal.
8. **Moneda**: solo `USD` en esta entrega.

---

## Transiciones de estado

```text
          crear
            │
            ▼
       ┌──────────┐   publicar (cumple regla 5)   ┌───────────┐
       │ BORRADOR │ ────────────────────────────► │ PUBLICADO │
       └──────────┘ ◄──────────────────────────── └───────────┘
                           despublicar
```

- `BORRADOR` es invisible para el visitante: no aparece en catálogo, ni en el mapa del sitio, ni
  por dirección directa, donde se comporta como inexistente (FR-012).
- `disponible` es **independiente** del estado: un producto publicado y agotado sigue siendo
  visible y consultable, solo cambia su aviso y su llamada a la acción.
- En esta entrega las transiciones las ejecutan las migraciones y los datos de ejemplo. La
  administración de la entrega 3 las expondrá en pantalla.

---

## Consultas que el catálogo necesita

Documentadas aquí porque determinan los índices de arriba.

| Uso | Filtro | Orden | Notas |
|-----|--------|-------|-------|
| Catálogo (FR-001, FR-003) | `estado = PUBLICADO` | `creadoEn` descendente, `id` como desempate | Paginado de 12 en 12; el desempate evita que un producto aparezca en dos páginas |
| Filtro por categoría (FR-004) | `estado = PUBLICADO` y `categoriaId` | igual | |
| Búsqueda (FR-005) | `estado = PUBLICADO` y `nombreNormalizado` contiene el término normalizado | igual | El término se normaliza con la misma función que la columna |
| Ficha (FR-008) | `slug` y `estado = PUBLICADO` | — | Si no hay coincidencia, se busca en el historial de slugs antes de dar por inexistente |
| Relacionados (FR-010) | misma categoría, `estado = PUBLICADO`, distinto del actual | `creadoEn` descendente | Máximo 4 |
| Mapa del sitio (FR-016) | `estado = PUBLICADO` | `actualizadoEn` descendente | Productos y categorías |

---

## Datos de ejemplo (FR-020)

Seis categorías alineadas con lo que la empresa ya anuncia en su sitio: purificación residencial
y comercial, filtración industrial, tratamiento de agua potable, ósmosis inversa, desalinización,
y repuestos y consumibles.

Entre 24 y 30 productos repartidos de forma desigual entre ellas, para que la paginación y los
filtros se ejerciten de verdad. El conjunto incluye deliberadamente:

- al menos **3 productos sin precio** («Precio a consultar»), entre ellos una planta industrial;
- al menos **2 agotados**;
- al menos **2 en borrador**, que no deben aparecer por ninguna vía;
- **1 producto sin imagen**, para ejercitar la imagen de reserva;
- **1 categoría sin productos publicados**, para ejercitar el mensaje de categoría vacía;
- nombres con acentos («Ósmosis inversa»), para ejercitar la búsqueda normalizada.

Los datos son representativos, **no reales**: se sustituyen por el catálogo verdadero antes de
publicar (supuesto recogido en la especificación).
