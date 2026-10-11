# Feature Specification: Carrito y checkout

**Feature Branch**: `claude/hls-water-purification-site-tvl85i`

**Created**: 2026-10-11

**Status**: Draft

**Input**: Descripción del usuario: "de la entrega 2: carrito y checkout. A futuro pienso conectarlo con n1co como pasarela de pago, así que si puedes buscar en su documentación y lo dejas listo mucho mejor, pero si no puedes, solo déjalo lo más listo posible para la integración a futuro"

Segunda de las tres entregas de la tienda en línea de Hidrosal. La entrega 001 dejó
el catálogo público y la ficha de producto. Esta añade la parte que convierte una
visita en una venta: el carrito, el proceso de compra y el cobro. La administración
de productos y usuarios es la entrega 003 y queda fuera.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Armar el carrito (Priority: P1)

Una persona que ya encontró lo que necesita en el catálogo lo va juntando: añade un
equipo de ósmosis inversa desde su ficha, vuelve al catálogo y añade dos cartuchos de
repuesto. En cualquier momento ve cuántas cosas lleva y cuánto suman. Entra al
carrito, sube la cantidad de cartuchos a cuatro, quita el que añadió por error y ve
el total actualizado, con el IVA ya incluido. Si cierra el navegador y vuelve al día
siguiente, su carrito sigue ahí.

**Why this priority**: sin carrito no hay tienda. Es el primer paso de cualquier
compra y lo único de esta entrega que aporta valor por sí solo: aunque el pago aún no
estuviera listo, un carrito que recuerda lo que el visitante quiere ya permite
recibir el pedido por otra vía.

**Independent Test**: añadir productos desde la ficha y desde el catálogo, cambiar
cantidades, quitar líneas, comprobar los totales y volver a abrir el sitio para
comprobar que el carrito persiste.

**Acceptance Scenarios**:

1. **Given** un producto publicado, disponible y con precio, **When** el visitante lo
   añade al carrito, **Then** ve una confirmación inmediata y el contador del carrito
   refleja la nueva cantidad.
2. **Given** el carrito tiene varias líneas, **When** el visitante lo abre, **Then**
   ve por cada línea la imagen, el nombre, el precio unitario, la cantidad y el
   subtotal, y abajo el total con la leyenda «IVA incluido».
3. **Given** una línea del carrito, **When** el visitante cambia su cantidad o la
   elimina, **Then** los subtotales y el total se recalculan sin recargar la página y
   sin perder las demás líneas.
4. **Given** un producto ya está en el carrito, **When** el visitante lo añade otra
   vez, **Then** se suma a la línea existente en lugar de crear una duplicada.
5. **Given** un visitante con carrito, **When** cierra el navegador y vuelve días
   después, **Then** encuentra el mismo carrito.
6. **Given** un producto sin precio público o marcado como agotado, **When** el
   visitante lo mira, **Then** no puede añadirlo al carrito y en su lugar se le ofrece
   solicitar una cotización.

---

### User Story 2 - Comprar y pagar en línea (Priority: P2)

El visitante decide comprar. Deja su nombre, correo y teléfono, elige cómo quiere
recibir lo que compró, revisa un resumen con el total y paga con tarjeta. Al
terminar ve una confirmación con el número de pedido y recibe un comprobante por
correo.

**Why this priority**: es la razón de ser de la entrega. Depende del carrito, así que
va después, pero es lo que cierra la venta.

**Independent Test**: recorrer la compra completa con el entorno de pruebas del
proveedor de pago y comprobar que queda un pedido con el total correcto, el estado
correcto y un comprobante enviado.

**Acceptance Scenarios**:

1. **Given** un carrito con productos, **When** el visitante inicia la compra,
   **Then** se le piden sus datos de contacto y de entrega, y ve el resumen del
   pedido con el total que va a pagar.
2. **Given** el visitante completó sus datos, **When** confirma el pedido, **Then**
   se le lleva al pago del proveedor y el pedido queda registrado como pendiente de
   pago antes de salir del sitio.
3. **Given** el pago se aprueba, **When** el visitante vuelve al sitio, **Then** ve la
   confirmación con el número de pedido y el detalle de lo comprado.
