/*
  Warnings:

  - You are about to drop the column `address` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherName` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `teacher` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `teacher` table. All the data in the column will be lost.
  - You are about to drop the `referral` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[rollNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rollNo` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `referral` DROP FOREIGN KEY `Referral_franchiseId_fkey`;

-- AlterTable
ALTER TABLE `attendance` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `address`,
    DROP COLUMN `dateOfBirth`,
    DROP COLUMN `fatherName`,
    DROP COLUMN `gender`,
    DROP COLUMN `password`,
    DROP COLUMN `phone`,
    ADD COLUMN `rollNo` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `phone`,
    DROP COLUMN `specialization`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `otpExpiry` DATETIME(3) NULL;

-- DropTable
DROP TABLE `referral`;

-- CreateTable
CREATE TABLE `Exam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `examType` ENUM('WEEKLY', 'MONTHLY', 'LEVEL', 'FINAL') NOT NULL,
    `examDate` DATETIME(3) NOT NULL,
    `totalMarks` INTEGER NOT NULL,
    `passingMarks` INTEGER NOT NULL,
    `duration` INTEGER NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `teacherId` INTEGER NOT NULL,
    `batchId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `examId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `obtainedMarks` INTEGER NOT NULL,
    `isPassed` BOOLEAN NOT NULL DEFAULT false,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ExamResult_examId_studentId_key`(`examId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Student_rollNo_key` ON `Student`(`rollNo`);

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamResult` ADD CONSTRAINT `ExamResult_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamResult` ADD CONSTRAINT `ExamResult_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
