# Fase 0 — Investigación y decisiones técnicas

**Feature**: 002 Carrito y checkout · **Fecha**: 2026-10-11

Las decisiones se numeran D-1 en adelante dentro de esta entrega. Cuando se cita una
decisión de la entrega 001 se dice explícitamente («decisión D-6 de la entrega 001»).
Las versiones se comprobaron contra el registro de npm el 2026-10-11, no de memoria.

---

## D-1 · El carrito vive en la base de datos, no en el navegador

**Decisión**: un carrito es una fila en la base de datos. El navegador solo lleva una
cookie `HttpOnly` con un identificador opaco y aleatorio que apunta a ella.

**Razón**: tres requisitos lo imponen a la vez. FR-009 exige que **los totales se
calculen en el servidor** y que uno enviado desde el navegador no se acepte; FR-006
exige que el carrito dure **30 días** sin cuenta; FR-010 exige revalidar precio y
disponibilidad contra el catálogo. Un carrito guardado en `localStorage` no cumple
ninguno de los tres: el servidor no lo ve, se pierde al cambiar de dispositivo y
obliga a confiar en lo que mande el cliente.

La cookie es `HttpOnly`, `Secure` y `SameSite=Lax`, como pide el principio I. El
identificador es aleatorio y opaco: conocer uno no permite deducir otro.

**Alternativas consideradas**:

- *Carrito solo en el navegador*: rechazada por lo anterior.
- *Carrito en la sesión del servidor*: no hay sesiones de visitante en esta entrega y
  crearlas para esto sería montar media autenticación sin necesitarla.

---

## D-2 · El precio no se guarda en el carrito; sí en el pedido

**Decisión**: una línea de carrito guarda **producto y cantidad**, nunca el precio. El
precio se lee del catálogo en cada render. Al crear el pedido, los precios se
**copian** a sus líneas y ya no cambian.

**Razón**: FR-010 pide avisar si el precio cambió, y FR-020 pide que un pedido no se
altere cuando el catálogo cambie después. Guardar el precio en el carrito obligaría a
mantenerlo sincronizado y a decidir qué valor manda; no guardarlo elimina la
posibilidad de que se desincronice. La frontera es clara: **el carrito mira el
catálogo, el pedido recuerda**.

**Alternativas consideradas**:

- *Guardar el precio en el carrito y compararlo*: funciona, pero añade un dato que
  puede quedar viejo sin que nadie se entere.

---

## D-3 · Dinero e IVA

**Decisión**: todos los importes en `DECIMAL(10,2)`, manipulados con el tipo decimal de
Prisma, nunca con flotantes (principio III, ya vigente desde la entrega 001). El total
es la suma de subtotales más el costo de envío. El IVA **no se suma**: va incluido en
los precios publicados, así que se **desglosa** hacia atrás:

```text
gravable = redondear(total / 1.13, 2)
iva      = total − gravable
```

El IVA se calcula restando y no multiplicando, para que `gravable + iva` sea
exactamente el total en todos los casos y no aparezca un centavo descuadrado.

**Razón**: FR-019 pide mostrar el IVA contenido en el total; el cliente ya decidió en
la entrega 001 que los precios publicados son finales con el 13 % incluido. El
redondeo se hace una sola vez, al final, sobre el total: redondear línea a línea
introduce diferencias de centavos frente a la factura.

**Alternativas consideradas**:

- *Guardar precios sin IVA y sumarlo al final*: contradice la decisión del cliente en
  la entrega 001 y obligaría a recalcular todo el catálogo.
- *Calcular el IVA como `total × 0.13/1.13`*: matemáticamente equivalente pero con dos
  redondeos; produce descuadres de un centavo.

---

## D-4 · El costo de envío y el umbral de contra entrega son configuración

**Decisión**: el monto fijo del envío (FR-013) y el umbral que marca un pedido contra
entrega como «grande» (FR-035) viven en variables de entorno validadas al arrancar,
junto a las demás.

**Razón**: FR-013 pide que sea configurable «sin tocar código», y una variable de
entorno lo cumple. Moverlo a una tabla editable desde pantalla exigiría la
administración, que es la entrega 003.

**Consecuencia honesta**: cambiar el monto obliga a reiniciar la aplicación. Para un
valor que cambia una o dos veces al año es aceptable; si el cliente quisiera cambiarlo
a menudo, la entrega 003 puede moverlo a una pantalla de ajustes sin tocar el resto.

