/*
  Warnings:

  - The `vector` column on the `Embedding` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Embedding_vector_idx";

-- AlterTable
ALTER TABLE "Embedding" DROP COLUMN "vector",
ADD COLUMN     "vector" DOUBLE PRECISION[];
