# Guía rápida de puesta en marcha y validación

**Feature**: 002 Carrito y checkout · **Fecha**: 2026-10-11

Cómo levantar la entrega 002 y comprobar que cumple lo especificado. No contiene código
de implementación: eso pertenece a `tasks.md` y a la fase de implementación.

---

## Requisitos previos

Los mismos de la entrega 001 —Node 22 LTS, MySQL 8 o MariaDB 10.6+, npm— más dos cosas
nuevas que **no** hacen falta para desarrollar:

| Requisito | Cuándo hace falta |
|-----------|-------------------|
| Credenciales de n1co | Solo para cobrar de verdad. En desarrollo se usa la pasarela simulada |
| Servicio SMTP | Solo para enviar correo de verdad. En desarrollo se escribe en la bitácora |

---

## Puesta en marcha

```bash
npm install

cp .env.example .env
#   Además de DATABASE_URL y NEXT_PUBLIC_SITE_URL de la entrega 001, completar:
#     PASARELA_PROVEEDOR=simulada
#     ENVIO_COSTO_FIJO=...        (el monto que decida Hidrosal; riesgo R-7)
#     CONTRA_ENTREGA_UMBRAL=...
#     CORREO_TRANSPORTE=bitacora

npx prisma migrate dev     # añade las tablas de carrito, pedido, pagos y personal
npx prisma db seed         # catálogo + usuario del personal + pedidos de ejemplo

npm run dev                # http://localhost:3000
```

El seed crea un usuario del personal para desarrollo. Sus credenciales se imprimen al
sembrar y **no deben reutilizarse en producción**: en producción el primer usuario se
crea con una orden aparte, no con el seed.

---

## Comprobaciones automáticas

```bash
npm run typecheck
npm run lint
npm run test        # unidad
npm run test:e2e    # extremo a extremo, contra la pasarela simulada
npm run build
```

Las cinco deben pasar antes de fusionar (constitución, puertas de calidad).

---

## Escenarios de validación

Cada escenario corresponde a una historia y se puede ejecutar a mano con los datos de
ejemplo. Son los mismos recorridos que cubren las pruebas de extremo a extremo.

### V-1 · El carrito junta, recuerda y suma bien (Historia 1, FR-001 a FR-010)

1. Añadir un producto desde su ficha y otro desde el catálogo. El contador de la
   navegación sube en ambos casos.
2. Añadir **otra vez** el primero: debe sumarse a su línea, no crear una segunda.
3. Abrir `/carrito`: cada línea con imagen, nombre, precio unitario, cantidad y
   subtotal; abajo el total con «IVA incluido».
4. Subir una cantidad, bajar otra, eliminar una línea: los totales se recalculan y el
   resto del carrito no se mueve.
5. Escribir `0`, `-3` y `500` como cantidad: deben quedar en 1, 1 y 99, sin error.
6. Intentar añadir un producto **sin precio** y uno **agotado**: no se puede; se ofrece
   cotización.
7. Cerrar el navegador, volver a abrirlo: el carrito sigue ahí.

### V-2 · Comprar con tarjeta (Historia 2, FR-017 a FR-030)

1. Desde el carrito, ir al checkout. Dejar un campo obligatorio vacío: avisa en español
   y **no** crea pedido.
2. Elegir **retiro**: no pide dirección y el envío no suma.
3. Elegir **envío**: pide dirección, municipio y departamento, y el costo fijo aparece
   como línea propia del resumen.
4. Elegir **tarjeta** y confirmar: aparece el pedido en la base como `PENDIENTE_PAGO`
   **antes** de salir del sitio.
5. En la pasarela simulada, **aprobar**: al volver, confirmación con referencia y
   detalle, pedido `PAGADO`, carrito vacío.
6. Repetir y **rechazar**: mensaje de que no se cobró nada, carrito **intacto**, opción
   de reintentar o cambiar de medio.

### V-3 · Comprar por transferencia y contra entrega (FR-031 a FR-035)

1. Elegir **transferencia**: la confirmación muestra los datos bancarios y la referencia
   a anotar; el pedido queda `PENDIENTE_PAGO` y claramente marcado como no pagado.
2. Elegir **contra entrega**: el pedido queda pendiente de cobro con el aviso de que se
   paga al recibir o retirar.
3. Hacer un pedido contra entrega por encima del umbral: debe quedar **señalado** en la
   notificación a ventas y en la lista de gestión.

### V-4 · El cobro es fiable (Historia 3, FR-027 a FR-045)

1. **Notificación duplicada**: reenviar la misma notificación. El pedido no cambia y no
   aparece un segundo pedido.
2. **Firma inválida**: enviar una notificación manipulada. Se rechaza, se registra y
   ningún pedido cambia de estado.
