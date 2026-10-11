import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { EstadoProducto, PrismaClient } from "@prisma/client";

import { generarSlug, normalizar } from "../lib/texto";

/**
 * Datos de ejemplo del catálogo (FR-020).
 *
 * Son representativos, NO reales: se sustituyen por el catálogo verdadero de
 * Hidrosal antes de publicar. El conjunto incluye deliberadamente los casos
 * límite que la especificación exige ejercitar: productos sin precio, agotados,
 * en borrador, uno sin imagen, una categoría sin productos publicados, nombres
 * con acentos y un identificador de dirección histórico.
 */

export type Especificacion = { nombre: string; valor: string };

export type ProductoSemilla = {
  sku: string;
  nombre: string;
  descripcion: string;
  especificaciones: Especificacion[];
  /** Ausente = «Precio a consultar» (FR-029). */
  precio?: string;
  estado?: EstadoProducto;
  /** `false` = agotado. */
  disponible?: boolean;
  /** Sin imágenes, para ejercitar la imagen de reserva. */
  sinImagen?: boolean;
  /** Fotografías adicionales, para ejercitar la galería. */
  imagenesExtra?: number;
  /** Direcciones antiguas que deben seguir funcionando (FR-013). */
  slugsHistoricos?: string[];
};

export type CategoriaSemilla = {
  slug: string;
  nombre: string;
  descripcion: string;
  orden: number;
  productos: ProductoSemilla[];
};

const RUTA_IMAGEN = "/img/productos/marcador.webp";

