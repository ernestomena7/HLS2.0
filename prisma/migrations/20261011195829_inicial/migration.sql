-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categorias_slug_key`(`slug`),
    INDEX `categorias_orden_idx`(`orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(60) NOT NULL,
    `slug` VARCHAR(140) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,
    `nombre_normalizado` VARCHAR(140) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `especificaciones` JSON NOT NULL,
    `precio` DECIMAL(10, 2) NULL,
    `moneda` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `estado` ENUM('BORRADOR', 'PUBLICADO') NOT NULL DEFAULT 'BORRADOR',
    `disponible` BOOLEAN NOT NULL DEFAULT true,
    `categoria_id` INTEGER NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `productos_sku_key`(`sku`),
    UNIQUE INDEX `productos_slug_key`(`slug`),
    INDEX `productos_nombre_normalizado_idx`(`nombre_normalizado`),
    INDEX `productos_estado_categoria_id_idx`(`estado`, `categoria_id`),
    INDEX `productos_estado_creado_en_idx`(`estado`, `creado_en`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imagenes_producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producto_id` INTEGER NOT NULL,
    `ruta` VARCHAR(255) NOT NULL,
    `texto_alternativo` VARCHAR(255) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `es_principal` BOOLEAN NOT NULL DEFAULT false,

    INDEX `imagenes_producto_producto_id_orden_idx`(`producto_id`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_slug_producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(140) NOT NULL,
    `producto_id` INTEGER NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `historial_slug_producto_slug_key`(`slug`),
    INDEX `historial_slug_producto_producto_id_idx`(`producto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imagenes_producto` ADD CONSTRAINT `imagenes_producto_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_slug_producto` ADD CONSTRAINT `historial_slug_producto_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
