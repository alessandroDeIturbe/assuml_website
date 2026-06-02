-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING_RECEIPT', 'PENDING_APPROVAL', 'ACTIVE');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "purchaseStatus" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "receiptKey" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paymentInfo" TEXT;
