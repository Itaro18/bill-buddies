/*
  Warnings:

  - Made the column `groupId` on table `UserExpense` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserExpense" DROP CONSTRAINT "UserExpense_groupId_fkey";

-- AlterTable
ALTER TABLE "UserExpense" ALTER COLUMN "groupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "UserExpense" ADD CONSTRAINT "UserExpense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
