/*
  Makes usernames case-insensitive at the database level ("Foo" and "foo" are the same user).
  This fails if case-variant duplicates already exist; find them first with:
    SELECT lower(username), array_agg(username) FROM "User" GROUP BY 1 HAVING count(*) > 1;
*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DATA TYPE CITEXT;
