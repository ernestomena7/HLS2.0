# Guía rápida de puesta en marcha y validación

**Feature**: 001 Catálogo y detalle de producto · **Fecha**: 2026-10-11

Cómo levantar la aplicación y comprobar que la entrega cumple lo especificado. No contiene
código de implementación: eso pertenece a `tasks.md` y a la fase de implementación.

---

## Requisitos previos

| Requisito | Versión | Nota |
|-----------|---------|------|
| Node.js | 22 LTS | El mismo runtime que debe ofrecer el alojamiento |
| MySQL o MariaDB | MySQL 8.0 / MariaDB 10.6+ | Local para desarrollo; en producción, el de Hostinger |
| Gestor de paquetes | npm | El que trae Node |

---

## Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno (ningún secreto se versiona)
cp .env.example .env
#    Editar .env y poner DATABASE_URL apuntando a la base local

# 3. Esquema de base de datos
npx prisma migrate dev

# 4. Datos de ejemplo
npx prisma db seed

# 5. Desarrollo
npm run dev        # http://localhost:3000
```

Compilación y arranque como en producción:

```bash
npm run build      # genera la salida standalone
npm start
```

Despliegue: las migraciones se aplican como **paso explícito previo al arranque**, nunca al
iniciar la aplicación (decisión D-12 de [research.md](./research.md)):

```bash
npx prisma migrate deploy
npm start
```

---

## Comprobaciones automáticas

```bash
npm run typecheck   # TypeScript estricto: debe terminar sin errores
npm run lint
npm run test        # Vitest: unidad
npm run test:e2e    # Playwright: extremo a extremo
```

Las cuatro deben pasar antes de fusionar (constitución, puertas de calidad).

---

## Escenarios de validación

Cada escenario corresponde a una historia de la especificación y se puede ejecutar a mano sobre
la aplicación levantada con los datos de ejemplo. Son los mismos recorridos que cubren las
pruebas de extremo a extremo.

### V-1 · El catálogo lista lo publicado (Historia 1, FR-001 a FR-003)

1. Abrir `/productos`.
2. **Esperado**: se ven los productos publicados en una rejilla, cada uno con imagen, nombre,
   categoría, disponibilidad y precio con «IVA incluido».
3. Comprobar que los **2 productos en borrador** del juego de datos no aparecen por ningún lado.
4. Comprobar que los productos **agotados** sí aparecen, marcados como tales.
5. Comprobar que los productos **sin precio** muestran «Precio a consultar» en lugar de una
   cifra.
6. Bajar al final: debe haber navegación de páginas, con 12 productos por página.

### V-2 · La ficha informa y lleva a la consulta (Historia 2, FR-008 a FR-011)

1. Abrir un producto desde el catálogo.
2. **Esperado**: galería navegable, descripción, tabla de especificaciones con nombre y valor,
   precio o «Precio a consultar», categoría y disponibilidad.
3. Al final de la ficha deben aparecer hasta 4 productos relacionados de la misma categoría, y
   deben abrirse.
4. La llamada a la acción debe llevar al formulario de contacto **indicando de qué producto
   procede la consulta**.
5. Abrir la ficha del producto **sin imagen**: debe mostrarse la imagen de reserva con texto
   alternativo, sin romperse.

### V-3 · Filtrar y buscar (Historia 3, FR-004 a FR-007)

1. Filtrar por una categoría: solo deben quedar sus productos publicados, y el filtro debe verse
   aplicado.
2. Buscar `osmosis`, `OSMOSIS` y `ósmosis`: **los tres** deben devolver el mismo resultado.
3. Combinar categoría y búsqueda: debe devolver la intersección, y volver a la página 1.
4. Buscar algo inexistente: mensaje claro de que no hay coincidencias y enlace al catálogo
   completo.
5. Copiar la dirección con filtro, búsqueda y página, abrirla en otra pestaña: **mismos
   resultados**.
6. Abrir `/productos?pagina=999`: debe mostrarse la última página con resultados, no una lista
   vacía.
7. Abrir `/productos?categoria=inexistente`: catálogo completo con aviso de categoría inexistente.
8. Abrir la categoría **sin productos publicados**: mensaje de que aún no hay productos, no un
   error.

### V-4 · Descubrimiento (Historia 4, FR-014 a FR-016)

1. Ver el código fuente de dos fichas distintas: cada una debe tener **título y descripción
   propios**.
2. Pegar la dirección de una ficha en una aplicación de mensajería o en un validador de vistas
   previas: debe mostrarse el nombre y la imagen principal del producto.
3. Abrir `/sitemap.xml`: deben estar la portada, el catálogo y todas las fichas publicadas, y **no
   debe estar** ningún producto en borrador.

### V-5 · El sitio de marketing sigue intacto (Historia 5, FR-022, FR-023)

1. Abrir `/` y comparar con las capturas del sitio anterior: mismo tema blanco, mismas
   tipografías, mismo hero con la línea del agua al 60 % y el difuminado completo al 90 %.
2. Recorrer las seis anclas de la navegación: todas deben seguir funcionando.
3. Enviar el formulario de contacto con datos válidos: debe comportarse igual que antes.

### V-6 · Direcciones estables (FR-013, SC-006)

1. Abrir una ficha y anotar su dirección.
2. Cambiar el nombre del producto en los datos y regenerar su slug.
3. Abrir la dirección anotada: debe **redirigir** a la nueva, no dar error.

### V-7 · Accesibilidad y estabilidad visual (FR-024 a FR-026, SC-003, SC-004)

1. Recorrer catálogo y ficha **solo con el teclado**: todo debe ser alcanzable, con foco visible y
   orden lógico.
2. Pasar una auditoría automática de accesibilidad: sin errores graves.
3. Cargar el catálogo con la red limitada a 4G en las herramientas del navegador: el contenido
   principal debe verse en menos de 2,5 s y **nada debe saltar** mientras cargan las imágenes.

---

## Resultado de la validación

Ejecutada el 2026-10-11 contra MariaDB 10.11 con el juego de datos de ejemplo
(6 categorías, 28 productos publicados), sobre la salida de producción
(`npm run build && npm start`).

| Escenario | Cómo se comprueba | Resultado |
|-----------|-------------------|-----------|
| V-1 · El catálogo lista lo publicado | `tests/e2e/catalogo.spec.ts` | ✅ 7 pruebas |
| V-2 · La ficha informa y lleva a la consulta | `tests/e2e/ficha-producto.spec.ts` | ✅ 9 pruebas |
| V-3 · Filtrar y buscar | `tests/e2e/busqueda-filtros.spec.ts` | ✅ 10 pruebas |
| V-4 · Descubrimiento | `tests/e2e/descubrimiento.spec.ts` | ✅ 6 pruebas |
| V-5 · El sitio de marketing sigue intacto | `tests/e2e/continuidad-marketing.spec.ts` | ✅ 12 pruebas |
| V-6 · Direcciones estables | Slug histórico del juego de datos, en `ficha-producto.spec.ts` | ✅ redirección permanente |
| V-7 · Accesibilidad y estabilidad visual | `tests/e2e/accesibilidad.spec.ts` y `scripts/medir-rendimiento.mjs` | ✅ ver abajo |

Totales: **69 pruebas unitarias** y **107 de extremo a extremo** (escritorio y
móvil), todas en verde.

### Accesibilidad (SC-003)

Auditoría automática con axe sobre siete páginas —portada, catálogo, catálogo
filtrado, catálogo sin resultados, ficha, ficha sin imagen y «no
encontrado»— en los niveles A y AA de WCAG 2.0 y 2.1: **cero incidencias**.

Se corrigieron dos que aparecieron en la primera pasada:

- contraste insuficiente del texto secundario, heredado del sitio estático. El
  token `--text-dim` pasó de `#6b8599` a `#566e85`, que cumple 4.5:1 sobre los
  cuatro fondos del tema. Mismo tono, solo más legible;
