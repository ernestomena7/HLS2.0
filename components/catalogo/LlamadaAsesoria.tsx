import Link from "next/link";

import estilos from "@/app/productos/productos.module.css";

type Props = {
  nombre: string;
  sku: string;
  disponible: boolean;
  /** `true` cuando el producto no tiene precio público. */
  aConsultar: boolean;
};

/**
 * Llamada a la acción de la ficha (FR-011).
 *
 * Lleva al formulario de contacto de la portada arrastrando la referencia del
 * producto consultado, de modo que la consulta llegue con contexto y no como
 * un «quiero información» suelto. El texto cambia según el producto esté
 * agotado o sin precio publicado, porque la pregunta del visitante es distinta
 * en cada caso.
 */
export default function LlamadaAsesoria({ nombre, sku, disponible, aConsultar }: Props) {
  // La consulta va antes del fragmento: `/?producto=SKU#contacto`. Al revés,
  // el navegador la trataría como parte del ancla y el formulario no la vería.
  const destino = `/?producto=${encodeURIComponent(sku)}#contacto`;

  const texto = !disponible
    ? "Consultar disponibilidad"
    : aConsultar
      ? "Solicitar cotización"
      : "Solicitar asesoría";

  return (
    <div className={estilos.asesoria}>
      <Link className="btn btn--primary" href={destino}>
        {texto}
      </Link>
      <p className={estilos.asesoriaNota}>
        Te respondemos con la propuesta para <strong>{nombre}</strong> (referencia {sku}).
      </p>
    </div>
  );
}
