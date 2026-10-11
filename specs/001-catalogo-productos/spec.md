# Feature Specification: Catálogo y detalle de producto

**Feature Branch**: `001-catalogo-productos`

**Created**: 2026-10-11

**Status**: Draft

**Input**: Descripción del usuario: "Catálogo y detalle de producto sobre una base Next.js, primera de las tres entregas de la tienda en línea de Hidrosal. Esta entrega convierte el sitio de marketing estático actual en una aplicación Next.js y añade la parte pública del catálogo, conservando intacto el sitio de marketing ya aprobado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar el catálogo (Priority: P1)

Una persona que necesita tratar el agua de su casa, su comercio o su planta entra al sitio de
Hidrosal y quiere ver qué equipos vende la empresa. Abre la sección de productos y recorre una
cuadrícula donde cada producto muestra su imagen, su nombre, la categoría a la que pertenece, el
precio en dólares y si está disponible. Con eso se hace una idea de la oferta sin tener que
llamar ni escribir.

**Why this priority**: es la razón de ser de la entrega. Sin una lista de productos visible no
hay tienda, y hoy la empresa solo puede mostrar servicios en prosa. Entregar únicamente esta
historia ya cambia la conversación comercial: el visitante ve qué se vende y a qué precio.

**Independent Test**: se prueba entrando a la página de catálogo con un conjunto de productos
cargado y comprobando que se listan todos los publicados, con los cinco datos visibles, y que
ninguno de los no publicados aparece.

**Acceptance Scenarios**:

1. **Given** existen productos publicados en varias categorías, **When** el visitante abre la
   página de catálogo, **Then** ve cada producto publicado con imagen, nombre, categoría, precio
   en dólares y estado de disponibilidad.
2. **Given** existe un producto en estado borrador, **When** el visitante abre la página de
   catálogo, **Then** ese producto no aparece en ningún lugar de la lista.
3. **Given** un producto está marcado como agotado, **When** el visitante lo ve en el catálogo,
   **Then** aparece visible y claramente identificado como agotado.
4. **Given** el catálogo tiene más productos de los que caben en una página, **When** el
   visitante llega al final de la lista, **Then** puede avanzar a la siguiente página y volver a
   la anterior sin perder el contexto.

---

### User Story 2 - Consultar la ficha de un producto (Priority: P2)

El visitante encuentra un equipo que le interesa y entra en su ficha. Ahí ve varias fotografías,
una descripción, y sobre todo la tabla de especificaciones técnicas que necesita para decidir:
caudal, presión de trabajo, dimensiones, materiales y garantía. Si el equipo no le encaja, ve
otros productos de la misma categoría. Si le encaja, tiene a mano una forma de pedir asesoría.

**Why this priority**: en equipos de tratamiento de agua la decisión se toma mirando la ficha
técnica, no la foto. Es lo que convierte una visita en una consulta comercial, pero depende de
que primero exista el catálogo.

**Independent Test**: se prueba abriendo directamente la dirección de un producto publicado y
comprobando que muestra galería, descripción, especificaciones, precio, disponibilidad,
relacionados y la llamada a la acción.

**Acceptance Scenarios**:

1. **Given** un producto publicado con tres imágenes y seis especificaciones, **When** el
   visitante abre su ficha, **Then** ve la galería navegable, la descripción y las seis
   especificaciones con su nombre y su valor.
2. **Given** el visitante está en la ficha de un producto, **When** quiere pedir asesoría,
   **Then** encuentra una llamada a la acción que lo lleva al formulario de contacto existente
   con la referencia del producto consultado.
3. **Given** existen otros productos publicados en la misma categoría, **When** el visitante
   llega al final de la ficha, **Then** ve productos relacionados de esa categoría y puede
   abrirlos.
4. **Given** un producto está agotado, **When** el visitante abre su ficha, **Then** ve el aviso
   de agotado y la vía para consultar disponibilidad, no un mensaje de error.

---

### User Story 3 - Filtrar y buscar dentro del catálogo (Priority: P3)

El visitante sabe más o menos qué busca: "algo de ósmosis inversa" o "un repuesto de membrana".
Usa el filtro por categoría o escribe en el buscador y la lista se reduce a lo que le sirve. Si
no hay coincidencias, el sitio se lo dice y le ofrece volver al catálogo completo.

**Why this priority**: multiplica la utilidad del catálogo en cuanto este crece, pero el catálogo
completo ya aporta valor por sí solo con pocos productos.

**Independent Test**: se prueba aplicando cada filtro de categoría y varias búsquedas por texto,
comprobando el conjunto de resultados esperado y el mensaje de "sin resultados".

