/*
  Warnings:

  - You are about to drop the column `isPublished` on the `exam` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[examCode]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `curriculumTrack` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examCode` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `exam` DROP COLUMN `isPublished`,
    ADD COLUMN `curriculumTrack` VARCHAR(191) NOT NULL,
    ADD COLUMN `examCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `startTime` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'SCHEDULED', 'COMPLETED', 'RESULT_PENDING', 'PUBLISHED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `examresult` ADD COLUMN `grade` VARCHAR(191) NULL,
    ADD COLUMN `isAbsent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `percentage` DOUBLE NULL,
    ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Exam_examCode_key` ON `Exam`(`examCode`);

-- CreateIndex
CREATE INDEX `Exam_examDate_idx` ON `Exam`(`examDate`);

-- CreateIndex
CREATE INDEX `Exam_status_idx` ON `Exam`(`status`);

-- CreateIndex
CREATE INDEX `ExamResult_examId_idx` ON `ExamResult`(`examId`);

-- RenameIndex
ALTER TABLE `exam` RENAME INDEX `Exam_batchId_fkey` TO `Exam_batchId_idx`;

-- RenameIndex
ALTER TABLE `exam` RENAME INDEX `Exam_teacherId_fkey` TO `Exam_teacherId_idx`;

-- RenameIndex
ALTER TABLE `examresult` RENAME INDEX `ExamResult_studentId_fkey` TO `ExamResult_studentId_idx`;