export const CATALOGO: CategoriaSemilla[] = [
  {
    slug: "purificacion-residencial-y-comercial",
    nombre: "Purificación residencial y comercial",
    descripcion:
      "Equipos para hogares, oficinas y locales comerciales que necesitan agua segura en el punto de consumo.",
    orden: 1,
    productos: [
      {
        sku: "HLS-PRC-001",
        nombre: "Purificador de agua para grifo",
        descripcion:
          "Purificador compacto que se instala directamente en el grifo de la cocina. Retiene sedimentos, cloro libre y malos sabores sin obra ni herramientas especiales.",
        especificaciones: [
          { nombre: "Etapas de filtración", valor: "2" },
          { nombre: "Caudal", valor: "1.9 litros por minuto" },
          { nombre: "Vida útil del cartucho", valor: "6 meses" },
        ],
        precio: "119.00",
      },
      {
        sku: "HLS-PRC-002",
        nombre: "Filtro purificador de tres etapas bajo lavaplatos",
        descripcion:
          "Sistema de tres etapas que se oculta bajo el lavaplatos y entrega agua filtrada por un grifo auxiliar. Pensado para familias de hasta seis personas.",
        especificaciones: [
          { nombre: "Etapas de filtración", valor: "3" },
          { nombre: "Caudal", valor: "3.8 litros por minuto" },
          { nombre: "Conexión", valor: "1/4 de pulgada" },
          { nombre: "Presión de trabajo", valor: "30 a 80 psi" },
        ],
        precio: "245.00",
        imagenesExtra: 2,
      },
      {
        sku: "HLS-PRC-003",
        nombre: "Dispensador purificador frío y caliente",
        descripcion:
          "Dispensador de piso con purificación integrada y salidas de agua fría y caliente. Reemplaza los garrafones en oficinas y salas de espera.",
        especificaciones: [
          { nombre: "Capacidad de agua fría", valor: "3 litros por hora" },
          { nombre: "Capacidad de agua caliente", valor: "5 litros por hora" },
          { nombre: "Consumo", valor: "420 W" },
        ],
        precio: "689.00",
      },
      {
        sku: "HLS-PRC-004",
        nombre: "Suavizador de agua residencial de 1 pie cúbico",
        descripcion:
          "Suavizador de resina catiónica con válvula automática. Elimina la dureza que daña tuberías, calentadores y electrodomésticos.",
        especificaciones: [
          { nombre: "Resina", valor: "1 pie cúbico" },
          { nombre: "Capacidad de intercambio", valor: "30,000 granos" },
          { nombre: "Regeneración", valor: "Automática por volumen" },
        ],
        precio: "749.00",
      },
      {
        sku: "HLS-PRC-005",
        nombre: "Purificador ultravioleta de 12 GPM",
        descripcion:
          "Desinfección ultravioleta sin químicos para toda la casa. Inactiva bacterias y virus sin alterar el sabor del agua.",
        especificaciones: [
          { nombre: "Caudal", valor: "12 galones por minuto" },
          { nombre: "Dosis", valor: "30 mJ/cm²" },
          { nombre: "Vida de la lámpara", valor: "9,000 horas" },
        ],
        precio: "535.00",
      },
      {
        sku: "HLS-PRC-006",
        nombre: "Estación purificadora para oficina",
        descripcion:
          "Solución llave en mano para oficinas de 20 a 80 personas: purificación, enfriamiento y mantenimiento programado. Se cotiza según el consumo y la instalación.",
        especificaciones: [
          { nombre: "Personas atendidas", valor: "20 a 80" },
          { nombre: "Instalación", valor: "Incluida" },
          { nombre: "Mantenimiento", valor: "Programa trimestral" },
        ],
      },
    ],
  },
  {
    slug: "filtracion-industrial",
    nombre: "Filtración industrial",
    descripcion:
      "Filtración de alto caudal para procesos productivos, calderas, torres de enfriamiento y líneas de embotellado.",
    orden: 2,
    productos: [
      {
        sku: "HLS-FIN-001",
        nombre: "Filtro multimedia industrial de 36 pulgadas",
        descripcion:
          "Filtro multimedia en tanque de fibra de vidrio para remoción de sólidos suspendidos en líneas de proceso. Se dimensiona según el caudal y la calidad del agua cruda.",
        especificaciones: [
          { nombre: "Diámetro del tanque", valor: "36 pulgadas" },
          { nombre: "Caudal de servicio", valor: "40 a 60 galones por minuto" },
          { nombre: "Lecho filtrante", valor: "Antracita, arena y grava" },
        ],
      },
      {
        sku: "HLS-FIN-002",
        nombre: "Filtro de carbón activado granular industrial",
        descripcion:
          "Remoción de cloro, cloraminas, olores y compuestos orgánicos antes de membranas o de procesos sensibles al oxidante.",
        especificaciones: [
          { nombre: "Diámetro del tanque", valor: "30 pulgadas" },
          { nombre: "Carbón", valor: "Cáscara de coco, 12x40 mesh" },
          { nombre: "Retrolavado", valor: "Automático" },
        ],
        precio: "3450.00",
      },
      {
        sku: "HLS-FIN-003",
        nombre: "Sistema de filtración en línea de alto caudal",
        descripcion:
          "Carcasas en paralelo para caudales elevados con cambio rápido de cartuchos y mínima caída de presión.",
        especificaciones: [
          { nombre: "Caudal", valor: "120 galones por minuto" },
          { nombre: "Cartuchos", valor: "6 de 40 pulgadas" },
          { nombre: "Material", valor: "Polipropileno reforzado" },
        ],
        precio: "2275.00",
        disponible: false,
      },
      {
        sku: "HLS-FIN-004",
        nombre: "Microfiltración de cartuchos en acero inoxidable",
        descripcion:
          "Carcasa sanitaria en acero inoxidable 304 para microfiltración final en planta de alimentos y bebidas.",
        especificaciones: [
          { nombre: "Material", valor: "Acero inoxidable 304" },
          { nombre: "Grado de filtración", valor: "1 micra absoluta" },
          { nombre: "Conexiones", valor: "Clamp sanitario de 2 pulgadas" },
        ],
        precio: "1980.00",
        sinImagen: true,
      },
    ],
  },
  {
    slug: "tratamiento-de-agua-potable",
    nombre: "Tratamiento de agua potable",
    descripcion:
      "Potabilización y desinfección para pozos, sistemas comunales, lotificaciones y proyectos municipales.",
    orden: 3,
    productos: [
      {
        sku: "HLS-TAP-001",
        nombre: "Clorador automático por bomba dosificadora",
        descripcion:
          "Dosificación proporcional al caudal con control de nivel y alarma por falta de solución. Para pozos y sistemas comunales.",
        especificaciones: [
          { nombre: "Caudal de dosificación", valor: "0 a 7 litros por hora" },
          { nombre: "Contrapresión máxima", valor: "100 psi" },
          { nombre: "Tanque de solución", valor: "120 litros" },
        ],
        precio: "870.00",
      },
      {
        sku: "HLS-TAP-002",
        nombre: "Equipo de desinfección ultravioleta de 30 GPM",
        descripcion:
          "Desinfección en línea para sistemas de distribución pequeños, con sensor de intensidad y aviso de cambio de lámpara.",
        especificaciones: [
          { nombre: "Caudal", valor: "30 galones por minuto" },
          { nombre: "Dosis", valor: "40 mJ/cm²" },
          { nombre: "Cámara", valor: "Acero inoxidable 316L" },
        ],
        precio: "1420.00",
        imagenesExtra: 1,
      },
      {
        sku: "HLS-TAP-003",
        nombre: "Planta compacta potabilizadora",
        descripcion:
          "Planta modular de coagulación, floculación, sedimentación, filtración y desinfección. Se diseña por proyecto según la fuente de agua.",
        especificaciones: [
          { nombre: "Capacidad", valor: "Desde 5 hasta 50 m³ por hora" },
          { nombre: "Montaje", valor: "Sobre patín (skid)" },
          { nombre: "Control", valor: "Tablero con PLC" },
        ],
      },
    ],
  },
  {
    slug: "osmosis-inversa",
    nombre: "Ósmosis inversa",
    descripcion:
      "La especialidad de Hidrosal: equipos de ósmosis inversa desde el punto de uso doméstico hasta plantas industriales.",
    orden: 4,
    productos: [
      {
        sku: "HLS-OSI-001",
        nombre: "Ósmosis inversa residencial 75 GPD",
        descripcion:
          "Equipo de cinco etapas para uso doméstico. Reduce hasta el 98 % de los sólidos disueltos y entrega agua de mesa en el punto de consumo.",
        especificaciones: [
          { nombre: "Producción", valor: "75 galones por día" },
          { nombre: "Etapas", valor: "5" },
          { nombre: "Tanque de almacenamiento", valor: "3.2 galones" },
          { nombre: "Rechazo de sólidos disueltos", valor: "Hasta 98 %" },
        ],
        precio: "389.00",
        imagenesExtra: 2,
        slugsHistoricos: ["osmosis-inversa-domestica-75-gpd"],
      },
      {
        sku: "HLS-OSI-002",
        nombre: "Ósmosis inversa bajo lavaplatos 100 GPD",
        descripcion:
          "Versión de mayor producción para familias numerosas, con bomba de refuerzo y grifo de acero inoxidable incluido.",
        especificaciones: [
          { nombre: "Producción", valor: "100 galones por día" },
          { nombre: "Etapas", valor: "5" },
          { nombre: "Bomba", valor: "De refuerzo incluida" },
        ],
        precio: "459.00",
      },
      {
        sku: "HLS-OSI-003",
        nombre: "Ósmosis inversa comercial 400 GPD",
        descripcion:
          "Equipo de montaje en marco para restaurantes, cafeterías y laboratorios pequeños. Incluye prefiltración y manómetros de control.",
        especificaciones: [
          { nombre: "Producción", valor: "400 galones por día" },
          { nombre: "Membranas", valor: "2 de 2012" },
          { nombre: "Alimentación", valor: "110 V" },
        ],
        precio: "1899.00",
      },
      {
        sku: "HLS-OSI-004",
        nombre: "Ósmosis inversa comercial 800 GPD",
        descripcion:
          "Mayor capacidad para purificadoras de agua y producción de hielo, con tablero de control y protección por baja presión.",
        especificaciones: [
          { nombre: "Producción", valor: "800 galones por día" },
          { nombre: "Membranas", valor: "4 de 2012" },
          { nombre: "Alimentación", valor: "220 V" },
        ],
        precio: "2890.00",
      },
      {
        sku: "HLS-OSI-005",
        nombre: "Planta de ósmosis inversa industrial 4000 GPD",
        descripcion:
          "Planta industrial sobre patín con prefiltración completa, bomba de alta presión, lavado químico y registro de parámetros. Se diseña a la medida del proceso.",
        especificaciones: [
          { nombre: "Producción", valor: "4,000 galones por día" },
          { nombre: "Membranas", valor: "4 de 4040" },
          { nombre: "Montaje", valor: "Sobre patín (skid)" },
          { nombre: "Instrumentación", valor: "Conductividad, presión y caudal en línea" },
        ],
        imagenesExtra: 2,
      },
      {
        sku: "HLS-OSI-006",
        nombre: "Ósmosis inversa con remineralización",
        descripcion:
          "Añade una etapa de remineralización que devuelve calcio y magnesio al agua producida y corrige el pH.",
        especificaciones: [
          { nombre: "Producción", valor: "75 galones por día" },
          { nombre: "Etapas", valor: "6" },
          { nombre: "pH del agua producida", valor: "7.2 a 7.8" },
        ],
        precio: "629.00",
      },
      {
        sku: "HLS-OSI-007",
        nombre: "Ósmosis inversa de cinco etapas con bomba",
        descripcion:
          "Configuración reforzada para zonas con baja presión de red, con bomba y transformador incluidos.",
        especificaciones: [
          { nombre: "Producción", valor: "100 galones por día" },
          { nombre: "Presión mínima de red", valor: "15 psi" },
          { nombre: "Etapas", valor: "5" },
        ],
        precio: "549.00",
      },
      {
        sku: "HLS-OSI-008",
        nombre: "Ósmosis inversa portátil para laboratorio",
        descripcion:
          "Equipo rodante para laboratorios y clínicas que necesitan agua de baja conductividad en distintos puntos del edificio.",
        especificaciones: [
          { nombre: "Producción", valor: "200 galones por día" },
          { nombre: "Conductividad del producto", valor: "Menor a 20 µS/cm" },
          { nombre: "Movilidad", valor: "Carro con ruedas y freno" },
        ],
        precio: "1299.00",
        disponible: false,
      },
    ],
  },
  {
    slug: "desalinizacion",
    nombre: "Desalinización",
    descripcion:
      "Tratamiento de agua salobre y de mar para proyectos costeros y embarcaciones. Línea en preparación.",
    orden: 5,
    productos: [
      {
        sku: "HLS-DES-001",
        nombre: "Desalinizadora costera de 10 m³ por día",
        descripcion:
          "Planta de ósmosis inversa de agua de mar con recuperación de energía, para hoteles y residenciales en la costa.",
        especificaciones: [
          { nombre: "Producción", valor: "10 m³ por día" },
          { nombre: "Recuperación de energía", valor: "Intercambiador de presión" },
        ],
        estado: EstadoProducto.BORRADOR,
      },
      {
        sku: "HLS-DES-002",
        nombre: "Desalinizadora modular para embarcaciones",
        descripcion:
          "Unidad compacta para embarcaciones de trabajo y recreo, con arranque automático y limpieza por agua dulce.",
        especificaciones: [
          { nombre: "Producción", valor: "1.5 m³ por día" },
          { nombre: "Alimentación", valor: "24 V en corriente continua" },
        ],
        precio: "24500.00",
        estado: EstadoProducto.BORRADOR,
      },
    ],
  },
  {
    slug: "repuestos-y-consumibles",
    nombre: "Repuestos y consumibles",
    descripcion:
      "Membranas, cartuchos, lámparas y bombas de reemplazo para mantener cada equipo rindiendo como el primer día.",
    orden: 6,
    productos: [
      {
        sku: "HLS-REP-001",
        nombre: "Membrana de ósmosis inversa 400 GPD",
        descripcion:
          "Membrana de poliamida de película delgada para equipos comerciales de 400 galones por día.",
        especificaciones: [
          { nombre: "Producción", valor: "400 galones por día" },
          { nombre: "Formato", valor: "2012" },
          { nombre: "Vida útil estimada", valor: "24 meses" },
        ],
        precio: "189.00",
      },
      {
        sku: "HLS-REP-002",
        nombre: "Cartucho de sedimentos de 5 micras",
        descripcion:
          "Cartucho de polipropileno hilado que retiene arena, óxido y partículas antes de las etapas siguientes.",
        especificaciones: [
          { nombre: "Grado de filtración", valor: "5 micras" },
          { nombre: "Longitud", valor: "10 pulgadas" },
          { nombre: "Reemplazo sugerido", valor: "Cada 6 meses" },
        ],
        precio: "7.50",
      },
      {
        sku: "HLS-REP-003",
        nombre: "Cartucho de carbón bloque CTO de 10 pulgadas",
        descripcion:
          "Carbón bloque de cáscara de coco para remover cloro, olores y sabores antes de la membrana.",
        especificaciones: [
          { nombre: "Grado de filtración", valor: "5 micras" },
          { nombre: "Longitud", valor: "10 pulgadas" },
          { nombre: "Reemplazo sugerido", valor: "Cada 6 meses" },
        ],
        precio: "11.90",
      },
      {
        sku: "HLS-REP-004",
        nombre: "Filtro posterior en línea de coco",
        descripcion:
          "Pulido final que corrige el sabor del agua a la salida del tanque de almacenamiento.",
        especificaciones: [
          { nombre: "Conexión", valor: "Rápida de 1/4 de pulgada" },
          { nombre: "Reemplazo sugerido", valor: "Cada 12 meses" },
        ],
        precio: "14.50",
      },
      {
        sku: "HLS-REP-005",
        nombre: "Lámpara ultravioleta de repuesto para 12 GPM",
        descripcion:
          "Lámpara de reemplazo para el purificador ultravioleta de 12 galones por minuto.",
        especificaciones: [
          { nombre: "Vida útil", valor: "9,000 horas" },
          { nombre: "Potencia", valor: "39 W" },
        ],
        precio: "96.00",
      },
      {
        sku: "HLS-REP-006",
        nombre: "Bomba booster para equipos de 100 GPD",
        descripcion:
          "Bomba de refuerzo con transformador e interruptor de alta presión para zonas de red débil.",
        especificaciones: [
          { nombre: "Presión de salida", valor: "80 psi" },
          { nombre: "Alimentación", valor: "24 V en corriente continua" },
        ],
        precio: "78.00",
      },
      {
        sku: "HLS-REP-007",
        nombre: "Kit de reemplazo anual para ósmosis de 5 etapas",
        descripcion:
          "Juego completo de cartuchos para el mantenimiento anual de un equipo doméstico de cinco etapas.",
        especificaciones: [
          { nombre: "Contenido", valor: "Sedimentos, carbón granular, carbón bloque y filtro posterior" },
          { nombre: "Compatibilidad", valor: "Equipos de 5 etapas de 75 y 100 GPD" },
        ],
        precio: "52.00",
      },
    ],
  },
];

