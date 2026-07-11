<?php
require 'api/db.php';
$pdo = Database::connect();
$stmt = $pdo->query('SELECT vid_id, link FROM video_metadatas LIMIT 5');
print_r($stmt->fetchAll());
