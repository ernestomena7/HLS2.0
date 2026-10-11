---

description: "Desglose ejecutable de la entrega 002"
---

# Tasks: Carrito y checkout

**Input**: Documentos de diseño en `/specs/002-carrito-checkout/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: SÍ se incluyen. No es una elección de estilo: la constitución (principio V)
obliga a pruebas automatizadas sobre cálculo de totales e impuestos, autenticación y
autorización, y a pruebas de extremo a extremo sobre los flujos de compra. En esta
entrega eso se traduce en unidad para dinero, estados, idempotencia, caducidad,
referencia y contraseñas, y extremo a extremo para los tres recorridos de compra, los
cinco casos de fiabilidad del cobro y la confirmación manual.

**Organization**: las tareas se agrupan por historia de usuario para poder implementarlas
y probarlas de forma independiente.

## Format: `[ID] [P?] [Story] Descripción`

- **[P]**: se puede ejecutar en paralelo (archivo distinto, sin depender de tareas incompletas)
- **[Story]**: historia a la que pertenece (US1…US5)
- Toda tarea indica su ruta exacta

## Path Conventions

Aplicación única Next.js en la raíz del repositorio, ampliando la estructura de la
entrega 001: `app/`, `components/`, `lib/`, `prisma/`, `tests/`. Nada de la entrega 001
se mueve.

---

## Phase 1: Setup (infraestructura compartida)

**Purpose**: dejar instaladas las dependencias nuevas, la configuración validada y el
esqueleto de directorios.

- [ ] T001 Añadir a `package.json` las dependencias de esta entrega: `@node-rs/argon2` 2.2.2 (argon2id, decisión D-8), `nodemailer` 10.1.0 y `@types/nodemailer` 8.0.2 (desarrollo). No hay SDK de n1co en npm: comprobado contra el registro
- [ ] T002 Ampliar `.env.example` con las variables nuevas, todas vacías y documentadas: `PASARELA_PROVEEDOR`, `PASARELA_ENTORNO`, `N1CO_CLAVE`, `N1CO_SECRETO_NOTIFICACIONES`, `N1CO_URL_BASE`, `ENVIO_COSTO_FIJO`, `CONTRA_ENTREGA_UMBRAL`, `PLAZO_TARJETA_HORAS`, `PLAZO_TRANSFERENCIA_DIAS`, `PLAZO_CONTRA_ENTREGA_DIAS`, `CORREO_TRANSPORTE`, `SMTP_URL`, `CORREO_REMITENTE`, `CORREO_VENTAS`, `BANCO_NOMBRE`, `BANCO_CUENTA`, `BANCO_TITULAR`, `MANTENIMIENTO_SECRETO`. Ningún secreto se versiona (constitución, principio I)
- [ ] T003 Extender `lib/env.ts` para validar las variables nuevas con Zod al arrancar, separando lo del servidor de lo público como ya hace, con mensajes legibles en español
- [ ] T004 [P] Crear el esqueleto de directorios: `app/carrito/`, `app/checkout/confirmacion/[referencia]/`, `app/checkout/cancelado/`, `app/pedidos/`, `app/gestion/ingreso/`, `app/gestion/pedidos/[referencia]/`, `app/api/pagos/[proveedor]/notificaciones/`, `app/api/mantenimiento/caducar/`, `components/carrito/`, `components/checkout/`, `components/gestion/`, `lib/carrito/`, `lib/pedidos/`, `lib/pagos/`, `lib/correo/`, `lib/personal/`

---

## Phase 2: Foundational (prerrequisitos bloqueantes)

**Purpose**: esquema de datos, reglas de dinero, máquina de estados y los dos puertos
—pasarela y correo— que todas las historias necesitan.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta que esta fase esté completa.

### Esquema de datos

- [ ] T005 Definir `Carrito` en `prisma/schema.prisma`: `token` cadena(64) **única**, aleatoria y opaca; `estado` enumerado `ABIERTO | CONVERTIDO | ABANDONADO` por defecto `ABIERTO`; `expiraEn` marca de tiempo **obligatoria** a 30 días de la última actividad; marcas de tiempo; índice en `(estado, expiraEn)`
- [ ] T006 Definir `LineaCarrito` en `prisma/schema.prisma`: `carritoId` obligatorio con **borrado en cascada**; `productoId` obligatorio con borrado **restringido**; `cantidad` entero **de 1 a 99**; **índice único en `(carritoId, productoId)`**, que es lo que hace cierto FR-003 por construcción. **No lleva precio** (decisión D-2)
- [ ] T007 Definir `Pedido` en `prisma/schema.prisma`: `referencia` cadena(20) **única** con formato `HLS-AAAAMM-XXXXXX`; `estado` enumerado `PENDIENTE_PAGO | PAGADO | NO_COMPLETADO | CANCELADO` por defecto `PENDIENTE_PAGO`; `medioPago` enumerado `TARJETA | TRANSFERENCIA | CONTRA_ENTREGA`; `formaEntrega` enumerado `RETIRO | ENVIO`; `costoEnvio`, `subtotal`, `total` e `ivaIncluido` en `DECIMAL(10,2)`; `moneda` cadena(3) por defecto `USD`; `nombre` cadena(140) de 3 a 140; `correo` cadena(160); `telefono` cadena(40); `compania` cadena(140) **opcional**; `direccion`, `municipio` cadena(80), `departamento` cadena(80) y `referenciasEntrega`, **obligatorios solo si `formaEntrega = ENVIO`**; `testigoCreacion` cadena(64) **única**; `carritoId` opcional; `expiraEn`; `pagadoEn` opcional; marcas de tiempo. Índices: únicos en `referencia` y `testigoCreacion`, e índices en `(estado, expiraEn)`, `(correo, referencia)` y `(estado, creadoEn)`
- [ ] T008 Definir `LineaPedido` en `prisma/schema.prisma`: `pedidoId` con **borrado en cascada**; `productoId` **opcional** con `SET NULL` al borrar, para que el histórico sobreviva a un producto eliminado; `sku` cadena(60), `nombre` cadena(140) y `slug` cadena(140) copiados; `precioUnitario` `DECIMAL(10,2)` mayor que 0; `cantidad` de 1 a 99; `subtotal` `DECIMAL(10,2)`; índice en `(pedidoId)`
- [ ] T009 [P] Definir `IntentoDePago` y `NotificacionDePago` en `prisma/schema.prisma`: el intento con `pedidoId` en cascada, `proveedor` cadena(40), `referenciaExterna` cadena(191), `importe` `DECIMAL(10,2)`, `estado` enumerado `INICIADO | APROBADO | RECHAZADO | CANCELADO | CADUCADO`, único en `(proveedor, referenciaExterna)` e índice en `(pedidoId, estado)`; la notificación con `proveedor`, `idEventoExterno` cadena(191), `cuerpo` JSON, `firmaVerificada` booleano, `procesadaEn` y `resultado` opcionales, `pedidoId` opcional, `recibidaEn`, **único en `(proveedor, idEventoExterno)`** —la llave de la idempotencia— e índice en `(firmaVerificada, recibidaEn)`
- [ ] T010 [P] Definir `UsuarioPersonal`, `SesionPersonal` y `ConfirmacionManual` en `prisma/schema.prisma`: el usuario con `correo` cadena(160) **única** en minúsculas, `nombre` cadena(140), `hashContrasena` cadena(255), `activo` booleano por defecto `true`, `ultimoIngresoEn` opcional; la sesión con `hashToken` cadena(64) **única** —se guarda el hash, no el identificador—, `usuarioId` en cascada, `expiraEn`, `ultimoUsoEn`; la confirmación con `pedidoId` y `usuarioId` ambos de **borrado restringido**, `accion` enumerado `CONFIRMAR_PAGO | DESCARTAR`, `importe` `DECIMAL(10,2)` opcional, `nota` opcional, e índice en `(pedidoId, creadoEn)`
- [ ] T011 [P] Definir `SolicitudCotizacion` en `prisma/schema.prisma`: `productoId` opcional con `SET NULL`; `sku` cadena(60) y `nombreProducto` cadena(140) copiados; `nombre` cadena(140), `correo` cadena(160), `telefono` cadena(40), `compania` cadena(140) opcional, `mensaje` texto **de 10 a 2000**; `atendidaEn` opcional; índice en `(atendidaEn, creadoEn)`
- [ ] T012 Generar la migración de las nueve tablas nuevas y versionarla en `prisma/migrations/`. Ninguna tabla de la entrega 001 se modifica

### Reglas que producen dinero

- [ ] T013 Implementar `lib/dinero.ts` según [reglas-de-calculo.md](./contracts/reglas-de-calculo.md): `subtotal`, `costoEnvio` (0.00 en retiro), `total` y el desglose `gravable = redondear(total / 1.13, 2)` e `iva = total − gravable`, **restando y no multiplicando**, con decimal exacto y nunca flotantes
- [ ] T014 [P] Escribir las pruebas unitarias de dinero en `tests/unit/dinero.test.ts`: los cuatro importes de la tabla del contrato ($389.00, $7.50, $11.90 y $2,890.00), que `gravable + iva = total` en todos los casos, que el retiro no suma envío, y que una cantidad de 0, −3 o 500 se corrige a 1, 1 y 99 sin lanzar
- [ ] T015 [P] Implementar en `lib/pedidos/referencia.ts` la generación `HLS-AAAAMM-XXXXXX`, con seis caracteres de un alfabeto sin `0`, `O`, `1`, `I` ni `l`, y la unicidad garantizada por la restricción de la base y no por comprobación previa
- [ ] T016 [P] Escribir las pruebas unitarias de referencia en `tests/unit/referencia.test.ts`: formato, ausencia de caracteres ambiguos y que dos generaciones seguidas no coinciden
- [ ] T017 Implementar la máquina de estados en `lib/pedidos/estados.ts` según [data-model.md](./data-model.md): las transiciones permitidas, los tres estados terminales y **quién** puede provocar cada una según el medio de pago
- [ ] T018 [P] Escribir las pruebas unitarias de estados en `tests/unit/estados.test.ts`: que el navegador del comprador nunca puede provocar `→ PAGADO`, que una transferencia solo la confirma personal autenticado, que los estados terminales no retroceden y que confirmar un pedido ya terminal es un no-op explicado

### Puertos

- [ ] T019 Definir el puerto de pasarela en `lib/pagos/puerto.ts` con las **tres** operaciones de [pasarela-de-pago.md](./contracts/pasarela-de-pago.md) —`crearCobro`, `verificarNotificacion` y `consultarEstado`— y sus esquemas Zod de entrada y salida
- [ ] T020 Implementar la pasarela simulada en `lib/pagos/simulada.ts`: devuelve una dirección local donde elegir el desenlace, y firma sus notificaciones con un secreto de desarrollo
- [ ] T021 Implementar el selector en `lib/pagos/index.ts`, que elige la implementación según `PASARELA_PROVEEDOR` y **rechaza arrancar con `simulada` cuando el entorno es producción**
- [ ] T022 [P] Escribir la prueba de ese cerrojo en `tests/unit/pasarela.test.ts`: con entorno de producción y proveedor `simulada`, el selector debe fallar al arrancar
- [ ] T023 [P] Definir el puerto de correo en `lib/correo/puerto.ts` e implementar `lib/correo/bitacora.ts` y `lib/correo/smtp.ts` con `nodemailer`, eligiendo por `CORREO_TRANSPORTE` (decisión D-11)

### Armazón visual y datos

- [ ] T024 [P] Crear `app/tienda.module.css` con los estilos compartidos de carrito, checkout, confirmación y consulta, consumiendo **solo** los tokens de `app/globals.css`, sin introducir colores nuevos
- [ ] T025 Ampliar `prisma/seed.ts` con un usuario del personal cuyas credenciales se imprimen al sembrar, y cuatro pedidos de ejemplo —pagado con tarjeta, esperando transferencia, contra entrega pendiente y no completado por vencimiento— más dos solicitudes de cotización. Los pedidos de ejemplo se siembran **solo en desarrollo**

**Checkpoint**: base lista. A partir de aquí las historias pueden avanzar.

---

## Phase 3: User Story 1 - Armar el carrito (Priority: P1) 🎯 MVP

**Goal**: que un visitante junte productos, cambie cantidades, vea el total con IVA
incluido y encuentre su carrito intacto días después.

**Independent Test**: añadir desde ficha y catálogo, comprobar que añadir dos veces suma
en lugar de duplicar, cambiar cantidades, eliminar líneas, verificar totales, y volver a
abrir el navegador para comprobar que el carrito persiste.

### Tests for User Story 1

- [ ] T026 [P] [US1] Escribir las pruebas unitarias de revalidación en `tests/unit/carrito.test.ts`: producto despublicado, agotado o sin precio marcan la línea como no disponible; un precio cambiado se señala con el anterior y el nuevo
- [ ] T027 [P] [US1] Escribir la prueba de extremo a extremo del carrito en `tests/e2e/carrito.spec.ts` cubriendo los seis escenarios de aceptación de la historia 1 más la persistencia entre sesiones

### Implementation for User Story 1

- [ ] T028 [US1] Implementar la identidad del carrito en `lib/carrito/identidad.ts`: cookie `HttpOnly`, `Secure` y `SameSite=Lax` con un token opaco y aleatorio, creación perezosa y renovación de `expiraEn` a 30 días en cada actividad (decisión D-1)
- [ ] T029 [US1] Implementar las operaciones del carrito en `lib/carrito/operaciones.ts`: añadir —solo productos publicados, disponibles y con precio—, sumar a la línea existente apoyándose en el índice único, cambiar cantidad acotando a 1–99, quitar línea y vaciar. **Todos los totales se calculan en el servidor** (FR-009)
- [ ] T030 [US1] Implementar `lib/carrito/revalidacion.ts`: comprobar publicación, disponibilidad y precio de cada línea contra el catálogo al abrir el carrito y al iniciar la compra
- [ ] T031 [P] [US1] Crear `components/carrito/LineaCarrito.tsx` con imagen, nombre, precio unitario, control de cantidad accesible, subtotal y el aviso de línea no disponible o con precio cambiado
- [ ] T032 [P] [US1] Crear `components/carrito/ResumenCarrito.tsx` con subtotal, total y la leyenda «IVA incluido» con su desglose
- [ ] T033 [P] [US1] Crear `components/carrito/IndicadorCarrito.tsx` y añadirlo a `components/marketing/Navegacion.tsx`, visible desde cualquier página (FR-007), sin romper las anclas ni el menú móvil existentes
- [ ] T034 [P] [US1] Crear `components/catalogo/BotonAnadir.tsx` y usarlo en `components/catalogo/TarjetaProducto.tsx` y en `app/productos/[slug]/page.tsx`, mostrando en su lugar la llamada a cotización cuando el producto no es comprable (FR-002)
- [ ] T035 [US1] Crear `app/carrito/page.tsx` como componente de servidor, sin caché, con el estado vacío y el paso al checkout bloqueado si alguna línea no es válida

**Checkpoint**: la historia 1 es demostrable por sí sola. Es el MVP.

---

## Phase 4: User Story 2 - Comprar y pagar en línea (Priority: P2)

**Goal**: que el visitante deje sus datos, elija entrega y medio de pago, y cierre la
compra por cualquiera de los tres caminos.

**Independent Test**: recorrer la compra completa con la pasarela simulada por cada uno
de los tres medios de pago, comprobando el pedido resultante, su total y su estado.

### Tests for User Story 2

- [ ] T036 [P] [US2] Escribir las pruebas unitarias del checkout en `tests/unit/checkout.test.ts`: la dirección es obligatoria con `ENVIO` y debe quedar vacía con `RETIRO`; el total es `subtotal + costoEnvio`; el costo de envío es `0.00` en retiro; un pedido sin líneas se rechaza
- [ ] T037 [P] [US2] Escribir la prueba de extremo a extremo de la compra con tarjeta en `tests/e2e/compra-tarjeta.spec.ts`: aprobación, rechazo con carrito intacto, y cambio de medio de pago tras un rechazo (FR-025)
- [ ] T038 [P] [US2] Escribir la prueba de extremo a extremo de transferencia y contra entrega en `tests/e2e/compra-manual.spec.ts`: datos bancarios y referencia visibles, pedido no pagado, y el señalamiento del pedido contra entrega por encima del umbral

### Implementation for User Story 2

- [ ] T039 [US2] Implementar `lib/pedidos/crear.ts`: copiar las líneas congelando `sku`, `nombre`, `slug`, `precioUnitario` y `cantidad`; calcular `subtotal`, `costoEnvio`, `total` e `ivaIncluido`; fijar `expiraEn` según el medio de pago; marcar el carrito como `CONVERTIDO` **en la misma transacción**; y apoyar la idempotencia en la restricción única de `testigoCreacion`, devolviendo el pedido existente si ya fue usado (decisiones D-9 y D-14)
- [ ] T040 [P] [US2] Crear `components/checkout/DatosComprador.tsx` con nombre, correo y teléfono obligatorios y compañía opcional, con etiquetas asociadas y errores anunciables en español
- [ ] T041 [P] [US2] Crear `components/checkout/FormaEntrega.tsx` con retiro y envío, pidiendo dirección, municipio, departamento y referencias **solo** en envío
- [ ] T042 [P] [US2] Crear `components/checkout/MedioPago.tsx` con los tres medios y la explicación de qué ocurre después de elegir cada uno (FR-024)
- [ ] T043 [P] [US2] Crear `components/checkout/ResumenPedido.tsx` con las líneas, el costo de envío como línea propia, el total, el desglose de IVA y la aceptación de términos
- [ ] T044 [US2] Crear `app/checkout/page.tsx`: emite el testigo de creación, compone el formulario, redirige al carrito si alguna línea es inválida y al catálogo si está vacío
- [ ] T045 [US2] Implementar la confirmación del pedido en `app/checkout/page.tsx` como mutación de servidor: validar con Zod, crear el pedido, y según el medio pedir el cobro al proveedor o llevar a la confirmación
- [ ] T046 [US2] Crear `app/checkout/confirmacion/[referencia]/page.tsx` con la referencia, el detalle, el total y qué hacer según el medio; en transferencia, los datos bancarios y la referencia a anotar (FR-031)
- [ ] T047 [US2] Crear `app/checkout/retorno/route.ts` y `app/checkout/cancelado/page.tsx`: el retorno **consulta el estado real al proveedor** y nunca da por pagado por el hecho de volver por esa ruta (FR-027)
- [ ] T048 [P] [US2] Añadir los estilos del checkout a `app/tienda.module.css`, sin colores nuevos

**Checkpoint**: historias 1 y 2 funcionando juntas: ya hay recorrido completo de compra.

---

## Phase 5: User Story 3 - Que el cobro sea fiable (Priority: P3)

**Goal**: que el estado de un pedido sea siempre el correcto, lo confirme el proveedor o
una persona, y que quede escrito quién lo hizo.

**Independent Test**: simular notificación duplicada, firma inválida, notificación con el
comprador desconectado y doble envío del formulario; y confirmar un pedido a mano
comprobando la atribución y que nadie sin sesión puede hacerlo.

### Tests for User Story 3

- [ ] T049 [P] [US3] Escribir las pruebas unitarias de idempotencia y caducidad en `tests/unit/notificaciones.test.ts`: una notificación repetida no cambia nada; una firma inválida se guarda como no verificada sin tocar pedidos; un importe que no coincide con el del pedido se rechaza; los plazos por medio de pago son los del contrato
- [ ] T050 [P] [US3] Escribir las pruebas unitarias de contraseñas y sesiones en `tests/unit/personal.test.ts`: el hash nunca es la contraseña, la verificación acepta la correcta y rechaza la incorrecta, y la tabla de sesiones guarda el **hash** del identificador y no el identificador
- [ ] T051 [P] [US3] Escribir la prueba de extremo a extremo de fiabilidad en `tests/e2e/fiabilidad-cobro.spec.ts` con los cinco casos de la historia 3
- [ ] T052 [P] [US3] Escribir la prueba de extremo a extremo de gestión en `tests/e2e/gestion.spec.ts`: sin sesión no se ve nada, confirmar con referencia pero sin sesión no se ejecuta y queda registrado, confirmar con sesión atribuye la acción, y el mensaje de ingreso fallido es el mismo para correo inexistente y contraseña incorrecta

### Implementation for User Story 3

- [ ] T053 [US3] Implementar `lib/pagos/notificaciones.ts`: verificar la firma **sobre el cuerpo crudo antes de interpretarlo**, guardar siempre la notificación —también las rechazadas—, y procesar el cambio de estado dentro de una transacción, apoyando la idempotencia en el único de `(proveedor, idEventoExterno)` (decisiones D-9 y D-13)
- [ ] T054 [US3] Crear `app/api/pagos/[proveedor]/notificaciones/route.ts` con los cuatro desenlaces del contrato de rutas, incluido reconocer la notificación cuando el procesamiento interno falla, para no provocar una tormenta de reintentos
- [ ] T055 [US3] Implementar el histórico en `lib/pedidos/historico.ts`: cada cambio de estado con su origen y su fecha, de modo que FR-043 sea cierto
- [ ] T056 [US3] Implementar `lib/pedidos/caducidad.ts`: evaluación perezosa al leer un pedido y barrida en bloque, con los plazos de 24 horas, 3 días hábiles y 15 días según el medio (decisión D-10)
- [ ] T057 [US3] Crear `app/api/mantenimiento/caducar/route.ts`, protegida por `MANTENIMIENTO_SECRETO` e idempotente, para que la dispare el cron del alojamiento
- [ ] T058 [US3] Implementar `lib/personal/contrasenas.ts` con argon2id usando `@node-rs/argon2`, dejando documentado en el propio archivo el plan B con `bcryptjs` a coste 12 si el alojamiento no cargara el binario
- [ ] T059 [US3] Implementar `lib/personal/sesiones.ts`: cookie `HttpOnly`, `Secure` y `SameSite`, identificador guardado **hasheado** en `SesionPersonal`, caducidad corta y renovación en cada uso
- [ ] T060 [US3] Crear `app/gestion/layout.tsx` que comprueba la sesión en el servidor antes de renderizar cualquier hija, y `app/gestion/ingreso/page.tsx` con el ingreso y el cierre de sesión, con el **mismo** mensaje ante correo inexistente y contraseña incorrecta
- [ ] T061 [US3] Crear `app/gestion/pedidos/page.tsx` con los pedidos pendientes de confirmar ordenados por antigüedad y los de monto alto señalados (FR-035), y `app/gestion/pedidos/[referencia]/page.tsx` con el detalle y su histórico
- [ ] T062 [US3] Implementar las acciones de confirmar y descartar en `lib/pedidos/confirmacion-manual.ts`, **volviendo a verificar la sesión en cada mutación** —un layout no es control de acceso—, registrando quién, cuándo e importe, y registrando también los intentos rechazados (FR-036 a FR-039)
- [ ] T063 [P] [US3] Crear `components/gestion/TarjetaPedidoPendiente.tsx` y `components/gestion/FormularioConfirmacion.tsx`, con el importe recibido y la nota opcional

**Checkpoint**: la tienda es operable de verdad: los tres medios de pago se pueden completar.

---

## Phase 6: User Story 4 - Pedir cotización (Priority: P4)

**Goal**: que los productos sin precio tengan salida comercial en lugar de una pared.

**Independent Test**: abrir la ficha de un producto sin precio, enviar la cotización y
comprobar que queda registrada con la referencia del producto y que el carrito no se tocó.

### Tests for User Story 4

- [ ] T064 [P] [US4] Escribir la prueba de extremo a extremo en `tests/e2e/cotizaciones.spec.ts` con los tres escenarios de aceptación de la historia 4

### Implementation for User Story 4

- [ ] T065 [US4] Implementar `lib/cotizaciones.ts`: validar con Zod —`mensaje` de 10 a 2000—, copiar `sku` y `nombreProducto` para que la consulta sobreviva al catálogo, y registrar la solicitud
- [ ] T066 [P] [US4] Crear `components/catalogo/FormularioCotizacion.tsx` reutilizando el estilo del formulario de contacto de la entrega 001, con validación en español
- [ ] T067 [US4] Integrarlo en `app/productos/[slug]/page.tsx` como acción principal cuando el producto no tiene precio público (FR-047), sustituyendo a la llamada genérica actual
- [ ] T068 [US4] Notificar a ventas cada solicitud desde `lib/cotizaciones.ts` usando el puerto de correo (FR-048)

---

## Phase 7: User Story 5 - Saber qué pasó con el pedido (Priority: P5)

**Goal**: que el comprador reciba su comprobante y pueda consultar su pedido.

**Independent Test**: completar una compra por cada medio, comprobar el comprobante y la
consulta; comprobar que una referencia válida con otro correo no muestra nada.

### Tests for User Story 5

- [ ] T069 [P] [US5] Escribir la prueba de extremo a extremo en `tests/e2e/consulta-pedido.spec.ts` con los cuatro escenarios de aceptación de la historia 5, incluido que el mensaje ante referencia inexistente y ante correo que no corresponde es **el mismo**

### Implementation for User Story 5

- [ ] T070 [US5] Crear la plantilla del comprobante en `lib/correo/comprobante.ts` con referencia, detalle, costo de envío, total, forma de entrega, medio de pago y qué hacer a continuación según el medio (FR-049)
- [ ] T071 [US5] Enviarlo al cerrar la compra desde `lib/pedidos/crear.ts`, sin que un fallo del correo impida completar la venta: la referencia ya se muestra en pantalla
- [ ] T072 [US5] Crear `app/pedidos/page.tsx` con el formulario de consulta por referencia y correo, y el detalle con el estado vigente
- [ ] T073 [US5] Implementar la consulta en `lib/pedidos/consulta.ts` devolviendo **el mismo** resultado ante referencia inexistente y ante correo que no corresponde, para no convertir la pantalla en un oráculo de referencias válidas (FR-051)

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T074 [P] Añadir las pantallas nuevas —carrito, checkout, confirmación, consulta y gestión— a `tests/e2e/accesibilidad.spec.ts` y corregir lo que la auditoría reporte en niveles A y AA (SC-008)
- [ ] T075 [P] Medir SC-007 sobre carrito y checkout con `node scripts/medir-rendimiento.mjs`: contenido principal por debajo de 2,5 s y desplazamiento acumulado por debajo de 0,1
- [ ] T076 [P] Verificar que no queda `any` ni `@ts-ignore` en `app/`, `components/` ni `lib/` (constitución, principio II)
- [ ] T077 [P] Excluir `/gestion` de `app/sitemap.ts` y marcarla como no indexable en sus metadatos
- [ ] T078 [P] Verificar que las cabeceras de `next.config.ts` y la política de contenido de `proxy.ts` se emiten también en las rutas nuevas, y que `app/api/pagos/[proveedor]/notificaciones/route.ts` no exige sesión ni CSRF pero sí firma
- [ ] T079 [P] Documentar en `README.md` el despliegue de esta entrega: variables nuevas, cómo crear el primer usuario del personal, el cron que llama a la barrida de caducidad, y que `PASARELA_PROVEEDOR` no puede ser `simulada` en producción
- [ ] T080 Ejecutar las cinco puertas de calidad en verde: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e` y `npm run build`
- [ ] T081 Recorrer los nueve escenarios de validación de `specs/002-carrito-checkout/quickstart.md` y confirmar con el cliente los riesgos abiertos: R-1 (Hostinger con Node), R-4 (servicio SMTP), R-6 (persona asignada a confirmar pedidos) y R-7 (monto del envío)

