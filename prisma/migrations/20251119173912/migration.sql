-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_containerId_fkey";

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE CASCADE ON UPDATE CASCADE;