**Acceptance Scenarios**:

1. **Given** el catálogo tiene productos de seis categorías, **When** el visitante filtra por una
   categoría, **Then** ve solo los productos publicados de esa categoría y el filtro aplicado
   queda visible.
2. **Given** el visitante escribe parte del nombre de un producto, **When** ejecuta la búsqueda,
   **Then** ve los productos publicados cuyo nombre contiene ese texto, sin distinguir mayúsculas
   ni acentos.
3. **Given** una búsqueda no coincide con ningún producto, **When** se muestran los resultados,
   **Then** el visitante ve un mensaje claro de que no hay coincidencias y un camino de vuelta al
   catálogo completo.
4. **Given** el visitante aplicó un filtro y una búsqueda, **When** comparte o recarga la
   dirección, **Then** vuelve a ver exactamente los mismos resultados.

---

### User Story 4 - Encontrar los productos desde un buscador externo (Priority: P4)

Alguien busca en internet "ósmosis inversa comercial El Salvador" y llega directamente a la ficha
del equipo de Hidrosal, no a la portada. La página que encuentra tiene un título y una
descripción propios, y al compartirla por mensajería se ve una vista previa con la imagen del
producto.

**Why this priority**: es la vía de captación más barata a medio plazo, pero no bloquea el uso
del catálogo por quien ya está en el sitio.

**Independent Test**: se prueba inspeccionando los metadatos de varias páginas de producto y
categoría, y comprobando que todas las direcciones publicadas aparecen en el mapa del sitio.

**Acceptance Scenarios**:

1. **Given** una ficha de producto publicada, **When** se inspecciona su información para
   buscadores, **Then** tiene título y descripción propios, distintos de los de otras páginas.
2. **Given** una ficha de producto publicada, **When** se comparte su dirección en una aplicación
   de mensajería, **Then** la vista previa muestra el nombre del producto y su imagen principal.
3. **Given** el catálogo tiene productos y categorías publicados, **When** se consulta el mapa del
   sitio, **Then** incluye la portada, las páginas de categoría y todas las fichas publicadas, y
   ninguna página en borrador.

---

### User Story 5 - Continuidad del sitio de marketing (Priority: P5)

Quien ya conocía el sitio de Hidrosal entra como siempre y no nota ningún cambio: el mismo hero
con el río, las mismas secciones, el mismo formulario de contacto y las mismas direcciones.
Simplemente, ahora hay además una sección de productos.

**Why this priority**: va al final porque no añade valor nuevo, pero es una condición
innegociable: la entrega no puede degradar lo que el cliente ya aprobó y está usando. Se verifica
en cada despliegue, no solo al terminar.

**Independent Test**: se prueba comparando cada página y cada ancla del sitio actual antes y
después del cambio de base técnica, y enviando el formulario de contacto.

**Acceptance Scenarios**:

1. **Given** el sitio de marketing actual, **When** se completa la migración, **Then** todas sus
   direcciones y anclas de navegación siguen respondiendo en la misma dirección.
2. **Given** la portada migrada, **When** un visitante la abre, **Then** ve el mismo diseño
   aprobado: tema blanco, tipografías Outfit e Inter, el hero con la línea del agua al 60 % de su
   altura y el difuminado completo al 90 %.
3. **Given** el formulario de contacto existente, **When** un visitante lo envía con datos
   válidos, **Then** se comporta igual que antes de la migración.

---

### Edge Cases

- **Producto inexistente**: una dirección de producto que no corresponde a ningún producto
  muestra una página de "no encontrado" en español, con enlace al catálogo, y responde como
  recurso inexistente ante los buscadores.
- **Producto en borrador**: es indistinguible de uno inexistente para el visitante; no se filtra
  por conocer la dirección.
- **Producto agotado**: sigue siendo visible y consultable; cambia el aviso y la llamada a la
  acción, nunca desaparece sin explicación.
- **Categoría sin productos publicados**: muestra la categoría con un mensaje de que aún no hay
  productos, no una página vacía ni un error.
- **Página fuera de rango** (por ejemplo, la página 50 de un catálogo con 3): devuelve al
  visitante a un estado válido en vez de una lista vacía sin contexto.
- **Búsqueda con acentos, mayúsculas o espacios sobrantes**: "ósmosis", "OSMOSIS" y " osmosis "
  devuelven los mismos resultados.
- **Producto sin imagen cargada**: se muestra una imagen de reserva con texto alternativo
  descriptivo; la ficha nunca se rompe por una imagen faltante.
- **Catálogo completamente vacío**: la página de productos explica que el catálogo está en
  preparación e invita a contactar.
