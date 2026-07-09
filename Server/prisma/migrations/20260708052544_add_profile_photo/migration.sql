/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `profilePhoto` VARCHAR(191) NULL,
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `rollNo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `profilePhoto` VARCHAR(191) NULL,
    ADD COLUMN `specialization` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `parentGuardianName` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_userId_key` ON `Student`(`userId`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
