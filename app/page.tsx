import Contacto from "@/components/marketing/Contacto";
import Efectos from "@/components/marketing/Efectos";
import Enfoque from "@/components/marketing/Enfoque";
import Hero from "@/components/marketing/Hero";
import Marcas from "@/components/marketing/Marcas";
import QueHacemos from "@/components/marketing/QueHacemos";
import QuienesSomos from "@/components/marketing/QuienesSomos";
import Servicios from "@/components/marketing/Servicios";

/**
 * Portada de Hidrosal.
 *
 * Las mismas seis secciones y las mismas anclas que el sitio aprobado
 * (FR-022, FR-023). Solo cambia la base técnica.
 *
 * Se renderiza en cada petición, y no en la compilación, porque la política de
 * seguridad de contenido firma los guiones de Next con un `nonce` distinto por
 * petición: un HTML horneado en la compilación llevaría un `nonce` caducado y
 * el navegador bloquearía todos los guiones, dejando la página sin hidratar.
 * El coste es nulo en la práctica: la portada no consulta la base de datos, es
 * marcado puro.
 */
export const dynamic = "force-dynamic";
export default function Portada() {
  return (
    <>
      <Hero />
      <QuienesSomos />
      <QueHacemos />
      <Servicios />
      <Enfoque />
      <Marcas />
      <Contacto />
      <Efectos />
    </>
  );
}
