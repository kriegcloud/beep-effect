/*
  Warnings:

  - You are about to drop the column `key` on the `File` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "File_key_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "key";
