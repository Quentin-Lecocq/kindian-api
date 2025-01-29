/*
  Warnings:

  - Added the required column `bookAuthor` to the `Highlight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Highlight" ADD COLUMN     "bookAuthor" VARCHAR(255) NOT NULL;
