/*
  Warnings:

  - You are about to alter the column `title` on the `classroom_tasks` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `title` on the `classrooms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `title` on the `conversations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `title` on the `courses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `thumbnail_url` on the `courses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `title` on the `lessons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `content_url` on the `lessons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `file_url` on the `messages` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `title` on the `sections` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `file_url` on the `task_submissions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `grade` on the `task_submissions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Decimal`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `password_hash` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `full_name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `avatar_url` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - Made the column `classroom_id` on table `classroom_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `classroom_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `classroom_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `joined_at` on table `classroom_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classroom_id` on table `classroom_tasks` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creator_id` on table `classroom_tasks` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `classroom_tasks` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `classrooms` required. This step will fail if there are existing NULL values in that column.
  - Made the column `conversation_id` on table `conversation_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `conversation_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `joined_at` on table `conversation_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `conversations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_id` on table `course_invitations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `course_invitations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `invited_at` on table `course_invitations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_id` on table `course_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `course_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `enrolled_at` on table `course_members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `owner_id` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `visibility` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `section_id` on table `lessons` required. This step will fail if there are existing NULL values in that column.
  - Made the column `conversation_id` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sender_id` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `notes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lesson_id` on table `notes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `notes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `notes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_id` on table `sections` required. This step will fail if there are existing NULL values in that column.
  - Made the column `task_id` on table `task_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `student_id` on table `task_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `submitted_at` on table `task_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `user_progress` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lesson_id` on table `user_progress` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_watched_second` on table `user_progress` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_completed` on table `user_progress` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `user_progress` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `classroom_members` MODIFY `classroom_id` VARCHAR(36) NOT NULL,
    MODIFY `user_id` VARCHAR(36) NOT NULL,
    MODIFY `role` ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
    MODIFY `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `classroom_tasks` MODIFY `classroom_id` VARCHAR(36) NOT NULL,
    MODIFY `creator_id` VARCHAR(36) NOT NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `deadline` DATETIME(3) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `classrooms` ADD COLUMN `is_public` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `title` VARCHAR(191) NOT NULL,
    MODIFY `invite_code` VARCHAR(191) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `conversation_members` MODIFY `conversation_id` VARCHAR(36) NOT NULL,
    MODIFY `user_id` VARCHAR(36) NOT NULL,
    MODIFY `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `conversations` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `course_invitations` MODIFY `course_id` VARCHAR(36) NOT NULL,
    MODIFY `user_id` VARCHAR(36) NOT NULL,
    MODIFY `invited_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `course_members` MODIFY `course_id` VARCHAR(36) NOT NULL,
    MODIFY `user_id` VARCHAR(36) NOT NULL,
    MODIFY `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `courses` MODIFY `owner_id` VARCHAR(36) NOT NULL,
    MODIFY `title` VARCHAR(191) NOT NULL,
    MODIFY `thumbnail_url` VARCHAR(191) NULL,
    MODIFY `price` DECIMAL NOT NULL DEFAULT 0,
    MODIFY `visibility` ENUM('public', 'private', 'sale') NOT NULL DEFAULT 'public',
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `lessons` MODIFY `section_id` VARCHAR(36) NOT NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `content_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `messages` MODIFY `conversation_id` VARCHAR(36) NOT NULL,
    MODIFY `sender_id` VARCHAR(36) NOT NULL,
    MODIFY `file_url` VARCHAR(191) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `notes` MODIFY `user_id` VARCHAR(36) NOT NULL,
    MODIFY `lesson_id` VARCHAR(36) NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `sections` MODIFY `course_id` VARCHAR(36) NOT NULL,
    MODIFY `title` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `task_submissions` MODIFY `task_id` VARCHAR(36) NOT NULL,
    MODIFY `student_id` VARCHAR(36) NOT NULL,
    MODIFY `file_url` VARCHAR(191) NULL,
    MODIFY `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `grade` DECIMAL NULL;

-- AlterTable
ALTER TABLE `user_progress` MODIFY `user_id` VARCHAR(36) NOT NULL,
    MODIFY `lesson_id` VARCHAR(36) NOT NULL,
    MODIFY `last_watched_second` INTEGER NOT NULL DEFAULT 0,
    MODIFY `is_completed` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `password_hash` VARCHAR(191) NOT NULL,
    MODIFY `full_name` VARCHAR(191) NULL,
    MODIFY `avatar_url` VARCHAR(191) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `classroom_join_requests` (
    `id` VARCHAR(191) NOT NULL,
    `classroom_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `classroom_join_requests_classroom_id_user_id_key`(`classroom_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `classroom_members` ADD CONSTRAINT `classroom_members_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_members` ADD CONSTRAINT `classroom_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_join_requests` ADD CONSTRAINT `classroom_join_requests_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_join_requests` ADD CONSTRAINT `classroom_join_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_members` ADD CONSTRAINT `course_members_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_members` ADD CONSTRAINT `course_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_invitations` ADD CONSTRAINT `course_invitations_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_invitations` ADD CONSTRAINT `course_invitations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_progress` ADD CONSTRAINT `user_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_progress` ADD CONSTRAINT `user_progress_lesson_id_fkey` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_members` ADD CONSTRAINT `conversation_members_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_members` ADD CONSTRAINT `conversation_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_tasks` ADD CONSTRAINT `classroom_tasks_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_tasks` ADD CONSTRAINT `classroom_tasks_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_submissions` ADD CONSTRAINT `task_submissions_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `classroom_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_submissions` ADD CONSTRAINT `task_submissions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_linked_courses` ADD CONSTRAINT `classroom_linked_courses_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_linked_courses` ADD CONSTRAINT `classroom_linked_courses_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_lesson_id_fkey` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `classroom_members` RENAME INDEX `classroom_id` TO `classroom_members_classroom_id_user_id_key`;

-- RenameIndex
ALTER TABLE `classrooms` RENAME INDEX `invite_code` TO `classrooms_invite_code_key`;

-- RenameIndex
ALTER TABLE `course_members` RENAME INDEX `course_id` TO `course_members_course_id_user_id_key`;

-- RenameIndex
ALTER TABLE `notes` RENAME INDEX `idx_notes_user_classroom` TO `notes_user_id_classroom_id_idx`;

-- RenameIndex
ALTER TABLE `notes` RENAME INDEX `idx_notes_user_lesson` TO `notes_user_id_lesson_id_idx`;

-- RenameIndex
ALTER TABLE `user_progress` RENAME INDEX `user_id` TO `user_progress_user_id_lesson_id_key`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `email` TO `users_email_key`;
