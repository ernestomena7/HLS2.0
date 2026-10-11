# Specification Quality Checklist: Carrito y checkout

**Purpose**: Validar que la especificación está completa y es de calidad antes de
planificar
**Created**: 2026-10-11
**Updated**: 2026-10-11, tras resolverse las tres decisiones de alcance
**Feature**: [spec.md](../spec.md)

## Content Quality

- [X] No implementation details (languages, frameworks, APIs)
- [X] Focused on user value and business needs
- [X] Written for non-technical stakeholders
- [X] All mandatory sections completed

## Requirement Completeness

- [X] No [NEEDS CLARIFICATION] markers remain
- [X] Requirements are testable and unambiguous
- [X] Success criteria are measurable
- [X] Success criteria are technology-agnostic (no implementation details)
- [X] All acceptance scenarios are defined
- [X] Edge cases are identified
- [X] Scope is clearly bounded
- [X] Dependencies and assumptions identified

## Feature Readiness

- [X] All functional requirements have clear acceptance criteria
- [X] User scenarios cover primary flows
- [X] Feature meets measurable outcomes defined in Success Criteria
- [X] No implementation details leak into specification

## Notes

### Validación: 16 de 16 ✅

Los tres marcadores [NEEDS CLARIFICATION] quedaron resueltos por el cliente el
2026-10-11 y se integraron en los requisitos, no como notas al margen:

| Decisión | Elegido | Dónde quedó |
|----------|---------|-------------|
| Qué se compra en línea | Todo producto con precio público, sin tope de monto | FR-011 |
| Cómo se entrega | Retiro gratis, o envío con costo fijo a todo el país | FR-012 a FR-016 |
| Medios de pago | Tarjeta, transferencia y contra entrega | FR-023 a FR-035 |

La tercera decisión fue la que más movió la especificación. Aceptar transferencia y
pago contra entrega significa que **dos de los tres medios de pago no los confirma
ninguna máquina**, sino una persona de Hidrosal. Eso añadió:

- cuatro requisitos de confirmación restringida y auditable (FR-036 a FR-039);
- dos escenarios de aceptación en la historia 3 y tres criterios de éxito (SC-011 a
  SC-013);
- cinco casos límite nuevos (transferencia que no llega, transferencia por otro
  importe, pedido contra entrega no recogido, contra entrega de monto alto y cambio del
  costo de envío);
- tres riesgos nuevos (R-5, R-6 y R-7).

### Un límite de alcance que conviene mirar

FR-036 a FR-039 son lo más cerca que esta entrega llega de la administración, que es la
entrega 003. Está asumido y justificado en la especificación: sin esa confirmación, dos
de los tres medios de pago no se pueden completar y la tienda no sería operable. Es
**solo** confirmar o descartar un pago, no una pantalla de administración de pedidos.

### Sobre la mención de n1co

El proveedor de pago aparece por su nombre en Dependencias, no en los requisitos. Los
requisitos están escritos contra «el proveedor de pago» en abstracto, de modo que la
especificación sigue siendo válida si el cliente cambia de proveedor. n1co es una
decisión de negocio ya tomada, y documentarla es parte de las dependencias, no un
detalle de implementación filtrado.

### Pendiente antes de planificar

- **R-2**: la documentación técnica de n1co no se pudo leer desde el entorno de trabajo
  (dominios bloqueados por la política de red). Lo recogido viene de fuentes
  secundarias y está marcado como no confirmado.
- **R-7**: falta el monto fijo del envío. Es un valor configurable: no bloquea
  planificar ni construir, sí publicar.
