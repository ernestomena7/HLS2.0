# Fase 1 — Modelo de datos

**Feature**: 002 Carrito y checkout · **Fecha**: 2026-10-11

Motor: MySQL 8.0 o MariaDB 10.6+, accedido solo por Prisma, con migraciones versionadas
(principio III). Este documento **añade** entidades a las de la entrega 001; `Producto`
y `Categoria` no se tocan.

Convención heredada: campos en `camelCase` en el modelo, columnas en `snake_case`,
tablas en plural, dinero en `DECIMAL(10,2)`.

---

## Entidades nuevas

### Carrito

Lo que un visitante ha juntado y todavía no ha comprado.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `token` | cadena (64) | **único**, aleatorio y opaco; es lo que viaja en la cookie |
| `estado` | enumerado | `ABIERTO` \| `CONVERTIDO` \| `ABANDONADO`. Por defecto `ABIERTO` |
| `creadoEn` / `actualizadoEn` | marca de tiempo | gestionadas por el ORM |
| `expiraEn` | marca de tiempo | obligatoria; 30 días desde la última actividad (FR-006) |

Índices: único en `token`; índice en `(estado, expiraEn)` para la barrida.

Relación: tiene 0..n `LineaCarrito`. Un carrito `CONVERTIDO` apunta al `Pedido` que
lo consumió.

**Regla**: un carrito solo pasa a `CONVERTIDO` dentro de la misma transacción que crea
el pedido (decisión D-14). Un segundo intento sobre un carrito ya convertido devuelve el
pedido existente en lugar de crear otro.

---

### LineaCarrito

Un producto y una cantidad. **No guarda precio** (decisión D-2).

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `carritoId` | entero | obligatorio, **borrado en cascada** |
| `productoId` | entero | obligatorio, referencia a `Producto`; borrado **restringido** |
| `cantidad` | entero | obligatorio, de 1 a 99 (FR-005) |
| `creadoEn` / `actualizadoEn` | marca de tiempo | gestionadas por el ORM |

Índices: **único en `(carritoId, productoId)`**, que es lo que garantiza FR-003 —añadir
dos veces el mismo producto suma la cantidad en lugar de duplicar la línea— sin depender
de que el código se acuerde de comprobarlo.

---

### Pedido

Una compra concreta. Su contenido es inmutable; lo único que cambia es el estado.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `referencia` | cadena (20) | **única**, legible y no adivinable (FR-022). Formato `HLS-AAAAMM-XXXXXX` |
| `estado` | enumerado | `PENDIENTE_PAGO` \| `PAGADO` \| `NO_COMPLETADO` \| `CANCELADO`. Por defecto `PENDIENTE_PAGO` |
| `medioPago` | enumerado | `TARJETA` \| `TRANSFERENCIA` \| `CONTRA_ENTREGA` |
| `formaEntrega` | enumerado | `RETIRO` \| `ENVIO` |
| `costoEnvio` | `DECIMAL(10,2)` | obligatorio; `0.00` cuando es retiro (FR-012) |
| `subtotal` | `DECIMAL(10,2)` | suma de los subtotales de línea |
| `total` | `DECIMAL(10,2)` | `subtotal + costoEnvio`. Es el importe a cobrar |
| `ivaIncluido` | `DECIMAL(10,2)` | desglose informativo del IVA contenido en `total` (decisión D-3) |
| `moneda` | cadena (3) | `USD` |
| `nombre` | cadena (140) | obligatorio, 3–140 |
| `correo` | cadena (160) | obligatorio, con forma de correo |
| `telefono` | cadena (40) | obligatorio, al menos 8 dígitos |
| `compania` | cadena (140) | **opcional** (FR-017) |
| `direccion` | texto | obligatoria **solo** si `formaEntrega = ENVIO` (FR-014) |
| `municipio` | cadena (80) | igual |
| `departamento` | cadena (80) | igual |
| `referenciasEntrega` | texto | opcional; cómo llegar |
| `testigoCreacion` | cadena (64) | **único**; idempotencia del envío del formulario (decisión D-9) |
| `carritoId` | entero | opcional, referencia al carrito de origen |
| `expiraEn` | marca de tiempo | plazo según el medio de pago (decisión D-10) |
| `pagadoEn` | marca de tiempo | opcional; se llena al pasar a `PAGADO` |
| `creadoEn` / `actualizadoEn` | marca de tiempo | gestionadas por el ORM |

