/*
  Warnings:

  - You are about to drop the column `createdAt` on the `teacher` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `teacher` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `teacher` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `teacher` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Made the column `qualification` on table `teacher` required. This step will fail if there are existing NULL values in that column.
  - Made the column `experience` on table `teacher` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Teacher_email_key` ON `teacher`;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `phone`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL,
    MODIFY `qualification` VARCHAR(191) NOT NULL,
    MODIFY `experience` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `updatedAt`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Franchise` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Franchise_email_key`(`email`),
    UNIQUE INDEX `Franchise_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Teacher_userId_key` ON `Teacher`(`userId`);

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
