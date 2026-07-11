<?php
// c:\xampp\htdocs\youtube-v2\api\index.php

// Disable error display in JSON response, but log them
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db.php';
require_once 'utils/MetadataParser.php';

$action = $_GET['action'] ?? '';

try {
    $pdo = Database::connect();

    switch ($action) {
        case 'videos':
            handleGetVideos($pdo);
            break;
        case 'video':
            handleGetVideo($pdo);
            break;
        case 'random_video':
            handleGetRandomVideo($pdo);
            break;
        case 'crawl':
            handleCrawl($pdo);
            break;
        case 'update_metadata':
            handleUpdateMetadata($pdo);
            break;
        case 'update_duration':
            handleUpdateDuration($pdo);
            break;
        case 'delete_video':
            handleDeleteVideo($pdo);
            break;
        case 'add_view':
            handleAddView($pdo);
            break;
        case 'toggle_like':
            handleToggleLike($pdo);
            break;
        case 'categories':
            handleGetCategories();
            break;
        case 'save_thumbnail':
            handleSaveThumbnail($pdo);
            break;
        case 'generate_missing_thumbnails':
            handleGenerateMissingThumbnails($pdo);
            break;
        case 'search_suggestions':
            handleSearchSuggestions($pdo);
            break;
        case 'playlists':
            handleGetPlaylists($pdo);
            break;
        case 'create_playlist':
            handleCreatePlaylist($pdo);
            break;
        case 'delete_playlist':
            handleDeletePlaylistAction($pdo);
            break;
        case 'add_to_playlist':
            handleAddToPlaylist($pdo);
            break;
        case 'remove_from_playlist':
            handleRemoveFromPlaylist($pdo);
            break;
        case 'update_playlist_videos':
            handleUpdatePlaylistVideos($pdo);
            break;
        case 'login':
            handleLogin($pdo);
            break;
        case 'logout':
            handleLogout();
            break;
        case 'signup':
            handleSignup($pdo);
            break;
        case 'update_profile':
            handleUpdateProfile($pdo);
            break;
        case 'get_comments':
            handleGetComments($pdo);
            break;
        case 'add_comment':
            handleAddComment($pdo);
            break;
        case 'vote_comment':
            handleVoteComment($pdo);
            break;
        case 'delete_comment':
            handleDeleteComment($pdo);
            break;
        case 'edit_comment':
            handleEditComment($pdo);
            break;
        case 'get_server_ips':
            handleGetServerIps();
            break;
        case 'cast_discover':
            handleCastDiscover();
            break;
        case 'cast_control':
            handleCastControl();
            break;
        case 'get_user_card':
            handleGetUserCard($pdo);
            break;
        case 'get_emotes':
            handleGetEmotes();
            break;
        default:
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['error' => 'Action not found']);
            break;
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}

// ----------------------------------------
// Controller Functions
// ----------------------------------------

function handleSearchSuggestions($pdo) {
    $search = $_GET['q'] ?? '';
    if (trim($search) === '') {
        echo json_encode([]);
        exit;
    }
    
    $keywords = preg_split('/\s+/', trim($search));
    $keywordConditions = [];
    $params = [];
    $i = 0;
    foreach ($keywords as $keyword) {
        if (trim($keyword) !== '') {
            $paramKey1 = ':search_kw_name_' . $i;
            $paramKey2 = ':search_kw_tag_' . $i;
            $keywordConditions[] = "(vid_name LIKE $paramKey1 OR tags LIKE $paramKey2)";
            $params[$paramKey1] = '%' . $keyword . '%';
            $params[$paramKey2] = '%' . $keyword . '%';
            $i++;
        }
    }
    
    if (empty($keywordConditions)) {
        echo json_encode([]);
        exit;
    }
    
    $whereSQL = implode(' AND ', $keywordConditions);
    
    // Sort matching suggestions: prioritized prefix match of the whole query first, then general match
    $stmt = $pdo->prepare("
        SELECT vid_id, vid_name 
        FROM video_metadatas 
        WHERE ($whereSQL)
        ORDER BY 
          CASE WHEN vid_name LIKE :prefix THEN 0 ELSE 1 END,
          upload_date DESC 
        LIMIT 50
    ");
    
    $params[':prefix'] = $search . '%';
    
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($results);
    exit;
}

function handleGetVideos($pdo) {
    $search = $_GET['q'] ?? '';
    $category = $_GET['category'] ?? 'all';
    $sort = $_GET['sort'] ?? 'recent'; // 'recent', 'mix'

    // Exclude row 10 (playlist compatibility seed) and ID 330, etc. (blacklist in legacy)
    $whereClauses = ['vid_id != 10'];
    $params = [];

    // Search query filter: split into individual keywords for space-insensitive/order-insensitive matching
    if (!empty($search)) {
        $keywords = preg_split('/\s+/', trim($search));
        $keywordConditions = [];
        $i = 0;
        foreach ($keywords as $keyword) {
            if (trim($keyword) !== '') {
                $paramKey1 = ':search_kw_name_' . $i;
                $paramKey2 = ':search_kw_tag_' . $i;
                $paramKey3 = ':search_kw_desc_' . $i;
                $keywordConditions[] = "(vid_name LIKE $paramKey1 OR tags LIKE $paramKey2 OR description LIKE $paramKey3)";
                $params[$paramKey1] = '%' . $keyword . '%';
                $params[$paramKey2] = '%' . $keyword . '%';
                $params[$paramKey3] = '%' . $keyword . '%';
                $i++;
            }
        }
        if (!empty($keywordConditions)) {
            $whereClauses[] = '(' . implode(' AND ', $keywordConditions) . ')';
        }
    }

    // Category filter
    if ($category !== 'all') {
        if ($category === 'video songs') {
            $whereClauses[] = '(tags LIKE :cat_tag1 OR tags LIKE :cat_tag2 OR vid_name LIKE :cat_name1 OR vid_name LIKE :cat_name2)';
            $params[':cat_tag1'] = '%video songs%';
            $params[':cat_tag2'] = '%videosongs%';
            $params[':cat_name1'] = '%video songs%';
            $params[':cat_name2'] = '%videosongs%';
        } else if ($category === 'downloads') {
            $whereClauses[] = '(tags LIKE :cat_tag OR vid_name LIKE :cat_name)';
            $params[':cat_tag'] = '%downloads%';
            $params[':cat_name'] = '%downloads%';
        } else if ($category === 'favourite') {
            $whereClauses[] = '(tags LIKE :cat_tag OR vid_name LIKE :cat_name)';
            $params[':cat_tag'] = '%favourite%';
            $params[':cat_name'] = '%favourite%';
        } else {
            $whereClauses[] = '(tags LIKE :cat_tag OR vid_name LIKE :cat_name)';
            $params[':cat_tag'] = '%' . $category . '%';
            $params[':cat_name'] = '%' . $category . '%';
        }
    }

    $whereSQL = implode(' AND ', $whereClauses);

    $orderBy = "upload_date DESC, upload_time DESC, vid_id DESC";
    if ($sort === 'oldest') {
        $orderBy = "upload_date ASC, upload_time ASC, vid_id ASC";
    } else if ($sort === 'likes') {
        $orderBy = "CAST(likes AS UNSIGNED) DESC, upload_date DESC";
    } else if ($sort === 'hot') {
        $orderBy = "CAST(views AS UNSIGNED) DESC, upload_date DESC";
    } else if ($sort === 'mix') {
        $orderBy = "RAND()";
    }

    $sql = "SELECT * FROM video_metadatas WHERE $whereSQL ORDER BY $orderBy";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $videos = $stmt->fetchAll();

    echo json_encode($videos);
}

function handleGetVideo($pdo) {
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        throw new Exception('Video ID is required');
    }

    $stmt = $pdo->prepare("SELECT * FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $video = $stmt->fetch();

    if (!$video) {
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['error' => 'Video not found']);
        exit;
    }

    // Decode subtitles if it's JSON string
    $subtitles = json_decode($video['subtitles'], true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $video['subtitles'] = $subtitles;
    }

    echo json_encode($video);
}

