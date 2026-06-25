-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Embedding" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Embedding_itemId_key" ON "Embedding"("itemId");

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "Embedding" ADD COLUMN IF NOT EXISTS vector vector(768);
CREATE INDEX IF NOT EXISTS "Embedding_vector_idx" ON "Embedding" USING ivfflat (vector vector_cosine_ops);