---

## D-5 · La pasarela de pago es un puerto, no una dependencia

**Decisión**: el código del checkout **no conoce n1co**. Habla con una interfaz corta:

```text
crearCobro(pedido)        → { urlDePago, referenciaExterna }
verificarNotificacion(p)  → EventoDePago | Rechazada
consultarEstado(ref)      → EstadoDeCobro
```

De esa interfaz habrá dos implementaciones: **n1co** y **simulada**. La simulada es la
que se usa en desarrollo y en las pruebas automatizadas.

**Razón**: es la respuesta directa al encargo de «dejarlo lo más listo posible para la
integración a futuro». Hoy no se puede terminar el adaptador de n1co —su documentación
no es accesible desde el entorno de trabajo, riesgo R-2— pero sí se puede construir
**todo lo demás** y probarlo de punta a punta contra la implementación simulada. Cuando
lleguen las credenciales y la documentación, lo que falta es un solo archivo, con un
contrato ya fijado y una batería de pruebas que lo espera.

Beneficio secundario: si el cliente cambiara de proveedor, o quisiera añadir un
segundo, cambia el adaptador y no el carrito, ni el pedido, ni el checkout.

**Alternativas consideradas**:

- *Llamar a n1co directamente desde el checkout*: más corto de escribir y imposible de
  probar sin credenciales. Además ata el negocio a un proveedor en el peor sitio.
- *Esperar a tener la documentación para empezar*: dejaría parada toda la entrega por
  una pieza que es menos del 10 % del trabajo.

---

## D-6 · Con n1co, página de pago alojada por ellos

**Decisión**: cuando se implemente el adaptador, se usará el cobro **alojado por n1co**
—su enlace o página de pago— y no un formulario de tarjeta propio.

**Razón**: el principio I prohíbe que datos completos de tarjeta pasen por el sistema, y
FR-026 lo repite. Con una página alojada, el número de tarjeta nunca toca un servidor de
Hidrosal: se reduce drásticamente el alcance de cumplimiento PCI DSS y desaparece toda
una clase de riesgo. El costo es un salto de dominio durante el pago, que es lo que el
comprador ya espera de cualquier tienda.

**Lo que se sabe de la API de n1co** (sin confirmar; su documentación está bloqueada
desde este entorno, riesgo R-2):

- expone una *Integration API* REST con dos módulos: **EPay** (métodos de pago, cobros,
  3-D Secure, reembolsos, suscripciones, mensajes de error) y **Merchant** (tienda,
  sucursales, enlaces de pago, pedidos, colecciones, productos), más una
  **CheckoutLink API**, que es la candidata para esta integración;
- distingue entorno de **pruebas** y de **producción**, configurados por separado;
- envía **notificaciones** al comercio con un token secreto generado en el portal, bajo
  *Configuración → Webhook*;
- **no publica paquete en npm**: comprobado, no existe `n1co`, `n1co-sdk`, `@n1co/sdk`
  ni `n1co-node`. El adaptador será HTTP escrito a mano, lo que refuerza D-5.

**Qué falta confirmar antes de escribir el adaptador**: direcciones base de cada
entorno, esquema de autenticación, forma de crear un enlace de cobro, nombres y
contenido de los eventos, y **cómo se verifica la firma de las notificaciones**.

---

## D-7 · El estado del pedido lo decide quien corresponde, y queda escrito

**Decisión**: una máquina de estados explícita con cuatro estados —`PENDIENTE_PAGO`,
`PAGADO`, `NO_COMPLETADO`, `CANCELADO`— y una regla por medio de pago sobre **quién**
puede provocar cada transición:

| Medio | Quién confirma el pago |
|-------|------------------------|
| Tarjeta | La notificación verificada del proveedor, o la consulta de estado al proveedor |
| Transferencia | Una persona de Hidrosal, autenticada |
| Contra entrega | Una persona de Hidrosal, autenticada |

Ninguna transición ocurre sin dejar una fila en el histórico, con origen y fecha.

**Razón**: FR-027 prohíbe que el navegador del comprador decida; FR-036 a FR-039
exigen que las confirmaciones manuales estén restringidas y atribuidas. Modelar los
estados y sus disparadores como dato, en vez de como `if` repartidos, es lo que hace
que FR-043 («reconstruir qué le pasó a un pedido») sea cierto y no una aspiración.

