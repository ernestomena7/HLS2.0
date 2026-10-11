"use client";

import Image from "next/image";
import { useState } from "react";

import { IMAGEN_DE_RESERVA } from "@/lib/catalogo/imagenes";

import estilos from "@/app/productos/productos.module.css";

type Imagen = { id?: number; ruta: string; textoAlternativo: string };

type Props = {
  nombre: string;
  imagenes: Imagen[];
};

const ANCHO = 900;
const ALTO = 675;

/**
 * Galería de la ficha.
 *
 * Las miniaturas son botones de verdad, así que se recorren con el tabulador y
 * se activan con Entrar o Espacio. Si el producto todavía no tiene fotografías
 * se muestra la imagen de reserva con su texto alternativo, nunca un hueco.
 */
export default function GaleriaProducto({ nombre, imagenes }: Props) {
  const galeria: Imagen[] = imagenes.length > 0 ? imagenes : [IMAGEN_DE_RESERVA];
  const [indice, setIndice] = useState(0);
  const principal = galeria[Math.min(indice, galeria.length - 1)] ?? galeria[0];

  if (principal === undefined) {
    return null;
  }

  return (
    <div className={estilos.galeria}>
      <div className={estilos.galeriaPrincipal}>
        <Image
          src={principal.ruta}
          alt={principal.textoAlternativo}
          width={ANCHO}
          height={ALTO}
          sizes="(max-width: 900px) 100vw, 50vw"
          priority
        />
      </div>

      {galeria.length > 1 && (
        <ul className={estilos.galeriaMiniaturas} aria-label={`Fotografías de ${nombre}`}>
          {galeria.map((imagen, posicion) => (
            <li key={imagen.id ?? imagen.ruta + posicion}>
              <button
                type="button"
                className={`${estilos.miniatura} ${posicion === indice ? estilos.miniaturaActiva : ""}`}
                aria-pressed={posicion === indice}
                aria-label={`Ver fotografía ${posicion + 1} de ${galeria.length}`}
                onClick={() => {
                  setIndice(posicion);
                }}
              >
                <Image
                  src={imagen.ruta}
                  alt=""
                  width={120}
                  height={90}
                  sizes="120px"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
