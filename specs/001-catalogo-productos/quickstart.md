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
