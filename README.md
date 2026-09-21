# Hidrosal (HLS) — Sitio web corporativo

Sitio de una sola página para **Hidrosal**, empresa salvadoreña de purificación y
tratamiento de agua por ósmosis inversa (residencial, comercial, industrial e
institucional). Está construido para generar contactos y leads de ventas.

## Características

- **Navegación fija** que se compacta y opacifica al hacer scroll, con menú móvil
  y resaltado automático de la sección activa.
- **Hero con parallax**: fotografía de un río con montañas boscosas al fondo
  (`assets/img/hero.webp`, 1920×1037, 57 KB). La imagen está recortada para que
  la línea del agua caiga al **60 %** de su altura y se ancla con
  `background-position: 50% 60%`, de modo que queda al **60 %** del hero en
  cualquier pantalla; desde ahí un difuminado la funde con el fondo al **90 %**.
- **Secciones**: Quiénes somos, Qué hacemos, Servicios (10 tarjetas), Nuestro
  enfoque, Marcas y Contacto.
- **Formulario de contacto** con validación en español (nombre, correo, teléfono,
  compañía opcional y mensaje) y campo trampa anti-spam.
- Animaciones de entrada al hacer scroll, diseño responsive y respeto por
  `prefers-reduced-motion`.

## Estructura

```
index.html              Marcado completo del sitio
assets/css/styles.css   Estilos (tokens de color, secciones, responsive)
assets/js/main.js       Navegación, parallax, reveals, marquesina y formulario
assets/img/hero.webp    Imagen del hero (río y montañas)
```

No hay proceso de compilación ni dependencias: es HTML, CSS y JavaScript estático.

## Ejecutar en local

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Personalización

| Qué | Dónde |
| --- | --- |
| Paleta, tipografías y medidas | `:root` en `assets/css/styles.css` |
| Endpoint del formulario | `FORM_ENDPOINT` en `assets/js/main.js` |
| Correo de destino | `CONTACT_EMAIL` en `assets/js/main.js` |
| Logos de marcas | sección `#marcas` en `index.html` |
| Imagen del hero | `assets/img/hero.webp` (mantén la línea del agua al 60 % de la imagen) |

### Formulario

`FORM_ENDPOINT` está vacío por defecto: al enviar, el sitio abre el cliente de
correo del visitante con el mensaje ya redactado hacia `ventas@hidrosal.com`.
Al colocar una URL (Formspree, Getform, Basin o un backend propio) el formulario
hace `POST` en JSON con los campos `nombre`, `correo`, `telefono`, `compania` y
`mensaje`, y muestra el estado del envío en la misma página.

### Marcas

Las tarjetas de la sección *Marcas* son **marcadores de posición** (`Marca 01` …
`Marca 08`). Sustituye cada `<span>` por el logo real cuando estén disponibles:

```html
<li class="brands__item"><img src="assets/img/marca.svg" alt="Nombre de la marca"></li>
```

## Despliegue

Al ser un sitio estático puede publicarse en GitHub Pages (rama y carpeta raíz),
Netlify, Vercel o cualquier hosting tradicional por FTP.

## Contacto

+503 7398 2967 · ventas@hidrosal.com