4. **Given** el pago se rechaza o el visitante lo cancela, **When** vuelve al sitio,
   **Then** ve un mensaje claro de que no se cobró nada, conserva su carrito intacto y
   puede intentarlo de nuevo.
5. **Given** un formulario incompleto o con datos inválidos, **When** el visitante
   intenta continuar, **Then** ve en español qué campo corregir y no se crea ningún
   pedido.
6. **Given** un pedido pagado, **When** se consulta su detalle, **Then** los precios
   y el total son los que había al momento de comprar, aunque el catálogo haya
   cambiado después.

---

### User Story 3 - Que el cobro sea fiable (Priority: P3)

Nadie ve esta historia, y por eso importa. El estado del pedido lo decide el
proveedor de pago, no el navegador del comprador: si el comprador cierra la pestaña
justo después de pagar, el pedido igual queda como pagado. Si el proveedor avisa dos
veces del mismo pago, el pedido no se duplica ni se cobra dos veces. Si el comprador
pulsa «pagar» tres veces seguidas, se genera un solo pedido.

**Why this priority**: un carrito bonito con cobros que se pierden o se duplican
destruye la confianza del cliente y cuesta dinero real. Es la historia que convierte
la tienda en algo que se puede operar.

**Independent Test**: simular en el entorno de pruebas una confirmación duplicada, una
confirmación que llega con el comprador desconectado, una confirmación falsificada y
un doble envío del formulario; comprobar que en los cuatro casos queda exactamente un
pedido con el estado correcto.

**Acceptance Scenarios**:

1. **Given** un pago aprobado, **When** el comprador nunca vuelve al sitio, **Then**
   el pedido queda igualmente registrado como pagado.
2. **Given** una confirmación de pago ya procesada, **When** el proveedor la vuelve a
   enviar, **Then** el pedido no cambia y no se genera un segundo pedido ni un segundo
   cobro.
3. **Given** una notificación de pago que no se puede verificar como auténtica,
   **When** llega al sistema, **Then** se rechaza, se registra el intento y ningún
   pedido cambia de estado.
4. **Given** el comprador confirma el pedido varias veces seguidas, **When** se
   procesan esas confirmaciones, **Then** existe un único pedido.
5. **Given** un pedido pendiente de pago que nunca se completa, **When** pasa el plazo
   establecido, **Then** queda marcado como caducado y deja de ocupar sitio en los
   informes de pedidos reales.

---

### User Story 4 - Pedir cotización de lo que no se vende en línea (Priority: P4)

Hay productos sin precio público —una planta industrial, por ejemplo— y equipos que
requieren visita técnica antes de venderse. El visitante interesado no se topa con una
pared: pide una cotización desde la misma ficha, indicando qué necesita, y Hidrosal
recibe la consulta con la referencia del producto.

**Why this priority**: es el camino de venta de los equipos más caros del catálogo, que
son justamente los que no se compran con tarjeta. Sin esto, la parte más rentable del
negocio queda sin salida en el sitio.

**Independent Test**: abrir la ficha de un producto sin precio, pedir cotización y
comprobar que la solicitud queda registrada con la referencia del producto y llega a
ventas.

**Acceptance Scenarios**:

1. **Given** un producto sin precio público, **When** el visitante abre su ficha,
   **Then** la acción principal es solicitar una cotización, no comprar.
2. **Given** el visitante solicita una cotización, **When** la envía, **Then** queda
   registrada con el producto, sus datos de contacto y su mensaje, y recibe
   confirmación en pantalla.
3. **Given** el visitante tiene un carrito con productos comprables, **When** solicita
   una cotización, **Then** su carrito no se ve afectado.

---

### User Story 5 - Saber qué pasó con el pedido (Priority: P5)

Después de comprar, el comprador quiere poder volver a mirar qué pidió y en qué va.
Recibe un comprobante por correo con el número de pedido y puede consultar su estado
en el sitio con ese número y su correo.

**Why this priority**: reduce las llamadas a ventas preguntando «¿llegó mi pago?», pero
no bloquea la venta. Va al final.

**Independent Test**: completar una compra, comprobar que llega el comprobante y que
la consulta del pedido muestra el mismo contenido; comprobar que con un número o un
correo que no corresponden no se muestra nada.

