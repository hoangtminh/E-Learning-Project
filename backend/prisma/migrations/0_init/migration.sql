-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NULL,
    `avatar_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classrooms` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `invite_code` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `invite_code`(`invite_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classroom_members` (
    `id` VARCHAR(36) NOT NULL,
    `classroom_id` VARCHAR(36) NULL,
    `user_id` VARCHAR(36) NULL,
    `role` ENUM('owner', 'admin', 'member') NULL DEFAULT 'member',
    `joined_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `classroom_id`(`classroom_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(36) NOT NULL,
    `owner_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `thumbnail_url` VARCHAR(255) NULL,
    `price` DECIMAL(15, 2) NULL DEFAULT 0,
    `visibility` ENUM('public', 'private', 'sale') NULL DEFAULT 'public',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_members` (
    `id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NULL,
    `user_id` VARCHAR(36) NULL,
    `enrolled_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `course_id`(`course_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_invitations` (
    `id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NULL,
    `user_id` VARCHAR(36) NULL,
    `invited_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NULL,
    `order_index` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lessons` (
    `id` VARCHAR(36) NOT NULL,
    `section_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NULL,
    `type` ENUM('video_embed', 'file_docx', 'file_pdf', 'image_png', 'image_jpg', 'text_content') NULL,
    `content_url` VARCHAR(255) NULL,
    `raw_text` TEXT NULL,
    `order_index` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_progress` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `lesson_id` VARCHAR(36) NULL,
    `last_watched_second` INTEGER NULL DEFAULT 0,
    `is_completed` BOOLEAN NULL DEFAULT false,
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_id`(`user_id`, `lesson_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` VARCHAR(36) NOT NULL,
    `classroom_id` VARCHAR(36) NULL,
    `type` ENUM('classroom_common', 'private_direct', 'custom_group') NULL,
    `title` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation_members` (
    `id` VARCHAR(36) NOT NULL,
    `conversation_id` VARCHAR(36) NULL,
    `user_id` VARCHAR(36) NULL,
    `joined_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(36) NOT NULL,
    `conversation_id` VARCHAR(36) NULL,
    `sender_id` VARCHAR(36) NULL,
    `content` TEXT NULL,
    `file_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classroom_tasks` (
    `id` VARCHAR(36) NOT NULL,
    `classroom_id` VARCHAR(36) NULL,
    `creator_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `deadline` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_submissions` (
    `id` VARCHAR(36) NOT NULL,
    `task_id` VARCHAR(36) NULL,
    `student_id` VARCHAR(36) NULL,
    `content` TEXT NULL,
    `file_url` VARCHAR(255) NULL,
    `submitted_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `grade` DECIMAL(5, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classroom_linked_courses` (
    `classroom_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`classroom_id`, `course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notes` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `lesson_id` VARCHAR(36) NULL,
    `classroom_id` VARCHAR(36) NULL,
    `content` TEXT NOT NULL,
    `video_timestamp` INTEGER NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_notes_user_classroom`(`user_id`, `classroom_id`),
    INDEX `idx_notes_user_lesson`(`user_id`, `lesson_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
