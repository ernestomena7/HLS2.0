# Contrato del puerto de pasarela de pago

**Feature**: 002 Carrito y checkout · **Fecha**: 2026-10-11

Este es el contrato que hace posible construir y probar todo el checkout **hoy**, sin
credenciales de n1co (decisión D-5). El checkout habla con esta interfaz; quién esté
detrás es intercambiable.

---

## La interfaz

Tres operaciones. Ni una más.

### 1 · `crearCobro(pedido) → ResultadoDeCobro`

Pide al proveedor que prepare un cobro para un pedido ya creado y `PENDIENTE_PAGO`.

**Entrada**: referencia del pedido, importe total, moneda, descripción corta, datos de
contacto del comprador y las direcciones de retorno (éxito y cancelación).

**Salida**:

| Campo | Significado |
|-------|-------------|
| `urlDePago` | A dónde enviar al comprador |
| `referenciaExterna` | El identificador del cobro en el proveedor |

**Errores**: el proveedor no responde, rechaza la petición o devuelve algo que no
cumple el esquema. En los tres casos el checkout MUST mostrar que no se pudo iniciar el
pago, conservar el carrito y **no** dejar el pedido en un estado falso.

**Invariante**: `crearCobro` **nunca** cambia el estado del pedido. Solo registra un
`IntentoDePago` en estado `INICIADO`.

---

### 2 · `verificarNotificacion(peticionCruda) → EventoDePago | Rechazada`

Recibe la petición **sin interpretar** y decide si es auténtica.

**Entrada**: cuerpo crudo y cabeceras, tal como llegaron. Interpretar antes de
verificar es por donde entran los ataques (decisión D-13).

**Salida cuando es auténtica**:

| Campo | Significado |
|-------|-------------|
| `idEvento` | Identificador del evento en el proveedor. Es la llave de la idempotencia |
| `referenciaExterna` | El cobro al que se refiere |
| `referenciaPedido` | El pedido, cuando el proveedor lo devuelve |
| `estado` | `APROBADO` \| `RECHAZADO` \| `CANCELADO` \| `CADUCADO` |
| `importe` | Lo cobrado |
| `ocurridoEn` | Cuándo |

**Salida cuando no lo es**: `Rechazada`, con el motivo. La notificación se guarda igual,
marcada como no verificada (FR-028).

**Invariantes**:

1. MUST ser una función pura respecto a la entrada: la misma petición da siempre el
   mismo resultado.
2. MUST NOT tocar la base de datos. Decide; no actúa.
3. Un importe que no coincida con el del pedido MUST tratarse como motivo de rechazo,
   no como un pago válido.

---

### 3 · `consultarEstado(referenciaExterna) → EstadoDeCobro`

Pregunta al proveedor en qué quedó un cobro.

**Para qué existe**: FR-030. Cuando la notificación no llega —y a veces no llega— esto
es lo que evita que un pedido se quede colgado para siempre. Se usa en el retorno del
comprador y en la barrida de vencimientos, **nunca** para dar por bueno lo que diga el
navegador.

---

## Quién implementa la interfaz

### `simulada` — la que se usa para construir y probar

Reproduce el comportamiento del proveedor sin red ni dinero: devuelve una `urlDePago`
local donde se elige el desenlace (aprobar, rechazar, cancelar), y firma sus
notificaciones con un secreto de desarrollo.

**No es un atajo, es el banco de pruebas**: es lo que permite cubrir con pruebas
automatizadas la notificación duplicada, la firma inválida, la notificación que llega
con el comprador desconectado y el doble envío del formulario (decisión D-15). Esas
pruebas seguirán sirviendo cuando n1co esté conectado, porque prueban **el checkout**,
no al proveedor.

**MUST NOT** poder activarse en producción: la configuración de entorno lo impide y hay
una prueba que lo comprueba.

### `n1co` — la que falta

Lo que se sabe (decisión D-6), **sin confirmar**, porque su documentación está bloqueada
desde el entorno de trabajo (riesgo R-2):

- *Integration API* REST con módulos **EPay** y **Merchant**, más una **CheckoutLink
  API**, que es la candidata: cobro alojado por n1co, sin que datos de tarjeta pasen por
  Hidrosal.
- Entornos de **pruebas** y **producción** separados.
- **Notificaciones** con un token secreto generado en el portal del comercio, bajo
  *Configuración → Webhook*, y dirección de recepción registrada ahí.
- **No hay paquete en npm**: comprobado. El adaptador será HTTP escrito a mano.

**Preguntas que hay que responder antes de escribirlo**:

1. Direcciones base de pruebas y de producción.
2. Esquema de autenticación de las peticiones salientes.
3. Cómo se crea un enlace de cobro y qué devuelve.
4. Nombres y contenido de los eventos de notificación.
5. **Cómo se verifica la firma**: qué cabecera, qué algoritmo y sobre qué se calcula.
6. Si la consulta de estado de un cobro existe y con qué forma.

Las seis caben en la interfaz de arriba sin cambiarla. Si alguna obligara a cambiarla,
es señal de que hay que revisar el contrato antes de seguir, no de parchearlo.

---

## Configuración

| Variable | Para qué |
|----------|----------|
| `PASARELA_PROVEEDOR` | `simulada` o `n1co` |
| `PASARELA_ENTORNO` | `pruebas` o `produccion` |
| `N1CO_*` | Credenciales y secreto de verificación. Vacías en `.env.example`, nunca versionadas |

**Regla** (principio I): ningún secreto en el repositorio. `.env.example` documenta cada
clave con el valor vacío.

---

## Lo que este contrato deja fuera a propósito

- **Reembolsos**: n1co los admite, pero la especificación no los pide. Cuando se
  necesiten, serán una cuarta operación y un hecho nuevo en el histórico, no un
  retroceso de estado.
- **Pagos recurrentes**: fuera de alcance.
- **Guardar tarjetas**: prohibido por el principio I.
