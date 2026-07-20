-- DropIndex
DROP INDEX `projects_createdAt_idx` ON `projects`;

-- AlterTable
ALTER TABLE `team_members` ADD COLUMN `discipline` ENUM('MUHENDISLIK', 'MIMARLIK', 'DIGER') NOT NULL DEFAULT 'DIGER';

-- CreateIndex
CREATE INDEX `projects_createdAt_idx` ON `projects`(`createdAt` DESC);
