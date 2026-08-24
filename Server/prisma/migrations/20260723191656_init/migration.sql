/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `fee` table. All the data in the column will be lost.
  - You are about to drop the column `pendingAmount` on the `fee` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `fee` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `fee` table. All the data in the column will be lost.
  - You are about to drop the column `txId` on the `fee` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `feepayment` table. All the data in the column will be lost.
  - You are about to drop the column `txId` on the `feepayment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[receiptNumber]` on the table `FeePayment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchId` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueAmount` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `franchiseId` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalFee` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMode` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptNumber` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedBy` to the `FeePayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `fee` DROP COLUMN `paymentDate`,
    DROP COLUMN `pendingAmount`,
    DROP COLUMN `remarks`,
    DROP COLUMN `totalAmount`,
    DROP COLUMN `txId`,
    ADD COLUMN `batchId` INTEGER NOT NULL,
    ADD COLUMN `dueAmount` DOUBLE NOT NULL,
    ADD COLUMN `franchiseId` INTEGER NOT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `totalFee` DOUBLE NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `feepayment` DROP COLUMN `createdBy`,
    DROP COLUMN `txId`,
    ADD COLUMN `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `paymentMode` VARCHAR(191) NOT NULL,
    ADD COLUMN `receiptNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `receivedBy` INTEGER NOT NULL,
    ADD COLUMN `referenceNumber` VARCHAR(191) NULL,
    ADD COLUMN `remarks` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `FeePayment_receiptNumber_key` ON `FeePayment`(`receiptNumber`);

-- AddForeignKey
ALTER TABLE `Fee` ADD CONSTRAINT `Fee_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fee` ADD CONSTRAINT `Fee_franchiseId_fkey` FOREIGN KEY (`franchiseId`) REFERENCES `Franchise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fee` ADD CONSTRAINT `Fee_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