/** Fecha base de creación; cada producto se separa un día para que el orden del catálogo sea estable. */
const FECHA_BASE = new Date("2026-09-01T12:00:00.000Z");

function textoAlternativo(nombre: string, indice: number, total: number): string {
  if (total === 1) {
    return `${nombre}, fotografía del producto`;
  }
  return `${nombre}, fotografía ${indice + 1} de ${total}`;
}

async function sembrar(db: PrismaClient): Promise<void> {
  // Se parte de cero en cada ejecución: los datos de ejemplo son reemplazables
  // por definición. El orden respeta las claves foráneas.
  await db.historialSlugProducto.deleteMany();
  await db.imagenProducto.deleteMany();
  await db.producto.deleteMany();
  await db.categoria.deleteMany();

  let desplazamiento = 0;

  for (const categoriaSemilla of CATALOGO) {
    const categoria = await db.categoria.create({
      data: {
        slug: categoriaSemilla.slug,
        nombre: categoriaSemilla.nombre,
        descripcion: categoriaSemilla.descripcion,
        orden: categoriaSemilla.orden,
      },
    });

    for (const semilla of categoriaSemilla.productos) {
      const creadoEn = new Date(FECHA_BASE.getTime() + desplazamiento * 86_400_000);
      desplazamiento += 1;

      const totalImagenes = semilla.sinImagen === true ? 0 : 1 + (semilla.imagenesExtra ?? 0);

      await db.producto.create({
        data: {
          sku: semilla.sku,
          slug: generarSlug(semilla.nombre),
          nombre: semilla.nombre,
          nombreNormalizado: normalizar(semilla.nombre),
          descripcion: semilla.descripcion,
          especificaciones: semilla.especificaciones,
          precio: semilla.precio ?? null,
          moneda: "USD",
          estado: semilla.estado ?? EstadoProducto.PUBLICADO,
          disponible: semilla.disponible ?? true,
          categoriaId: categoria.id,
          creadoEn,
          actualizadoEn: creadoEn,
          imagenes: {
            create: Array.from({ length: totalImagenes }, (_, indice) => ({
              ruta: RUTA_IMAGEN,
              textoAlternativo: textoAlternativo(semilla.nombre, indice, totalImagenes),
              orden: indice,
              esPrincipal: indice === 0,
            })),
          },
          slugsHistoricos: {
            create: (semilla.slugsHistoricos ?? []).map((slug) => ({ slug })),
          },
        },
      });
    }
  }
}

