-- CreateTable
CREATE TABLE "MenuConfig" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "logoImg" TEXT NOT NULL DEFAULT '',
    "diablitoImg" TEXT NOT NULL DEFAULT '',
    "gloriasImg" TEXT NOT NULL DEFAULT '',
    "botanasImg" TEXT NOT NULL DEFAULT '',
    "precioClasico" INTEGER NOT NULL DEFAULT 25,
    "precioGlorias" INTEGER NOT NULL DEFAULT 27,
    "precioDiablito" INTEGER NOT NULL DEFAULT 27,
    "precioBotana" INTEGER NOT NULL DEFAULT 12,
    "precioExtra" INTEGER NOT NULL DEFAULT 2,
    "diablitoDesc" TEXT NOT NULL DEFAULT 'Clásico de Tamarindo, Nanche o Durazno, cargado con chamoy, salsa botanera y Tajín. ¡Pica pero sabe rico!',
    "gloriasDesc" TEXT NOT NULL DEFAULT 'Sabor de fresa con plátano, leche, lechera y ese toque especial. ¡El favorito de la casa!',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sabor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🍧',
    "color" TEXT NOT NULL DEFAULT '#e74c3c',
    "bg" TEXT NOT NULL DEFAULT 'linear-gradient(135deg,#ffeaea,#fff8e1)',
    "desc" TEXT NOT NULL DEFAULT '',
    "img" TEXT NOT NULL DEFAULT '',
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Sabor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraClasico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExtraClasico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraDiablito" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExtraDiablito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraGloria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExtraGloria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseDiablito" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BaseDiablito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Botana" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Botana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageUpload" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/png',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageUpload_key_key" ON "ImageUpload"("key");
