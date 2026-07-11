-- Database schema setup for YouTube-v2
-- Repository: offline-youtube-browser-video-organizer

CREATE DATABASE IF NOT EXISTS `youtube-v2` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `youtube-v2`;

-- Table 1: video_metadatas
CREATE TABLE IF NOT EXISTS `video_metadatas` (
    `vid_id` int(11) NOT NULL AUTO_INCREMENT,
    `vid_name` text NOT NULL,
    `link` text NOT NULL,
    `uploader_id` int(11) NOT NULL,
    `uploader_name` text NOT NULL,
    `uploader_img` mediumtext NOT NULL,
    `likes` int(11) NOT NULL DEFAULT 0,
    `dislikes` int(11) NOT NULL DEFAULT 0,
    `duration` int(11) NOT NULL DEFAULT 0,
    `views` int(11) DEFAULT 0,
    `upload_date` date NOT NULL DEFAULT current_timestamp(),
    `upload_time` time NOT NULL DEFAULT current_timestamp(),
    `tags` longtext NOT NULL,
    `subtitles` longtext NOT NULL DEFAULT 'null',
    `description` longtext NOT NULL DEFAULT 'Published',
    `comments` int(11) NOT NULL DEFAULT 0,
    
    -- FFmpeg extension fields
    `filesize` bigint(20) DEFAULT NULL,
    `width` int(11) DEFAULT NULL,
    `height` int(11) DEFAULT NULL,
    `aspect_ratio` varchar(10) DEFAULT NULL,
    `bitrate` int(11) DEFAULT NULL,
    `framerate` float DEFAULT NULL,
    `codec` varchar(50) DEFAULT NULL,
    
    PRIMARY KEY (`vid_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: playlists
CREATE TABLE IF NOT EXISTS `playlists` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `playlist_name` varchar(50) NOT NULL UNIQUE,
    `video_ids` longtext NOT NULL,
    `video_count` int(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: users
CREATE TABLE IF NOT EXISTS `users` (
    `user_num` int(11) NOT NULL AUTO_INCREMENT,
    `user_name` varchar(40) NOT NULL UNIQUE,
    `privilege` varchar(10) NOT NULL DEFAULT 'USER',
    `Members` longtext DEFAULT NULL,
    `user_pass` varchar(40) DEFAULT NULL,
    `first_name` varchar(15) DEFAULT NULL,
    `last_name` varchar(15) DEFAULT NULL,
    `user_desc` varchar(2000) DEFAULT 'Hiii There its me !!! yeah you dont know me....',
    `user_pic` varchar(200) DEFAULT '/youtube-v2/Userdatabase/ProfilePic/default1.jpg',
    `comment_votes` longtext DEFAULT NULL,
    `reply_votes` longtext DEFAULT NULL,
    `karma` int(11) NOT NULL DEFAULT 0,
    `joined_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: comments
CREATE TABLE IF NOT EXISTS `comments` (
    `com_id` int(11) NOT NULL AUTO_INCREMENT,
    `com_page` varchar(255) NOT NULL,
    `user_num` int(11) NOT NULL,
    `com_date` date NOT NULL,
    `com_time` time NOT NULL,
    `comment` longtext NOT NULL,
    `total_replies` int(11) NOT NULL DEFAULT 0,
    `upvotes` int(11) NOT NULL DEFAULT 0,
    `downvotes` int(11) NOT NULL DEFAULT 0,
    `points` int(11) NOT NULL DEFAULT 0,
    `edited` varchar(20) NOT NULL DEFAULT 'false',
    `attachment_url` varchar(500) DEFAULT NULL,
    `attachment_type` varchar(20) DEFAULT NULL,
    PRIMARY KEY (`com_id`),
    KEY `idx_com_page` (`com_page`),
    KEY `idx_user_num` (`user_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: replies
CREATE TABLE IF NOT EXISTS `replies` (
    `reply_id` int(11) NOT NULL AUTO_INCREMENT,
    `com_id` int(11) NOT NULL,
    `user_num` int(11) NOT NULL,
    `page` varchar(100) NOT NULL,
    `reply_date` date NOT NULL,
    `reply_time` time NOT NULL,
    `replied_to` varchar(40) NOT NULL,
    `reply` longtext NOT NULL,
    `upvotes` int(11) NOT NULL DEFAULT 0,
    `downvotes` int(11) NOT NULL DEFAULT 0,
    `points` int(11) NOT NULL DEFAULT 0,
    `edited` varchar(20) NOT NULL DEFAULT 'false',
    `parent_reply_id` int(11) DEFAULT NULL,
    `attachment_url` varchar(500) DEFAULT NULL,
    `attachment_type` varchar(20) DEFAULT NULL,
    PRIMARY KEY (`reply_id`),
    KEY `idx_com_id` (`com_id`),
    KEY `idx_user_num` (`user_num`),
    KEY `idx_parent_reply_id` (`parent_reply_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 6: user_activity_votes
CREATE TABLE IF NOT EXISTS `user_activity_votes` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_num` int(11) NOT NULL,
    `target_type` enum('comment','reply') NOT NULL,
    `target_id` int(11) NOT NULL,
    `vote_type` enum('upvote','downvote') NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_user_vote` (`user_num`,`target_type`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 7: chats
CREATE TABLE IF NOT EXISTS `chats` (
    `chat_id` int(11) NOT NULL AUTO_INCREMENT,
    `type` tinytext NOT NULL,
    `chatted_to_id` int(11) NOT NULL,
    `chat_to_name` text NOT NULL,
    `chat_to_img` text NOT NULL,
    `chatted_by_id` int(11) NOT NULL,
    `chat_by_name` text NOT NULL,
    `chat_by_img` text NOT NULL,
    `chat_date` date NOT NULL,
    `chat_time` time NOT NULL,
    `chat_text` longtext NOT NULL,
    `chat_edited` text NOT NULL DEFAULT 'false',
    `chat_read` text NOT NULL DEFAULT 'false',
    PRIMARY KEY (`chat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
