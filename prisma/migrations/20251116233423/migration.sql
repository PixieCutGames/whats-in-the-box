/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Container` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Container" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "imageUrl",
ADD COLUMN     "imageId" TEXT;
