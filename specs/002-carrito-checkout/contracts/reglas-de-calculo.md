# Contrato de cálculo: totales, IVA, envío y caducidad

**Feature**: 002 Carrito y checkout · **Fecha**: 2026-10-11

Estas reglas producen dinero que alguien va a pagar, así que se fijan aquí y se cubren
con pruebas unitarias (principio V). Son deterministas: las mismas entradas dan siempre
el mismo resultado.

---

## Totales

```text
subtotalLinea = precioUnitario × cantidad
subtotal      = Σ subtotalLinea
costoEnvio    = 0.00                si formaEntrega = RETIRO
              = ENVIO_COSTO_FIJO    si formaEntrega = ENVIO
total         = subtotal + costoEnvio
```

Todo en decimal exacto, nunca en flotante (principio III). **El redondeo ocurre una sola
vez**, al final; los precios de catálogo ya vienen con dos decimales, así que los
productos no introducen redondeo.

---

## Desglose del IVA

Los precios publicados son finales, con el 13 % ya incluido (entrega 001, FR-028). El
IVA no se suma: se desglosa hacia atrás.

```text
gravable = redondear(total / 1.13, 2)   // redondeo al más cercano, mitad hacia arriba
iva      = total − gravable
```

**Por qué restando y no multiplicando**: con `iva = redondear(total × 0.13/1.13, 2)` hay
dos redondeos independientes y `gravable + iva` puede diferir del total en un centavo.
Restando, la identidad `gravable + iva = total` se cumple siempre.

| Total | Gravable | IVA | Comprobación |
|-------|----------|-----|--------------|
| $389.00 | $344.25 | $44.75 | 344.25 + 44.75 = 389.00 ✓ |
| $7.50 | $6.64 | $0.86 | 6.64 + 0.86 = 7.50 ✓ |
| $11.90 | $10.53 | $1.37 | 10.53 + 1.37 = 11.90 ✓ |
| $2,890.00 | $2,557.52 | $332.48 | 2557.52 + 332.48 = 2890.00 ✓ |

El desglose es **informativo**: se muestra y se guarda en el pedido, pero el importe a
cobrar es siempre `total`.

---

## Cantidades

| Entrada | Resultado |
|---------|-----------|
| Menor que 1, cero, negativa o no numérica | Se corrige a 1 |
| Mayor que 99 | Se corrige a 99 |
| Decimal | Se trunca a entero y se acota al rango |

Nunca se rechaza con un error: se corrige y se sigue (FR-005).

---

## Revalidación del carrito

Al abrir el carrito y al iniciar la compra, por cada línea:

| Situación | Qué pasa |
|-----------|----------|
| El producto ya no está publicado | La línea se marca como no disponible; bloquea el paso al pago |
| El producto está agotado | Igual |
| El producto perdió su precio público | Igual |
| El precio cambió | La línea se marca con el precio anterior y el nuevo; hay que confirmar antes de pagar (FR-010) |
| Cambió el costo de envío | Se muestra el cambio en el resumen y hay que confirmarlo (FR-016) |

**Invariante**: nunca se cobra un importe que el comprador no haya visto y confirmado.

---

## Caducidad

Plazo desde la creación del pedido, configurable por variable de entorno:

| Medio de pago | Plazo por defecto | Por qué |
|---------------|-------------------|---------|
| Tarjeta | 24 horas | El cobro se resuelve en minutos; un día es de sobra |
| Transferencia | 3 días hábiles | Deja margen para un depósito de fin de semana |
| Contra entrega | 15 días | Depende de coordinar una entrega, que lleva más tiempo |

Al vencer, el pedido pasa a `NO_COMPLETADO`. **No se borra**: un pedido que no prosperó
es información, no basura.

Los carritos caducan a los **30 días** sin actividad (FR-006) y pasan a `ABANDONADO`.

---

## Umbral de pedido grande

Un pedido con `medioPago = CONTRA_ENTREGA` y `total` por encima de
`CONTRA_ENTREGA_UMBRAL` se señala en la notificación a ventas y en la lista de gestión
(FR-035). **No se bloquea**: el cliente decidió aceptar contra entrega sin tope, y quién
despacha es una decisión de negocio, no del sistema.

---

## Referencia del pedido

Formato: `HLS-AAAAMM-XXXXXX`, donde `XXXXXX` son seis caracteres aleatorios de un
alfabeto sin ambigüedades (sin `0`, `O`, `1`, `I`, `l`).

- **Legible**: se puede dictar por teléfono sin confusiones.
- **No adivinable**: la parte aleatoria lo impide, que es lo que FR-022 pide y lo que
  hace seguro consultar un pedido con referencia y correo.
- **Única**: con restricción en la base, no con una comprobación previa.
