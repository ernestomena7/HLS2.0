# Specification Quality Checklist: Carrito y checkout

**Purpose**: Validar que la especificación está completa y es de calidad antes de
planificar
**Created**: 2026-10-11
**Feature**: [spec.md](../spec.md)

## Content Quality

- [X] No implementation details (languages, frameworks, APIs)
- [X] Focused on user value and business needs
- [X] Written for non-technical stakeholders
- [X] All mandatory sections completed

## Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
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

### Validación: 15 de 16

Queda un solo punto abierto, y es deliberado: **tres marcadores
[NEEDS CLARIFICATION]** en FR-012, FR-014 y FR-015. Los tres son decisiones de
negocio del cliente, no detalles técnicos, y ninguno tiene un valor por defecto
razonable:

| Marcador | Requisito | Qué decide |
|----------|-----------|------------|
| Q1 | FR-015 | Qué parte del catálogo se puede comprar en línea |
| Q2 | FR-012 | Cómo se entrega lo comprado y qué cuesta |
| Q3 | FR-014 | Qué medios de pago se aceptan |

Los tres afectan al **alcance**, que es la prioridad más alta de la lista: cambian qué
pantallas hay que construir y qué estados puede tener un pedido. Responderlos antes de
`/speckit-plan` evita rehacer el plan.

### Sobre la mención de n1co

El proveedor de pago aparece por su nombre en la sección de Dependencias, no en los
requisitos. Los requisitos están escritos contra «el proveedor de pago» en abstracto,
de modo que la especificación sigue siendo válida si el cliente cambia de proveedor.
Eso es intencional y no incumple la regla de «sin detalles de implementación»: n1co es
una decisión de negocio ya tomada por el cliente, y documentarla es parte de las
dependencias.

### Pendiente de verificar antes de planificar

La documentación técnica de n1co **no se pudo leer** desde el entorno de trabajo
(dominios bloqueados por la política de red). Lo recogido procede de fuentes
secundarias y está marcado como no confirmado en la especificación. Es el riesgo R-2.
