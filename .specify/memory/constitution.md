<!--
Sync Impact Report — 2026-10-11
Cambio de versión: (sin versión previa, plantilla sin rellenar) → 1.0.0
Motivo del salto: ratificación inicial. La plantilla no contenía principios concretos,
por lo que esta es la primera versión con contenido vinculante.

Principios definidos (6; la plantilla traía 5 huecos):
- I. Seguridad por Defecto (NO NEGOCIABLE)
- II. Tipado Estricto de Extremo a Extremo
- III. Esquema de Datos Versionado
- IV. Accesibilidad y Rendimiento como Requisitos
- V. Pruebas Proporcionales al Riesgo
- VI. Localización para El Salvador

Secciones añadidas:
- Restricciones Tecnológicas y de Despliegue (antes [SECTION_2_NAME])
- Flujo de Desarrollo y Puertas de Calidad (antes [SECTION_3_NAME])

Secciones eliminadas: ninguna.

Seguimiento pendiente:
- TODO(HOSTINGER_PLAN): confirmar que el plan contratado en Hostinger ejecuta Node.js
  (hosting con Node o VPS). El hosting compartido solo con PHP no puede servir Next.js.
- TODO(PASARELA_PAGO): el cliente aún no ha elegido pasarela de pago; condiciona el checkout.

Este informe es material de revisión temporal y debe eliminarse antes de dar por cerrada
la enmienda.
-->

# Hidrosal (HLS) Constitution

## Core Principles

### I. Seguridad por Defecto (NO NEGOCIABLE)

La tienda maneja cuentas de personas y pedidos, así que la postura segura es la posición de
partida, no un endurecimiento posterior.

- Los secretos (credenciales de base de datos, claves de sesión, claves de pasarela) MUST vivir
  solo en variables de entorno. Ningún secreto se versiona; el repositorio MUST mantener un
  `.env.example` con las claves vacías y documentadas.
- Toda entrada que cruce el límite del servidor (formularios, parámetros de ruta, cuerpos de
  petición, webhooks) MUST validarse en el servidor con un esquema tipado antes de usarse.
- La autorización MUST verificarse en el servidor en cada ruta, acción y consulta de
  administración. Ocultar un enlace en la interfaz NO cuenta como control de acceso.
- Las contraseñas MUST almacenarse con argon2id o bcrypt con factor de coste vigente. Nunca en
  texto plano, nunca con hash simple sin sal.
- Las mutaciones autenticadas MUST estar protegidas contra CSRF y las cookies de sesión MUST ser
  `HttpOnly`, `Secure` y `SameSite`.
- Los datos completos de tarjeta NO se almacenan ni se registran en bitácoras. El cobro se
  delega a una pasarela; el sistema guarda únicamente identificadores y estados devueltos.

*Razón: una filtración de credenciales o de datos de clientes es un daño irreversible para el
cliente y para su reputación comercial.*

### II. Tipado Estricto de Extremo a Extremo

- TypeScript MUST ejecutarse en modo estricto (`strict: true`) y la compilación MUST fallar ante
  errores de tipo.
- El código de producción MUST NOT contener `any` ni `@ts-ignore`. Cuando un tipo externo es
  genuinamente desconocido se usa `unknown` y se estrecha con validación.
- Los límites del sistema (formularios, API, variables de entorno, respuestas de terceros) MUST
  validarse con esquemas Zod, y los tipos MUST derivarse de esos esquemas en lugar de declararse
  por duplicado.

*Razón: en una tienda, un tipo equivocado en un precio o en un total es un error con consecuencia
monetaria directa.*

### III. Esquema de Datos Versionado

- Todo cambio en la base de datos MUST llegar mediante una migración versionada y revisable,
  generada por el ORM. Nunca se modifica el esquema de producción a mano.
- Cada migración MUST tener un camino de reversión conocido, documentado en el propio cambio
  cuando no sea automático.
- El acceso a datos MUST pasar por el ORM. El SQL concatenado a partir de valores de usuario está
  PROHIBIDO; cuando se necesite SQL crudo, MUST ser parametrizado y justificado en la revisión.
- El dinero MUST representarse con tipos decimales exactos en la base de datos y en el dominio.
  Los flotantes binarios están PROHIBIDOS para precios, totales e impuestos.

*Razón: el esquema es la memoria del negocio; perder o corromper pedidos no se arregla con un
despliegue nuevo.*

### IV. Accesibilidad y Rendimiento como Requisitos

- Las páginas MUST ser operables solo con teclado, con foco visible y orden de tabulación lógico.
- El marcado MUST ser semántico y los formularios MUST tener etiquetas asociadas y mensajes de
  error anunciables por lectores de pantalla.
- El contraste de texto MUST cumplir WCAG 2.1 AA (4.5:1 en texto normal).
- Las animaciones MUST respetar `prefers-reduced-motion`.
- Las imágenes MUST servirse optimizadas y con dimensiones declaradas para no provocar saltos de
  diseño.
