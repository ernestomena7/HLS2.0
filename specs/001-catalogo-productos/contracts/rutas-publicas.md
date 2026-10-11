# Contrato de rutas públicas

**Feature**: 001 Catálogo y detalle de producto · **Fecha**: 2026-10-11

La interfaz que esta entrega expone al exterior son sus direcciones. Este contrato fija qué
devuelve cada una, con qué código de respuesta y con qué metadatos. Es lo que verifican las
pruebas de extremo a extremo.

---

## Rutas heredadas del sitio de marketing (FR-022)

| Ruta | Contenido | Código |
|------|-----------|--------|
| `/` | Portada de marketing migrada: hero, quiénes somos, qué hacemos, servicios, enfoque, marcas y contacto | 200 |
| `/#quienes-somos`, `/#que-hacemos`, `/#servicios`, `/#enfoque`, `/#marcas`, `/#contacto` | Anclas de la portada; deben seguir existiendo con el mismo identificador | 200 |

**Invariante**: ninguna de estas direcciones puede dejar de responder ni cambiar de aspecto
(SC-005). La portada conserva el hero con la línea del agua al 60 % de la imagen y el difuminado
completo al 90 %.

---

## Catálogo

### `GET /productos`

Listado de productos publicados. Acepta los parámetros descritos en
[parametros-catalogo.md](./parametros-catalogo.md).

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| Hay resultados | Rejilla de productos; por cada uno: imagen principal, nombre, categoría, estado de disponibilidad y precio con «IVA incluido» o «Precio a consultar» | 200 |
| Filtro o búsqueda sin coincidencias | Mensaje de que no hay resultados y enlace al catálogo completo (FR-007) | 200 |
| Catálogo vacío | Mensaje de catálogo en preparación e invitación a contactar | 200 |
| Parámetros inválidos | Se canonicalizan según el contrato de parámetros y se responde con el listado resultante | 200 |

**Metadatos**: título y descripción propios del catálogo; la página responde a `/productos` como
dirección canónica, sin importar el orden de los parámetros.

**Estado en la dirección**: filtro, búsqueda y página viajan en la dirección, de modo que
recargarla o compartirla reproduce los mismos resultados (FR-006).

---

## Ficha de producto

### `GET /productos/{slug}`

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| `slug` corresponde a un producto **publicado** | Ficha completa: galería, descripción, tabla de especificaciones, categoría, disponibilidad, precio o «Precio a consultar», relacionados de la misma categoría (máx. 4) y llamada a la acción hacia el formulario de contacto con la referencia del producto | 200 |
| `slug` corresponde a un **slug histórico** de un producto publicado | Redirección a la dirección vigente del producto | 301 |
| `slug` no existe | Página «no encontrado» en español con enlace al catálogo | 404 |
| `slug` corresponde a un producto en **borrador** | Idéntico al caso anterior: no se distingue de uno inexistente (FR-012, caso límite de borrador) | 404 |
| Producto publicado y **agotado** | Ficha completa con el aviso de agotado y la vía para consultar disponibilidad; nunca un error | 200 |
| Producto publicado **sin imágenes** | Ficha completa con imagen de reserva y texto alternativo descriptivo | 200 |

**Metadatos** (FR-014, FR-015): título con el nombre del producto, descripción derivada de su
descripción, y datos para vista previa al compartir, con la imagen principal del producto.

---

## Descubrimiento

### `GET /sitemap.xml`

Incluye la portada, el catálogo, las páginas de categoría disponibles y **todas** las fichas de
productos publicados. **Excluye** cualquier producto en borrador (FR-016).

### `GET /robots.txt`

Permite el rastreo del sitio público y apunta al mapa del sitio.

---

## Errores

### `GET /{cualquier-ruta-inexistente}`

Página «no encontrado» en español, con el diseño del sitio y enlace al catálogo y a la portada.
Código 404.

---

## Reglas transversales

1. Todas las respuestas son en **español salvadoreño**; no hay negociación de idioma.
2. Todos los precios visibles van en **dólares** con la leyenda «IVA incluido»; los productos sin
   precio muestran «Precio a consultar» con la misma prominencia.
3. Toda página es **operable con teclado**, con foco visible y orden de tabulación lógico.
4. Ninguna página expone detalles técnicos en pantalla ante un fallo: el detalle va a la bitácora
   del servidor.
