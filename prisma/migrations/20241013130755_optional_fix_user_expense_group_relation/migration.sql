-- AlterTable
ALTER TABLE "UserExpense" ADD COLUMN     "groupId" TEXT;

-- AddForeignKey
ALTER TABLE "UserExpense" ADD CONSTRAINT "UserExpense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
