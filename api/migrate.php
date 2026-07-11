<?php
// c:\xampp\htdocs\youtube-v2\api\migrate.php

require_once 'db.php';

header('Content-Type: text/html; charset=utf-8');

function cleanLegacyString($str) {
    if (empty($str)) return $str;
    
    // Decode legacy escaping replacements
    $str = str_replace("!1and1!", "&", $str);
    $str = str_replace("&#39;", "'", $str);
    $str = str_replace("&quote&;", "”", $str);
    $str = str_replace("&quote;", "“", $str);
    $str = str_replace("&quot;", '"', $str);
    $str = str_replace("&#43;", "+", $str);
    $str = str_replace("&#63;", "?", $str);
    
    // Decode URL-encoded spaces and special characters (like %20 -> space)
    $str = rawurldecode($str);
    return $str;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Migration & Sanitization Manager</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f0f0f;
            color: #f1f1f1;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
        }
        .container {
            background-color: #1f1f1f;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            border: 1px solid #333;
        }
        h1 {
            color: #ff0000;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-top: 0;
        }
        .status-box {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-family: monospace;
            white-space: pre-wrap;
            background-color: #0c0c0c;
            border-left: 5px solid #ff0000;
        }
        .btn {
            background-color: #ff0000;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover {
            background-color: #cc0000;
        }
        .success {
            color: #4caf50;
        }
        .info {
            color: #2196f3;
        }
        .error {
            color: #f44336;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>Database Migration & Sanitization</h1>
    <p>This script initializes the new <strong>youtube-v2</strong> database, overhauls data sanitization by removing legacy string escapes (like <code>!1and1!</code> and URL-encoded spaces), and migrates clean records from the legacy database.</p>

    <?php
    if (isset($_POST['migrate']) || php_sapi_name() === 'cli') {
        echo '<div class="status-box">';
        try {
            // 1. Connect without selecting database
            echo "[INFO] Connecting to MySQL server...\n";
            $pdo = Database::connect(true);
            echo "[SUCCESS] Connected successfully.\n\n";

            // 2. Drop legacy test DB if necessary or verify youtube-v2
            echo "[INFO] Creating database `youtube-v2` if it does not exist...\n";
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `youtube-v2` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            echo "[SUCCESS] Database `youtube-v2` verified.\n\n";

            // 3. Select database
            $pdo->exec("USE `youtube-v2`");

            // 4. Create table
            echo "[INFO] Creating/Verifying table `video_metadatas` in `youtube-v2`...\n";
            $createTableSQL = "
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
                    
                    -- Extension fields
                    `filesize` bigint(20) DEFAULT NULL,
                    `width` int(11) DEFAULT NULL,
                    `height` int(11) DEFAULT NULL,
                    `aspect_ratio` varchar(10) DEFAULT NULL,
                    `bitrate` int(11) DEFAULT NULL,
                    `framerate` float DEFAULT NULL,
                    `codec` varchar(50) DEFAULT NULL,
                    
                    PRIMARY KEY (`vid_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            $pdo->exec($createTableSQL);
            echo "[SUCCESS] Table `video_metadatas` created/verified.\n\n";

            // Create playlists table
            $createPlaylistsTableSQL = "
                CREATE TABLE IF NOT EXISTS `playlists` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `playlist_name` varchar(50) NOT NULL UNIQUE,
                    `video_ids` longtext NOT NULL,
                    `video_count` int(11) NOT NULL DEFAULT 0,
                    PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            $pdo->exec($createPlaylistsTableSQL);
            echo "[SUCCESS] Table `playlists` created/verified.\n\n";

            // Seed a default playlist if none exists
            $checkPlaylistStmt = $pdo->query("SELECT COUNT(*) as count FROM `playlists` WHERE playlist_name = 'default'");
            if ($checkPlaylistStmt->fetch()['count'] == 0) {
                $pdo->exec("INSERT INTO `playlists` (playlist_name, video_ids, video_count) VALUES ('default', '[]', 0)");
                echo "[SUCCESS] Seeded default empty playlist in `playlists` table.\n";
            }

            // Create users table
            $createUsersTableSQL = "
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
            ";
            $pdo->exec($createUsersTableSQL);
            echo "[SUCCESS] Table `users` created/verified.\n\n";

            // Create comments table
            $createCommentsTableSQL = "
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
                    PRIMARY KEY (`com_id`),
                    KEY `idx_com_page` (`com_page`),
                    KEY `idx_user_num` (`user_num`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            $pdo->exec($createCommentsTableSQL);
            echo "[SUCCESS] Table `comments` created/verified.\n\n";

            // Create replies table
            $createRepliesTableSQL = "
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
                    PRIMARY KEY (`reply_id`),
                    KEY `idx_com_id` (`com_id`),
                    KEY `idx_user_num` (`user_num`),
                    KEY `idx_parent_reply_id` (`parent_reply_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            $pdo->exec($createRepliesTableSQL);
            echo "[SUCCESS] Table `replies` created/verified.\n\n";

            // Create user_activity_votes table
            $createVotesTableSQL = "
                CREATE TABLE IF NOT EXISTS `user_activity_votes` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `user_num` int(11) NOT NULL,
                    `target_type` enum('comment','reply') NOT NULL,
                    `target_id` int(11) NOT NULL,
                    `vote_type` enum('upvote','downvote') NOT NULL,
                    PRIMARY KEY (`id`),
                    UNIQUE KEY `uniq_user_vote` (`user_num`,`target_type`,`target_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            $pdo->exec($createVotesTableSQL);
            echo "[SUCCESS] Table `user_activity_votes` created/verified.\n\n";

            // Create chats table (for messaging migration compatibility)
            $createChatsTableSQL = "
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
            ";
            $pdo->exec($createChatsTableSQL);
            echo "[SUCCESS] Table `chats` created/verified.\n\n";

            // 5. Query legacy database
            echo "[INFO] Checking for legacy `youtube` database...\n";
            $stmt = $pdo->query("SHOW DATABASES LIKE 'youtube'");
            $legacyDbExists = $stmt->fetch();

            if ($legacyDbExists) {
                echo "[SUCCESS] Legacy database `youtube` found.\n";
                
                $stmt = $pdo->query("SHOW TABLES FROM `youtube` LIKE 'video_metadatas'");
                $legacyTableExists = $stmt->fetch();

                if ($legacyTableExists) {
                    echo "[SUCCESS] Legacy table `youtube.video_metadatas` found.\n";
                    
                    // Check if new table is empty
                    $stmt = $pdo->query("SELECT COUNT(*) as count FROM `youtube-v2`.`video_metadatas` WHERE vid_id != 10");
                    $newCount = $stmt->fetch()['count'];

                    if ($newCount == 0) {
                        // Migrate row 10 to playlists table
                        $row10Stmt = $pdo->query("SELECT * FROM `youtube`.`video_metadatas` WHERE vid_id = 10");
                        $row10 = $row10Stmt->fetch();
                        if ($row10) {
                            $serialized = $row10['vid_name'];
                            $unserialized = @unserialize($serialized);
                            if (is_array($unserialized)) {
                                $videoIdsJson = json_encode($unserialized);
                                $videoCount = (int)$row10['uploader_id'];
                                
                                $playlistStmt = $pdo->prepare("
                                    INSERT INTO `youtube-v2`.`playlists` (playlist_name, video_ids, video_count)
                                    VALUES ('default', :video_ids, :video_count)
                                    ON DUPLICATE KEY UPDATE video_ids = VALUES(video_ids), video_count = VALUES(video_count)
                                ");
                                $playlistStmt->execute([
                                    ':video_ids' => $videoIdsJson,
                                    ':video_count' => $videoCount
                                ]);
                                echo "[SUCCESS] Migrated legacy Row 10 playlist into new `playlists` table.\n";
                            }
                        }

                        echo "[INFO] Fetching records from `youtube.video_metadatas` for sanitization...\n";
                        
                        // Fetch all rows from legacy
                        $legacyStmt = $pdo->query("SELECT * FROM `youtube`.`video_metadatas` WHERE vid_id != 10");
                        $legacyRows = $legacyStmt->fetchAll();
                        
                        echo "[INFO] Sanitizing and importing " . count($legacyRows) . " records...\n";
                        
                        $insertStmt = $pdo->prepare("
                            INSERT INTO `youtube-v2`.`video_metadatas` 
                            (vid_id, vid_name, link, uploader_id, uploader_name, uploader_img, likes, dislikes, duration, views, upload_date, upload_time, tags, subtitles, description, comments)
                            VALUES 
                            (:vid_id, :vid_name, :link, :uploader_id, :uploader_name, :uploader_img, :likes, :dislikes, :duration, :views, :upload_date, :upload_time, :tags, :subtitles, :description, :comments)
                        ");

                        $pdo->beginTransaction();
                        $migrated = 0;
                        foreach ($legacyRows as $row) {
                            $insertStmt->execute([
                                ':vid_id' => $row['vid_id'],
                                ':vid_name' => cleanLegacyString($row['vid_name']),
                                ':link' => cleanLegacyString($row['link']),
                                ':uploader_id' => $row['uploader_id'],
                                ':uploader_name' => cleanLegacyString($row['uploader_name']),
                                ':uploader_img' => str_replace('/comment section/', '/youtube-v2/', cleanLegacyString($row['uploader_img'])),
                                ':likes' => $row['likes'],
                                ':dislikes' => $row['dislikes'],
                                ':duration' => $row['duration'],
                                ':views' => $row['views'],
                                ':upload_date' => $row['upload_date'],
                                ':upload_time' => $row['upload_time'],
                                ':tags' => cleanLegacyString($row['tags']),
                                ':subtitles' => $row['subtitles'], // Keep raw JSON subtitles config
                                ':description' => cleanLegacyString($row['description']),
                                ':comments' => $row['comments']
                            ]);
                            $migrated++;
                        }
                        $pdo->commit();
                        echo "<span class='success'>[SUCCESS] Successfully migrated and sanitized $migrated records!</span>\n\n";
                    } else {
                        echo "[INFO] The new table `youtube-v2.video_metadatas` already contains $newCount records. Skipping sanitization import.\n\n";
                    }
                }
            }

            // Migrate data from legacy `userdata` database if it exists
            echo "[INFO] Checking for legacy `userdata` database...\n";
            $stmt = $pdo->query("SHOW DATABASES LIKE 'userdata'");
            $userdataDbExists = $stmt->fetch();

            if ($userdataDbExists) {
                echo "[SUCCESS] Legacy database `userdata` found.\n";

                // Migrate users
                $usersCount = $pdo->query("SELECT COUNT(*) FROM `youtube-v2`.`users`")->fetchColumn();
                if ($usersCount == 0) {
                    echo "[INFO] Migrating users from `userdata.user_info`...\n";
                    $oldUsers = $pdo->query("SELECT * FROM `userdata`.`user_info`")->fetchAll();
                    $insertUser = $pdo->prepare("
                        INSERT INTO `youtube-v2`.`users` 
                        (user_num, user_name, privilege, Members, user_pass, first_name, last_name, user_desc, user_pic, comment_votes, reply_votes, karma)
                        VALUES 
                        (:user_num, :user_name, :privilege, :Members, :user_pass, :first_name, :last_name, :user_desc, :user_pic, :comment_votes, :reply_votes, 0)
                    ");
                    $pdo->beginTransaction();
                    foreach ($oldUsers as $u) {
                        $insertUser->execute([
                            ':user_num' => $u['user_num'],
                            ':user_name' => $u['user_name'],
                            ':privilege' => $u['privilege'],
                            ':Members' => $u['Members'],
                            ':user_pass' => $u['user_pass'],
                            ':first_name' => $u['first_name'],
                            ':last_name' => $u['last_name'],
                            ':user_desc' => $u['user_desc'],
                            ':user_pic' => str_replace('/comment section/', '/youtube-v2/', $u['user_pic']),
                            ':comment_votes' => $u['comment_votes'],
                            ':reply_votes' => $u['reply_votes']
                        ]);
                    }
                    $pdo->commit();
                    echo "[SUCCESS] Migrated " . count($oldUsers) . " users.\n\n";
                } else {
                    echo "[INFO] Users table already has data. Skipping migration.\n\n";
                }

                // Migrate comments
                $commentsCount = $pdo->query("SELECT COUNT(*) FROM `youtube-v2`.`comments`")->fetchColumn();
                if ($commentsCount == 0) {
                    echo "[INFO] Migrating comments from `userdata.comment_store`...\n";
                    $oldComments = $pdo->query("SELECT * FROM `userdata`.`comment_store`")->fetchAll();
                    $insertComment = $pdo->prepare("
                        INSERT INTO `youtube-v2`.`comments`
                        (com_id, com_page, user_num, com_date, com_time, comment, total_replies, upvotes, downvotes, points, edited)
                        VALUES
                        (:com_id, :com_page, :user_num, :com_date, :com_time, :comment, :total_replies, :upvotes, :downvotes, :points, :edited)
                    ");
                    $pdo->beginTransaction();
                    foreach ($oldComments as $c) {
                        $cleanComment = str_replace('/comment section/', '/youtube-v2/', $c['comment']);
                        $insertComment->execute([
                            ':com_id' => $c['com_id'],
                            ':com_page' => $c['com_page'],
                            ':user_num' => $c['user_num'],
                            ':com_date' => $c['com_date'],
                            ':com_time' => $c['com_time'],
                            ':comment' => $cleanComment,
                            ':total_replies' => $c['total_replies'],
                            ':upvotes' => $c['upvotes'],
                            ':downvotes' => $c['downvotes'],
                            ':points' => $c['points'],
                            ':edited' => $c['edited']
                        ]);
                    }
                    $pdo->commit();
                    echo "[SUCCESS] Migrated " . count($oldComments) . " comments.\n\n";
                } else {
                    echo "[INFO] Comments table already has data. Skipping migration.\n\n";
                }

                // Migrate replies
                $repliesCount = $pdo->query("SELECT COUNT(*) FROM `youtube-v2`.`replies`")->fetchColumn();
                if ($repliesCount == 0) {
                    echo "[INFO] Migrating replies from `userdata.reply_store`...\n";
                    $oldReplies = $pdo->query("SELECT * FROM `userdata`.`reply_store`")->fetchAll();
                    $insertReply = $pdo->prepare("
                        INSERT INTO `youtube-v2`.`replies`
                        (reply_id, com_id, user_num, page, reply_date, reply_time, replied_to, reply, upvotes, downvotes, points, edited, parent_reply_id)
                        VALUES
                        (:reply_id, :com_id, :user_num, :page, :reply_date, :reply_time, :replied_to, :reply, :upvotes, :downvotes, :points, :edited, NULL)
                    ");
                    $pdo->beginTransaction();
                    foreach ($oldReplies as $r) {
                        $cleanReply = str_replace('/comment section/', '/youtube-v2/', $r['reply']);
                        $insertReply->execute([
                            ':reply_id' => $r['reply_id'],
                            ':com_id' => $r['com_id'],
                            ':user_num' => $r['user_num'],
                            ':page' => $r['page'],
                            ':reply_date' => $r['reply_date'],
                            ':reply_time' => $r['reply_time'],
                            ':replied_to' => $r['replied_to'],
                            ':reply' => $cleanReply,
                            ':upvotes' => $r['upvotes'],
                            ':downvotes' => $r['downvotes'],
                            ':points' => $r['points'],
                            ':edited' => $r['edited']
                        ]);
                    }
                    $pdo->commit();
                    echo "[SUCCESS] Migrated " . count($oldReplies) . " replies.\n\n";
                } else {
                    echo "[INFO] Replies table already has data. Skipping migration.\n\n";
                }

                // Migrate chats
                $chatsCount = $pdo->query("SELECT COUNT(*) FROM `youtube-v2`.`chats`")->fetchColumn();
                if ($chatsCount == 0) {
                    echo "[INFO] Migrating chats from `userdata.chat_store`...\n";
                    $oldChats = $pdo->query("SELECT * FROM `userdata`.`chat_store`")->fetchAll();
                    $insertChat = $pdo->prepare("
                        INSERT INTO `youtube-v2`.`chats`
                        (chat_id, type, chatted_to_id, chat_to_name, chat_to_img, chatted_by_id, chat_by_name, chat_by_img, chat_date, chat_time, chat_text, chat_edited, chat_read)
                        VALUES
                        (:chat_id, :type, :chatted_to_id, :chat_to_name, :chat_to_img, :chatted_by_id, :chat_by_name, :chat_by_img, :chat_date, :chat_time, :chat_text, :chat_edited, :chat_read)
                    ");
                    $pdo->beginTransaction();
                    foreach ($oldChats as $ch) {
                        $insertChat->execute([
                            ':chat_id' => $ch['chat_id'],
                            ':type' => $ch['type'],
                            ':chatted_to_id' => $ch['chatted_to_id'],
                            ':chat_to_name' => $ch['chat_to_name'],
                            ':chat_to_img' => str_replace('/comment section/', '/youtube-v2/', $ch['chat_to_img']),
                            ':chatted_by_id' => $ch['chatted_by_id'],
                            ':chat_by_name' => $ch['chat_by_name'],
                            ':chat_by_img' => str_replace('/comment section/', '/youtube-v2/', $ch['chat_by_img']),
                            ':chat_date' => $ch['chat_date'],
                            ':chat_time' => $ch['chat_time'],
                            ':chat_text' => str_replace('/comment section/', '/youtube-v2/', $ch['chat_text']),
                            ':chat_edited' => $ch['chat_edited'],
                            ':chat_read' => $ch['chat_read']
                        ]);
                    }
                    $pdo->commit();
                    echo "[SUCCESS] Migrated " . count($oldChats) . " chats.\n\n";
                } else {
                    echo "[INFO] Chats table already has data. Skipping migration.\n\n";
                }
            }

            // 6. Ensure row 10 exists
            echo "[INFO] Checking row 10 (playlist compatibility)...\n";
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM `youtube-v2`.`video_metadatas` WHERE vid_id = 10");
            $stmt->execute();
            $row10Exists = $stmt->fetch()['count'] > 0;

            if (!$row10Exists) {
                echo "[INFO] Seeding compatibility row 10...\n";
                $emptyPlaylist = serialize([]);
                $insertRow10 = "
                    INSERT INTO `youtube-v2`.`video_metadatas` 
                    (vid_id, vid_name, link, uploader_id, uploader_name, uploader_img, likes, dislikes, duration, views, tags, subtitles, description, comments) 
                    VALUES 
                    (10, :vid_name, '', 0, 'system', '/youtube-v2/Userdatabase/profilepic/defaulta.jpg', 0, 0, 0, 0, '', 'null', 'Playlist Seed Row', 0)
                ";
                $stmt = $pdo->prepare($insertRow10);
                $stmt->execute([':vid_name' => $emptyPlaylist]);
                echo "[SUCCESS] Row 10 seeded.\n\n";
            }

            echo "<span class='success'><b>[MIGRATION & SANITIZATION COMPLETE]</b> All databases have been updated to modern standards!</span>";

        } catch (Exception $e) {
            if ($pdo && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            echo "<span class='error'><b>[ERROR]</b> Setup failed: " . $e->getMessage() . "</span>";
        }
        echo '</div>';
        echo '<a href="../index.html" class="btn" style="background-color: #333; margin-right: 10px;">Go to App</a>';
        echo '<form method="POST" style="display:inline"><button type="submit" name="migrate" value="1" class="btn">Force Re-Run</button></form>';
    } else {
        // Show run button
        echo '
        <form method="POST">
            <button type="submit" name="migrate" value="1" class="btn">Start Sanitized Migration</button>
        </form>
        ';
    }
    ?>
</div>
</body>
</html>
