/*
  Warnings:

  - Added the required column `userId` to the `Highlight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Highlight" ADD COLUMN     "userId" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