**Acceptance Scenarios**:

1. **Given** un pedido pagado, **When** se completa la compra, **Then** el comprador
   recibe un comprobante por correo con el número de pedido, el detalle y el total.
2. **Given** un número de pedido y el correo con el que se compró, **When** el
   comprador los introduce, **Then** ve el estado y el detalle de ese pedido.
3. **Given** un número de pedido válido con un correo que no le corresponde, **When**
   se intenta consultar, **Then** no se muestra ningún dato del pedido.

---

### Edge Cases

- **El precio cambia mientras el carrito espera**: el comprador añadió algo a $389 y
  al pagar cuesta $420. Se le avisa del cambio antes de cobrar y se le pide
  confirmarlo; nunca se cobra un precio distinto del que aceptó.
- **El producto deja de estar publicado o se agota** mientras está en el carrito: la
  línea se marca como no disponible, no se puede pagar hasta resolverla, y el resto
  del carrito sigue intacto.
- **El carrito queda vacío** al llegar al checkout (porque se quitó la última línea en
  otra pestaña): se devuelve al catálogo con un aviso, sin crear pedido.
- **El proveedor de pago no responde** al iniciar el cobro: el comprador ve que no se
  pudo iniciar el pago, su carrito queda intacto y no se crea un pedido fantasma.
- **La confirmación del proveedor llega antes** de que el comprador vuelva al sitio:
  la página de confirmación muestra el pedido ya pagado, sin pedir nada más.
- **La confirmación del proveedor llega tarde** o no llega: el pedido queda pendiente y
  se resuelve consultando el estado al proveedor, no adivinando.
- **El comprador paga dos veces** el mismo pedido desde dos pestañas: solo un cobro
  queda asociado al pedido, y cualquier cobro sobrante queda señalado para devolución.
- **Cantidad absurda** (cero, negativa, 9999): se corrige a un rango válido en lugar de
  romper el carrito.
- **Una línea de producto sin imagen**: se muestra la imagen de reserva, como en el
  catálogo.
- **El comprador escribe un correo con errata**: el comprobante no llega. El número de
  pedido se muestra en pantalla además de enviarse, para que no dependa solo del
  correo.

## Requirements *(mandatory)*

### Functional Requirements

#### Carrito

- **FR-001**: El sistema MUST permitir añadir al carrito cualquier producto publicado,
  disponible y con precio público, desde el catálogo y desde su ficha.
- **FR-002**: El sistema MUST NOT permitir añadir al carrito un producto sin precio
  público, agotado o no publicado.
- **FR-003**: El sistema MUST sumar la cantidad a la línea existente cuando se añade un
  producto que ya está en el carrito, en vez de crear una línea duplicada.
- **FR-004**: Los visitantes MUST poder cambiar la cantidad de cada línea y eliminar
  líneas, con el total recalculándose de inmediato.
- **FR-005**: El sistema MUST limitar la cantidad por línea a un rango válido (mínimo 1
  y un máximo razonable por línea) y corregir cualquier valor fuera de rango en lugar de
  fallar.
- **FR-006**: El sistema MUST conservar el carrito del visitante entre visitas durante
  al menos 30 días, sin exigirle crear una cuenta.
- **FR-007**: El sistema MUST mostrar en la navegación un indicador con la cantidad de
  artículos del carrito, visible desde cualquier página.
- **FR-008**: El sistema MUST mostrar, por cada línea, imagen, nombre, precio unitario,
  cantidad y subtotal; y para el carrito, el total con la leyenda «IVA incluido».
- **FR-009**: El sistema MUST calcular todos los totales en el servidor. Un total
  enviado desde el navegador MUST NOT ser aceptado como válido.
- **FR-010**: El sistema MUST revalidar precio, publicación y disponibilidad de cada
  línea al abrir el carrito y al iniciar la compra, y avisar de cualquier cambio antes
  de cobrar.

#### Compra y pago

- **FR-011**: El sistema MUST pedir, para comprar: nombre, correo electrónico y
  teléfono. La compañía MUST ser opcional.
