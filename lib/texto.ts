/**
 * Normalización de texto y generación de identificadores legibles.
 *
 * La normalización ocurre en la aplicación y no en la intercalación de la base
 * (decisión D-3): MySQL 8 trae `utf8mb4_0900_ai_ci`, insensible a acentos, pero
 * MariaDB —muy común en Hostinger— no la tiene. Normalizar aquí da el mismo
 * resultado en cualquier motor y es verificable con pruebas unitarias.
 */

/**
 * Pasa un texto a minúsculas y le quita los diacríticos, de modo que «Ósmosis»,
 * «OSMOSIS» y «osmosis» produzcan exactamente el mismo valor.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Genera el identificador legible de una dirección a partir de un nombre:
 * normalizado, separado por guiones, sin guiones repetidos ni al principio o al
 * final, y sin ningún carácter fuera de `a-z`, `0-9` y `-`.
 */
export function generarSlug(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
