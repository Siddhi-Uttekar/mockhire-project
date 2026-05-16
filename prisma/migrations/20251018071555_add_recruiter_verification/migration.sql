/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING_EMAIL', 'PENDING_MANUAL_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING_EMAIL';

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "public"."User"("emailVerificationToken");
