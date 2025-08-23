-- CreateEnum
CREATE TYPE "media_type" AS ENUM ('image', 'video', 'gif');

-- CreateTable
CREATE TABLE "slider_slides" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "subtitle" VARCHAR(500),
    "description" TEXT,
    "media_type" "media_type" NOT NULL DEFAULT 'image',
    "media_url" VARCHAR(500) NOT NULL,
    "mobile_media_url" VARCHAR(500),
    "button_text" VARCHAR(100),
    "button_url" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slider_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_slider_order" ON "slider_slides"("order");

-- CreateIndex
CREATE INDEX "idx_slider_active" ON "slider_slides"("is_active");
