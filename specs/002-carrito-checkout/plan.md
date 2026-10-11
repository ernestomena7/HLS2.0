# Implementation Plan: Carrito y checkout

**Branch**: `claude/hls-water-purification-site-tvl85i` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-carrito-checkout/spec.md`

## Summary

Añadir sobre la aplicación de la entrega 001 la parte que convierte una visita en una
venta: carrito persistente, checkout con tres medios de pago, cobro fiable y consulta
del pedido. El catálogo, la ficha y el sitio de marketing no se tocan.

El enfoque técnico se apoya en tres decisiones que gobiernan todo lo demás:

1. **El carrito vive en la base de datos** y el navegador solo lleva un identificador
   opaco. Es lo único que permite calcular totales en el servidor, conservarlos 30 días
   y revalidar precios contra el catálogo.
2. **La pasarela de pago es un puerto, no una dependencia.** El checkout habla con una
   interfaz de tres operaciones; detrás hay dos implementaciones, `n1co` y `simulada`.
   Esto es lo que permite construir y probar el checkout **completo hoy**, sin
   credenciales ni documentación de n1co, y terminar el adaptador después sin tocar
   nada más.
3. **El estado del pedido es una máquina de estados explícita** con una regla por medio
   de pago sobre quién puede provocar cada transición, y un histórico que registra todas.

El cliente eligió aceptar transferencia bancaria y pago contra entrega además de
tarjeta. Esa decisión arrastra una consecuencia técnica que conviene ver de frente: dos
de los tres medios de pago **no los confirma ninguna máquina**, sino una persona, y la
especificación exige registrar quién. Eso obliga a construir una autenticación mínima
del personal en esta entrega. Está acotada a lo imprescindible y la entrega 003 la
extiende en vez de rehacerla.

## Technical Context

**Language/Version**: TypeScript 6.0 en modo estricto, sobre Node.js 22 LTS. Mismo
encadenado que la entrega 001 (su decisión D-13: `typescript-eslint` todavía no soporta
la línea 7)

**Primary Dependencies**: las de la entrega 001 —Next.js 16.4 con App Router, React
19.3, Prisma 7.10 con `@prisma/adapter-mariadb`, Zod 4.6, `sharp` 0.35— más
`@node-rs/argon2` 2.2.2 para contraseñas y `nodemailer` 10.1.0 para el comprobante.
**No hay SDK de n1co en npm**: comprobado contra el registro; el adaptador será HTTP
escrito a mano

**Storage**: MySQL 8.0 o MariaDB 10.6+, por Prisma, con migraciones versionadas. Nueve
tablas nuevas; ninguna de la entrega 001 se modifica. Dinero en `DECIMAL(10,2)`

**Testing**: Vitest 5 para unidad —desglose de IVA, totales, envío, cantidades,
transiciones de estado, idempotencia, caducidad, referencia del pedido, contraseñas— y
Playwright 1.64 para extremo a extremo sobre los tres recorridos de compra, los cuatro
casos de fiabilidad del cobro y la confirmación manual, todo contra la pasarela simulada

**Target Platform**: alojamiento Hostinger con ejecución de Node, salida
`output: "standalone"`, igual que la entrega 001. Sin funciones edge ni servicios
propietarios

**Project Type**: aplicación web renderizada en servidor, una sola unidad desplegable

**Performance Goals**: contenido principal por debajo de 2,5 s en 4G de gama media y
desplazamiento acumulado por debajo de 0,1 (SC-007), igual que el resto del sitio

**Constraints**: ningún dato de tarjeta en el sistema (FR-026); totales calculados en
servidor (FR-009); el estado de un pago con tarjeta solo lo decide el proveedor
(FR-027); confirmaciones manuales restringidas y atribuidas (FR-036 a FR-039); el sitio
de la entrega 001 intacto (FR-054); accesibilidad AA y operación por teclado (FR-053);
español salvadoreño y dólares con IVA incluido (FR-019, FR-052)

**Scale/Scope**: el catálogo previsto (~200 productos), pedidos del orden de decenas al
mes al principio. 6 pantallas nuevas de cara al público —carrito, checkout,
confirmación, consulta de pedido, cotización y retorno del pago— más 3 internas
—ingreso, lista de pedidos y detalle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluado contra la constitución v1.0.0.

| Principio | Cómo lo cumple este plan | Estado |
|-----------|--------------------------|--------|
| I. Seguridad por defecto | Ningún dato de tarjeta entra al sistema: el cobro es una página alojada por el proveedor (D-6). Secretos solo en entorno, con `.env.example` vacío y documentado. Toda entrada validada con Zod en el servidor antes de usarse, incluidas las notificaciones del proveedor, cuya firma se verifica **sobre el cuerpo crudo, antes de interpretarlo** (D-13). Contraseñas con argon2id. Sesiones con cookie `HttpOnly`/`Secure`/`SameSite` y el identificador guardado hasheado. Autorización comprobada en el servidor en toda ruta de `/gestion`, no por ocultar enlaces | PASA |
| II. Tipado estricto | `strict: true`; sin `any` ni `@ts-ignore` en producción, con la regla de ESLint ya activa desde la entrega 001. Tipos derivados de Prisma y de los esquemas Zod, incluidos los de la pasarela y los de las notificaciones | PASA |
| III. Esquema versionado | Las nueve tablas nuevas nacen como migración de Prisma. Todo el dinero en `DECIMAL(10,2)`, manipulado como decimal; el desglose de IVA se calcula restando para que no haya descuadres de un centavo (D-3) | PASA |
| IV. Accesibilidad y rendimiento | Marcado semántico, formularios con etiquetas asociadas y errores anunciables, operación por teclado y contraste AA heredado de los tokens aprobados. Se conserva el sistema de diseño: mismos tokens, mismas tipografías, el sitio de marketing sin tocar | PASA |
| V. Pruebas proporcionales al riesgo | Unidad sobre todo lo que produce dinero o decide acceso. Extremo a extremo sobre los tres recorridos de compra y sobre los cuatro casos de fiabilidad del cobro, posible **hoy** gracias a la pasarela simulada (D-5, D-15) | PASA |
| VI. Localización | Español salvadoreño, dólares, IVA del 13 % incluido con su desglose, formatos locales con `Intl` | PASA |

**Resultado: PASA, sin violaciones que justificar.** Tres puntos que el plan vigila por
estar en el filo:

- **La autenticación del personal adelanta trabajo de la entrega 003.** No es una
  violación de la constitución —que de hecho exige comprobar autorización en el
  servidor— pero sí un cruce de frontera entre entregas. Está justificado en D-8 y
  acotado a una tabla de usuarios, una de sesiones, un ingreso y una pantalla.
- **El adaptador de n1co queda sin escribir** mientras su documentación no sea
  accesible (riesgo R-2). El diseño lo aísla para que esto no bloquee nada más, pero
  hay que decirlo claro: la entrega no puede cobrar con tarjeta de verdad hasta que esa
  pieza exista.
- **La constitución tiene un `TODO(PASARELA_PAGO)` ya superado**: decía que el cliente
  no había elegido pasarela. Ya la eligió. Conviene cerrarlo con `/speckit-constitution`
  en algún momento; no bloquea esta entrega.

### Re-evaluación posterior al diseño (Fase 1)

Revisado de nuevo tras producir `research.md`, `data-model.md`, los contratos y
`quickstart.md`. **Sigue pasando, sin violaciones.** El diseño refuerza cuatro
principios en puntos concretos:

- **Principio I**: el contrato de la pasarela obliga a verificar la firma **antes** de
  interpretar el cuerpo, y a que `verificarNotificacion` no toque la base de datos —
  decide, no actúa. La consulta del pedido devuelve el mismo mensaje ante referencia
  inexistente y ante correo que no corresponde, para no convertir la pantalla en un
  oráculo. La pasarela simulada no puede activarse en producción, y hay una prueba que
  lo comprueba.
- **Principio III**: el modelo pone la idempotencia donde de verdad aguanta la
  concurrencia —restricciones de unicidad en la base, no comprobaciones previas— en los
  dos sitios donde duele: el testigo de creación del pedido y el identificador de evento
  de la notificación (D-9). El índice único en `(carritoId, productoId)` hace que FR-003
  sea cierto por construcción y no por disciplina.
- **Principio IV**: `quickstart.md` recoge el recorrido por teclado y la auditoría
  automática como escenario V-9, con los mismos umbrales que la entrega 001.
- **Principio V**: los cinco casos de fiabilidad del cobro están listados como pruebas
  obligatorias, no como buenas intenciones (D-15).

Ninguna decisión de diseño obligó a desviarse de la constitución, así que la tabla de
complejidad sigue vacía.

## Project Structure

### Documentation (this feature)

```text
specs/002-carrito-checkout/
├── plan.md                      # Este archivo
├── research.md                  # Fase 0: 15 decisiones y 8 riesgos
├── data-model.md                # Fase 1: 9 entidades nuevas y la máquina de estados
├── quickstart.md                # Fase 1: cómo levantar y validar
├── contracts/                   # Fase 1
│   ├── rutas-publicas.md        #   qué responde cada dirección
│   ├── pasarela-de-pago.md      #   el puerto que aísla a n1co
│   └── reglas-de-calculo.md     #   totales, IVA, envío, caducidad, referencia
├── checklists/
│   └── requirements.md          # Validación de la especificación (16/16)
└── tasks.md                     # Fase 2: lo genera /speckit-tasks, no este comando
```

### Source Code (repository root)

Se añade sobre la estructura de la entrega 001; lo existente no se mueve.

```text
app/
├── carrito/page.tsx                     # historia 1
├── checkout/
│   ├── page.tsx                         # historia 2
│   ├── confirmacion/[referencia]/page.tsx
│   ├── retorno/route.ts                 # regreso desde el proveedor
│   └── cancelado/page.tsx
├── pedidos/page.tsx                     # historia 5: consulta por referencia y correo
├── gestion/
│   ├── layout.tsx                       # comprueba sesión en servidor
│   ├── ingreso/page.tsx
│   └── pedidos/
│       ├── page.tsx
│       └── [referencia]/page.tsx
└── api/
    ├── pagos/[proveedor]/notificaciones/route.ts
    └── mantenimiento/caducar/route.ts

