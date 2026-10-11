# Contrato de parámetros del catálogo

**Feature**: 001 Catálogo y detalle de producto · **Fecha**: 2026-10-11

Los parámetros de `GET /productos` llegan desde la dirección, es decir, desde fuera del sistema.
Se validan en el servidor antes de tocar la base de datos (constitución, principio I) y se
canonicalizan para que una misma consulta tenga siempre una sola representación.

---

## Parámetros

| Nombre | Tipo | Por defecto | Reglas |
|--------|------|-------------|--------|
| `q` | texto | ausente | Se recorta de espacios sobrantes. Longitud válida: 1–80 caracteres tras recortar. Se normaliza (minúsculas, sin diacríticos) antes de consultar |
| `categoria` | texto | ausente | Debe corresponder al `slug` de una categoría existente |
| `pagina` | entero | 1 | Entero positivo. Tamaño de página: 12 |

---

## Canonicalización

Ninguna entrada inválida produce un error en pantalla: se corrige y se sigue adelante. La
canonicalización es determinista y está cubierta por pruebas unitarias.

| Entrada | Resultado |
|---------|-----------|
| `q` solo con espacios, o vacío | Se descarta: equivale a no filtrar por texto |
| `q` de más de 80 caracteres | Se recorta a 80 |
| `categoria` que no existe | Se descarta y se avisa en pantalla de que se muestra el catálogo completo |
| `pagina` no numérica, cero o negativa | Se trata como 1 |
| `pagina` mayor que el número de páginas disponibles | Se devuelve la **última página con resultados**, no una lista vacía (caso límite de página fuera de rango) |
| Parámetros desconocidos | Se ignoran; no alteran el resultado |
| Parámetro repetido (`?q=a&q=b`) | Se toma el primero |

**Dirección canónica**: los parámetros se emiten siempre en el orden `categoria`, `q`, `pagina`, y
los que tienen su valor por defecto se omiten. Así, la página 1 del catálogo completo es
`/productos`, no `/productos?pagina=1`.

---

## Combinaciones

`categoria` y `q` son **acumulativos**: filtrar por categoría y buscar texto devuelve la
intersección. Cambiar el filtro o la búsqueda **reinicia** la paginación a la página 1, porque
mantener la página 3 al cambiar de filtro deja al visitante mirando una lista vacía sin entender
por qué.

---

## Respuesta esperada

Para cualquier combinación válida, el catálogo devuelve:

- los productos **publicados** que cumplen el filtro, ordenados por fecha de creación
  descendente, con el identificador como desempate (ningún producto puede aparecer en dos
  páginas);
- como máximo 12 por página;
- el total de resultados y el número de páginas, para poder dibujar la navegación;
- el estado aplicado (categoría y búsqueda vigentes), visible en pantalla y reflejado en la
  dirección (FR-006).

---

## Ejemplos

| Dirección | Significado |
|-----------|-------------|
| `/productos` | Catálogo completo, página 1 |
| `/productos?categoria=osmosis-inversa` | Solo ósmosis inversa, página 1 |
| `/productos?q=membrana` | Productos cuyo nombre contiene «membrana», sin distinguir acentos ni mayúsculas |
| `/productos?categoria=repuestos-y-consumibles&q=uv&pagina=2` | Intersección de categoría y texto, segunda página |
| `/productos?pagina=999` | Última página con resultados |
| `/productos?categoria=inexistente` | Catálogo completo con aviso de que la categoría pedida no existe |
