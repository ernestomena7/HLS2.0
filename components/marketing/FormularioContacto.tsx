"use client";

import { useId, useState, useSyncExternalStore, type FormEvent } from "react";

import { retraso } from "@/components/marketing/retraso";

/**
 * Formulario de contacto.
 *
 * Conserva la validación en español, el campo trampa anti-spam y el
 * comportamiento de envío del sitio aprobado: si no hay un servicio
 * configurado en `FORM_ENDPOINT`, se abre el correo del visitante con el
 * mensaje ya redactado hacia ventas@hidrosal.com.
 *
 * Novedad de esta entrega: si se llega desde la ficha de un producto
 * (`/?producto=SKU#contacto`), el mensaje arranca con esa referencia, de modo
 * que la consulta llega con contexto (FR-011).
 */

/** Servicio que recibe el formulario (Formspree, Getform, un backend propio…). */
const FORM_ENDPOINT = "";
const CORREO_CONTACTO = "ventas@hidrosal.com";

type Campo = "nombre" | "correo" | "telefono" | "mensaje";

/** Nunca cambia mientras la página vive: la referencia llega en la dirección. */
const sinCambios = (): (() => void) => () => {};

/** En el servidor no hay dirección que leer. */
const sinReferencia = (): string | null => null;

const referenciaDelNavegador = (): string | null => {
  const pedido = new URLSearchParams(window.location.search).get("producto");
  return pedido === null || pedido === "" ? null : pedido;
};

const REGLAS: Record<Campo, (valor: string) => string> = {
  nombre: (valor) => {
    if (valor === "") return "Escribe tu nombre.";
    if (valor.length < 3) return "El nombre es demasiado corto.";
    return "";
  },
  correo: (valor) => {
    if (valor === "") return "Escribe tu correo electrónico.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return "El correo no parece válido.";
    return "";
  },
  telefono: (valor) => {
    if (valor === "") return "Escribe tu teléfono.";
    if (valor.replace(/\D/g, "").length < 8)
      return "El teléfono debe tener al menos 8 dígitos.";
    return "";
  },
  mensaje: (valor) => {
    if (valor === "") return "Cuéntanos qué necesitas.";
    if (valor.length < 10) return "El mensaje es demasiado corto.";
    return "";
  },
};

const CAMPOS: Campo[] = ["nombre", "correo", "telefono", "mensaje"];

type Estado = { texto: string; clase: "" | "is-ok" | "is-error" };

