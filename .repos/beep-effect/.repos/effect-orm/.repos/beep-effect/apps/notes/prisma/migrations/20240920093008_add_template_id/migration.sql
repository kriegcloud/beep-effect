/*
  Warnings:

  - A unique constraint covering the columns `[templateId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "templateId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_templateId_key" ON "Document"("templateId");
