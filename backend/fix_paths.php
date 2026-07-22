<?php
// c:\laragon\www\youtube\api\fix_paths.php
// One-time script to normalize stored paths in the database.
// 1. Fix /youtube-v2/ → /youtube/
// 2. Strip leading /youtube/ from stored paths (so they work with any deployment folder or virtual host)
// Run this once from the browser, then delete this file.

require_once 'db.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Fix Database Paths</title>
    <style>
        body { font-family: monospace; background: #0f0f0f; color: #f1f1f1; padding: 30px; }
        .box { background: #1f1f1f; padding: 20px; border-radius: 8px; max-width: 800px; margin: 0 auto; }
        h1 { color: #ff0000; }
        .ok { color: #4caf50; }
        .info { color: #2196f3; }
        .err { color: #f44336; }
        pre { background: #0c0c0c; padding: 12px; border-radius: 6px; overflow-x: auto; }
    </style>
</head>
<body>
<div class="box">
<h1>Fix Stored Paths in Database</h1>
<pre>
<?php
try {
    $pdo = Database::connect();
    echo "<span class='info'>[INFO] Connected to database.\n\n</span>";

    $totalUpdated = 0;

    // ── Step 1: Fix /youtube-v2/ → /youtube/ ──
    echo "<span class='info'>=== Step 1: /youtube-v2/ → /youtube/ ===\n</span>";

    $pathTables = [
        'users'           => ['user_pic'],
        'video_metadatas' => ['uploader_img'],
        'chats'           => ['chat_to_img', 'chat_by_img', 'chat_text'],
        'comments'        => ['attachment_url'],
        'replies'         => ['attachment_url'],
    ];

    foreach ($pathTables as $table => $columns) {
        foreach ($columns as $col) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` WHERE `$col` LIKE :pattern");
            $stmt->execute([':pattern' => '%/youtube-v2/%']);
            $count = $stmt->fetchColumn();

            if ($count > 0) {
                $stmt = $pdo->prepare("UPDATE `$table` SET `$col` = REPLACE(`$col`, '/youtube-v2/', '/youtube/') WHERE `$col` LIKE :pattern");
                $stmt->execute([':pattern' => '%/youtube-v2/%']);
                echo "<span class='ok'>[FIXED] `$table`.`$col`: $count rows updated.\n</span>";
                $totalUpdated += $count;
            } else {
                echo "<span class='info'>[OK] `$table`.`$col`: no rows to fix.\n</span>";
            }
        }
    }

    // Also fix paths embedded in comment/reply text
    $textTables = [
        'comments' => ['comment'],
        'replies'  => ['reply'],
    ];

    foreach ($textTables as $table => $columns) {
        foreach ($columns as $col) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` WHERE `$col` LIKE :pattern");
            $stmt->execute([':pattern' => '%/youtube-v2/%']);
            $count = $stmt->fetchColumn();

            if ($count > 0) {
                $stmt = $pdo->prepare("UPDATE `$table` SET `$col` = REPLACE(`$col`, '/youtube-v2/', '/youtube/') WHERE `$col` LIKE :pattern");
                $stmt->execute([':pattern' => '%/youtube-v2/%']);
                echo "<span class='ok'>[FIXED] `$table`.`$col`: $count rows updated.\n</span>";
                $totalUpdated += $count;
            } else {
                echo "<span class='info'>[OK] `$table`.`$col`: no rows to fix.\n</span>";
            }
        }
    }

    // ── Step 2: Strip leading /youtube/ so paths work with any folder name or virtual host ──
    echo "\n<span class='info'>=== Step 2: Strip leading /youtube/ from stored paths ===\n</span>";

    $stripTables = [
        'users'           => ['user_pic'],
        'video_metadatas' => ['uploader_img'],
        'chats'           => ['chat_to_img', 'chat_by_img'],
        'comments'        => ['attachment_url'],
        'replies'         => ['attachment_url'],
    ];

    foreach ($stripTables as $table => $columns) {
        foreach ($columns as $col) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` WHERE `$col` LIKE :prefix");
            $stmt->execute([':prefix' => '/youtube/%']);
            $count = $stmt->fetchColumn();

            if ($count > 0) {
                $stmt = $pdo->prepare("UPDATE `$table` SET `$col` = SUBSTRING(`$col`, 10) WHERE `$col` LIKE :prefix");
                $stmt->execute([':prefix' => '/youtube/%']);
                echo "<span class='ok'>[STRIPPED] `$table`.`$col`: $count rows updated.\n</span>";
                $totalUpdated += $count;
            } else {
                echo "<span class='info'>[OK] `$table`.`$col`: no rows to fix.\n</span>";
            }
        }
    }

    echo "\n<span class='ok'>[DONE] Total rows affected: $totalUpdated</span>\n";

} catch (Exception $e) {
    echo "<span class='err'>[ERROR] " . $e->getMessage() . "</span>\n";
}
?>
</pre>
<p><a href="../index.html" style="color:#ff0000;">Go to App</a> &nbsp;|&nbsp; <strong style="color:#f44336;">Delete this file after running!</strong></p>
</div>
</body>
</html>
