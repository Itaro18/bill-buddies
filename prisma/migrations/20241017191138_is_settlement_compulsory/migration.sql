/*
  Warnings:

  - Made the column `isSettlement` on table `Expense` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "isSettlement" SET NOT NULL;