- **Dirección de producto modificada**: si el identificador legible de un producto cambia, la
  dirección anterior sigue llevando al producto en vez de romperse.
- **Dos productos con el mismo nombre**: cada uno conserva una dirección propia e inequívoca.

## Requirements *(mandatory)*

### Functional Requirements

**Catálogo**

- **FR-001**: El sistema MUST mostrar una página de catálogo con todos los productos en estado
  publicado y ninguno en estado borrador.
- **FR-002**: Cada producto del catálogo MUST mostrar imagen principal, nombre, categoría, precio
  y estado de disponibilidad.
- **FR-003**: El sistema MUST paginar el catálogo cuando el número de productos publicados supere
  el tamaño de página definido, con navegación a la página anterior y siguiente.
- **FR-004**: El sistema MUST permitir filtrar el catálogo por categoría.
- **FR-005**: El sistema MUST permitir buscar productos por texto contenido en su nombre, sin
  distinguir mayúsculas, minúsculas ni acentos.
- **FR-006**: El estado del catálogo (filtro, búsqueda y página) MUST quedar reflejado en la
  dirección, de modo que recargarla o compartirla reproduzca los mismos resultados.
- **FR-007**: Cuando un filtro o una búsqueda no devuelvan resultados, el sistema MUST informarlo
  en español y ofrecer un camino de vuelta al catálogo completo.

**Ficha de producto**

- **FR-008**: Cada producto publicado MUST ser accesible mediante una dirección legible, estable y
  única, derivada de su nombre.
- **FR-009**: La ficha de producto MUST mostrar galería de imágenes, descripción, tabla de
  especificaciones técnicas, precio, categoría y estado de disponibilidad.
- **FR-010**: La ficha de producto MUST mostrar productos relacionados de la misma categoría
  cuando existan.
- **FR-011**: La ficha de producto MUST ofrecer una llamada a la acción que lleve al formulario de
  contacto existente, indicando de qué producto procede la consulta.
- **FR-012**: El sistema MUST responder con una página de "no encontrado" en español, y con el
  código correspondiente a un recurso inexistente, ante direcciones de productos inexistentes o
  en borrador.
- **FR-013**: Cuando el identificador legible de un producto cambie, el sistema MUST seguir
  resolviendo la dirección anterior hacia el producto correcto.

**Descubrimiento**

- **FR-014**: Cada página de producto y de categoría MUST tener título y descripción propios para
  buscadores.
- **FR-015**: Cada página de producto MUST exponer la información necesaria para que al
  compartirla se muestre una vista previa con nombre e imagen del producto.
- **FR-016**: El sistema MUST publicar un mapa del sitio que incluya las páginas públicas y las
  fichas publicadas, y que excluya las que estén en borrador.

**Datos**

- **FR-017**: El sistema MUST almacenar productos, categorías e imágenes de producto de forma
  persistente, con los cambios de estructura aplicados mediante migraciones versionadas.
- **FR-018**: El precio MUST almacenarse y calcularse con precisión decimal exacta, sin pérdida de
  centavos.
- **FR-019**: Cada imagen de producto MUST tener texto alternativo obligatorio.
- **FR-020**: El sistema MUST incluir un conjunto de datos de ejemplo representativo del catálogo
  de Hidrosal (purificadores residenciales, filtración industrial, ósmosis inversa, suavizadores,
  desalinización, y repuestos y consumibles) que permita probar catálogo, filtros, búsqueda,
  paginación y ficha sin esperar a la administración.
- **FR-021**: El sistema MUST impedir dos productos con el mismo identificador legible y dos
  categorías con el mismo identificador legible.

**Presentación y continuidad**

- **FR-022**: El sistema MUST conservar todas las páginas y anclas públicas del sitio de marketing
  actual en sus mismas direcciones.
- **FR-023**: Las páginas nuevas MUST usar el sistema de diseño aprobado: tema blanco, los tokens
  de color existentes y las tipografías Outfit e Inter.
- **FR-024**: Las páginas de catálogo y ficha MUST ser operables únicamente con teclado, con foco
  visible y orden de tabulación lógico.
- **FR-025**: El texto de las páginas nuevas MUST cumplir una relación de contraste mínima de
  4,5:1.
- **FR-026**: Las imágenes MUST reservar su espacio antes de cargarse, de modo que el contenido no
  salte durante la carga.
- **FR-027**: Todo el contenido de cara al público MUST estar en español salvadoreño y los precios
  expresados en dólares estadounidenses.
- **FR-028**: El precio mostrado MUST indicar de forma explícita su relación con el IVA
  [NEEDS CLARIFICATION: ¿el precio que se publica incluye el IVA del 13 % o se muestra sin IVA y
  se advierte que se añade al cotizar?]