3. **Comprador desconectado**: aprobar en la pasarela simulada sin volver al sitio. El
   pedido queda `PAGADO` igual.
4. **Doble envío**: pulsar «confirmar pedido» dos veces seguidas. Existe **un** pedido.
5. **Vencimiento**: adelantar la fecha de vencimiento de un pedido pendiente y ejecutar
   la barrida. Pasa a `NO_COMPLETADO` y **no** se borra.
6. Abrir el histórico de un pedido: cada cambio de estado con su origen y su fecha.

### V-5 · Solo Hidrosal confirma los pagos manuales (FR-036 a FR-039, D-8)

1. Abrir `/gestion/pedidos` **sin sesión**: redirige al ingreso, no muestra nada.
2. Intentar confirmar un pedido conociendo solo su referencia, sin sesión: no se
   ejecuta y **el intento queda registrado**.
3. Ingresar con el usuario del personal, confirmar un pedido de transferencia anotando
   el importe recibido: pasa a `PAGADO` y queda registrado **quién, cuándo y cuánto**.
4. Confirmarlo otra vez: no-op explicado, no un segundo cambio ni un error.
5. Descartar un pedido contra entrega: pasa a `NO_COMPLETADO`, con el mismo registro.
6. Comprobar el mensaje de ingreso fallido: el mismo para correo inexistente y para
   contraseña incorrecta.

### V-6 · Cotizaciones (Historia 4, FR-046 a FR-048)

1. Abrir la ficha de un producto **sin precio**: la acción principal es solicitar
   cotización, no comprar.
2. Enviarla: queda registrada con la referencia del producto y llega a ventas.
3. Comprobar que el carrito **no** se vio afectado.

### V-7 · Después de la compra (Historia 5, FR-049 a FR-051)

1. Completar una compra por cada medio de pago: llega un comprobante con referencia,
   detalle, costo de envío, total y **qué hacer a continuación** según el medio.
2. Consultar en `/pedidos` con referencia y correo correctos: estado y detalle.
3. Consultar con un correo que no corresponde: **el mismo** mensaje que con una
   referencia inexistente.
4. Confirmar una transferencia desde gestión y volver a consultar: ya aparece pagada.

### V-8 · Lo que no cambió (FR-054)

1. Portada, catálogo y fichas responden igual que en la entrega 001, con el mismo
   aspecto y las mismas direcciones.
2. `/sitemap.xml` sigue sin incluir borradores, y ahora tampoco incluye `/gestion`.

### V-9 · Accesibilidad y rendimiento (FR-053, SC-007, SC-008)

1. Recorrer carrito, checkout, confirmación y consulta **solo con teclado**.
2. Pasar la auditoría automática de accesibilidad sobre esas cuatro pantallas: sin
   incidencias de nivel A ni AA.
3. Medir con la red limitada a 4G: contenido principal por debajo de 2,5 s y
   desplazamiento acumulado por debajo de 0,1, con el mismo script de la entrega 001.

---

## Comprobaciones de cálculo

Vale la pena verificarlas a mano una vez, porque producen dinero que alguien paga:

| Total | Gravable | IVA |
|-------|----------|-----|
| $389.00 | $344.25 | $44.75 |
| $7.50 | $6.64 | $0.86 |
| $11.90 | $10.53 | $1.37 |
| $2,890.00 | $2,557.52 | $332.48 |

En los cuatro, `gravable + IVA = total` exactamente. El detalle de la regla está en
[contracts/reglas-de-calculo.md](./contracts/reglas-de-calculo.md).

---

## Qué NO cubre esta entrega

Si algo de esto aparece durante la validación, el alcance se está desbordando:

- cuentas de cliente, con historial de pedidos propio;
- administración de productos, categorías o usuarios (entrega 003);
- control de existencias por unidades, reservas de stock;
- cupones, promociones, precios por volumen o pagos recurrentes;
- facturación electrónica (DTE);
- reembolsos desde la aplicación.

---

## Antes de publicar

- **Confirmar R-1**: que el plan de Hostinger ejecuta Node. Sin eso no se despliega nada.
- **Resolver R-2**: abrir la documentación de n1co desde una red sin restricciones y
  completar el adaptador. Hasta entonces, `PASARELA_PROVEEDOR` no puede ser `n1co`.
- **Resolver R-7**: fijar el monto del envío.
- **Resolver R-4**: contratar el servicio SMTP y pasar `CORREO_TRANSPORTE` a `smtp`.
- **Asignar a una persona** la revisión diaria de pedidos por transferencia y contra
  entrega (riesgo R-6). Es trabajo operativo, no de código.
- Cambiar la contraseña del usuario del personal y **no** usar la del seed.
