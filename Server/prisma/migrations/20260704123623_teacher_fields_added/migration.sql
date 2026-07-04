/*
  Warnings:

  - Added the required column `password` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `specialization` VARCHAR(191) NULL;
