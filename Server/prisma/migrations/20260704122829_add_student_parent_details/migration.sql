/*
  Warnings:

  - You are about to drop the column `rollNo` on the `student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Student_rollNo_key` ON `student`;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `rollNo`,
    ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;