components/
├── carrito/                             # línea, resumen, indicador de la navegación
├── checkout/                            # datos, entrega, medio de pago, resumen
└── gestion/                             # lista y detalle de pedidos pendientes

lib/
├── carrito/                             # identidad por cookie, líneas, revalidación
├── pedidos/                             # creación, estados, histórico, referencia
├── pagos/
│   ├── puerto.ts                        # la interfaz de tres operaciones
│   ├── n1co.ts                          # adaptador real (pendiente de R-2)
│   ├── simulada.ts                      # adaptador de pruebas
│   └── notificaciones.ts                # verificación e idempotencia
├── dinero.ts                            # totales, desglose de IVA, envío
├── correo/                              # puerto y adaptadores smtp / bitácora
└── personal/                            # contraseñas, sesiones, autorización

prisma/
├── schema.prisma                        # + 9 modelos
├── migrations/                          # migración nueva, versionada
└── seed.ts                              # + usuario del personal y pedidos de ejemplo

tests/
├── unit/                                # dinero, estados, idempotencia, caducidad…
└── e2e/                                 # tres compras, fiabilidad, gestión
```

**Structure Decision**: se mantiene la aplicación Next.js única de la entrega 001. Las
piezas nuevas siguen la misma separación que ya funciona —rutas en `app/`, presentación
en `components/`, reglas en `lib/`— con dos añadidos propios de esta entrega:

- **`lib/pagos/` es una frontera, no una carpeta más.** Dentro vive todo lo que sabe de
  un proveedor de cobro; fuera, nadie lo sabe. Es lo que hace cierta la promesa de
  «listo para n1co»: cuando llegue su documentación, se escribe `n1co.ts` y no se toca
  nada más.
- **`/gestion` está separada por ruta y por comprobación de rol en el servidor**, como
  exige la constitución. Su `layout.tsx` verifica la sesión antes de renderizar
  cualquier hija, y cada mutación la vuelve a verificar: un layout no es un control de
  acceso por sí solo.

## Complexity Tracking

> Sin violaciones de la constitución que justificar. Tabla no aplicable en esta entrega.
>
> La única decisión que añade superficie respecto a lo estrictamente pedido es la
> autenticación mínima del personal, y no es complejidad gratuita: FR-037 y FR-038 la
> exigen, y sin ella dos de los tres medios de pago que el cliente eligió no se pueden
> completar. La alternativa más simple —un enlace firmado enviado al correo de ventas—
> se evaluó y se rechazó en D-8 porque un buzón compartido no puede atribuir la acción a
> una persona, que es justo lo que FR-038 pide.
