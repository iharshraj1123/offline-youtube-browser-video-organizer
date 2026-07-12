<?php
// c:\laragon\www\youtube\api\migrate_dates.php

ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

require_once 'db.php';

try {
    $pdo = Database::connect();
    
    // Fetch all videos
    $stmt = $pdo->query("SELECT vid_id, link, vid_name FROM video_metadatas");
    $videos = $stmt->fetchAll();
    
    $updatedCount = 0;
    $missingCount = 0;
    $errors = [];
    
    $updateStmt = $pdo->prepare("UPDATE video_metadatas SET upload_date = :date, upload_time = :time WHERE vid_id = :id");
    
    foreach ($videos as $video) {
        $id = $video['vid_id'];
        $link = $video['link'];
        
        // Clean backslashes/slashes
        $filePath = str_replace('\\', '/', $link);
        
        // Check if file exists
        if (file_exists($filePath)) {
            $mtime = filemtime($filePath);
            if ($mtime !== false) {
                $uploadDate = date('Y-m-d', $mtime);
                $uploadTime = date('H:i:s', $mtime);
                
                $updateStmt->execute([
                    ':date' => $uploadDate,
                    ':time' => $uploadTime,
                    ':id' => $id
                ]);
                $updatedCount++;
            } else {
                $errors[] = "Failed to read time for: " . $video['vid_name'];
            }
        } else {
            $missingCount++;
        }
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Migration completed successfully.',
        'total_videos' => count($videos),
        'updated' => $updatedCount,
        'missing_files' => $missingCount,
        'errors' => $errors
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