### Bloqueada por el riesgo R-2

- [ ] T082 Implementar el adaptador real en `lib/pagos/n1co.ts` contra la *CheckoutLink API*, respetando el puerto de [pasarela-de-pago.md](./contracts/pasarela-de-pago.md). **BLOQUEADA**: requiere abrir la documentación de n1co desde una red sin restricciones y obtener credenciales de pruebas. Las seis preguntas a responder están listadas en el contrato; la quinta —cómo se verifica la firma de las notificaciones— es la que no se puede inventar

---

## Dependencies

```text
Phase 1 (Setup)
   │
   ▼
Phase 2 (Foundational)  ← bloquea todo
   │
   ├──► Phase 3 · US1 (P1) ─────┐
   │                            │
   │                            ├──► Phase 4 · US2 (P2)   (necesita el carrito)
   │                            │          │
   │                            │          ├──► Phase 5 · US3 (P3)   (necesita pedidos)
   │                            │          │
   │                            │          └──► Phase 7 · US5 (P5)   (necesita pedidos)
   │                            │
   └──► Phase 6 · US4 (P4)      │   (independiente: solo necesita la fase 2)
                                ▼
                          Phase 8 (Polish)
```

Dependencias reales entre historias:

- **US1** no depende de ninguna otra. Es el MVP.
- **US2** necesita el carrito de US1 para tener algo que comprar: **requiere US1**.
- **US3** actúa sobre pedidos ya creados: **requiere US2**.
- **US4** es **independiente** de US1–US3: solo necesita la fase 2 y la ficha de la
  entrega 001. Puede ir en paralelo desde el final de la fase 2.
