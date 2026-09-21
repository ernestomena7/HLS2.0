/* =====================================================================
   HIDROSAL (HLS) — Interacciones del sitio
   Navegación fija, parallax del hero, animaciones al hacer scroll,
   marquesina de marcas y formulario de contacto.
   ===================================================================== */
(function () {
  'use strict';

  /* Endpoint del formulario (Formspree, Getform, Basin, tu propio backend…).
     Si se deja vacío, el formulario abre el correo del visitante con los
     datos ya redactados hacia ventas@hidrosal.com. */
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'ventas@hidrosal.com';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------- Navegación fija --- */
  var nav = $('#nav');
  var navLinks = $('#navLinks');
  var navToggle = $('#navToggle');

  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  }

  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  $$('a', navLinks).forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); }
  });

  /* ------------------------------- Enlace activo según la sección --- */
  var sections = $$('main section[id]');
  var linkFor = {};
  $$('a[href^="#"]', navLinks).forEach(function (a) {
    linkFor[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) { return; }
        if (entry.isIntersecting) {
          $$('a', navLinks).forEach(function (a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------- Animaciones al aparecer ---- */
  var revealables = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* --------------------------------------------- Parallax del hero -- */
  var hero = $('.hero');
  var layers = $$('[data-parallax]');
  var heroContent = $('.hero__content');
  var ticking = false;

  function paint() {
    ticking = false;
    var y = window.scrollY;
    var h = hero.offsetHeight;
    if (y > h) { return; }                 /* fuera de vista: nada que pintar */
    var p = Math.min(y / h, 1);

    layers.forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute('data-parallax')) || 0;
      layer.style.transform = 'translate3d(0,' + (y * speed).toFixed(2) + 'px,0)';
    });

    if (heroContent) {
      heroContent.style.transform = 'translate3d(0,' + (y * -0.16).toFixed(2) + 'px,0)';
      heroContent.style.opacity = String(Math.max(0, 1 - p * 1.35));
    }
  }

  function requestPaint() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(paint);
    }
  }

  window.addEventListener('scroll', function () {
    onScrollNav();
    if (!reduceMotion) { requestPaint(); }
  }, { passive: true });

  window.addEventListener('resize', function () {
    if (!reduceMotion) { requestPaint(); }
  }, { passive: true });

  onScrollNav();
  if (!reduceMotion) { paint(); }

  /* ------------------------------------- Marquesina de las marcas --- */
  var marquee = $('[data-marquee]');
  if (marquee) {
    var track = $('.brands__track', marquee);
    /* Se duplica el listado para que el desplazamiento sea continuo. */
    track.innerHTML += track.innerHTML;
    $$('.brands__item', track).forEach(function (item, i) {
      if (i >= track.children.length / 2) { item.setAttribute('aria-hidden', 'true'); }
    });
  }

  /* ------------------------------------------ Formulario contacto --- */
  var form = $('#contactForm');
  var status = $('#formStatus');

  var RULES = {
    nombre: function (v) {
      if (!v) { return 'Escribe tu nombre.'; }
      if (v.length < 3) { return 'El nombre es demasiado corto.'; }
      return '';
    },
    correo: function (v) {
      if (!v) { return 'Escribe tu correo electrónico.'; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { return 'El correo no parece válido.'; }
      return '';
    },
    telefono: function (v) {
      if (!v) { return 'Escribe tu teléfono.'; }
      if (v.replace(/\D/g, '').length < 8) { return 'El teléfono debe tener al menos 8 dígitos.'; }
      return '';
    },
    mensaje: function (v) {
      if (!v) { return 'Cuéntanos qué necesitas.'; }
      if (v.length < 10) { return 'El mensaje es demasiado corto.'; }
      return '';
    }
  };

  function setError(name, message) {
    var input = form.elements[name];
    if (!input) { return; }
    var field = input.closest('.field');
    var slot = $('[data-error-for="' + name + '"]', form);
    field.classList.toggle('is-invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) { slot.textContent = message; }
  }

  function validate() {
    var firstInvalid = null;
    Object.keys(RULES).forEach(function (name) {
      var value = (form.elements[name].value || '').trim();
      var message = RULES[name](value);
      setError(name, message);
      if (message && !firstInvalid) { firstInvalid = form.elements[name]; }
    });
    return firstInvalid;
  }

  if (form) {
    Object.keys(RULES).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () {
        setError(name, RULES[name]((input.value || '').trim()));
      });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('is-invalid')) {
          setError(name, RULES[name]((input.value || '').trim()));
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Campo trampa: si viene lleno, es un bot. */
      if ((form.elements.sitio.value || '').trim() !== '') { return; }

      var invalid = validate();
      if (invalid) {
        status.textContent = 'Revisa los campos marcados para continuar.';
        status.className = 'form__status is-error';
        invalid.focus();
        return;
      }

      var data = {
        nombre: form.elements.nombre.value.trim(),
        correo: form.elements.correo.value.trim(),
        telefono: form.elements.telefono.value.trim(),
        compania: form.elements.compania.value.trim(),
        mensaje: form.elements.mensaje.value.trim()
      };

      if (!FORM_ENDPOINT) {
        /* Sin backend configurado: se abre el cliente de correo. */
        var body = [
          'Nombre: ' + data.nombre,
          'Correo: ' + data.correo,
          'Teléfono: ' + data.telefono,
          'Compañía: ' + (data.compania || 'No indicada'),
          '',
          data.mensaje
        ].join('\n');
        window.location.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('Solicitud de asesoría — ' + data.nombre) +
          '&body=' + encodeURIComponent(body);
        status.textContent = 'Abrimos tu correo con el mensaje listo para enviar.';
        status.className = 'form__status is-ok';
        return;
      }

      var button = $('button[type="submit"]', form);
      button.disabled = true;
      status.textContent = 'Enviando…';
      status.className = 'form__status';

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) { throw new Error('HTTP ' + res.status); }
        form.reset();
        status.textContent = '¡Gracias! Recibimos tu mensaje y te contactaremos muy pronto.';
        status.className = 'form__status is-ok';
      }).catch(function () {
        status.textContent = 'No pudimos enviar el mensaje. Escríbenos a ' + CONTACT_EMAIL + '.';
        status.className = 'form__status is-error';
      }).then(function () {
        button.disabled = false;
      });
    });
  }

  /* ------------------------------------------------------- Varios --- */
  var year = $('#year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
