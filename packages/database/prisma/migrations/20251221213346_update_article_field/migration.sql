/*
  Warnings:

  - You are about to drop the column `category` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "category",
DROP COLUMN "source",
ADD COLUMN     "author" TEXT,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "urlToImage" TEXT,
ALTER COLUMN "title" DROP NOT NULL;