- **US5** necesita que existan pedidos: **requiere US2**.
- **T082** no depende de ninguna fase; depende de que se resuelva el riesgo R-2.

---

## Parallel Execution Examples

**Fase 2, tras T008**: T009, T010 y T011 definen modelos distintos y pueden ir a la vez.
Tras T012, las parejas regla/prueba T013–T014, T015–T016 y T017–T018 son independientes
entre sí, igual que T022, T023 y T024.

**Historia 1, tras T030**: T031, T032, T033 y T034 son componentes sin solape.

**Historia 2, tras T039**: T040, T041, T042, T043 y T048 son cinco archivos distintos.

**Historia 3**: las cuatro pruebas T049 a T052 se pueden escribir a la vez; en la
implementación, T058 y T059 son independientes de T053 a T057.

**Entre historias**: un segundo par de manos puede llevar la fase 6 (US4) completa
mientras otro avanza US1 → US2 → US3, porque solo comparten la ficha de producto, que
US4 toca en un único punto (T067).

---

## Implementation Strategy

### Alcance del MVP

**Fases 1, 2 y 3** (T001–T035): un carrito que junta, recuerda y suma bien. Es
demostrable al cliente por sí solo y es lo que permite empezar a recibir pedidos aunque
sea por teléfono.

### Entrega incremental sugerida

1. **Incremento 1 — MVP**: fases 1–3. El carrito funcionando.
2. **Incremento 2 — la venta cierra**: fase 4 (US2). Con la pasarela simulada ya se
   puede recorrer la compra entera y enseñársela al cliente.
3. **Incremento 3 — operable**: fase 5 (US3). Sin esto, transferencia y contra entrega
   no se pueden completar, así que es innegociable para publicar.
4. **Incremento 4 — captación y seguimiento**: fases 6 y 7 (US4 y US5).
5. **Incremento 5 — cierre**: fase 8.
6. **T082 cuando se desbloquee R-2**: hasta entonces la tienda puede operar con
   transferencia y contra entrega, pero **no puede cobrar con tarjeta**.

### Antes de empezar

Tres cosas que no dependen del equipo de desarrollo y conviene mover ya:

- **R-2**: conseguir la documentación de n1co y credenciales de pruebas. No bloquea
  construir, sí bloquea cobrar con tarjeta.
- **R-1**: confirmar que el plan de Hostinger ejecuta Node. Bloquea desplegar.
- **R-6**: decidir quién en Hidrosal revisa y confirma los pedidos por transferencia y
  contra entrega. Sin esa persona, dos de los tres medios de pago no funcionan por mucho
  código que se escriba.