- El sistema de diseño existente MUST conservarse: tema blanco, tokens de color en `:root`,
  tipografías Outfit e Inter, y la línea de agua del hero al 60 % de su altura.

*Razón: la tienda debe vender a cualquier visitante, y la identidad visual ya aprobada por el
cliente no se renegocia en cada pantalla nueva.*

### V. Pruebas Proporcionales al Riesgo

- La lógica de negocio crítica MUST tener pruebas automatizadas: cálculo de precios, totales e
  impuestos del carrito, autenticación, y autorización por rol.
- Los flujos de compra (catálogo → detalle → carrito → checkout) y de administración (ingreso,
  alta y edición de productos, gestión de usuarios) MUST cubrirse con pruebas de extremo a extremo.
- Todo informe de defecto en lógica crítica MUST reproducirse primero con una prueba que falle.
- La cobertura exhaustiva de código presentacional NO es obligatoria: el esfuerzo de prueba se
  concentra donde un fallo cuesta dinero, datos o acceso.

*Razón: probar todo por igual desperdicia el presupuesto; no probar el cobro ni el acceso lo
destruye.*

### VI. Localización para El Salvador

- El contenido de cara al público MUST estar en español, con el registro usado en El Salvador.
- Los precios MUST expresarse en dólares estadounidenses (USD), moneda de curso legal del país.
- Los formatos de fecha, número y teléfono MUST seguir la convención salvadoreña.
- Los mensajes de error visibles MUST ser accionables y estar en español; los textos técnicos
  quedan en las bitácoras del servidor, no en pantalla.

*Razón: el comprador es salvadoreño y la confianza en una tienda se pierde con una traducción
mecánica o un precio ambiguo.*

## Restricciones Tecnológicas y de Despliegue

- **Marco**: Next.js con App Router y TypeScript estricto. React Server Components por defecto;
  los componentes de cliente se usan solo donde hay estado o interacción del navegador.
- **Base de datos**: MySQL. El acceso se hace con Prisma y migraciones versionadas.
- **Despliegue**: Hostinger. La aplicación MUST poder ejecutarse con el runtime de Node de
  Hostinger (`next start`, con `output: "standalone"`). Las funciones edge propietarias y
  cualquier servicio exclusivo de un proveedor están PROHIBIDOS salvo que exista y se documente
  una alternativa autoalojada.
- **Autenticación**: correo y contraseña, con sesiones seguras y dos roles diferenciados,
  `cliente` y `administrador`. El área de administración MUST estar separada por ruta y por
  comprobación de rol en el servidor.
- **Pagos**: el cobro se delega a una pasarela externa. El sistema NO almacena datos completos de
  tarjeta.
- **Alcance funcional vigente**: catálogo de productos, detalle de producto, carrito, checkout,
  administración de productos y administración sencilla de usuarios.
- **Herramientas**: Node.js LTS, ESLint y Prettier (o equivalente) ejecutables por línea de
  comandos; cualquier desarrollador MUST poder levantar el proyecto con instalar dependencias,
  copiar `.env.example` y correr las migraciones.

## Flujo de Desarrollo y Puertas de Calidad

- El trabajo sigue el flujo guiado por especificación de Spec Kit: `/speckit-specify` →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. La implementación no comienza sin
  especificación escrita.
- Antes de fusionar, la rama MUST pasar: verificación de tipos, lint, pruebas automatizadas y
  compilación de producción. Una puerta en rojo bloquea la fusión.
- Las revisiones MUST verificar el cumplimiento de esta constitución, no solo el estilo del
  código. Toda desviación MUST declararse y justificarse en la descripción del cambio.
- Las migraciones de base de datos MUST revisarse explícitamente antes de fusionarse.
- Los mensajes de commit y las descripciones de cambio se redactan en español, en modo
  imperativo, explicando el porqué.

## Governance

- Esta constitución PREVALECE sobre cualquier otra práctica, preferencia o costumbre del
  repositorio. Ante un conflicto, gana la constitución.
- **Enmiendas**: toda modificación MUST quedar registrada en este archivo, con la justificación
  del cambio y el ajuste de versión correspondiente. Las enmiendas que afecten al alcance
  contratado MUST contar con la aprobación del cliente antes de aplicarse.
- **Versionado semántico de este documento**:
  - MAJOR: se elimina o se redefine un principio de forma incompatible con lo anterior.
  - MINOR: se añade un principio o una sección, o se amplía materialmente una guía existente.
  - PATCH: aclaraciones, correcciones de redacción y precisiones sin cambio de significado.
- **Revisión de cumplimiento**: cada cambio que llegue a la rama principal MUST haber sido
  revisado contra estos principios. La complejidad añadida MUST justificarse; cuando una
  alternativa más simple cumple el requisito, se elige la simple.
- **Guía operativa**: para el detalle del día a día (comandos, estructura y convenciones) se usa
  `CLAUDE.md` en la raíz del repositorio; cuando ese archivo contradiga esta constitución, manda
  esta constitución y el archivo MUST corregirse.

**Version**: 1.0.0 | **Ratified**: 2026-10-11 | **Last Amended**: 2026-10-11
