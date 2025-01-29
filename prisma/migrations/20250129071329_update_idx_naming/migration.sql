-- CreateIndex
CREATE INDEX "highlight_user_idx" ON "Highlight"("userId");

-- RenameIndex
ALTER INDEX "user_idx" RENAME TO "book_user_idx";

-- RenameIndex
ALTER INDEX "book_idx" RENAME TO "highlight_book_idx";
