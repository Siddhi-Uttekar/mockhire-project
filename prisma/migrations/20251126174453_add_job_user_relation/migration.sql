/*
  Warnings:

  - You are about to drop the column `company` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `posted` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `responsibilities` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "company",
DROP COLUMN "industry",
DROP COLUMN "level",
DROP COLUMN "logo",
DROP COLUMN "posted",
DROP COLUMN "requirements",
DROP COLUMN "responsibilities",
DROP COLUMN "salary",
DROP COLUMN "type",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