- **FR-012**: El sistema MUST ofrecer al comprador la forma de recepción de su compra
  [NEEDS CLARIFICATION: ¿qué opciones de entrega ofrece Hidrosal y con qué costo? Ver Q2]
  y MUST reflejar su costo en el total antes de cobrar.
- **FR-013**: El sistema MUST mostrar un resumen completo —líneas, costo de entrega si
  lo hay y total— y exigir la aceptación de los términos antes de cobrar.
- **FR-014**: El sistema MUST permitir pagar con los medios que Hidrosal acepte
  [NEEDS CLARIFICATION: ¿solo tarjeta, o también transferencia bancaria o pago contra entrega? Ver Q3].
- **FR-015**: El sistema MUST permitir comprar en línea los productos dentro del alcance
  acordado [NEEDS CLARIFICATION: ¿todo el catálogo con precio, o hay un tope de monto por encima del cual se pide cotización? Ver Q1].
- **FR-016**: El sistema MUST NOT recibir, almacenar ni registrar datos de tarjeta en
  ningún momento. Los datos de pago MUST introducirse exclusivamente en el entorno del
  proveedor de pago.
- **FR-017**: El sistema MUST registrar el pedido como pendiente de pago **antes** de
  enviar al comprador a pagar, de modo que ningún cobro pueda existir sin un pedido que
  lo respalde.
- **FR-018**: El sistema MUST congelar en el pedido el precio unitario, el nombre y la
  referencia de cada producto en el momento de la compra, de modo que un cambio
  posterior en el catálogo no altere un pedido ya realizado.
- **FR-019**: El sistema MUST operar en dólares, con el IVA del 13 % ya incluido en los
  precios publicados (heredado de la entrega 001) y MUST mostrar el importe de IVA
  contenido en el total, para que el comprador pueda verificarlo.
- **FR-020**: El sistema MUST vaciar el carrito únicamente cuando el pedido queda
  confirmado como pagado; ante un pago rechazado o cancelado MUST conservarlo intacto.

#### Fiabilidad del cobro

- **FR-021**: El estado de pago de un pedido MUST determinarse exclusivamente por la
  confirmación verificada del proveedor de pago. Lo que diga el navegador del comprador
  MUST NOT bastar para dar un pedido por pagado.
- **FR-022**: El sistema MUST verificar la autenticidad de cada notificación del
  proveedor antes de actuar sobre ella, y MUST rechazar y registrar las que no pueda
  verificar.
- **FR-023**: El procesamiento de las notificaciones del proveedor MUST ser idempotente:
  recibir la misma notificación varias veces MUST producir el mismo resultado que
  recibirla una sola vez.
- **FR-024**: El sistema MUST impedir que una doble confirmación del comprador genere
  dos pedidos o dos cobros del mismo carrito.
- **FR-025**: El sistema MUST poder consultar al proveedor el estado real de un cobro
  cuando la notificación no llegue, en lugar de dejar el pedido en un limbo indefinido.
- **FR-026**: El sistema MUST marcar como caducados los pedidos que quedan pendientes de
  pago más allá de un plazo definido, sin borrarlos.
- **FR-027**: El sistema MUST registrar en bitácora cada cambio de estado de un pedido y
  cada notificación recibida, con fecha y origen, de modo que cualquier discrepancia
  pueda reconstruirse después.
- **FR-028**: Los mensajes de error en pantalla MUST NOT exponer detalles técnicos ni
  identificadores internos del proveedor de pago.

#### Cotizaciones

- **FR-029**: Los visitantes MUST poder solicitar una cotización desde la ficha de
  cualquier producto, y la solicitud MUST registrar la referencia del producto, los
  datos de contacto y el mensaje.
- **FR-030**: El sistema MUST mostrar la solicitud de cotización como acción principal
  en los productos que no se pueden comprar en línea.
- **FR-031**: El sistema MUST notificar a ventas cada solicitud de cotización recibida.

#### Después de la compra

- **FR-032**: El sistema MUST asignar a cada pedido una referencia legible, única y no
  adivinable, y mostrarla en pantalla al terminar la compra.
- **FR-033**: El sistema MUST enviar al comprador un comprobante por correo con la
  referencia, el detalle y el total del pedido.