- los enlaces apagados de «Anterior» y «Siguiente» en los extremos de la
  paginación. Ya no se dibujan: un texto atenuado que no lleva a ninguna parte
  no aportaba nada.

Una auditoría automática no sustituye a una revisión a mano: sabe si un texto
alternativo existe, no si es útil. Queda como comprobación antes de publicar,
con el catálogo real.

### Rendimiento (SC-004 y SC-007)

Medido con `node scripts/medir-rendimiento.mjs`, que simula una conexión 4G de
gama media (1,6 Mb/s, 150 ms de ida y vuelta) y un procesador cuatro veces más
lento, en una pantalla de 390 px.

| Página | LCP | CLS |
|--------|-----|-----|
| Portada | 1.16 s | 0.000 |
| Catálogo | 0.71 s | 0.073 |
| Catálogo, página 2 | 1.21 s | 0.073 |
| Ficha | 0.77 s | 0.000 |

Umbrales de SC-004: contenido principal por debajo de **2,5 s** y
desplazamiento acumulado por debajo de **0,1**. Se cumplen.

**SC-007** se comprobó repitiendo la medición con **200 productos y 10
categorías** (`SEMILLA_CARGA=1 npx prisma db seed`): los mismos valores, y el
servidor respondiendo entre 15 y 35 ms en catálogo, búsqueda, paginación
profunda y mapa del sitio.

Dos correcciones salieron de estas mediciones:

- el hero esperaba a JavaScript para hacerse visible, lo que dejaba el
  contenido principal de la portada en **3,0 s**. Ahora su animación de entrada
  es solo CSS: **1,16 s**. Las demás secciones siguen apareciendo al
  desplazarse, y un `<noscript>` las muestra si no hay JavaScript;
- la fila de filtros se envolvía en varias líneas y cambiaba de altura al
  cargar la tipografía. Con diez categorías eso llevaba el desplazamiento
  acumulado a **0,16**, por encima del límite. Ahora es una sola fila
  desplazable, de altura fija.

**Decisión pendiente del cliente**: el 0,073 que queda viene de que los títulos
se reajustan cuando llega la tipografía Outfit. Cambiar la estrategia de carga
a `display: "optional"` lo deja en **0,000** y baja además la segunda página
del catálogo de 1,21 s a 0,74 s; el precio es que, en una primera visita con
red lenta, el texto se ve con la tipografía del sistema en lugar de la
aprobada. Se mantiene `swap` porque FR-023 pide no alterar el diseño y SC-004
ya se cumple, pero la alternativa está medida por si el cliente prefiere
priorizar la estabilidad visual.

---

## Qué NO cubre esta entrega

Si algo de esto aparece durante la validación, es señal de que el alcance se está desbordando:

- añadir al carrito, carrito o checkout (entrega 2);
- cualquier pantalla de administración, ingreso de usuarios o gestión de productos (entrega 3);
- cuentas de cliente, reseñas, cupones o cálculo de envíos.

---

## Antes de publicar

- Sustituir los datos de ejemplo por el catálogo real de Hidrosal (nombres, precios,
  especificaciones y fotografías).
- Confirmar que el plan de Hostinger **ejecuta Node** — riesgo R-1 de
  [research.md](./research.md). Sin eso, nada de lo anterior se puede desplegar.
- Confirmar el motor real de base de datos (MySQL o MariaDB) y su versión — riesgo R-2.