- **FR-029**: El catálogo MUST contemplar productos sin precio público
  [NEEDS CLARIFICATION: ¿todos los productos llevan precio visible, o los equipos industriales se
  publican como "precio a consultar" y solo los de consumo llevan precio?]

### Key Entities *(include if feature involves data)*

- **Producto**: un equipo o consumible que Hidrosal ofrece. Atributos relevantes: código interno
  (SKU), identificador legible para la dirección, nombre, descripción, conjunto de
  especificaciones técnicas (pares de nombre y valor), precio en dólares, estado de publicación
  (publicado o borrador), disponibilidad, y fechas de creación y actualización. Pertenece a una
  categoría y tiene una o varias imágenes.
- **Categoría**: agrupación comercial de productos (por ejemplo, ósmosis inversa o repuestos y
  consumibles). Atributos: identificador legible, nombre, descripción y orden de presentación.
  Agrupa varios productos.
- **Imagen de producto**: fotografía asociada a un producto. Atributos: ubicación del archivo,
  texto alternativo obligatorio, orden de presentación e indicador de imagen principal. Pertenece
  a un producto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante que llega a la portada encuentra un producto concreto del catálogo en
  menos de 30 segundos, usando el filtro de categoría o el buscador.
- **SC-002**: El 100 % de las fichas publicadas muestran nombre, categoría, al menos una imagen
  con texto alternativo, especificaciones técnicas, precio y disponibilidad.
- **SC-003**: Las páginas de catálogo y de ficha se completan solo con teclado, y una auditoría
  automática de accesibilidad no reporta ningún error grave.
- **SC-004**: El contenido principal del catálogo y de la ficha es visible en menos de 2,5
  segundos en una conexión móvil simulada de gama media, y el desplazamiento acumulado de diseño
  se mantiene por debajo de 0,1.
- **SC-005**: Ninguna de las direcciones públicas del sitio de marketing anterior queda rota tras
  la migración: 0 enlaces internos con error.
- **SC-006**: Las direcciones de producto publicadas siguen resolviendo correctamente tras un
  despliegue posterior y tras un cambio de nombre del producto: 0 direcciones rotas.
- **SC-007**: El catálogo mantiene los tiempos de SC-004 con al menos 200 productos publicados y
  10 categorías.
- **SC-008**: Una persona del equipo de Hidrosal, sin conocimientos técnicos, puede recorrer el
  catálogo y explicar qué vende la empresa sin ayuda, en la primera sesión de revisión.

## Assumptions

- **Sin variantes de producto**: cada combinación vendible (capacidad, voltaje, tamaño) se publica
  como un producto independiente con su propio código. Las variantes agrupadas bajo un mismo
  producto quedan fuera de esta entrega.
- **Una categoría por producto**: no hay productos en varias categorías ni subcategorías anidadas
  en esta entrega.
- **Disponibilidad como indicador, no como inventario**: se publica "disponible" o "agotado"; no
  se lleva conteo de existencias ni reservas, porque eso pertenece al carrito y al checkout.
- **Origen de los datos**: hasta la tercera entrega los productos se cargan mediante migraciones y
  datos de ejemplo. No hay pantalla de administración en esta entrega.
- **Imágenes**: se sirven desde el propio proyecto; no se integra un gestor de archivos externo
  hasta que exista la administración.
- **Llamada a la acción provisional**: la ficha lleva al formulario de contacto. El botón de
  añadir al carrito llegará en la segunda entrega y sustituirá a esa llamada a la acción.
- **Un solo idioma y una sola moneda**: español y dólares estadounidenses. No hay selector de
  idioma ni de moneda.
- **Los datos de ejemplo son representativos, no reales**: los nombres, precios y especificaciones
  del conjunto de prueba deberán sustituirse por el catálogo real antes de publicar.
- **Tamaño de página del catálogo**: 12 productos por página, ajustable sin cambiar la
  especificación.
- **El sitio de marketing es la fuente de la identidad visual**: cualquier duda de diseño se
  resuelve mirando las páginas actuales, no inventando componentes nuevos.

## Dependencies

- **Entrega 2 (carrito y checkout)** depende de esta: reutilizará el modelo de productos y
  sustituirá la llamada a la acción de la ficha.
- **Entrega 3 (administración)** depende de esta: administrará las mismas entidades que aquí se
  definen.
- **Elección de pasarela de pago**: pendiente, pero NO bloquea esta entrega, porque aquí no se
  cobra.
- **Plan de alojamiento en Hostinger con ejecución de Node**: debe confirmarse antes del
  despliegue; un plan solo con PHP no puede servir esta aplicación.
