<?php
require 'api/db.php';
$pdo = Database::connect();
$stmt = $pdo->query('SELECT COUNT(*) FROM video_metadatas WHERE vid_id < 2000');
echo "Count < 2000: " . $stmt->fetchColumn() . "\n";
$stmt = $pdo->query('SELECT COUNT(*) FROM video_metadatas');
echo "Total Count: " . $stmt->fetchColumn() . "\n";
$stmt = $pdo->query('SELECT MIN(vid_id), MAX(vid_id) FROM video_metadatas');
print_r($stmt->fetch());
