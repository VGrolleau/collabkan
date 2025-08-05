-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_kanbanId_fkey";

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "Kanban"("id") ON DELETE CASCADE ON UPDATE CASCADE;