export default function FormularioContacto() {
  const idEstado = useId();

  /**
   * Referencia del producto consultado, leída de la dirección del navegador y
   * no con `useSearchParams`: así la sección entera se renderiza en el
   * servidor y el ancla `#contacto` sigue existiendo en el HTML, que es lo que
   * FR-022 exige conservar. El servidor no ve ninguna referencia, el navegador
   * sí, y React resuelve la diferencia al hidratar sin avisos ni parpadeos.
   */
  const referencia = useSyncExternalStore(sinCambios, referenciaDelNavegador, sinReferencia);

  const [valores, setValores] = useState<Record<Campo | "compania" | "sitio", string>>({
    nombre: "",
    correo: "",
    telefono: "",
    compania: "",
    mensaje: "",
    sitio: "",
  });

  /**
   * `null` significa que el visitante todavía no ha tocado el mensaje, así que
   * se muestra el arranque con la referencia del producto. En cuanto escribe,
   * manda lo suyo.
   */
  const [mensajeEditado, setMensajeEditado] = useState<string | null>(null);

  const mensaje =
    mensajeEditado ??
    (referencia === null ? "" : `Hola, me interesa el producto con referencia ${referencia}. `);
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
  const [estado, setEstado] = useState<Estado>({ texto: "", clase: "" });
  const [enviando, setEnviando] = useState(false);

  const leer = (campo: Campo): string => (campo === "mensaje" ? mensaje : valores[campo]);

  const cambiar = (campo: Campo | "compania" | "sitio", valor: string): void => {
    if (campo === "mensaje") {
      setMensajeEditado(valor);
    } else {
      setValores((previos) => ({ ...previos, [campo]: valor }));
    }
    if (campo !== "compania" && campo !== "sitio" && tocados[campo] === true) {
      setErrores((previos) => ({ ...previos, [campo]: REGLAS[campo](valor.trim()) }));
    }
  };

  const validar = (): Campo | null => {
    const nuevos: Partial<Record<Campo, string>> = {};
    let primerInvalido: Campo | null = null;

    for (const campo of CAMPOS) {
      const problema = REGLAS[campo](leer(campo).trim());
      nuevos[campo] = problema;
      if (problema !== "" && primerInvalido === null) {
        primerInvalido = campo;
      }
    }

    setErrores(nuevos);
    setTocados({ nombre: true, correo: true, telefono: true, mensaje: true });
    return primerInvalido;
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();

    // Campo trampa: si viene lleno, es un bot.
    if (valores.sitio.trim() !== "") {
      return;
    }

    const invalido = validar();
    if (invalido !== null) {
      setEstado({ texto: "Revisa los campos marcados para continuar.", clase: "is-error" });
      document.getElementById(invalido)?.focus();
      return;
    }

    const datos = {
      nombre: valores.nombre.trim(),
      correo: valores.correo.trim(),
      telefono: valores.telefono.trim(),
      compania: valores.compania.trim(),
      mensaje: mensaje.trim(),
      ...(referencia === null ? {} : { producto: referencia }),
    };

    if (FORM_ENDPOINT === "") {
      // Sin servicio configurado: se abre el cliente de correo del visitante.
      const cuerpo = [
        `Nombre: ${datos.nombre}`,
        `Correo: ${datos.correo}`,
        `Teléfono: ${datos.telefono}`,
        `Compañía: ${datos.compania === "" ? "No indicada" : datos.compania}`,
        ...(referencia === null ? [] : [`Producto consultado: ${referencia}`]),
        "",
        datos.mensaje,
      ].join("\n");

      window.location.href =
        `mailto:${CORREO_CONTACTO}` +
        `?subject=${encodeURIComponent(`Solicitud de asesoría — ${datos.nombre}`)}` +
        `&body=${encodeURIComponent(cuerpo)}`;

      setEstado({ texto: "Abrimos tu correo con el mensaje listo para enviar.", clase: "is-ok" });
      return;
    }

    setEnviando(true);
    setEstado({ texto: "Enviando…", clase: "" });

    try {
      const respuesta = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(datos),
      });
      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
      }
      setValores({
        nombre: "",
        correo: "",
        telefono: "",
        compania: "",
        mensaje: "",
        sitio: "",
      });
      setMensajeEditado("");
      setErrores({});
      setTocados({});
      setEstado({
        texto: "¡Gracias! Recibimos tu mensaje y te contactaremos muy pronto.",
        clase: "is-ok",
      });
    } catch {
      setEstado({
        texto: `No pudimos enviar el mensaje. Escríbenos a ${CORREO_CONTACTO}.`,
        clase: "is-error",
      });
    } finally {
      setEnviando(false);
    }
  };

  const clase = (campo: Campo): string =>
    `field${errores[campo] !== undefined && errores[campo] !== "" ? " is-invalid" : ""}`;

  const invalido = (campo: Campo): "true" | "false" =>
    errores[campo] !== undefined && errores[campo] !== "" ? "true" : "false";

  return (
    <form
      className="form reveal"
      id="contactForm"
      noValidate
      style={retraso(100)}
      onSubmit={(evento) => {
        void enviar(evento);
      }}
    >
      <div className={clase("nombre")}>
        <label htmlFor="nombre">
          Nombre <span aria-hidden="true">*</span>
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          required
          placeholder="Tu nombre completo"
          value={valores.nombre}
          aria-invalid={invalido("nombre")}
          onChange={(evento) => {
            cambiar("nombre", evento.target.value);
          }}
          onBlur={(evento) => {
            setTocados((previos) => ({ ...previos, nombre: true }));
            setErrores((previos) => ({
              ...previos,
              nombre: REGLAS.nombre(evento.target.value.trim()),
            }));
          }}
        />
        <p className="field__error" data-error-for="nombre">
          {errores.nombre ?? ""}
        </p>
      </div>

      <div className={clase("correo")}>
        <label htmlFor="correo">
          Correo electrónico <span aria-hidden="true">*</span>
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          required
          placeholder="nombre@empresa.com"
          value={valores.correo}
          aria-invalid={invalido("correo")}
          onChange={(evento) => {
            cambiar("correo", evento.target.value);
          }}
          onBlur={(evento) => {
            setTocados((previos) => ({ ...previos, correo: true }));
            setErrores((previos) => ({
              ...previos,
              correo: REGLAS.correo(evento.target.value.trim()),
            }));
          }}
        />
        <p className="field__error" data-error-for="correo">
          {errores.correo ?? ""}
        </p>
      </div>

      <div className={clase("telefono")}>
        <label htmlFor="telefono">
          Teléfono <span aria-hidden="true">*</span>
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+503 0000 0000"
          value={valores.telefono}
          aria-invalid={invalido("telefono")}
          onChange={(evento) => {
            cambiar("telefono", evento.target.value);
          }}
          onBlur={(evento) => {
            setTocados((previos) => ({ ...previos, telefono: true }));
            setErrores((previos) => ({
              ...previos,
              telefono: REGLAS.telefono(evento.target.value.trim()),
            }));
          }}
        />
        <p className="field__error" data-error-for="telefono">
          {errores.telefono ?? ""}
        </p>
      </div>

      <div className="field">
        <label htmlFor="compania">
          Compañía <em>(opcional)</em>
        </label>
        <input
          id="compania"
          name="compania"
          type="text"
          autoComplete="organization"
          placeholder="Nombre de tu empresa"
          value={valores.compania}
          onChange={(evento) => {
            cambiar("compania", evento.target.value);
          }}
        />
      </div>

      <div className={`${clase("mensaje")} field--full`}>
        <label htmlFor="mensaje">
          Mensaje <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          required
          placeholder="Cuéntanos qué necesitas: caudal, uso, ubicación del proyecto…"
          value={mensaje}
          aria-invalid={invalido("mensaje")}
          onChange={(evento) => {
            cambiar("mensaje", evento.target.value);
          }}
          onBlur={(evento) => {
            setTocados((previos) => ({ ...previos, mensaje: true }));
            setErrores((previos) => ({
              ...previos,
              mensaje: REGLAS.mensaje(evento.target.value.trim()),
            }));
          }}
        />
        <p className="field__error" data-error-for="mensaje">
          {errores.mensaje ?? ""}
        </p>
      </div>

      {/* Campo trampa anti-spam: las personas no lo ven. */}
      <div className="field field--hp" aria-hidden="true">
        <label htmlFor="sitio">No llenar</label>
        <input
          id="sitio"
          name="sitio"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={valores.sitio}
          onChange={(evento) => {
            cambiar("sitio", evento.target.value);
          }}
        />
      </div>

      <div className="form__foot field--full">
        <button className="btn btn--primary" type="submit" disabled={enviando}>
          Enviar mensaje
        </button>
        <p
          className={`form__status ${estado.clase}`.trim()}
          id={idEstado}
          role="status"
          aria-live="polite"
        >
          {estado.texto}
        </p>
      </div>
    </form>
  );
}