Índices: único en `referencia`; único en `testigoCreacion`; índice en
`(estado, expiraEn)` para la barrida; índice en `(correo, referencia)` para la consulta
del comprador (FR-050); índice en `(estado, creadoEn)` para los listados del personal.

**Reglas de validación** (capa de escritura, con pruebas):

1. `total` MUST ser mayor que 0 y MUST coincidir con `subtotal + costoEnvio`.
2. `costoEnvio` MUST ser `0.00` cuando `formaEntrega = RETIRO`.
3. Los campos de dirección MUST estar presentes cuando `formaEntrega = ENVIO` y MUST
   estar vacíos cuando es `RETIRO`.
4. `pagadoEn` MUST existir si y solo si el estado es `PAGADO`.
5. Un pedido MUST tener al menos una línea.

---

### LineaPedido

Copia congelada de lo comprado (FR-020).

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `pedidoId` | entero | obligatorio, **borrado en cascada** |
| `productoId` | entero | **opcional**, referencia a `Producto`, con `SET NULL` al borrar |
| `sku` | cadena (60) | obligatorio; copia |
| `nombre` | cadena (140) | obligatorio; copia |
| `slug` | cadena (140) | obligatorio; copia, para poder enlazar a la ficha |
| `precioUnitario` | `DECIMAL(10,2)` | obligatorio, mayor que 0; copia |
| `cantidad` | entero | obligatorio, de 1 a 99 |
| `subtotal` | `DECIMAL(10,2)` | `precioUnitario × cantidad` |

Índice: `(pedidoId)`.

**Por qué `productoId` es opcional y se anula al borrar**: si algún día se elimina un
producto del catálogo, el pedido histórico debe seguir contando qué se vendió. El
nombre, el sku y el precio están copiados precisamente para eso.

---

### IntentoDePago

Cada vez que se envía al comprador a pagar con tarjeta.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `pedidoId` | entero | obligatorio, **borrado en cascada** |
| `proveedor` | cadena (40) | `n1co` o `simulada` |
| `referenciaExterna` | cadena (191) | identificador que devuelve el proveedor; **único por proveedor** |
| `importe` | `DECIMAL(10,2)` | obligatorio |
| `estado` | enumerado | `INICIADO` \| `APROBADO` \| `RECHAZADO` \| `CANCELADO` \| `CADUCADO` |
| `creadoEn` / `actualizadoEn` | marca de tiempo | gestionadas por el ORM |

Índices: único en `(proveedor, referenciaExterna)`; índice en `(pedidoId, estado)`.

**Regla**: un pedido puede tener varios intentos —el comprador puede reintentar— pero
**como mucho uno `APROBADO`**. La unicidad lógica se garantiza en la capa de escritura y
se verifica con prueba, igual que se hizo con la imagen principal en la entrega 001.

---

### NotificacionDePago

Cada aviso recibido del proveedor. Es el registro que hace idempotente el
procesamiento (decisión D-9) y auditable el histórico (FR-043).

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `proveedor` | cadena (40) | obligatorio |
| `idEventoExterno` | cadena (191) | **único por proveedor**; es la llave de la idempotencia |
| `cuerpo` | JSON | el contenido recibido, tal cual |
| `firmaVerificada` | booleano | obligatorio |
| `procesadaEn` | marca de tiempo | opcional; nula mientras no se haya procesado |
| `resultado` | cadena (191) | opcional; qué se hizo o por qué se descartó |
| `pedidoId` | entero | opcional; el pedido afectado, si se pudo relacionar |
| `recibidaEn` | marca de tiempo | obligatoria |

Índices: único en `(proveedor, idEventoExterno)`; índice en `(firmaVerificada, recibidaEn)`.

**Se guardan también las rechazadas** (FR-028): una notificación que no verifica es
justo la que hay que poder revisar después.

---

### ConfirmacionManual

Quién dio por pagado —o por no completado— un pedido de transferencia o contra entrega
(FR-038).

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `pedidoId` | entero | obligatorio, **borrado restringido** |
| `usuarioId` | entero | obligatorio, referencia a `UsuarioPersonal`; borrado **restringido** |
| `accion` | enumerado | `CONFIRMAR_PAGO` \| `DESCARTAR` |
| `importe` | `DECIMAL(10,2)` | opcional; el importe realmente recibido |
| `nota` | texto | opcional |
| `creadoEn` | marca de tiempo | obligatoria |

Índice: `(pedidoId, creadoEn)`.

