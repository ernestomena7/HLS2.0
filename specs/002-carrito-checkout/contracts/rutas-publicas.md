# Contrato de rutas

**Feature**: 002 Carrito y checkout · **Fecha**: 2026-10-11

Amplía el contrato de la entrega 001, que sigue vigente sin cambios: `/`, `/productos`,
`/productos/{slug}`, `/sitemap.xml` y `/robots.txt` responden igual que antes (FR-054).

Todas las rutas de este documento se sirven **sin caché** (decisión D-12) y en español
salvadoreño.

---

## Carrito

### `GET /carrito`

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| Carrito con líneas | Cada línea con imagen, nombre, precio unitario, cantidad y subtotal; total con «IVA incluido» | 200 |
| Carrito vacío o inexistente | Mensaje de carrito vacío con enlace al catálogo | 200 |
| Alguna línea cambió de precio | El listado, con el cambio señalado línea a línea (FR-010) | 200 |
| Alguna línea dejó de estar disponible | El listado, con la línea marcada como no disponible y el paso al pago bloqueado | 200 |

### Acciones del carrito

Son mutaciones de servidor, no una API pública. Todas validan la entrada con esquema
tipado antes de tocar datos, y todas recalculan el total **en el servidor** (FR-009).

| Acción | Reglas |
|--------|--------|
| Añadir producto | Solo si está publicado, disponible y con precio (FR-001, FR-002). Si ya está en el carrito, suma cantidad (FR-003) |
| Cambiar cantidad | Se acota a 1–99; fuera de rango se corrige, no falla (FR-005) |
| Quitar línea | Elimina la línea; el resto del carrito no se toca |
| Vaciar | Elimina todas las líneas |

**Invariante**: ninguna acción acepta un precio ni un total que venga del navegador.

---

## Compra

### `GET /checkout`

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| Carrito con líneas válidas | Formulario de datos, elección de entrega y de medio de pago, y resumen | 200 |
| Carrito vacío | Redirección al catálogo con aviso, sin crear pedido | 303 |
| Alguna línea inválida | Redirección al carrito con el problema señalado | 303 |

### `POST /checkout` (confirmar pedido)

Entrada: datos de contacto, forma de entrega, dirección si corresponde, medio de pago,
aceptación de términos y el **testigo de creación** emitido al renderizar la página.

| Situación | Resultado | Código |
|-----------|-----------|--------|
| Datos válidos, medio `TARJETA` | Se crea el pedido `PENDIENTE_PAGO`, se pide el cobro al proveedor y se redirige a su página de pago | 303 |
| Datos válidos, medio `TRANSFERENCIA` | Se crea el pedido `PENDIENTE_PAGO` y se lleva a la confirmación con los datos bancarios y la referencia | 303 |
| Datos válidos, medio `CONTRA_ENTREGA` | Se crea el pedido `PENDIENTE_PAGO` y se lleva a la confirmación | 303 |
| Testigo ya usado | **No se crea un segundo pedido**: se devuelve el existente (FR-041) | 303 |
| Datos inválidos | El formulario con los errores en español; ningún pedido creado | 200 |
| El proveedor no responde | Aviso de que no se pudo iniciar el pago; el carrito queda intacto | 200 |

### `GET /checkout/confirmacion/{referencia}`

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| El pedido existe y la sesión de compra corresponde | Confirmación con referencia, detalle, total y qué hacer según el medio de pago | 200 |
| Pedido con transferencia | Además, los datos bancarios y la referencia a anotar (FR-031) | 200 |
| Referencia inexistente | «No encontrado» | 404 |

### `GET /checkout/retorno` · `GET /checkout/cancelado`

Puntos de regreso desde el proveedor de pago.

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| Regreso tras pago | Se consulta el estado real al proveedor y se muestra la confirmación. **Nunca** se da por pagado por venir de esta ruta (FR-027) | 303 → confirmación |
| Regreso tras cancelar o rechazo | Mensaje de que no se cobró nada, carrito intacto, opción de reintentar o cambiar de medio (FR-025) | 200 |

---

## Notificaciones del proveedor

### `POST /api/pagos/{proveedor}/notificaciones`

