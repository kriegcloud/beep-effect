/*
  Warnings:

  - A unique constraint covering the columns `[userId,templateId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Document_templateId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Document_userId_templateId_key" ON "Document"("userId", "templateId");