---

## D-8 · Autenticación mínima del personal: lo que FR-038 obliga a construir

**Decisión**: esta entrega incluye un ingreso por correo y contraseña para el personal
de Hidrosal, con sesión segura, y **una sola pantalla** detrás: la lista de pedidos
pendientes de confirmar, con las acciones de confirmar y descartar.

**Razón**: hay que ser honesto sobre por qué. FR-037 exige que no baste con conocer la
referencia de un pedido, y **FR-038 exige registrar quién confirmó**. Esas dos juntas
descartan la alternativa barata:

- *Enlace firmado de un solo uso enviado al correo de ventas*: cumple FR-037, pero el
  buzón de ventas es compartido, así que **no puede atribuir la acción a una persona**.
  Falla FR-038.
- *Credenciales compartidas o autenticación básica*: mismo problema de atribución, y
  peor higiene.

Así que o se construye un ingreso de verdad, o se deja fuera transferencia y contra
entrega, que son dos de los tres medios de pago que el cliente eligió. Se construye.

**Alcance deliberadamente mínimo**: una tabla de usuarios del personal, una de
sesiones, un ingreso, un cierre de sesión y una pantalla. **No** hay alta de usuarios
por pantalla (se siembra el primero), ni roles, ni recuperación de contraseña: eso es
la entrega 003, que extiende esto en lugar de rehacerlo.

**Contraseñas**: `@node-rs/argon2` 2.2.2, con argon2id. Es la primera opción del
principio I, y es un binario precompilado que no necesita compilador en el servidor. El
proyecto ya depende de `sharp`, que también es nativo, así que no añade una clase de
riesgo nueva. **Plan B documentado**: `bcryptjs` 3.0.3, puro JavaScript, con factor de
coste 12 —también admitido por el principio I— si el alojamiento no pudiera cargar el
binario.

**Sesiones**: cookie `HttpOnly`, `Secure`, `SameSite=Lax`, con el identificador de
sesión guardado **hasheado** en la base, de modo que leer la tabla no permite
suplantar a nadie. Caducidad corta y renovación en cada uso.

---

## D-9 · Idempotencia en los dos sitios donde duele

**Decisión**: dos mecanismos distintos para dos problemas distintos.

1. **Doble envío del formulario de compra** (FR-041): la página de checkout emite un
   testigo único; el pedido se crea con ese testigo bajo restricción de unicidad en la
   base. El segundo envío choca con la restricción y devuelve el pedido que ya existe,
   en vez de crear otro.
2. **Notificación repetida del proveedor** (FR-029): cada notificación se guarda con el
   identificador de evento que manda el proveedor, con restricción de unicidad. Si ya
   está, se responde «recibido» y no se hace nada más. El procesamiento ocurre dentro
   de una transacción junto con el cambio de estado del pedido.

**Razón**: la unicidad en la base es la única garantía que sobrevive a dos peticiones
concurrentes. Comprobar «¿ya existe?» antes de insertar no lo es: entre la comprobación
y la inserción cabe otra petición.

---

## D-10 · Caducidad: perezosa al leer, más una barrida que puede llamar un cron

**Decisión**: el plazo depende del medio de pago —tarjeta 24 horas, transferencia 3 días
hábiles, contra entrega 15 días, los tres configurables— y se aplica de dos formas: al
leer un pedido se evalúa si ya venció, y además hay una ruta protegida de barrida que
marca en bloque los vencidos.

**Razón**: FR-042 pide que ningún pedido quede colgado para siempre. No se puede
depender solo de un proceso en segundo plano: en un alojamiento compartido no hay
garantía de que exista. La evaluación perezosa hace que la pantalla nunca mienta; la
barrida mantiene los informes limpios y la puede disparar el cron de hPanel.

---

## D-11 · Correo saliente, también como puerto

**Decisión**: una interfaz `EnviadorDeCorreo` con dos implementaciones: SMTP con
`nodemailer` 10.1.0, y una que escribe el mensaje en la bitácora. La de bitácora es la
que se usa en desarrollo y en pruebas.

**Razón**: riesgo R-4 — Hidrosal aún no ha dicho con qué servicio enviará correo. Sin
este desacople, la historia 5 no se podría construir ni probar. Con él, se construye
completa hoy y el día que lleguen las credenciales SMTP solo se rellenan variables de
entorno.