Ruta de servidor a servidor. Sin sesión, sin CSRF, con verificación de firma.

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| Firma válida, evento nuevo | Se guarda, se procesa en transacción y se cambia el estado del pedido | 200 |
| Firma válida, evento ya recibido | Se reconoce y **no se hace nada más** (FR-029) | 200 |
| Firma inválida o ausente | Se guarda como no verificada, no cambia ningún pedido (FR-028) | 400 |
| Firma válida, fallo interno al procesar | Se reconoce para no provocar reintentos en cascada; el fallo queda en bitácora (decisión D-13) | 200 |

**Orden obligatorio**: verificar la firma sobre el cuerpo **crudo** antes de
interpretarlo.

---

## Consulta del pedido por el comprador

### `GET /pedidos` · `POST /pedidos`

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| Formulario de consulta | Referencia y correo | 200 |
| Referencia y correo que coinciden | Estado y detalle del pedido (FR-050) | 200 |
| Cualquier otra combinación | **El mismo mensaje** de «no encontramos ese pedido», sin distinguir si la referencia existe (FR-051) | 200 |

**Por qué el mismo mensaje**: distinguir «referencia inexistente» de «correo que no
corresponde» convertiría la pantalla en un oráculo para adivinar referencias válidas.

---

## Cotizaciones

### `POST /cotizaciones`

| Situación | Respuesta | Código |
|-----------|-----------|--------|
| Datos válidos | Se registra con la referencia del producto y se notifica a ventas (FR-046, FR-048) | 303 |
| Datos inválidos | El formulario con los errores en español | 200 |

**Invariante**: enviar una cotización no toca el carrito (historia 4, escenario 3).

---

## Gestión interna (personal de Hidrosal)

Todo bajo `/gestion`. **Toda** ruta comprueba la sesión en el servidor; ocultar el
enlace no cuenta como control de acceso (principio I).

| Ruta | Contenido | Sin sesión |
|------|-----------|------------|
| `GET /gestion/ingreso` | Formulario de ingreso | 200 |
| `POST /gestion/ingreso` | Crea la sesión; mismo mensaje genérico ante correo o contraseña incorrectos | 303 / 200 |
| `POST /gestion/salir` | Cierra la sesión | 303 |
| `GET /gestion/pedidos` | Pedidos pendientes de confirmar, por antigüedad, con los de monto alto señalados (FR-035) | 303 → ingreso |
| `GET /gestion/pedidos/{referencia}` | Detalle y su histórico | 303 → ingreso |
| `POST /gestion/pedidos/{referencia}/confirmar` | Marca `PAGADO`, registra quién, cuándo e importe (FR-036, FR-038) | 303 → ingreso |
| `POST /gestion/pedidos/{referencia}/descartar` | Marca `NO_COMPLETADO`, con el mismo registro | 303 → ingreso |

**Reglas transversales de `/gestion`**:

1. Las mutaciones MUST estar protegidas contra CSRF y la cookie de sesión MUST ser
   `HttpOnly`, `Secure` y `SameSite`.
2. Un intento de confirmar sin sesión válida MUST quedar registrado (FR-039).
3. `/gestion` MUST quedar fuera del mapa del sitio y marcado como no indexable.
4. Confirmar un pedido que ya está en estado terminal MUST ser un no-op explicado, no
   un error ni un segundo cambio.

---

## Barrida de vencimientos

### `POST /api/mantenimiento/caducar`

Ruta protegida por un secreto compartido, pensada para el cron del alojamiento
(decisión D-10). Marca `NO_COMPLETADO` los pedidos vencidos y `ABANDONADO` los carritos
caducados. Es idempotente: ejecutarla dos veces seguidas no cambia nada la segunda vez.

---

## Reglas transversales

1. Español salvadoreño en todo lo visible; sin negociación de idioma.
2. Dólares, con el IVA del 13 % incluido y su desglose visible.
3. Toda página operable con teclado, foco visible y contraste AA (FR-053).
4. Ningún mensaje en pantalla expone detalles técnicos ni identificadores del proveedor
   de pago (FR-045); el detalle va a la bitácora.
5. Ninguna ruta de esta entrega se cachea.
