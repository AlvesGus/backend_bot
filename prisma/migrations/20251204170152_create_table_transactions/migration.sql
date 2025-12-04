/*
  Warnings:

  - Changed the type of `category` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "category" AS ENUM ('Entrada', 'Saida', 'Investimento');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "category",
ADD COLUMN     "category" "category" NOT NULL;