El comprobante **nunca es el único camino**: FR-022 ya obliga a mostrar la referencia en
pantalla, así que una caída del correo no pierde una venta.

---

## D-12 · Renderizado y caché

**Decisión**: carrito, checkout, confirmación, consulta de pedido y las pantallas del
personal se sirven **sin caché** (`no-store`), por petición.

**Razón**: la entrega 001 ya dejó todo el sitio renderizándose por petición (su decisión
D-14, por el `nonce` de la política de seguridad). Aquí hay además una razón propia: son
páginas con datos de una persona concreta. Cachear un carrito o un pedido sería servirle
a alguien lo de otro.

---

## D-13 · La ruta que recibe las notificaciones

**Decisión**: una ruta de servidor dedicada, sin estado de sesión, que (a) verifica la
firma antes de leer nada, (b) guarda la notificación, (c) responde rápido, y (d) procesa
dentro de una transacción. Responde siempre con un código que el proveedor entienda como
recibido cuando la notificación es auténtica, aunque el procesamiento interno falle,
para no provocar una tormenta de reintentos; el fallo queda en bitácora para resolverlo.

**Razón**: FR-028 exige verificar antes de actuar. El orden importa: validar la firma
sobre el cuerpo **crudo**, antes de interpretarlo, porque interpretar antes de verificar
es exactamente por donde entran los ataques.

---

## D-14 · Concurrencia entre pestañas

**Decisión**: convertir un carrito en pedido marca el carrito como convertido dentro de
la misma transacción. Un segundo intento sobre un carrito ya convertido devuelve el
pedido existente.

**Razón**: FR-041 y el caso límite de «el comprador paga dos veces desde dos pestañas».
Es la misma lógica de D-9 aplicada al carrito.

---

## D-15 · Pruebas

**Decisión**: unidad sobre lo que cuesta dinero —desglose de IVA, costo de envío,
totales, transiciones de estado, idempotencia, caducidad, hash y verificación de
contraseña— y extremo a extremo sobre los **tres** recorridos de compra, contra la
pasarela simulada.

**Razón**: principio V. Además, las pruebas de extremo a extremo con la pasarela
simulada son las que permiten afirmar que el checkout funciona **antes** de tener
credenciales de n1co, que es justo lo que pide el encargo.

Casos de extremo a extremo que no son opcionales, porque son los de la historia 3:
notificación duplicada, notificación con firma inválida, notificación que llega con el
comprador desconectado, doble envío del formulario, y confirmación manual por alguien
no autenticado.

---

## Riesgos abiertos

| Id | Riesgo | Impacto | Mitigación |
|----|--------|---------|------------|
| **R-1** | El plan de Hostinger podría no ejecutar Node | Bloqueante para desplegar, heredado de la entrega 001 | Confirmarlo con el cliente. No bloquea construir |
| **R-2** | La documentación de n1co no es accesible desde el entorno de trabajo | Alto para el adaptador, nulo para el resto | D-5: todo se construye y se prueba contra la pasarela simulada. El adaptador queda como última pieza, con contrato fijado |
| **R-3** | El alta como comercio en n1co, comisiones y plazos de liquidación | Marca la fecha real de puesta en marcha | Trámite del cliente; conviene empezarlo ya |
| **R-4** | No hay servicio de correo saliente confirmado | Medio | D-11: puerto con implementación de bitácora; la referencia se muestra en pantalla |
| **R-5** | Contra entrega sin tope expone a pedidos grandes no recogidos | Comercial, del cliente | FR-035 los señala a ventas. La decisión de despachar es de negocio |
| **R-6** | Transferencia y contra entrega exigen que alguien confirme pedidos a diario | Operativo | D-8 da la herramienta. Hidrosal debe asignar a una persona |
| **R-7** | Falta el monto fijo del envío | Bajo | D-4: variable de entorno. Bloquea publicar, no construir |
| **R-8** | El binario de argon2 podría no cargar en el alojamiento | Bajo | D-8: plan B con `bcryptjs`, también admitido por el principio I |

## Pendientes de la especificación

Ninguno. Los tres marcadores de la especificación fueron resueltos por el cliente el
2026-10-11 y están integrados en los requisitos.
