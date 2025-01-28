-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "bookId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "addedAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookTitle" VARCHAR(255) NOT NULL,
    "page" INTEGER NOT NULL,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_idx" ON "Highlight"("bookId");

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