function handleGetRandomVideo($pdo) {
    // Select a single random video (exclude compatibility seed 10)
    $stmt = $pdo->query("SELECT * FROM video_metadatas WHERE vid_id != 10 ORDER BY RAND() LIMIT 1");
    $video = $stmt->fetch();
    
    if ($video) {
        $subtitles = json_decode($video['subtitles'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $video['subtitles'] = $subtitles;
        }
    }
    
    echo json_encode($video);
    exit;
}

function handleCrawl($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $directory = $data['directory'] ?? '';
    $recursive = isset($data['recursive']) ? (bool)$data['recursive'] : false;

    if (empty($directory)) {
        throw new Exception('Directory path is required');
    }

    // Normalize directory path
    $directory = str_replace('\\', '/', $directory);
    $directory = rtrim($directory, '/') . '/';

    if (!is_dir($directory)) {
        throw new Exception("Directory does not exist or is not readable: $directory");
    }

    // 1. Purge legacy row 10 in video_metadatas if it exists
    $pdo->exec("DELETE FROM video_metadatas WHERE vid_id = 10");

    // 2. Bidirectional sync: Clean up missing files from database
    $stmt = $pdo->query("SELECT vid_id, link FROM video_metadatas");
    $dbVideos = $stmt->fetchAll();
    $deletedCount = 0;
    foreach ($dbVideos as $dbVideo) {
        $link = $dbVideo['link'];
        $id = $dbVideo['vid_id'];
        
        $localPath = str_replace('file:///', '', $link);
        $localPath = str_replace('//', '/', $localPath);
        $localPathDecoded = rawurldecode($localPath);
        
        if (!file_exists($localPath) && !file_exists($localPathDecoded)) {
            // Delete video metadata row
            $deleteStmt = $pdo->prepare("DELETE FROM video_metadatas WHERE vid_id = :id");
            $deleteStmt->execute([':id' => $id]);
            // Clean from default playlist
            deleteFromPlaylistsTable($pdo, $id);
            $deletedCount++;
        }
    }

    $videoExtensions = ['mp4', 'webm', 'mkv', 'avi'];
    $files = [];

    // Scan directory
    if ($recursive) {
        $directoryIterator = new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS);
        $iterator = new RecursiveIteratorIterator($directoryIterator);
        foreach ($iterator as $fileInfo) {
            if ($fileInfo->isFile()) {
                $ext = strtolower($fileInfo->getExtension());
                if (in_array($ext, $videoExtensions)) {
                    $files[] = str_replace('\\', '/', $fileInfo->getRealPath());
                }
            }
        }
    } else {
        $scanned = scandir($directory);
        foreach ($scanned as $item) {
            if ($item === '.' || $item === '..') continue;
            $filePath = $directory . $item;
            if (is_file($filePath)) {
                $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                if (in_array($ext, $videoExtensions)) {
                    $files[] = $filePath;
                }
            }
        }
    }

    $added = 0;
    $skipped = 0;
    $newVideosList = [];

    // Get cookie values for user session
    $uploader_id = $_COOKIE['loggedusernum'] ?? 1;
    $uploader_name = $_COOKIE['loggedusername'] ?? 'Admin';
    $uploader_img = $_COOKIE['loggeduserpic'] ?? '/comment section/userdatabase/profilepic/defaulta.jpg';

    // Query helper to check existing links
    $checkStmt = $pdo->prepare("SELECT vid_id FROM video_metadatas WHERE link = :link");

    // Insert statement
    $insertStmt = $pdo->prepare("
        INSERT INTO video_metadatas 
        (vid_name, link, uploader_id, uploader_name, uploader_img, likes, dislikes, duration, views, upload_date, upload_time, tags, subtitles, description, comments, filesize, width, height, aspect_ratio, bitrate, framerate, codec)
        VALUES 
        (:vid_name, :link, :uploader_id, :uploader_name, :uploader_img, 0, 0, :duration, 0, :upload_date, :upload_time, :tags, 'null', :description, 0, :filesize, :width, :height, :aspect_ratio, :bitrate, :framerate, :codec)
    ");

    $ffmpegPath = getFFmpegPath();
    $newVidIds = [];

    foreach ($files as $file) {
        // Construct the legacy file:/// link path
        $driveLetter = '';
        $restOfPath = '';
        
        // Check if path is of Windows format (e.g. D:/Video songs)
        if (preg_match('/^([a-zA-Z]):\/(.*)$/', $file, $matches)) {
            $drive = $matches[1];
            $rest = $matches[2];
            $link = "file:///" . strtoupper($drive) . ":/" . $rest;
        } else {
            $link = "file:///" . str_replace('%', '%25', $file);
        }

        // Check if exists
        $checkStmt->execute([':link' => $link]);
        if ($checkStmt->fetch()) {
            $skipped++;
            continue;
        }

        // Parse file metadata
        $meta = MetadataParser::parse($file);

        // Get file modification date for upload date/time
        $mtime = filemtime($file);
        $upload_date = date('Y-m-d', $mtime);
        $upload_time = date('H:i:s', $mtime);

        $filename = basename($file);

        $params = [
            ':vid_name' => $filename,
            ':link' => $link,
            ':uploader_id' => $uploader_id,
            ':uploader_name' => $uploader_name,
            ':uploader_img' => $uploader_img,
            ':duration' => $meta['duration'],
            ':upload_date' => $upload_date,
            ':upload_time' => $upload_time,
            ':tags' => '',
            ':description' => 'Discovered via crawler.',
            ':filesize' => $meta['filesize'],
            ':width' => $meta['width'],
            ':height' => $meta['height'],
            ':aspect_ratio' => $meta['aspect_ratio'],
            ':bitrate' => $meta['bitrate'],
            ':framerate' => $meta['framerate'],
            ':codec' => $meta['codec']
        ];

        $insertStmt->execute($params);
        $newId = $pdo->lastInsertId();
        $newVidIds[] = $newId;
        
        $thumbCreated = false;
        if ($ffmpegPath) {
            $thumbCreated = generateServerThumbnail($ffmpegPath, $file, $newId);
        }

        $newVideosList[] = [
            'id' => $newId,
            'name' => $filename,
            'duration' => $meta['duration'],
            'size' => $meta['filesize'],
            'thumbnail_created' => $thumbCreated
        ];
        $added++;
    }

    // Update playlists table instead of legacy row 10
    if ($added > 0) {
        updatePlaylistsTable($pdo, $newVidIds);
    }

    echo json_encode([
        'success' => true,
        'added' => $added,
        'skipped' => $skipped,
        'deleted' => $deletedCount,
        'new_videos' => $newVideosList
    ]);
}

function handleUpdateMetadata($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $id = $data['vid_id'] ?? '';
    $title = $data['vid_name'] ?? '';
    $description = $data['description'] ?? '';
    $tags = $data['tags'] ?? '';

    if (empty($id)) {
        throw new Exception('Video ID is required');
    }

    $stmt = $pdo->prepare("
        UPDATE video_metadatas 
        SET vid_name = :title, description = :description, tags = :tags 
        WHERE vid_id = :id
    ");
    $stmt->execute([
        ':title' => $title,
        ':description' => $description,
        ':tags' => $tags,
        ':id' => $id
    ]);

    echo json_encode(['success' => true]);
}

function handleUpdateDuration($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $id = $data['vid_id'] ?? '';
    $duration = $data['duration'] ?? 0;

    if (empty($id)) {
        throw new Exception('Video ID is required');
    }

    $stmt = $pdo->prepare("UPDATE video_metadatas SET duration = :duration WHERE vid_id = :id");
    $stmt->execute([
        ':duration' => $duration,
        ':id' => $id
    ]);

    echo json_encode(['success' => true]);
}

function handleDeleteVideo($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $id = $data['vid_id'] ?? '';

    if (empty($id)) {
        throw new Exception('Video ID is required');
    }

    // Delete record
    $stmt = $pdo->prepare("DELETE FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);

    // Update playlists table
    deleteFromPlaylistsTable($pdo, $id);

    echo json_encode(['success' => true]);
}

function handleAddView($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $id = $data['vid_id'] ?? '';

    if (empty($id)) {
        throw new Exception('Video ID is required');
    }

    $stmt = $pdo->prepare("UPDATE video_metadatas SET views = views + 1 WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true]);
}

function handleToggleLike($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    
    $id = $data['vid_id'] ?? '';
    $type = $data['type'] ?? 'like'; // 'like' or 'dislike'
    $action = $data['action'] ?? 'increment'; // 'increment' or 'decrement'

    if (empty($id)) {
        throw new Exception('Video ID is required');
    }

    $val = ($action === 'increment') ? 1 : -1;

    if ($type === 'like') {
        $stmt = $pdo->prepare("UPDATE video_metadatas SET likes = GREATEST(0, likes + :val) WHERE vid_id = :id");
    } else {
        $stmt = $pdo->prepare("UPDATE video_metadatas SET dislikes = GREATEST(0, dislikes + :val) WHERE vid_id = :id");
    }
    
    $stmt->execute([':val' => $val, ':id' => $id]);

    echo json_encode(['success' => true]);
}

function handleGetCategories() {
    // Custom video category shortcuts
    $categories = [
        ['id' => 'all', 'name' => 'All'],
        ['id' => 'recent', 'name' => 'Recent'],
        ['id' => 'hot', 'name' => 'Hot'],
        ['id' => 'videosongs', 'name' => 'Video Songs'],
        ['id' => 'downloads', 'name' => 'Downloads'],
        ['id' => 'study', 'name' => 'Study'],
        ['id' => 'animes', 'name' => 'My Animes'],
        ['id' => 'entertainment', 'name' => '0-entertainment']
    ];
    echo json_encode($categories);
}

// ----------------------------------------
// Playlists Table Management Helpers
// ----------------------------------------

function updatePlaylistsTable($pdo, $newIds) {
    $stmt = $pdo->prepare("SELECT video_ids FROM playlists WHERE playlist_name = 'default'");
    $stmt->execute();
    $row = $stmt->fetch();
    
    $playlist = [];
    if ($row) {
        $playlist = json_decode($row['video_ids'], true);
        if (!is_array($playlist)) {
            $playlist = [];
        }
    }
    
    foreach ($newIds as $id) {
        $playlist[] = (string)$id;
    }
    
    $count = count($playlist);
    $json = json_encode($playlist);
    
    $updateStmt = $pdo->prepare("
        INSERT INTO playlists (playlist_name, video_ids, video_count)
        VALUES ('default', :playlist, :count)
        ON DUPLICATE KEY UPDATE video_ids = VALUES(video_ids), video_count = VALUES(video_count)
    ");
    $updateStmt->execute([
        ':playlist' => $json,
        ':count' => $count
    ]);
}

function deleteFromPlaylistsTable($pdo, $deleteId) {
    $stmt = $pdo->prepare("SELECT video_ids FROM playlists WHERE playlist_name = 'default'");
    $stmt->execute();
    $row = $stmt->fetch();
    
    if ($row) {
        $playlist = json_decode($row['video_ids'], true);
        if (is_array($playlist)) {
            $key = array_search((string)$deleteId, $playlist);
            if ($key !== false) {
                array_splice($playlist, $key, 1);
                
                $count = count($playlist);
                $json = json_encode($playlist);
                
                $updateStmt = $pdo->prepare("UPDATE playlists SET video_ids = :playlist, video_count = :count WHERE playlist_name = 'default'");
                $updateStmt->execute([
                    ':playlist' => $json,
                    ':count' => $count
                ]);
            }
        }
    }
}

function handleSaveThumbnail($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $id = $data['vid_id'] ?? '';
    $image = $data['image'] ?? ''; // data:image/jpeg;base64,...

    if (empty($id) || empty($image)) {
        throw new Exception('vid_id and image data are required');
    }

    // Clean up base64 header
    $image = str_replace('data:image/jpeg;base64,', '', $image);
    $image = str_replace('data:image/png;base64,', '', $image);
    $image = str_replace(' ', '+', $image);
    $decoded = base64_decode($image);

    $thumbDir = dirname(__DIR__) . '/thumbnails/';
    if (!is_dir($thumbDir)) {
        mkdir($thumbDir, 0777, true);
    }

    file_put_contents($thumbDir . $id . '.jpg', $decoded);
    echo json_encode(['success' => true]);
}

function getFFmpegPath() {
    // 1. Check local bin folder
    $localBin = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'ffmpeg.exe';
    if (file_exists($localBin)) {
        return '"' . $localBin . '"';
    }

    // 2. Check standard Windows installations
    $standardPaths = [
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\ffmpeg\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe'
    ];
    foreach ($standardPaths as $path) {
        if (file_exists($path)) {
            return '"' . $path . '"';
        }
    }

    // 3. Check if ffmpeg is in system PATH (Windows)
    $output = [];
    $returnVar = -1;
    @exec('where ffmpeg', $output, $returnVar);
    if ($returnVar === 0 && !empty($output)) {
        $foundPath = trim($output[0]);
        if (file_exists($foundPath)) {
            return '"' . $foundPath . '"';
        }
        return 'ffmpeg';
    }

    return null;
}

function generateServerThumbnail($ffmpegPath, $videoPath, $vidId) {
    $thumbDir = dirname(__DIR__) . '/thumbnails/';
    if (!is_dir($thumbDir)) {
        mkdir($thumbDir, 0777, true);
    }
    $outputPath = $thumbDir . $vidId . '.jpg';
    
    // Create temporary hardlink on the same partition to bypass Windows Unicode cmd.exe bugs
    $tempLink = getTempHardlink($videoPath);
    $inputPath = $tempLink ? $tempLink : $videoPath;
    
    // Extract 1 frame at 6 seconds
    $cmd = "$ffmpegPath -y -ss 00:00:06 -i " . escapeshellarg($inputPath) . " -vframes 1 -q:v 2 " . escapeshellarg($outputPath);
    
    $output = [];
    $returnVar = -1;
    @exec($cmd, $output, $returnVar);
    
    // Clean up temporary hardlink if created
    if ($tempLink && file_exists($tempLink)) {
        @unlink($tempLink);
    }
    
    return ($returnVar === 0 && file_exists($outputPath));
}

function handleGenerateMissingThumbnails($pdo) {
    // Keep timeout safe since we only do a small batch of 5 at a time
    set_time_limit(90);
    
    $ffmpegPath = getFFmpegPath();
    if (!$ffmpegPath) {
        throw new Exception('FFmpeg is not installed or available on this server.');
    }

    $stmt = $pdo->query("SELECT vid_id, vid_name, link FROM video_metadatas");
    $allVideos = $stmt->fetchAll();

    $thumbDir = dirname(__DIR__) . '/thumbnails/';
    if (!is_dir($thumbDir)) {
        mkdir($thumbDir, 0777, true);
    }

    // Find all videos missing thumbnails on disk
    $missing = [];
    foreach ($allVideos as $video) {
        if (empty($video['link']) || intval($video['vid_id']) === 10) continue;
        $outputPath = $thumbDir . $video['vid_id'] . '.jpg';
        if (!file_exists($outputPath)) {
            $missing[] = $video;
        }
    }

    $totalCount = count($allVideos);
    $remainingCount = count($missing);

    if ($remainingCount === 0) {
        echo json_encode([
            'success' => true,
            'batch_processed' => 0,
            'generated' => 0,
            'failed' => 0,
            'remaining' => 0,
            'total' => $totalCount
        ]);
        exit;
    }

    // Process a batch of 5 videos
    $batchSize = 5;
    $batch = array_slice($missing, 0, $batchSize);
    
    $generated = 0;
    $failed = 0;
    $failedList = [];

    foreach ($batch as $video) {
        $id = $video['vid_id'];
        $name = $video['vid_name'];
        $link = $video['link'];

        $localPath = str_replace('file:///', '', $link);
        $localPath = str_replace('//', '/', $localPath);
        
        $success = generateServerThumbnail($ffmpegPath, $localPath, $id);

        if ($success) {
            $generated++;
        } else {
            $failed++;
            $failedList[] = [
                'id' => $id,
                'name' => $name,
                'path' => $localPath
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'batch_processed' => count($batch),
        'generated' => $generated,
        'failed' => $failed,
        'remaining' => $remainingCount - count($batch),
        'total' => $totalCount,
        'failed_list' => $failedList
    ]);
}

function getTempHardlink($originalPath) {
    $dir = dirname($originalPath);
    $ext = pathinfo($originalPath, PATHINFO_EXTENSION);
    
    // Create random unique ASCII filename
    $tempName = 'temp_thumb_' . uniqid() . '.' . $ext;
    $tempPath = $dir . DIRECTORY_SEPARATOR . $tempName;
    
    // Normalize path slashes for Windows link()
    $tempPath = str_replace('/', DIRECTORY_SEPARATOR, $tempPath);
    $originalPath = str_replace('/', DIRECTORY_SEPARATOR, $originalPath);
    
    if (@link($originalPath, $tempPath)) {
        return $tempPath;
    }
    return null;
}

function handleGetPlaylists($pdo) {
    $stmt = $pdo->query("SELECT * FROM playlists WHERE playlist_name != 'default' ORDER BY id DESC");
    $playlists = $stmt->fetchAll();
    
    // Decode video_ids JSON for each playlist
    foreach ($playlists as &$pl) {
        $ids = json_decode($pl['video_ids'], true);
        $pl['video_ids'] = is_array($ids) ? $ids : [];
    }
    
    echo json_encode($playlists);
    exit;
}

function handleCreatePlaylist($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $name = trim($data['name'] ?? '');
    
    if (empty($name)) {
        throw new Exception('Playlist name is required');
    }
    
    // Check if exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM playlists WHERE playlist_name = :name");
    $stmt->execute([':name' => $name]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('A playlist with this name already exists');
    }
    
    $stmt = $pdo->prepare("INSERT INTO playlists (playlist_name, video_ids, video_count) VALUES (:name, '[]', 0)");
    $stmt->execute([':name' => $name]);
    
    echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId(), 'name' => $name]);
    exit;
}

function handleDeletePlaylistAction($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $id = intval($data['id'] ?? 0);
    
    $stmt = $pdo->prepare("DELETE FROM playlists WHERE id = :id AND playlist_name != 'default'");
    $stmt->execute([':id' => $id]);
    
    echo json_encode(['status' => 'success']);
    exit;
}

function handleAddToPlaylist($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $playlistId = intval($data['playlist_id'] ?? 0);
    $vidId = intval($data['vid_id'] ?? 0);
    
    if ($playlistId <= 0 || $vidId <= 0) {
        throw new Exception('Invalid playlist or video ID');
    }
    
    $stmt = $pdo->prepare("SELECT video_ids FROM playlists WHERE id = :id");
    $stmt->execute([':id' => $playlistId]);
    $pl = $stmt->fetch();
    if (!$pl) {
        throw new Exception('Playlist not found');
    }
    
    $videoIds = json_decode($pl['video_ids'], true);
    if (!is_array($videoIds)) {
        $videoIds = [];
    }
    
    // Add if not already present
    if (!in_array($vidId, $videoIds)) {
        $videoIds[] = $vidId;
    }
    
    $count = count($videoIds);
    $json = json_encode($videoIds);
    
    $stmt = $pdo->prepare("UPDATE playlists SET video_ids = :ids, video_count = :count WHERE id = :id");
    $stmt->execute([
        ':ids' => $json,
        ':count' => $count,
        ':id' => $playlistId
    ]);
    
    echo json_encode(['status' => 'success', 'video_ids' => $videoIds]);
    exit;
}

function handleRemoveFromPlaylist($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $playlistId = intval($data['playlist_id'] ?? 0);
    $vidId = intval($data['vid_id'] ?? 0);
    
    if ($playlistId <= 0 || $vidId <= 0) {
        throw new Exception('Invalid playlist or video ID');
    }
    
    $stmt = $pdo->prepare("SELECT video_ids FROM playlists WHERE id = :id");
    $stmt->execute([':id' => $playlistId]);
    $pl = $stmt->fetch();
    if (!$pl) {
        throw new Exception('Playlist not found');
    }
    
    $videoIds = json_decode($pl['video_ids'], true);
    if (is_array($videoIds)) {
        $videoIds = array_values(array_filter($videoIds, function($id) use ($vidId) {
            return intval($id) !== $vidId;
        }));
    } else {
        $videoIds = [];
    }
    
    $count = count($videoIds);
    $json = json_encode($videoIds);
    
    $stmt = $pdo->prepare("UPDATE playlists SET video_ids = :ids, video_count = :count WHERE id = :id");
    $stmt->execute([
        ':ids' => $json,
        ':count' => $count,
        ':id' => $playlistId
    ]);
    
    echo json_encode(['status' => 'success', 'video_ids' => $videoIds]);
    exit;
}

function handleUpdatePlaylistVideos($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $playlistId = intval($data['playlist_id'] ?? 0);
    $videoIds = $data['video_ids'] ?? [];
    
    if ($playlistId <= 0 || !is_array($videoIds)) {
        throw new Exception('Invalid parameters');
    }
    
    // Sanitize to integers
    $videoIds = array_map('intval', $videoIds);
    $count = count($videoIds);
    $json = json_encode($videoIds);
    
    $stmt = $pdo->prepare("UPDATE playlists SET video_ids = :ids, video_count = :count WHERE id = :id");
    $stmt->execute([
        ':ids' => $json,
        ':count' => $count,
        ':id' => $playlistId
    ]);
    
    echo json_encode(['status' => 'success']);
    exit;
}

function getCurrentUserNum() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (isset($_SESSION['loggedusernum'])) {
        return intval($_SESSION['loggedusernum']);
    }
    if (isset($_COOKIE['loggedusernum'])) {
        return intval($_COOKIE['loggedusernum']);
    }
    return null;
}

function handleLogin($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if ($username === '' || $password === '') {
        throw new Exception('Username and password are required');
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_name = :username AND user_pass = :password AND privilege != 'GROUP'");
    $stmt->execute([
        ':username' => $username,
        ':password' => $password
    ]);
    $user = $stmt->fetch();

    if (!$user) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Incorrect username or password']);
        exit;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION['loggedusername'] = $user['user_name'];
    $_SESSION['loggedusernum'] = $user['user_num'];
    $_SESSION['loggeduserpic'] = $user['user_pic'];
    $_SESSION['loggeduserprivilege'] = $user['privilege'];
    $_SESSION['loggeduserfirstname'] = $user['first_name'];
    $_SESSION['loggeduserlastname'] = $user['last_name'];
    $_SESSION['loggeduseruserdesc'] = $user['user_desc'];

    $expiry = time() + (365 * 24 * 60 * 60);
    setcookie('loggedusername', $user['user_name'], $expiry, '/');
    setcookie('loggedusernum', $user['user_num'], $expiry, '/');
    setcookie('loggeduserpic', $user['user_pic'], $expiry, '/');
    setcookie('loggeduserprivilege', $user['privilege'], $expiry, '/');
    setcookie('loggeduserfirstname', $user['first_name'], $expiry, '/');
    setcookie('loggeduserlastname', $user['last_name'], $expiry, '/');
    setcookie('loggeduseruserdesc', $user['user_desc'], $expiry, '/');

    echo json_encode([
        'status' => 'success',
        'user' => [
            'user_num' => intval($user['user_num']),
            'user_name' => $user['user_name'],
            'user_pic' => $user['user_pic'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'user_desc' => $user['user_desc'],
            'privilege' => $user['privilege'],
            'karma' => intval($user['karma'])
        ]
    ]);
    exit;
}

function handleLogout() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_destroy();

    $past = time() - 3600;
    setcookie('loggedusername', '', $past, '/');
    setcookie('loggedusernum', '', $past, '/');
    setcookie('loggeduserpic', '', $past, '/');
    setcookie('loggeduserprivilege', '', $past, '/');
    setcookie('loggeduserfirstname', '', $past, '/');
    setcookie('loggeduserlastname', '', $past, '/');
    setcookie('loggeduseruserdesc', '', $past, '/');

    echo json_encode(['status' => 'success']);
    exit;
}

function handleSignup($pdo) {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $firstName = trim($_POST['first_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');
    $description = trim($_POST['description'] ?? '');

    if ($username === '' || $password === '') {
        throw new Exception('Username and password are required');
    }

    if (strlen($password) < 6 || !preg_match('/[0-9]/', $password) || strpos($password, ' ') !== false) {
        throw new Exception('Password must be at least 6 characters, contain a number, and have no spaces.');
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE user_name = :username");
    $stmt->execute([':username' => $username]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('Username is already taken');
    }

    if ($description === '') {
        $description = 'Hiii There its me !!! yeah you dont know me....';
    }

    $profilePic = '/youtube-v2/Userdatabase/ProfilePic/default' . rand(1, 10) . '.jpg';
    if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
        $picName = $_FILES['profile_pic']['name'];
        $ext = strtolower(pathinfo($picName, PATHINFO_EXTENSION));
        
        $destDir = __DIR__ . '/../Userdatabase/ProfilePic';
        if (!file_exists($destDir)) {
            mkdir($destDir, 0777, true);
        }

        $newFileName = sanitizeFileName($username) . '_' . time() . '.' . $ext;
        $destPath = $destDir . '/' . $newFileName;
        if (move_uploaded_file($_FILES['profile_pic']['tmp_name'], $destPath)) {
            $profilePic = '/youtube-v2/Userdatabase/ProfilePic/' . $newFileName;
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO users (user_name, user_pass, first_name, last_name, user_desc, user_pic, privilege, comment_votes, reply_votes, karma)
        VALUES (:username, :password, :first_name, :last_name, :description, :profile_pic, 'USER', 'a:1:{i:0;s:7:\"upvoted\";}', 'a:1:{i:0;s:7:\"upvoted\";}', 0)
    ");
    $stmt->execute([
        ':username' => $username,
        ':password' => $password,
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':description' => $description,
        ':profile_pic' => $profilePic
    ]);

    echo json_encode(['status' => 'success']);
    exit;
}

function sanitizeFileName($str) {
    return preg_replace('/[^a-zA-Z0-9_\-]/', '', $str);
}

function handleGetComments($pdo) {
    $videoId = intval($_GET['video_id'] ?? 0);
    if ($videoId <= 0) {
        throw new Exception('Invalid Video ID');
    }

    $comPage1 = $videoId;
    $comPage2 = '/YouTube/play.php?play_vid=' . $videoId;

    $currentUserNum = getCurrentUserNum();

    $commentsStmt = $pdo->prepare("
        SELECT c.*, u.user_name, u.user_pic, u.karma
        FROM comments c
        JOIN users u ON c.user_num = u.user_num
        WHERE c.com_page = :page1 OR c.com_page = :page2
        ORDER BY c.points DESC, c.com_date DESC, c.com_time DESC
    ");
    $commentsStmt->execute([
        ':page1' => $comPage1,
        ':page2' => $comPage2
    ]);
    $comments = $commentsStmt->fetchAll();

    $votedComments = [];
    $votedReplies = [];
    if ($currentUserNum) {
        $votesStmt = $pdo->prepare("SELECT target_id, vote_type, target_type FROM user_activity_votes WHERE user_num = :user_num");
        $votesStmt->execute([':user_num' => $currentUserNum]);
        $votes = $votesStmt->fetchAll();
        foreach ($votes as $v) {
            if ($v['target_type'] === 'comment') {
                $votedComments[$v['target_id']] = $v['vote_type'];
            } else {
                $votedReplies[$v['target_id']] = $v['vote_type'];
            }
        }
    }

    $repliesStmt = $pdo->prepare("
        SELECT r.*, u.user_name, u.user_pic, u.karma
        FROM replies r
        JOIN users u ON r.user_num = u.user_num
        WHERE r.page = :page1 OR r.page = :page2
        ORDER BY r.reply_date ASC, r.reply_time ASC
    ");
    $repliesStmt->execute([
        ':page1' => $comPage1,
        ':page2' => $comPage2
    ]);
    $replies = $repliesStmt->fetchAll();

    $repliesByComment = [];
    foreach ($replies as &$rep) {
        $rep['com_id'] = intval($rep['com_id']);
        $rep['reply_id'] = intval($rep['reply_id']);
        $rep['user_num'] = intval($rep['user_num']);
        $rep['karma'] = intval($rep['karma']);
        $rep['upvotes'] = intval($rep['upvotes']);
        $rep['downvotes'] = intval($rep['downvotes']);
        $rep['points'] = intval($rep['points']);
        $rep['user_vote'] = $votedReplies[$rep['reply_id']] ?? null;
        $rep['parent_reply_id'] = $rep['parent_reply_id'] ? intval($rep['parent_reply_id']) : null;
        
        $repliesByComment[$rep['com_id']][] = $rep;
    }

    $commentsTree = [];
    foreach ($comments as $com) {
        $comId = intval($com['com_id']);
        $com['com_id'] = $comId;
        $com['user_num'] = intval($com['user_num']);
        $com['karma'] = intval($com['karma']);
        $com['upvotes'] = intval($com['upvotes']);
        $com['downvotes'] = intval($com['downvotes']);
        $com['points'] = intval($com['points']);
        $com['user_vote'] = $votedComments[$comId] ?? null;

        $rawReplies = $repliesByComment[$comId] ?? [];
        $com['replies'] = buildRepliesTree($rawReplies);
        $commentsTree[] = $com;
    }

    echo json_encode($commentsTree);
    exit;
}

function buildRepliesTree($flatReplies) {
    $repliesByParent = [];
    $roots = [];
    foreach ($flatReplies as $r) {
        if ($r['parent_reply_id'] === null) {
            $roots[] = $r;
        } else {
            $repliesByParent[$r['parent_reply_id']][] = $r;
        }
    }

    $nest = function(&$items) use (&$nest, $repliesByParent) {
        foreach ($items as &$item) {
            $id = $item['reply_id'];
            $children = $repliesByParent[$id] ?? [];
            if (!empty($children)) {
                $nest($children);
            }
            $item['replies'] = $children;
        }
    };

    $nest($roots);
    return $roots;
}

function handleAddComment($pdo) {
    $currentUserNum = getCurrentUserNum();
    if (!$currentUserNum) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    if (!empty($_POST)) {
        $data = $_POST;
    } else {
        $rawData = file_get_contents('php://input');
        $data = json_decode($rawData, true) ?: [];
    }

    $videoId = intval($data['video_id'] ?? 0);
    $commentText = trim($data['comment_text'] ?? '');
    $parentComId = isset($data['parent_com_id']) && $data['parent_com_id'] !== '' ? intval($data['parent_com_id']) : null;
    $parentReplyId = isset($data['parent_reply_id']) && $data['parent_reply_id'] !== '' ? intval($data['parent_reply_id']) : null;
    $repliedTo = trim($data['replied_to'] ?? '');

    if ($videoId <= 0 || $commentText === '') {
        throw new Exception('Invalid parameters or empty comment text');
    }

    $attachmentUrl = trim($data['attachment_url'] ?? '');
    $attachmentType = trim($data['attachment_type'] ?? '');

    // Handle file upload
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['attachment'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        $destDir = __DIR__ . '/../uploads/comments';
        if (!file_exists($destDir)) {
            mkdir($destDir, 0777, true);
        }

        $newFileName = 'att_' . $currentUserNum . '_' . time() . '_' . rand(100, 999) . '.' . $ext;
        $destPath = $destDir . '/' . $newFileName;
        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            $attachmentUrl = '/youtube-v2/uploads/comments/' . $newFileName;
            if (in_array($ext, ['mp4', 'webm', 'ogg'])) {
                $attachmentType = 'video';
            } elseif ($ext === 'gif') {
                $attachmentType = 'gif';
            } else {
                $attachmentType = 'image';
            }
        }
    }

    if ($attachmentUrl === '') {
        $attachmentUrl = null;
        $attachmentType = null;
    }

    $comPage = '/YouTube/play.php?play_vid=' . $videoId;
    $date = date('Y-m-d');
    $time = date('H:i:s');

    if ($parentComId === null) {
        $stmt = $pdo->prepare("
            INSERT INTO comments (com_page, user_num, com_date, com_time, comment, total_replies, upvotes, downvotes, points, edited, attachment_url, attachment_type)
            VALUES (:com_page, :user_num, :com_date, :com_time, :comment, 0, 0, 0, 0, 'false', :att_url, :att_type)
        ");
        $stmt->execute([
            ':com_page' => $comPage,
            ':user_num' => $currentUserNum,
            ':com_date' => $date,
            ':com_time' => $time,
            ':comment' => $commentText,
            ':att_url' => $attachmentUrl,
            ':att_type' => $attachmentType
        ]);
        $newId = $pdo->lastInsertId();

        $pdo->prepare("UPDATE video_metadatas SET comments = comments + 1 WHERE vid_id = :vid_id")->execute([':vid_id' => $videoId]);

        $stmt = $pdo->prepare("SELECT c.*, u.user_name, u.user_pic, u.karma FROM comments c JOIN users u ON c.user_num = u.user_num WHERE c.com_id = :id");
        $stmt->execute([':id' => $newId]);
        $res = $stmt->fetch();
        $res['replies'] = [];
        echo json_encode($res);
        exit;
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO replies (com_id, user_num, page, reply_date, reply_time, replied_to, reply, upvotes, downvotes, points, edited, parent_reply_id, attachment_url, attachment_type)
            VALUES (:com_id, :user_num, :page, :reply_date, :reply_time, :replied_to, :reply, 0, 0, 0, 'false', :parent_reply_id, :att_url, :att_type)
        ");
        $stmt->execute([
            ':com_id' => $parentComId,
            ':user_num' => $currentUserNum,
            ':page' => $comPage,
            ':reply_date' => $date,
            ':reply_time' => $time,
            ':replied_to' => $repliedTo,
            ':reply' => $commentText,
            ':parent_reply_id' => $parentReplyId,
            ':att_url' => $attachmentUrl,
            ':att_type' => $attachmentType
        ]);
        $newId = $pdo->lastInsertId();

        $pdo->prepare("UPDATE comments SET total_replies = total_replies + 1 WHERE com_id = :com_id")->execute([':com_id' => $parentComId]);

        $pdo->prepare("UPDATE video_metadatas SET comments = comments + 1 WHERE vid_id = :vid_id")->execute([':vid_id' => $videoId]);

        $stmt = $pdo->prepare("SELECT r.*, u.user_name, u.user_pic, u.karma FROM replies r JOIN users u ON r.user_num = u.user_num WHERE r.reply_id = :id");
        $stmt->execute([':id' => $newId]);
        $res = $stmt->fetch();
        $res['replies'] = [];
        echo json_encode($res);
        exit;
    }
}

function handleVoteComment($pdo) {
    $currentUserNum = getCurrentUserNum();
    if (!$currentUserNum) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $targetType = $data['target_type'] ?? '';
    $targetId = intval($data['target_id'] ?? 0);
    $voteType = $data['vote_type'] ?? '';

    if (!in_array($targetType, ['comment', 'reply']) || $targetId <= 0 || !in_array($voteType, ['upvote', 'downvote', 'none'])) {
        throw new Exception('Invalid vote parameters');
    }

    $table = $targetType === 'comment' ? 'comments' : 'replies';
    $idCol = $targetType === 'comment' ? 'com_id' : 'reply_id';

    $stmt = $pdo->prepare("SELECT user_num, upvotes, downvotes FROM `$table` WHERE `$idCol` = :id");
    $stmt->execute([':id' => $targetId]);
    $target = $stmt->fetch();
    if (!$target) {
        throw new Exception('Target item not found');
    }
    $authorId = intval($target['user_num']);

    $stmt = $pdo->prepare("SELECT vote_type FROM user_activity_votes WHERE user_num = :user_num AND target_type = :target_type AND target_id = :target_id");
    $stmt->execute([
        ':user_num' => $currentUserNum,
        ':target_type' => $targetType,
        ':target_id' => $targetId
    ]);
    $existing = $stmt->fetch();
    $existingVote = $existing ? $existing['vote_type'] : null;

    $pdo->beginTransaction();
    try {
        if ($existingVote) {
            $updiff = $existingVote === 'upvote' ? -1 : 0;
            $downdiff = $existingVote === 'downvote' ? -1 : 0;
            $karmadiff = $existingVote === 'upvote' ? -1 : 1;

            $pdo->prepare("UPDATE `$table` SET upvotes = upvotes + :up, downvotes = downvotes + :down, points = points + :points WHERE `$idCol` = :id")
                ->execute([':up' => $updiff, ':down' => $downdiff, ':points' => ($updiff - $downdiff), ':id' => $targetId]);

            if ($authorId !== $currentUserNum) {
                $pdo->prepare("UPDATE users SET karma = karma + :karma WHERE user_num = :author")
                    ->execute([':karma' => $karmadiff, ':author' => $authorId]);
            }

            $pdo->prepare("DELETE FROM user_activity_votes WHERE user_num = :user_num AND target_type = :target_type AND target_id = :target_id")
                ->execute([':user_num' => $currentUserNum, ':target_type' => $targetType, ':target_id' => $targetId]);
        }

        if ($voteType !== 'none') {
            $updiff = $voteType === 'upvote' ? 1 : 0;
            $downdiff = $voteType === 'downvote' ? 1 : 0;
            $karmadiff = $voteType === 'upvote' ? 1 : -1;

            $pdo->prepare("UPDATE `$table` SET upvotes = upvotes + :up, downvotes = downvotes + :down, points = points + :points WHERE `$idCol` = :id")
                ->execute([':up' => $updiff, ':down' => $downdiff, ':points' => ($updiff - $downdiff), ':id' => $targetId]);

            if ($authorId !== $currentUserNum) {
                $pdo->prepare("UPDATE users SET karma = karma + :karma WHERE user_num = :author")
                    ->execute([':karma' => $karmadiff, ':author' => $authorId]);
            }

            $pdo->prepare("INSERT INTO user_activity_votes (user_num, target_type, target_id, vote_type) VALUES (:user_num, :target_type, :target_id, :vote_type)")
                ->execute([
                    ':user_num' => $currentUserNum,
                    ':target_type' => $targetType,
                    ':target_id' => $targetId,
                    ':vote_type' => $voteType
                ]);
        }

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

    $stmt = $pdo->prepare("SELECT upvotes, downvotes, points FROM `$table` WHERE `$idCol` = :id");
    $stmt->execute([':id' => $targetId]);
    $updated = $stmt->fetch();
    $updated['user_vote'] = $voteType === 'none' ? null : $voteType;
    
    $newKarma = $pdo->query("SELECT karma FROM users WHERE user_num = $authorId")->fetchColumn();
    $updated['author_karma'] = intval($newKarma);

    echo json_encode($updated);
    exit;
}

function handleDeleteComment($pdo) {
    $currentUserNum = getCurrentUserNum();
    if (!$currentUserNum) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $targetType = $data['target_type'] ?? '';
    $targetId = intval($data['target_id'] ?? 0);

    if (!in_array($targetType, ['comment', 'reply']) || $targetId <= 0) {
        throw new Exception('Invalid delete parameters');
    }

    $table = $targetType === 'comment' ? 'comments' : 'replies';
    $idCol = $targetType === 'comment' ? 'com_id' : 'reply_id';

    $stmt = $pdo->prepare("SELECT user_num FROM `$table` WHERE `$idCol` = :id");
    $stmt->execute([':id' => $targetId]);
    $item = $stmt->fetch();
    if (!$item) {
        throw new Exception('Item not found');
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $isAdmin = isset($_SESSION['loggeduserprivilege']) && $_SESSION['loggeduserprivilege'] === 'ADMIN';
    if (intval($item['user_num']) !== $currentUserNum && !$isAdmin) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['error' => 'Permission denied']);
        exit;
    }

    $hasChildren = false;
    if ($targetType === 'comment') {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM replies WHERE com_id = :id");
        $stmt->execute([':id' => $targetId]);
        $hasChildren = $stmt->fetchColumn() > 0;
    } else {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM replies WHERE parent_reply_id = :id");
        $stmt->execute([':id' => $targetId]);
        $hasChildren = $stmt->fetchColumn() > 0;
    }

    if ($hasChildren) {
        $stmt = $pdo->prepare("UPDATE `$table` SET comment = '[Comment deleted by user]', edited = 'true' WHERE `$idCol` = :id");
        if ($targetType === 'reply') {
            $stmt = $pdo->prepare("UPDATE `$table` SET reply = '[Comment deleted by user]', edited = 'true' WHERE `$idCol` = :id");
        }
        $stmt->execute([':id' => $targetId]);
        echo json_encode(['status' => 'soft_deleted']);
    } else {
        $stmt = $pdo->prepare("DELETE FROM `$table` WHERE `$idCol` = :id");
        $stmt->execute([':id' => $targetId]);
        echo json_encode(['status' => 'deleted']);
    }
    exit;
}

function handleEditComment($pdo) {
    $currentUserNum = getCurrentUserNum();
    if (!$currentUserNum) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $targetType = $data['target_type'] ?? '';
    $targetId = intval($data['target_id'] ?? 0);
    $newText = trim($data['new_text'] ?? '');

    if (!in_array($targetType, ['comment', 'reply']) || $targetId <= 0 || $newText === '') {
        throw new Exception('Invalid edit parameters');
    }

    $table = $targetType === 'comment' ? 'comments' : 'replies';
    $idCol = $targetType === 'comment' ? 'com_id' : 'reply_id';
    $textCol = $targetType === 'comment' ? 'comment' : 'reply';

    // Verify owner
    $stmt = $pdo->prepare("SELECT user_num FROM `$table` WHERE `$idCol` = :id");
    $stmt->execute([':id' => $targetId]);
    $item = $stmt->fetch();
    if (!$item) {
        throw new Exception('Item not found');
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $isAdmin = isset($_SESSION['loggeduserprivilege']) && $_SESSION['loggeduserprivilege'] === 'ADMIN';
    if (intval($item['user_num']) !== $currentUserNum && !$isAdmin) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['error' => 'Permission denied']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE `$table` SET `$textCol` = :text, edited = 'true' WHERE `$idCol` = :id");
    $stmt->execute([':text' => $newText, ':id' => $targetId]);

    echo json_encode(['status' => 'success']);
    exit;
}

function handleGetUserCard($pdo) {
    $username = trim($_GET['username'] ?? '');
    if ($username === '') {
        throw new Exception('Username parameter required');
    }

    $stmt = $pdo->prepare("SELECT user_num, user_name, user_pic, user_desc, karma, joined_date, first_name, last_name FROM users WHERE user_name = :username");
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if (!$user) {
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    $num = intval($user['user_num']);

    // Get total counts
    $commentsCount = $pdo->prepare("SELECT COUNT(*) FROM comments WHERE user_num = :num");
    $commentsCount->execute([':num' => $num]);
    $totalComments = $commentsCount->fetchColumn();

    $repliesCount = $pdo->prepare("SELECT COUNT(*) FROM replies WHERE user_num = :num");
    $repliesCount->execute([':num' => $num]);
    $totalReplies = $repliesCount->fetchColumn();

    $uploadsCount = $pdo->prepare("SELECT COUNT(*) FROM video_metadatas WHERE uploader_name = :name");
    $uploadsCount->execute([':name' => $username]);
    $totalUploads = $uploadsCount->fetchColumn();

    // Get uploads list
    $uploadsStmt = $pdo->prepare("SELECT * FROM video_metadatas WHERE uploader_name = :name ORDER BY upload_date DESC");
    $uploadsStmt->execute([':name' => $username]);
    $uploads = $uploadsStmt->fetchAll();

    // Get complete comment history (comments + replies)
    $historyStmt = $pdo->prepare("
        SELECT 'comment' as type, c.com_id as id, c.com_page as page, c.comment as text, c.com_date as date, c.com_time as time, c.points, c.attachment_url, c.attachment_type, vm.vid_name, vm.vid_id
        FROM comments c
        LEFT JOIN video_metadatas vm ON (c.com_page COLLATE utf8mb4_general_ci = CAST(vm.vid_id AS CHAR) COLLATE utf8mb4_general_ci OR c.com_page COLLATE utf8mb4_general_ci = CONCAT('/YouTube/play.php?play_vid=', vm.vid_id) COLLATE utf8mb4_general_ci)
        WHERE c.user_num = :num1
        UNION ALL
        SELECT 'reply' as type, r.reply_id as id, r.page as page, r.reply as text, r.reply_date as date, r.reply_time as time, r.points, r.attachment_url, r.attachment_type, vm.vid_name, vm.vid_id
        FROM replies r
        LEFT JOIN video_metadatas vm ON (r.page COLLATE utf8mb4_general_ci = CAST(vm.vid_id AS CHAR) COLLATE utf8mb4_general_ci OR r.page COLLATE utf8mb4_general_ci = CONCAT('/YouTube/play.php?play_vid=', vm.vid_id) COLLATE utf8mb4_general_ci)
        WHERE r.user_num = :num2
        ORDER BY date DESC, time DESC
    ");
    $historyStmt->execute([
        ':num1' => $num,
        ':num2' => $num
    ]);
    $commentHistory = $historyStmt->fetchAll();

    echo json_encode([
        'user_num' => $num,
        'user_name' => $user['user_name'],
        'user_pic' => $user['user_pic'],
        'user_desc' => $user['user_desc'],
        'first_name' => $user['first_name'] ?? '',
        'last_name' => $user['last_name'] ?? '',
        'karma' => intval($user['karma']),
        'joined_date' => $user['joined_date'],
        'total_comments' => intval($totalComments + $totalReplies),
        'total_uploads' => intval($totalUploads),
        'uploads' => $uploads,
        'comments' => $commentHistory
    ]);
    exit;
}

function handleGetEmotes() {
    $emotesDir = __DIR__ . '/../uploads/emogies';
    if (!file_exists($emotesDir)) {
        echo json_encode([]);
        exit;
    }
    
    $files = scandir($emotesDir);
    $emotes = [];
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, ['png', 'jpg', 'jpeg', 'gif'])) {
            $emotes[] = [
                'name' => pathinfo($file, PATHINFO_FILENAME),
                'url' => '/youtube-v2/uploads/emogies/' . rawurlencode($file)
            ];
        }
    }
    
    echo json_encode($emotes);
    exit;
}

function handleUpdateProfile($pdo) {
    $currentUserNum = getCurrentUserNum();
    if (!$currentUserNum) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $username = trim($_POST['username'] ?? '');
    $firstName = trim($_POST['first_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '') {
        throw new Exception('Username cannot be empty');
    }

    // Get current user details
    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_num = :num");
    $stmt->execute([':num' => $currentUserNum]);
    $currentUser = $stmt->fetch();
    if (!$currentUser) {
        throw new Exception('User not found');
    }

    $oldUsername = $currentUser['user_name'];

    // If username changes, check if taken
    if (strtolower($oldUsername) !== strtolower($username)) {
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE user_name = :username AND user_num != :num");
        $checkStmt->execute([':username' => $username, ':num' => $currentUserNum]);
        if ($checkStmt->fetchColumn() > 0) {
            throw new Exception('Username is already taken');
        }
    }

    // Password rules if changing
    if ($password !== '') {
        if (strlen($password) < 6 || !preg_match('/[0-9]/', $password) || strpos($password, ' ') !== false) {
            throw new Exception('Password must be at least 6 characters, contain a number, and have no spaces.');
        }
    } else {
        $password = $currentUser['user_pass'];
    }

    // Handle avatar upload
    $profilePic = $currentUser['user_pic'];
    if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
        $picName = $_FILES['profile_pic']['name'];
        $ext = strtolower(pathinfo($picName, PATHINFO_EXTENSION));
        
        $destDir = __DIR__ . '/../Userdatabase/ProfilePic';
        if (!file_exists($destDir)) {
            mkdir($destDir, 0777, true);
        }

        $newFileName = sanitizeFileName($username) . '_' . time() . '.' . $ext;
        $destPath = $destDir . '/' . $newFileName;
        if (move_uploaded_file($_FILES['profile_pic']['tmp_name'], $destPath)) {
            $profilePic = '/youtube-v2/Userdatabase/ProfilePic/' . $newFileName;
        }
    }

    $pdo->beginTransaction();
    try {
        // Update users table
        $updateStmt = $pdo->prepare("
            UPDATE users 
            SET user_name = :username, first_name = :first_name, last_name = :last_name, user_desc = :desc, user_pass = :pass, user_pic = :pic
            WHERE user_num = :num
        ");
        $updateStmt->execute([
            ':username' => $username,
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':desc' => $description,
            ':pass' => $password,
            ':pic' => $profilePic,
            ':num' => $currentUserNum
        ]);

        // If username changed, update uploader names in video_metadatas
        if (strtolower($oldUsername) !== strtolower($username)) {
            $upMeta = $pdo->prepare("UPDATE video_metadatas SET uploader_name = :new WHERE uploader_name = :old");
            $upMeta->execute([
                ':new' => $username,
                ':old' => $oldUsername
            ]);
        }

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

    // Refresh PHP Session if active
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['loggedusername'] = $username;
    $_SESSION['loggeduserpic'] = $profilePic;
    $_SESSION['loggeduserfirstname'] = $firstName;
    $_SESSION['loggeduserlastname'] = $lastName;
    $_SESSION['loggeduseruserdesc'] = $description;

    // Refresh cookies
    $expiry = time() + (365 * 24 * 60 * 60);
    setcookie('loggedusername', $username, $expiry, '/');
    setcookie('loggeduserpic', $profilePic, $expiry, '/');
    setcookie('loggeduserfirstname', $firstName, $expiry, '/');
    setcookie('loggeduserlastname', $lastName, $expiry, '/');
    setcookie('loggeduseruserdesc', $description, $expiry, '/');

    echo json_encode([
        'status' => 'success',
        'user' => [
            'user_num' => intval($currentUserNum),
            'user_name' => $username,
            'user_pic' => $profilePic,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'user_desc' => $description,
            'privilege' => $currentUser['privilege'],
            'karma' => intval($currentUser['karma'])
        ]
    ]);
    exit;
}

// ----------------------------------------
// Smart TV Casting (DLNA/UPnP) Helper Functions
// ----------------------------------------

function getLocalIPs() {
    $ips = [];
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        @exec('ipconfig', $output);
        foreach ($output as $line) {
            if (preg_match('/IPv4 Address[\.\s]+:\s*([0-9\.]+)/i', $line, $matches)) {
                $ip = trim($matches[1]);
                if ($ip !== '127.0.0.1' && !in_array($ip, $ips)) {
                    $ips[] = $ip;
                }
            }
        }
    } else {
        @exec('hostname -I', $output);
        if (!empty($output)) {
            $parts = explode(' ', trim($output[0]));
            foreach ($parts as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && $ip !== '127.0.0.1') {
                    $ips[] = $ip;
                }
            }
        }
    }
    if (empty($ips)) {
        $ips[] = $_SERVER['SERVER_ADDR'] ?? gethostbyname(gethostname());
    }
    return array_values(array_filter($ips, function($ip) {
        return !empty($ip) && $ip !== '127.0.0.1';
    }));
}

function parseUPnPDescription($url) {
    $ctx = stream_context_create([
        'http' => ['timeout' => 1.5]
    ]);
    $xml = @file_get_contents($url, false, $ctx);
    if (!$xml) return null;

    $friendlyName = 'Unknown DLNA Device';
    if (preg_match('/<friendlyName>(.*?)<\/friendlyName>/i', $xml, $m)) {
        $friendlyName = trim($m[1]);
    }

    $parts = parse_url($url);
    $baseUrl = $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');

    $controlUrl = '';
    
    // Split XML into <service> segments to avoid tag order dependency inside <service>
    $services = preg_split('/<\/service>/i', $xml);
    foreach ($services as $srv) {
        if (preg_match('/urn:schemas-upnp-org:service:AVTransport:[1-9]/i', $srv)) {
            if (preg_match('/<controlURL>(.*?)<\/controlURL>/i', $srv, $m)) {
                $controlUrl = trim($m[1]);
                break;
            }
        }
    }

    // Fallback if no AVTransport service was found
    if (empty($controlUrl)) {
        if (preg_match('/<controlURL>(.*?)<\/controlURL>/i', $xml, $m)) {
            $controlUrl = trim($m[1]);
        }
    }

    if ($controlUrl) {
        if (strpos($controlUrl, 'http') === 0) {
            $fullControlUrl = $controlUrl;
        } else {
            $fullControlUrl = rtrim($baseUrl, '/') . '/' . ltrim($controlUrl, '/');
        }
        return [
            'name' => $friendlyName,
            'control_url' => $fullControlUrl
        ];
    }
    return null;
}

function handleGetServerIps() {
    echo json_encode(getLocalIPs());
    exit;
}

function handleCastDiscover() {
    $serverIp = $_GET['server_ip'] ?? '0.0.0.0';
    if (!filter_var($serverIp, FILTER_VALIDATE_IP)) {
        $serverIp = '0.0.0.0';
    }

    $targets = [
        "urn:schemas-upnp-org:device:MediaRenderer:1",
        "urn:schemas-upnp-org:service:AVTransport:1",
        "upnp:rootdevice"
    ];

    $socket = @stream_socket_server("udp://" . $serverIp . ":0", $errno, $errstr, STREAM_SERVER_BIND);
    $devices = [];
    $locations = [];

    if ($socket) {
        stream_set_timeout($socket, 1, 500000);
        
        foreach ($targets as $target) {
            $msg = "M-SEARCH * HTTP/1.1\r\n" .
                   "HOST: 239.255.255.250:1900\r\n" .
                   "MAN: \"ssdp:discover\"\r\n" .
                   "MX: 2\r\n" .
                   "ST: " . $target . "\r\n\r\n";
            @stream_socket_sendto($socket, $msg, 0, '239.255.255.250:1900');
        }

        $start = microtime(true);
        while ((microtime(true) - $start) < 2.0) {
            $r = [$socket];
            $w = null;
            $e = null;
            if (stream_select($r, $w, $e, 0, 500000)) {
                $buf = @stream_socket_recvfrom($socket, 2048, 0, $peer);
                if ($buf) {
                    if (preg_match('/LOCATION:\s*(.*?)\r?\n/i', $buf, $m)) {
                        $loc = trim($m[1]);
                        if (!in_array($loc, $locations)) {
                            $locations[] = $loc;
                        }
                    }
                }
            } else {
                break;
            }
        }
        @fclose($socket);
    }

    foreach ($locations as $loc) {
        $dev = parseUPnPDescription($loc);
        if ($dev) {
            // Avoid duplicate devices by control_url
            if (!in_array($dev['control_url'], array_column($devices, 'control_url'))) {
                $devices[] = $dev;
            }
        }
    }

    echo json_encode($devices);
    exit;
}

function sendSOAPRequest($controlUrl, $service, $action, $args) {
    $xml = '<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>
    <u:' . $action . ' xmlns:u="' . $service . '">
      <InstanceID>0</InstanceID>';
    
    foreach ($args as $key => $val) {
        $xml .= '<' . $key . '>' . htmlspecialchars($val) . '</' . $key . '>';
    }
    
    $xml .= '    </u:' . $action . '>
  </s:Body>
</s:Envelope>';

    $headers = [
        'Content-Type: text/xml; charset="utf-8"',
        'SOAPACTION: "' . $service . '#' . $action . '"',
        'Content-Length: ' . strlen($xml),
        'Connection: close'
    ];

    $ch = curl_init($controlUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $code === 200 ? 'success' : 'error',
        'code' => $code,
        'response' => $res
    ];
}

function resolveLocalFilePath($link) {
    $path = str_replace('file:///', '', $link);
    $path = rawurldecode($path);
    return $path;
}

function checkAndTranscodeMedia($originalLink) {
    $localPath = resolveLocalFilePath($originalLink);
    if (!file_exists($localPath)) {
        return null;
    }

    $ffmpegPath = getFFmpegPath();
    if (!$ffmpegPath) {
        return null; // FFmpeg not found
    }
    $ffprobePath = str_replace('ffmpeg.exe', 'ffprobe.exe', $ffmpegPath);

    $cacheDir = __DIR__ . '/../uploads/cast_cache';
    if (!file_exists($cacheDir)) {
        @mkdir($cacheDir, 0777, true);
    }

    $fileHash = md5($localPath);
    $cachedFile = $cacheDir . '/' . $fileHash . '.mp4';
    $cachedUrlPath = '/youtube-v2/uploads/cast_cache/' . $fileHash . '.mp4';

    if (file_exists($cachedFile)) {
        return $cachedUrlPath;
    }

    // Check video codec
    $videoCodec = '';
    $vcmd = $ffprobePath . ' -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($localPath);
    $voutput = [];
    @exec($vcmd, $voutput, $vcode);
    if ($vcode === 0 && !empty($voutput)) {
        $videoCodec = trim($voutput[0]);
    }

    // Check audio codec and channels
    $audioCodec = '';
    $audioChannels = 2;
    $acmd = $ffprobePath . ' -v error -select_streams a:0 -show_entries stream=codec_name,channels -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($localPath);
    $aoutput = [];
    @exec($acmd, $aoutput, $acode);
    if ($acode === 0 && !empty($aoutput)) {
        $audioCodec = trim($aoutput[0]);
        $audioChannels = isset($aoutput[1]) ? intval(trim($aoutput[1])) : 2;
    }

    $ext = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));

    $needFullVideoTranscode = ($ext !== 'mp4' || $videoCodec !== 'h264');
    $needAudioTranscode = (($audioCodec !== 'aac' && $audioCodec !== 'mp3') || $audioChannels > 2);

    if (!$needFullVideoTranscode && !$needAudioTranscode) {
        return null; // Fully compatible natively
    }

    if ($needFullVideoTranscode) {
        // Transcode both video to H.264 (preset superfast for speed) and audio to AAC stereo (44.1kHz / 128kbps) with faststart flags
        $transcodeCmd = $ffmpegPath . ' -y -i ' . escapeshellarg($localPath) . ' -c:v libx264 -preset superfast -crf 23 -pix_fmt yuv420p -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart ' . escapeshellarg($cachedFile);
    } else {
        // H.264 video exists, only transcode audio to AAC stereo (44.1kHz / 128kbps) with faststart flags
        $transcodeCmd = $ffmpegPath . ' -y -i ' . escapeshellarg($localPath) . ' -c:v copy -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart ' . escapeshellarg($cachedFile);
    }

    $transcodeOutput = [];
    @exec($transcodeCmd, $transcodeOutput, $transcodeReturnCode);

    if ($transcodeReturnCode === 0 && file_exists($cachedFile)) {
        return $cachedUrlPath;
    }

    return null;
}

function handleCastControl() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $controlUrl = $data['control_url'] ?? '';
    $action = $data['action'] ?? '';
    $mediaUrl = $data['media_url'] ?? '';
    $videoLink = $data['video_link'] ?? '';

    if (empty($controlUrl) || empty($action)) {
        throw new Exception('Missing control parameters');
    }

    $service = 'urn:schemas-upnp-org:service:AVTransport:1';
    $res = null;

    switch ($action) {
        case 'set_uri':
            $finalMediaUrl = $mediaUrl;
            if (!empty($videoLink)) {
                $cachedPath = checkAndTranscodeMedia($videoLink);
                if ($cachedPath !== null) {
                    $serverIp = $_GET['server_ip'] ?? $_SERVER['SERVER_ADDR'] ?? 'localhost';
                    if (!filter_var($serverIp, FILTER_VALIDATE_IP)) {
                        $serverIp = 'localhost';
                    }
                    $port = $_SERVER['SERVER_PORT'] ?? '80';
                    $portSuffix = ($port === '80' || $port === '443') ? '' : ':' . $port;
                    $finalMediaUrl = "http://" . $serverIp . $portSuffix . $cachedPath;
                }
            }

            $title = $data['title'] ?? 'Video';
            $meta = '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/">' .
                    '<item id="0" parentID="0" restricted="1">' .
                    '<dc:title>' . htmlspecialchars($title) . '</dc:title>' .
                    '<upnp:class>object.item.videoItem.movie</upnp:class>' .
                    '<res protocolInfo="http-get:*:video/mp4:*">' . htmlspecialchars($finalMediaUrl) . '</res>' .
                    '</item>' .
                    '</DIDL-Lite>';

            $res = sendSOAPRequest($controlUrl, $service, 'SetAVTransportURI', [
                'CurrentURI' => $finalMediaUrl,
                'CurrentURIMetaData' => $meta
            ]);
            break;
        case 'play':
            $res = sendSOAPRequest($controlUrl, $service, 'Play', [
                'Speed' => '1'
            ]);
            break;
        case 'pause':
            $res = sendSOAPRequest($controlUrl, $service, 'Pause', []);
            break;
        case 'stop':
            $res = sendSOAPRequest($controlUrl, $service, 'Stop', []);
            break;
        default:
            throw new Exception('Unsupported cast action');
    }

    echo json_encode($res);
    exit;
}