**Borrado restringido en ambas direcciones**: ni un pedido ni un usuario pueden
desaparecer dejando una confirmación huérfana. Una auditoría sin el «quién» no sirve.

---

### UsuarioPersonal

Personal de Hidrosal con acceso a la confirmación de pagos (decisión D-8). Alcance
deliberadamente mínimo; la entrega 003 lo extiende.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `correo` | cadena (160) | **único**, en minúsculas |
| `nombre` | cadena (140) | obligatorio |
| `hashContrasena` | cadena (255) | argon2id; **nunca** la contraseña |
| `activo` | booleano | por defecto `true`; desactivar impide ingresar sin borrar el histórico |
| `ultimoIngresoEn` | marca de tiempo | opcional |
| `creadoEn` / `actualizadoEn` | marca de tiempo | gestionadas por el ORM |

Índice: único en `correo`.

---

### SesionPersonal

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `hashToken` | cadena (64) | **único**; se guarda el **hash** del identificador de sesión, no el identificador |
| `usuarioId` | entero | obligatorio, **borrado en cascada** |
| `expiraEn` | marca de tiempo | obligatoria |
| `creadoEn` | marca de tiempo | obligatoria |
| `ultimoUsoEn` | marca de tiempo | obligatoria |

Índices: único en `hashToken`; índice en `(usuarioId, expiraEn)`.

**Por qué el hash**: si alguien lee la tabla de sesiones, no obtiene cookies válidas con
las que suplantar a nadie. Es la misma razón por la que no se guardan contraseñas.

---

### SolicitudCotizacion

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero autoincremental | clave primaria |
| `productoId` | entero | opcional, referencia a `Producto`, `SET NULL` al borrar |
| `sku` | cadena (60) | obligatorio; copia, para que la consulta sobreviva al catálogo |
| `nombreProducto` | cadena (140) | obligatorio; copia |
| `nombre` | cadena (140) | obligatorio |
| `correo` | cadena (160) | obligatorio |
| `telefono` | cadena (40) | obligatorio |
| `compania` | cadena (140) | opcional |
| `mensaje` | texto | obligatorio, 10–2000 |
| `atendidaEn` | marca de tiempo | opcional |
| `creadoEn` | marca de tiempo | obligatoria |

Índice: `(atendidaEn, creadoEn)`.

---

## Transiciones de estado del pedido

```text
                        crear pedido
                             │
                             ▼
                   ┌──────────────────┐
         ┌─────────│  PENDIENTE_PAGO  │─────────┐
         │         └──────────────────┘         │
         │                   │                  │
   pago confirmado      vence el plazo     el comprador
         │                   │              cancela
         ▼                   ▼                  ▼
   ┌──────────┐     ┌────────────────┐   ┌────────────┐
   │  PAGADO  │     │ NO_COMPLETADO  │   │ CANCELADO  │
   └──────────┘     └────────────────┘   └────────────┘
```

Quién puede provocar cada transición (decisión D-7):

| Transición | Tarjeta | Transferencia | Contra entrega |
|------------|---------|---------------|----------------|
| → `PAGADO` | Notificación verificada del proveedor, o consulta de estado al proveedor | Persona de Hidrosal autenticada | Persona de Hidrosal autenticada |
| → `NO_COMPLETADO` | Vencimiento del plazo (24 h) | Vencimiento (3 días hábiles) o descarte manual | Vencimiento (15 días) o descarte manual |
| → `CANCELADO` | El comprador, antes de pagar | El comprador | El comprador |

**Invariantes**:

- `PAGADO`, `NO_COMPLETADO` y `CANCELADO` son **terminales**: no se vuelve atrás. Una
  devolución, cuando exista, será un hecho nuevo, no un retroceso de estado.
- El navegador del comprador **nunca** provoca `→ PAGADO` (FR-027).
- Toda transición deja fila en el histórico, con origen y fecha (FR-043).

---

## Datos de ejemplo

El seed de la entrega 001 se amplía con:

- **un usuario del personal** para poder ingresar en desarrollo, con contraseña de
  ejemplo documentada en el `quickstart` y **nunca** reutilizable en producción;
- **cuatro pedidos de ejemplo**, uno por cada situación que hay que poder mirar: pagado
  con tarjeta, esperando transferencia, contra entrega pendiente y no completado por
  vencimiento;
- **dos solicitudes de cotización**, una atendida y otra no.

Los pedidos de ejemplo se generan solo en desarrollo: `prisma db seed` en producción
carga el catálogo, no pedidos inventados.