async function principal(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url === undefined || url === "") {
    throw new Error(
      "Falta DATABASE_URL. Copiá .env.example a .env y apuntá la variable a tu base local.",
    );
  }

  const db = new PrismaClient({ adapter: new PrismaMariaDb(url) });

  try {
    await sembrar(db);

    const categorias = await db.categoria.count();
    const publicados = await db.producto.count({ where: { estado: EstadoProducto.PUBLICADO } });
    const borradores = await db.producto.count({ where: { estado: EstadoProducto.BORRADOR } });
    const agotados = await db.producto.count({
      where: { estado: EstadoProducto.PUBLICADO, disponible: false },
    });
    const sinPrecio = await db.producto.count({
      where: { estado: EstadoProducto.PUBLICADO, precio: null },
    });

    console.warn(
      `Datos de ejemplo cargados: ${categorias} categorías, ${publicados} productos publicados ` +
        `(${agotados} agotados, ${sinPrecio} sin precio) y ${borradores} en borrador.`,
    );
  } finally {
    await db.$disconnect();
  }
}

// Solo siembra cuando se ejecuta como orden (`prisma db seed`); al importarse
// desde una prueba, el módulo se limita a exponer el juego de datos.
const rutaEjecutada = process.argv[1] ?? "";
if (/prisma[\\/]seed\.ts$/.test(rutaEjecutada)) {
  principal().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