- **FR-034**: Los compradores MUST poder consultar el estado y el detalle de su pedido
  indicando su referencia junto con el correo con el que compraron.
- **FR-035**: El sistema MUST NOT mostrar datos de un pedido a quien no aporte esa
  combinación correcta.

#### Transversales

- **FR-036**: Todo el contenido visible MUST estar en español salvadoreño.
- **FR-037**: Carrito, compra y consulta de pedido MUST ser operables solo con teclado,
  con foco visible y orden lógico, y MUST cumplir el nivel AA de contraste.
- **FR-038**: El sistema MUST conservar intactos el sitio de marketing y el catálogo de
  la entrega 001, incluidas sus direcciones.
- **FR-039**: El sistema MUST permitir operar contra el entorno de pruebas del proveedor
  de pago sin tocar dinero real, y cambiar a producción sin cambiar código.

### Key Entities

- **Carrito**: lo que un visitante ha juntado y todavía no ha comprado. Pertenece a un
  visitante anónimo, tiene fecha de última actividad y caduca. Contiene 0..n líneas.
- **Línea de carrito**: un producto y una cantidad dentro de un carrito, con el precio
  vigente en el catálogo.
- **Pedido**: una compra concreta. Tiene referencia propia, datos de contacto del
  comprador, forma de entrega, total, estado y fechas. Es inmutable en su contenido
  una vez creado: lo único que cambia es su estado.
- **Línea de pedido**: copia congelada de lo comprado —nombre, referencia del producto,
  precio unitario y cantidad— independiente de que el catálogo cambie después.
- **Intento de pago**: cada vez que se envía al comprador a pagar un pedido. Guarda el
  identificador que devuelve el proveedor, el importe, el estado y el momento. Un
  pedido puede tener varios intentos y como mucho uno aprobado.
- **Notificación de pago**: cada aviso recibido del proveedor, con su contenido, el
  resultado de su verificación y si ya fue procesada. Es el registro que permite que el
  procesamiento sea idempotente y auditable.
- **Solicitud de cotización**: una consulta comercial sobre un producto, con los datos
  de contacto, el mensaje y el producto consultado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un comprador que llega con la decisión tomada completa la compra, desde la
  ficha del producto hasta la confirmación, en menos de 3 minutos.
- **SC-002**: El total que el comprador ve antes de pagar coincide con el importe
  cobrado en el 100 % de las compras.
- **SC-003**: Ningún dato de tarjeta pasa por los sistemas de Hidrosal, comprobable
  revisando lo que el sistema recibe y almacena.
- **SC-004**: En pruebas de confirmaciones repetidas, confirmaciones tardías y dobles
  envíos del formulario, el número de pedidos duplicados y de cobros duplicados es
  **cero**.
- **SC-005**: El 95 % de los pagos aprobados quedan reflejados en el pedido en menos de
  60 segundos desde la aprobación.
- **SC-006**: El carrito de un visitante sobrevive al cierre del navegador durante al
  menos 30 días.
- **SC-007**: El contenido principal del carrito y del checkout se ve en menos de 2,5
  segundos en una conexión 4G de gama media, con desplazamiento acumulado de diseño por
  debajo de 0,1, igual que el resto del sitio.
- **SC-008**: Una auditoría automática de accesibilidad sobre carrito, checkout,
  confirmación y consulta de pedido no reporta ninguna incidencia de nivel A ni AA.
- **SC-009**: Se puede recorrer una compra completa de principio a fin en el entorno de
  pruebas del proveedor sin mover dinero real.
- **SC-010**: Ante una discrepancia, el histórico permite reconstruir qué le pasó a un
  pedido y cuándo, sin consultar al proveedor de pago.

## Assumptions

### Alcance

- **Compra sin cuenta**: se compra como invitado. Las cuentas de cliente no entran en
  esta entrega; la gestión de usuarios de la entrega 003 es para el personal de
  Hidrosal, no para compradores.
- **Sin inventario por unidades**: el catálogo de la entrega 001 solo distingue
  «disponible» y «agotado», sin llevar existencias. Esta entrega no descuenta unidades
  ni reserva stock. Si el negocio lo necesita, es una entrega aparte.
