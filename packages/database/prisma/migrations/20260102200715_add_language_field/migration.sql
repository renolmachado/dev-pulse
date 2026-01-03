/*
  Warnings:

  - The `category` column on the `Article` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('LIFESTYLE_WELLNESS', 'TECHNOLOGY_INNOVATION', 'SOFTWARE_ENGINEERING_DEVELOPMENT', 'BUSINESS_FINANCE', 'ARTS_ENTERTAINMENT', 'NEWS_SOCIETY', 'SCIENCE_NATURE', 'POLITICS_GOVERNMENT', 'SPORTS_RECREATION', 'EDUCATION_CAREER', 'HEALTH_MEDICINE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ES', 'PT');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN',
DROP COLUMN "category",
ADD COLUMN     "category" "Category";

-- DropEnum
DROP TYPE "Categories";

-- CreateIndex
CREATE INDEX "Article_category_id_idx" ON "Article"("category" DESC, "id" DESC);
