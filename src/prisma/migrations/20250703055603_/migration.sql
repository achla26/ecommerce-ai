/*
  Warnings:

  - The values [AUTH] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[user_id,type]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('VERIFY', 'RESET', 'REFRESH', 'ACCESS', 'TEMP_ACCESS');
ALTER TABLE "tokens" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_user_id_type_key" ON "tokens"("user_id", "type");