- **Sin cupones ni promociones**, sin precios por volumen y sin pagos recurrentes. El
  proveedor elegido admite suscripciones, pero Hidrosal no las ha pedido.
- **La facturación electrónica (DTE) queda fuera**. El sistema registra la compra y
  envía un comprobante; la emisión del documento tributario sigue haciéndose por los
  medios actuales de Hidrosal. Se recoge el dato mínimo del comprador para poder
  emitirlo después.
- **La administración de pedidos queda fuera**: en esta entrega los pedidos se
  consultan desde la base de datos o por la notificación a ventas. La pantalla de
  administración es la entrega 003.

### Producto y negocio

- Los precios publicados son finales, en dólares y con el IVA del 13 % incluido, tal
  como se resolvió en la entrega 001 (FR-028 y FR-029 de aquella especificación).
- Los productos sin precio público existen y son parte del modelo de negocio: la
  cotización no es un caso raro, es el camino principal de los equipos grandes.
- Hidrosal atiende solo El Salvador. No hay ventas internacionales ni otra moneda.

### Dependencias

- **Proveedor de pago: n1co** (fintech salvadoreña), elegido por el cliente. Lo que se
  pudo confirmar de su documentación pública, sin poder abrirla desde el entorno de
  trabajo —sus dominios están bloqueados por la política de red— y por tanto
  **pendiente de verificar antes de implementar**:
  - expone una *Integration API* de tipo REST con dos módulos: **EPay** (métodos de
    pago, cobros, 3-D Secure, reembolsos, suscripciones y mensajes de error) y
    **Merchant** (tienda, sucursales, enlaces de pago, pedidos, colecciones y
    productos), además de una **CheckoutLink API**;
  - distingue entornos de **pruebas (sandbox)** y de **producción (live)**, que se
    configuran por separado;
  - envía **notificaciones (webhooks)** al comercio, con un token secreto que se genera
    en el portal del comercio, bajo Configuración → Webhook, y una dirección de
    recepción que se registra ahí mismo;
  - publica código de ejemplo y un complemento para WooCommerce en su organización de
    GitHub.
  - **Sin confirmar**: direcciones base, esquema exacto de autenticación, nombres y
    contenido de los eventos, forma de verificar la firma de las notificaciones, y
    condiciones comerciales (comisiones, plazos de liquidación, requisitos de alta).
- **Se diseña para no depender de n1co**: el cobro se trata como un servicio externo
  intercambiable, con una frontera clara entre el pedido —que es de Hidrosal— y el
  cobro —que es del proveedor. Si n1co no cuadra, o si más adelante hay que añadir otro
  proveedor, lo que cambia es la pieza de cobro, no el carrito, el pedido ni el
  checkout.
- **Se prefiere el cobro alojado por el proveedor** (enlace o página de pago suya) antes
  que un formulario de tarjeta propio. No es una preferencia estética: evita que datos
  de tarjeta pasen por los sistemas de Hidrosal, que es lo que exige el principio I de
  la constitución, y reduce drásticamente las obligaciones de cumplimiento PCI.
- **Envío de correo**: hace falta un servicio de correo saliente para el comprobante.
  Hidrosal aún no ha indicado cuál. Hasta tenerlo, el número de pedido se muestra en
  pantalla y la venta no depende del correo.
- Esta entrega se apoya en el catálogo, la ficha, el modelo de datos y el diseño ya
  aprobados en la entrega 001.

### Riesgos

- **R-1 (heredado, bloqueante)**: el plan de alojamiento debe ejecutar Node. Sigue sin
  confirmarse y bloquea cualquier despliegue, también el de esta entrega.
- **R-2**: la documentación de n1co no se pudo leer desde el entorno de trabajo. Antes
  de planificar la implementación hay que abrirla desde una red sin restricciones, o
  pedir al cliente el acceso al portal de comercio y las credenciales de pruebas.
- **R-3**: el alta como comercio en n1co, sus comisiones y sus plazos de liquidación son
  trámites del cliente, no del equipo de desarrollo, y pueden marcar la fecha real de
  puesta en marcha.
- **R-4**: sin servicio de correo saliente confirmado, el comprobante por correo
  (historia 5) no se puede completar aunque el código esté listo.
