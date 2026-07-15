<?php
// c:\laragon\www\youtube\api\index.php

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

// Dynamically determine the base directory path (e.g. "/youtube" or "")
$baseDir = str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '')));
if ($baseDir === '/') {
    $baseDir = '';
}
define('BASE_DIR', $baseDir);

function stripBaseDir($path) {
    // 1. Remove leading slashes and dots to normalize the incoming path
    $clean = ltrim($path, './\\');
    
    // 2. Normalize the base directory (removes the leading slash, e.g., "youtube")
    $baseDirName = ltrim(BASE_DIR, '/\\');
    
    if ($baseDirName !== '') {
        // 3. Case-insensitive check: does the path start with "youtube/" or "YouTube/"?
        if (stripos($clean, $baseDirName . '/') === 0) {
            // If yes, chop off the base folder name and the slash
            $clean = substr($clean, strlen($baseDirName) + 1);
        }
    }
    
    return ltrim($clean, '/\\');
}

require_once 'db.php';
require_once 'utils/MetadataParser.php';
require_once 'classes/FFmpegService.php';

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
        case 'start_cast_prep':
            handleStartCastPrep();
            break;
        case 'start_convert_prep':
            handleStartConvertPrep($pdo);
            break;
        case 'get_progress':
            handleGetProgress();
            break;
        case 'stop_prep':
            handleStopPrep();
            break;
        case 'finish_cast_prep':
            handleFinishCastPrep();
            break;
        case 'finish_convert_prep':
            handleFinishConvertPrep();
            break;
        case 'cast_probe':
            handleCastProbe();
            break;
        case 'cast_discover':
            handleCastDiscover();
            break;
        case 'cast_control':
            handleCastControl();
            break;
        case 'cast_stream':
            handleCastStream();
            break;
        case 'get_user_card':
            handleGetUserCard($pdo);
            break;
        case 'get_emotes':
            handleGetEmotes();
            break;
        case 'ytdlp_verify':
            handleYtdlpVerify();
            break;
        case 'ytdlp_update':
            handleYtdlpUpdate();
            break;
        case 'ytdlp_info':
            handleYtdlpInfo();
            break;
        case 'ytdlp_download':
            handleYtdlpDownload($pdo);
            break;
        case 'upload_file':
            handleUploadFile($pdo);
            break;
        case 'probe_video':
            handleProbeVideo($pdo);
            break;
        case 'convert_video':
            handleConvertVideo($pdo);
            break;
        case 'detect_subtitle':
            handleDetectSubtitle($pdo);
            break;
        case 'save_subtitle':
            handleSaveSubtitle($pdo);
            break;
        case 'remove_subtitle':
            handleRemoveSubtitle($pdo);
            break;
        case 'set_autoload':
            handleSetAutoload($pdo);
            break;
        case 'serve_subtitle':
            handleServeSubtitle($pdo);
            break;
        case 'save_subtitle_style':
            handleSaveSubtitleStyle($pdo);
            break;

        // ---- FFmpeg Converter ----
        case 'ffmpeg_verify':
            handleFfmpegVerify();
            break;
        case 'ffmpeg_info':
            handleFfmpegInfo();
            break;
        case 'ffmpeg_convert':
            handleFfmpegConvert();
            break;
        case 'ffmpeg_download':
            handleFfmpegDownload();
            break;
        case 'ffmpeg_cleanup':
            FFmpegService::cleanup();
            echo json_encode(['success' => true]);
            exit;
        case 'ffmpeg_analyze':
            $inputPath = $_POST['path'] ?? '';
            $type = $_POST['type'] ?? 'scenes';
            if (empty($inputPath)) {
                echo json_encode(['error' => 'No file provided']);
                exit;
            }
            echo json_encode(FFmpegService::analyze($inputPath, $type));
            exit;

        case 'ffmpeg_concat':
            $inputJson = $_POST['paths'] ?? '[]';
            $paths = json_decode($inputJson, true) ?: [];
            $rawOpts = $_POST['options'] ?? '{}';
            $opts = json_decode($rawOpts, true) ?: [];
            if (isset($_FILES['files'])) {
                $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
                if (!is_dir($tmpDir)) @mkdir($tmpDir, 0777, true);
                $files = $_FILES['files'];
                $count = is_array($files['name']) ? count($files['name']) : 1;
                for ($i = 0; $i < $count; $i++) {
                    if ($files['error'][$i] === UPLOAD_ERR_OK) {
                        $dest = $tmpDir . '/' . uniqid('concat_') . '_' . basename($files['name'][$i]);
                        move_uploaded_file($files['tmp_name'][$i], $dest);
                        $paths[] = $dest;
                    }
                }
            }
            FFmpegService::concat($paths, $opts);
            exit;

        case 'ffmpeg_split':
            $inputPath = $_POST['input'] ?? '';
            $segJson = $_POST['segments'] ?? '[]';
            $segments = json_decode($segJson, true) ?: [];
            if (empty($inputPath) || empty($segments)) {
                echo "data: " . json_encode(['type' => 'error', 'message' => 'Missing input or segments']) . "\n\n";
                flush(); exit;
            }
            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
                if (!is_dir($tmpDir)) @mkdir($tmpDir, 0777, true);
                $uploadPath = $tmpDir . '/' . uniqid('upload_') . '_' . basename($_FILES['file']['name']);
                move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath);
                $inputPath = $uploadPath;
            }
            $outDir = dirname(__DIR__) . '/uploads/ffmpeg_output';
            if (!is_dir($outDir)) @mkdir($outDir, 0777, true);
            FFmpegService::split($inputPath, $segments, $outDir);
            exit;

        // -- crawler presets
        case 'get_presets':
            handleGetPresets($pdo);
            break;
        case 'save_preset':
            handleSavePreset($pdo);
            break;
        case 'delete_preset':
            handleDeletePreset($pdo);
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
            $whereClauses[] = '(link LIKE :cat_link)';
            $params[':cat_link'] = '%/Video songs/%';
        } else if ($category === 'downloads') {
            $whereClauses[] = '(link LIKE :cat_link1 OR link LIKE :cat_link2 OR link LIKE :cat_link3)';
            $params[':cat_link1'] = '%/Downloads/%';
            $params[':cat_link2'] = '%/downloaded videos/%';
            $params[':cat_link3'] = '%/downloaded videos new/%';
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
    $uploaderInfo = [
        'id' => $_COOKIE['loggedusernum'] ?? 1,
        'name' => $_COOKIE['loggedusername'] ?? 'Admin',
        'img' => stripBaseDir($_COOKIE['loggeduserpic'] ?? BASE_DIR . '/Userdatabase/profilepic/defaulta.jpg'),
    ];

    $ffmpegPath = getFFmpegPath();
    $newVidIds = [];
    $videoExtensions = ['mp4', 'webm', 'mkv', 'avi'];

    foreach ($files as $file) {
        $result = processSingleVideo($pdo, $file, $uploaderInfo, $ffmpegPath, $videoExtensions, 'Discovered via crawler.');
        if ($result === false) { $skipped++; continue; }
        $newVidIds[] = $result['id'];
        $newVideosList[] = $result;
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

function processSingleVideo($pdo, $file, $uploaderInfo, $ffmpegPath, $videoExtensions, $description) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (!in_array($ext, $videoExtensions)) return false;
    if (!file_exists($file)) return false;

    $normalized = str_replace('\\', '/', $file);
    if (preg_match('/^([a-zA-Z]):\/(.*)$/', $normalized, $matches)) {
        $drive = $matches[1];
        $rest = $matches[2];
        $link = "file:///" . strtoupper($drive) . ":/" . $rest;
    } else {
        $link = "file:///" . str_replace('%', '%25', $normalized);
    }

    $checkStmt = $pdo->prepare("SELECT vid_id FROM video_metadatas WHERE link = :link");
    $checkStmt->execute([':link' => $link]);
    if ($checkStmt->fetch()) return false;

    $meta = MetadataParser::parse($file);
    $mtime = filemtime($file);
    $upload_date = date('Y-m-d', $mtime);
    $upload_time = date('H:i:s', $mtime);
    $filename = basename($file);

    $insertStmt = $pdo->prepare("
        INSERT INTO video_metadatas 
        (vid_name, link, uploader_id, uploader_name, uploader_img, likes, dislikes, duration, views, upload_date, upload_time, tags, subtitles, description, comments, filesize, width, height, aspect_ratio, bitrate, framerate, codec)
        VALUES 
        (:vid_name, :link, :uploader_id, :uploader_name, :uploader_img, 0, 0, :duration, 0, :upload_date, :upload_time, :tags, 'null', :description, 0, :filesize, :width, :height, :aspect_ratio, :bitrate, :framerate, :codec)
    ");

    $insertStmt->execute([
        ':vid_name' => $filename,
        ':link' => $link,
        ':uploader_id' => $uploaderInfo['id'],
        ':uploader_name' => $uploaderInfo['name'],
        ':uploader_img' => $uploaderInfo['img'],
        ':duration' => $meta['duration'],
        ':upload_date' => $upload_date,
        ':upload_time' => $upload_time,
        ':tags' => '',
        ':description' => $description,
        ':filesize' => $meta['filesize'],
        ':width' => $meta['width'],
        ':height' => $meta['height'],
        ':aspect_ratio' => $meta['aspect_ratio'],
        ':bitrate' => $meta['bitrate'],
        ':framerate' => $meta['framerate'],
        ':codec' => $meta['codec']
    ]);

    $newId = $pdo->lastInsertId();

    $thumbCreated = false;
    if ($ffmpegPath) {
        $thumbCreated = generateServerThumbnail($ffmpegPath, $file, $newId);
    }

    return [
        'id' => $newId,
        'name' => $filename,
        'duration' => $meta['duration'],
        'size' => $meta['filesize'],
        'thumbnail_created' => $thumbCreated
    ];
}

function cleanSourceUrl($rawUrl) {
    $rawUrl = trim($rawUrl);
    if (empty($rawUrl)) return $rawUrl;
    $parts = parse_url($rawUrl);
    if (!$parts || !isset($parts['host'])) return $rawUrl;

    $host = strtolower($parts['host']);
    $host = preg_replace('/^www\./', '', $host);

    // YouTube: extract video ID, strip everything else
    if (in_array($host, ['youtube.com', 'youtu.be'])) {
        $vid = '';
        if ($host === 'youtu.be') {
            $path = ltrim($parts['path'] ?? '', '/');
            $vid = explode('/', $path)[0];
        } else {
            if (isset($parts['query'])) {
                parse_str($parts['query'], $q);
                $vid = $q['v'] ?? '';
            }
        }
        if (!empty($vid) && preg_match('/^[a-zA-Z0-9_-]{11}$/', $vid)) {
            return 'https://www.youtube.com/watch?v=' . $vid;
        }
    }

    // For other sites, strip common tracking params
    $trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source', 'si'];
    if (isset($parts['query'])) {
        parse_str($parts['query'], $q);
        $cleanQ = array_diff_key($q, array_flip($trackingParams));
        $newQuery = http_build_query($cleanQ);
        $scheme = ($parts['scheme'] ?? 'https') . '://';
        $hostPart = $parts['host'];
        $pathPart = $parts['path'] ?? '';
        $result = $scheme . $hostPart . $pathPart;
        if (!empty($newQuery)) $result .= '?' . $newQuery;
        if (isset($parts['fragment'])) $result .= '#' . $parts['fragment'];
        return $result;
    }

    return $rawUrl;
}

function handleUploadFile($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $directory = $data['directory'] ?? '';
    $files = $data['files'] ?? [];

    if (empty($directory)) {
        throw new Exception('Directory path is required');
    }
    if (empty($files) || !is_array($files)) {
        throw new Exception('At least one file is required');
    }

    $directory = str_replace('\\', '/', $directory);
    $directory = rtrim($directory, '/') . '/';

    if (!is_dir($directory)) {
        throw new Exception("Directory does not exist: $directory");
    }

    $uploaderInfo = [
        'id' => $_COOKIE['loggedusernum'] ?? 1,
        'name' => $_COOKIE['loggedusername'] ?? 'Admin',
        'img' => stripBaseDir($_COOKIE['loggeduserpic'] ?? BASE_DIR . '/Userdatabase/profilepic/defaulta.jpg'),
    ];

    $ffmpegPath = getFFmpegPath();
    $videoExtensions = ['mp4', 'webm', 'mkv', 'avi'];
    $added = 0;
    $skipped = 0;
    $errors = [];
    $newVideosList = [];
    $newVidIds = [];

    foreach ($files as $filename) {
        $filePath = $directory . $filename;

        $result = processSingleVideo($pdo, $filePath, $uploaderInfo, $ffmpegPath, $videoExtensions, 'Uploaded via uploader.');
        if ($result === false) {
            $existsCheck = $pdo->prepare("SELECT vid_id FROM video_metadatas WHERE link = :link");
            $file = $filePath;
            $normalized = str_replace('\\', '/', $file);
            if (preg_match('/^([a-zA-Z]):\/(.*)$/', $normalized, $matches)) {
                $drive = $matches[1];
                $rest = $matches[2];
                $link = "file:///" . strtoupper($drive) . ":/" . $rest;
            } else {
                $link = "file:///" . str_replace('%', '%25', $normalized);
            }
            $existsCheck->execute([':link' => $link]);
            if ($existsCheck->fetch()) {
                $skipped++;
            } else {
                $errors[] = "Failed to process: $filename (file missing or unsupported format)";
            }
            continue;
        }
        $newVidIds[] = $result['id'];
        $newVideosList[] = $result;
        $added++;
    }

    if ($added > 0) {
        updatePlaylistsTable($pdo, $newVidIds);
    }

    echo json_encode([
        'success' => true,
        'added' => $added,
        'skipped' => $skipped,
        'errors' => $errors,
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

    // Delete associated thumbnail
    $thumbPath = dirname(__DIR__) . '/thumbnails/' . $id . '.jpg';
    if (file_exists($thumbPath)) {
        @unlink($thumbPath);
    }

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
    
    // Try to extract frame at 6 seconds
    $cmd = "$ffmpegPath -y -ss 00:00:06 -i " . escapeshellarg($inputPath) . " -vframes 1 -q:v 15 " . escapeshellarg($outputPath);
    
    $output = [];
    $returnVar = -1;
    @exec($cmd, $output, $returnVar);
    
    // Fallback: if 6s seek failed or produced no output (e.g. video shorter than 6s), try first frame
    if ($returnVar !== 0 || !file_exists($outputPath)) {
        $cmd = "$ffmpegPath -y -i " . escapeshellarg($inputPath) . " -vframes 1 -q:v 15 " . escapeshellarg($outputPath);
        @exec($cmd, $output, $returnVar);
    }
    
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

    // Audio-only formats that can never produce a video thumbnail
    $audioExtensions = ['mp3', 'm4a', 'wav', 'flac', 'ogg', 'aac', 'wma', 'opus'];

    $stmt = $pdo->query("SELECT vid_id, vid_name, link FROM video_metadatas ORDER BY vid_id");
    $allVideos = $stmt->fetchAll();

    $thumbDir = dirname(__DIR__) . '/thumbnails/';
    if (!is_dir($thumbDir)) {
        mkdir($thumbDir, 0777, true);
    }

    // Find all videos missing thumbnails on disk
    $missing = [];
    $skipped = 0;
    foreach ($allVideos as $video) {
        if (empty($video['link']) || intval($video['vid_id']) === 10) continue;
        
        $ext = strtolower(pathinfo($video['vid_name'], PATHINFO_EXTENSION));
        if (in_array($ext, $audioExtensions)) {
            $skipped++;
            continue;
        }
        
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
            'total' => $totalCount,
            'skipped_audio' => $skipped
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
        
        // Skip if video file doesn't exist on disk
        if (!file_exists($localPath)) {
            $failed++;
            $failedList[] = [
                'id' => $id,
                'name' => $name,
                'path' => $localPath,
                'reason' => 'file_not_found'
            ];
            continue;
        }
        
        $success = generateServerThumbnail($ffmpegPath, $localPath, $id);

        if ($success) {
            $generated++;
        } else {
            $failed++;
            $failedList[] = [
                'id' => $id,
                'name' => $name,
                'path' => $localPath,
                'reason' => 'ffmpeg_error'
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
        'skipped_audio' => $skipped,
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
    setcookie('loggedusername', $user['user_name'] ?? '', $expiry, '/');
    setcookie('loggedusernum', $user['user_num'] ?? '', $expiry, '/');
    setcookie('loggeduserpic', $user['user_pic'] ?? '', $expiry, '/');
    setcookie('loggeduserprivilege', $user['privilege'] ?? '', $expiry, '/');
    setcookie('loggeduserfirstname', $user['first_name'] ?? '', $expiry, '/');
    setcookie('loggeduserlastname', $user['last_name'] ?? '', $expiry, '/');
    setcookie('loggeduseruserdesc', $user['user_desc'] ?? '', $expiry, '/');

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

    $profilePic = stripBaseDir(BASE_DIR . '/Userdatabase/ProfilePic/default' . rand(1, 10) . '.jpg');
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
            $profilePic = stripBaseDir(BASE_DIR . '/Userdatabase/ProfilePic/' . $newFileName);
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
            $attachmentUrl = stripBaseDir(BASE_DIR . '/uploads/comments/' . $newFileName);
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
                'url' => stripBaseDir(BASE_DIR . '/uploads/emogies/' . rawurlencode($file))
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
            $profilePic = stripBaseDir(BASE_DIR . '/Userdatabase/ProfilePic/' . $newFileName);
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
    setcookie('loggedusername', $username ?? '', $expiry, '/');
    setcookie('loggeduserpic', $profilePic ?? '', $expiry, '/');
    setcookie('loggeduserfirstname', $firstName ?? '', $expiry, '/');
    setcookie('loggeduserlastname', $lastName ?? '', $expiry, '/');
    setcookie('loggeduseruserdesc', $description ?? '', $expiry, '/');

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

function detectGpuEncoder($ffmpegPath) {
    $encoders = [];
    exec($ffmpegPath . ' -encoders 2>&1', $encoders, $ec);
    $line = implode("\n", $encoders);
    if (strpos($line, 'h264_nvenc') !== false) return 'h264_nvenc';
    if (strpos($line, 'h264_qsv') !== false) return 'h264_qsv';
    if (strpos($line, 'h264_amf') !== false) return 'h264_amf';
    return 'libx264';
}

function evictCastCache($maxBytes) {
    $cacheDir = __DIR__ . '/../uploads/cast_cache';
    $files = glob($cacheDir . '/*.mp4');
    if (!$files) return;

    $totalSize = 0;
    foreach ($files as $f) {
        $totalSize += filesize($f);
    }

    if ($totalSize <= $maxBytes) return;

    usort($files, function($a, $b) {
        return fileatime($a) - fileatime($b);
    });

    foreach ($files as $f) {
        if ($totalSize <= $maxBytes) break;
        $totalSize -= filesize($f);
        @unlink($f);
    }
}

function execInBackground($cmd, $progressId) {
    $batchFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.bat';
    
    // Reroute the crash log directly into your youtube/uploads folder
    $logFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'ffmpeg_error.log';
    
    // Capture ALL output (stdout and stderr) to the log file
    $batchContent = '@echo off' . "\r\n"
        . 'title ffmpeg_' . $progressId . "\r\n"
        . $cmd . ' > "' . $logFile . '" 2>&1' . "\r\n"
        . 'del "%~f0"' . "\r\n"
        . 'exit' . "\r\n";
        
    file_put_contents($batchFile, $batchContent);
    
    if (class_exists('COM')) {
        try {
            $wsh = new COM('WScript.Shell');
            $wsh->Run('cmd /C "' . $batchFile . '"', 0, false);
            return;
        } catch (Throwable $e) {}
    }
    
    pclose(popen('start /B "" "' . $batchFile . '"', 'r'));
}

function stopBackgroundProcess($progressId) {
    exec('taskkill /F /FI "WINDOWTITLE eq ffmpeg_' . $progressId . '" 2> NUL', $out, $code);
    @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.bat');
    @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.txt');
    @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.dur');
}

function getDurationUs($localPath) {
    $ffprobePath = str_replace('"', '', getFFmpegPath());
    $ffprobePath = str_replace('ffmpeg.exe', 'ffprobe.exe', $ffprobePath);
    $durOut = [];
    exec($ffprobePath . ' -v error -show_entries format=duration -of csv=p=0 ' . escapeshellarg($localPath), $durOut, $durCode);
    if ($durCode === 0 && !empty($durOut[0])) {
        return intval(floatval(trim($durOut[0])) * 1000000);
    }
    return 0;
}

function probeCastMedia($localPath) {
    $ffmpegPath = getFFmpegPath();
    if (!$ffmpegPath) return ['error' => 'FFmpeg not found'];
    $ffprobePath = str_replace('ffmpeg.exe', 'ffprobe.exe', $ffmpegPath);

    $tempLink = getTempHardlink($localPath);
    $probePath = $tempLink ? $tempLink : $localPath;

    try {
        $vcmd = $ffprobePath . ' -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($probePath);
        $voutput = []; $vcode = -1;
        exec($vcmd, $voutput, $vcode);
        $videoCodec = ($vcode === 0 && !empty($voutput)) ? trim($voutput[0]) : 'unknown';

        $pixCmd = $ffprobePath . ' -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($probePath);
        $pixOut = []; $pixCode = -1;
        exec($pixCmd, $pixOut, $pixCode);
        $pixFmt = ($pixCode === 0 && !empty($pixOut[0])) ? trim($pixOut[0]) : '';
        $is10bit = preg_match('/p1[0-9]|1[0-9](le|be)/', $pixFmt);

        $acmd = $ffprobePath . ' -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate -of csv=p=0 ' . escapeshellarg($probePath);
        $aoutput = []; $acode = -1;
        exec($acmd, $aoutput, $acode);
        $audioCodec = ''; $audioChannels = 2; $audioSampleRate = 0;
        if ($acode === 0 && !empty($aoutput)) {
            $parts = explode(',', trim($aoutput[0]));
            $audioCodec = trim($parts[0] ?? '');
            
            // Handle cases where ffprobe omits channels (e.g., Opus returning "opus,48000")
            if (count($parts) === 2) {
                $audioChannels = 2; // Assume stereo fallback
                $audioSampleRate = intval(trim($parts[1]));
            } else {
                $audioChannels = isset($parts[1]) ? intval(trim($parts[1])) : 2;
                $audioSampleRate = isset($parts[2]) ? intval(trim($parts[2])) : 0;
            }
        }

        $ext = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));

        $needVideoTranscode = ($videoCodec !== 'h264' || $is10bit);
        $needAudioTranscode = !($audioCodec === 'aac' && $audioChannels <= 2 && $audioSampleRate > 0 && $audioSampleRate <= 48000);

        $cacheDir = __DIR__ . '/../uploads/cast_cache';
        if (!file_exists($cacheDir)) @mkdir($cacheDir, 0777, true);
        $fileHash = md5($localPath);
        $cachedFile = $cacheDir . '/' . $fileHash . '.mp4';
        $isCached = file_exists($cachedFile) && filesize($cachedFile) > 0;

        return [
            'cached' => $isCached,
            'video_codec' => $videoCodec,
            'video_bit_depth' => $is10bit ? '10-bit' : '8-bit',
            'video_ok' => !$needVideoTranscode,
            'audio_codec' => $audioCodec,
            'audio_channels' => $audioChannels,
            'audio_sample_rate' => $audioSampleRate,
            'audio_ok' => !$needAudioTranscode,
            'container' => $ext,
            'container_ok' => ($ext === 'mp4'),
        ];
    } finally {
        if ($tempLink && file_exists($tempLink)) @unlink($tempLink);
    }
}

function handleCastProbe() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $videoLink = $data['video_link'] ?? '';

    if (empty($videoLink)) {
        throw new Exception('Missing video_link parameter');
    }

    $localPath = resolveLocalFilePath($videoLink);
    if (!file_exists($localPath)) {
        throw new Exception('Video file not found on disk');
    }

    echo json_encode(probeCastMedia($localPath));
    exit;
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
    $cachedUrlPath = BASE_DIR . '/uploads/cast_cache/' . $fileHash . '.mp4';

    if (file_exists($cachedFile) && filesize($cachedFile) > 0) {
        return $cachedUrlPath;
    }

    // Create a temp hardlink with ASCII-only name to bypass Windows escapeshellarg()
    // corruption of special characters like !, %, and multi-byte Unicode
    $tempLink = getTempHardlink($localPath);
    $probePath = $tempLink ? $tempLink : $localPath;

    $transcodeReturnCode = -1;

    try {
        // Check video codec
        $videoCodec = '';
        $vcmd = $ffprobePath . ' -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($probePath);
        $voutput = [];
        exec($vcmd, $voutput, $vcode);
        if ($vcode !== 0 || empty($voutput)) {
            error_log("[cast] ffprobe video codec detection failed for: $localPath (exit=$vcode)");
        }
        if ($vcode === 0 && !empty($voutput)) {
            $videoCodec = trim($voutput[0]);
        }

        // Check audio codec, channels, and sample rate
        $audioCodec = '';
        $audioChannels = 2;
        $audioSampleRate = 0;
        $acmd = $ffprobePath . ' -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate -of csv=p=0 ' . escapeshellarg($probePath);
        $aoutput = [];
        exec($acmd, $aoutput, $acode);
        if ($acode !== 0 || empty($aoutput)) {
            error_log("[cast] ffprobe audio detection failed for: $localPath (exit=$acode)");
        }
        if ($acode === 0 && !empty($aoutput)) {
            $parts = explode(',', trim($aoutput[0]));
            $audioCodec = trim($parts[0] ?? '');
            
            // Handle cases where ffprobe omits channels (e.g., Opus returning "opus,48000")
            if (count($parts) === 2) {
                $audioChannels = 2; // Assume stereo fallback
                $audioSampleRate = intval(trim($parts[1]));
            } else {
                $audioChannels = isset($parts[1]) ? intval(trim($parts[1])) : 2;
                $audioSampleRate = isset($parts[2]) ? intval(trim($parts[2])) : 0;
            }
        }

        $ext = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));

        $needVideoTranscode = ($videoCodec !== 'h264');
        // DLNA-safe audio: AAC stereo ≤48kHz. TVs reject surround, high-sample-rate, or exotic codecs.
        $needAudioTranscode = !($audioCodec === 'aac' && $audioChannels <= 2 && $audioSampleRate > 0 && $audioSampleRate <= 48000);
        $needRemux = ($ext !== 'mp4');

        if (!$needVideoTranscode && !$needAudioTranscode && !$needRemux) {
            evictCastCache(500 * 1024 * 1024);
            if (!file_exists($cachedFile)) {
                @copy($localPath, $cachedFile);
            }
            if (file_exists($cachedFile) && filesize($cachedFile) > 0) {
                return $cachedUrlPath;
            }
            return null; // Fallback — couldn't cache
        }

        evictCastCache(500 * 1024 * 1024);

        if ($needVideoTranscode) {
            $encoder = detectGpuEncoder($ffmpegPath);
            $isGpu = ($encoder !== 'libx264');

            $vcmd2 = $ffprobePath . ' -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ' . escapeshellarg($probePath);
            $vdims = [];
            exec($vcmd2, $vdims, $vdc);
            $needScale = false;
            if ($vdc === 0 && !empty($vdims)) {
                $dims = explode(',', trim($vdims[0]));
                $w = intval($dims[0] ?? 0);
                $h = intval($dims[1] ?? 0);
                if ($w > 1920 || $h > 1080) {
                    $needScale = true;
                }
            }

            // Apply fast presets for detected GPU encoders
            if ($encoder === 'h264_nvenc') {
                $videoArgsGpu = '-c:v h264_nvenc -pix_fmt yuv420p -preset fast -rc vbr -cq:v 23 -b:v 8M -maxrate 10M -bufsize 16M';
            } elseif ($encoder === 'h264_qsv') {
                $videoArgsGpu = '-c:v h264_qsv -pix_fmt yuv420p -preset fast -b:v 8M -maxrate 10M -bufsize 16M';
            } elseif ($encoder === 'h264_amf') {
                $videoArgsGpu = '-c:v h264_amf -pix_fmt yuv420p -preset speed -b:v 8M -maxrate 10M -bufsize 16M';
            } else {
                $videoArgsGpu = '-c:v ' . $encoder . ' -pix_fmt yuv420p -b:v 8M -maxrate 10M -bufsize 16M';
            }
            $videoArgsCpu = '-c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -b:v 8M -maxrate 10M -bufsize 16M';
            $videoArgs = $isGpu ? $videoArgsGpu : $videoArgsCpu;

            $scaleArg = $needScale ? ' -vf "scale=\'min(1920,iw)\':\'min(1080,ih)\':force_original_aspect_ratio=decrease"' : '';

            $transcodeCmd = $ffmpegPath . ' -y -threads 0 -i ' . escapeshellarg($probePath)
                . ' ' . $videoArgs
                . $scaleArg
                . ' -r 30'
                . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart '
                . escapeshellarg($cachedFile);

            $transcodeOutput = [];
            exec($transcodeCmd, $transcodeOutput, $transcodeReturnCode);

            if ($transcodeReturnCode !== 0) {
                error_log("[cast] GPU transcode failed for: $localPath (encoder=$encoder)");
                error_log("[cast] ffmpeg output: " . implode("\n", $transcodeOutput));
            }

            if ($transcodeReturnCode !== 0 && $isGpu) {
                @unlink($cachedFile);
                $transcodeCmd = $ffmpegPath . ' -y -threads 0 -i ' . escapeshellarg($probePath)
                    . ' ' . $videoArgsCpu
                    . $scaleArg
                    . ' -r 30'
                    . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart '
                    . escapeshellarg($cachedFile);
                $transcodeOutput = [];
                exec($transcodeCmd, $transcodeOutput, $transcodeReturnCode);

                if ($transcodeReturnCode !== 0) {
                    error_log("[cast] CPU fallback transcode failed for: $localPath");
                    error_log("[cast] ffmpeg output: " . implode("\n", $transcodeOutput));
                }
            }
        } else {
            // Video is already H.264, no need to transcode video.
            // Always re-encode audio to AAC for DLNA compatibility.
            $transcodeCmd = $ffmpegPath . ' -y -i ' . escapeshellarg($probePath)
                . ' -c:v copy -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart '
                . escapeshellarg($cachedFile);
            $transcodeOutput = [];
            exec($transcodeCmd, $transcodeOutput, $transcodeReturnCode);

            if ($transcodeReturnCode !== 0) {
                error_log("[cast] Audio remux failed for: $localPath");
                error_log("[cast] ffmpeg output: " . implode("\n", $transcodeOutput));
            }
        }
    } finally {
        // Clean up temp hardlink
        if ($tempLink && file_exists($tempLink)) {
            @unlink($tempLink);
        }
    }

    if ($transcodeReturnCode === 0 && file_exists($cachedFile) && filesize($cachedFile) > 0) {
        return $cachedUrlPath;
    }

    return null;
}

function handleStartCastPrep() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $videoLink = $data['video_link'] ?? '';
    if (empty($videoLink)) throw new Exception('Missing video_link');

    $localPath = resolveLocalFilePath($videoLink);
    if (!file_exists($localPath)) throw new Exception('Video file not found');

    $ffmpegPath = getFFmpegPath();
    if (!$ffmpegPath) throw new Exception('FFmpeg not found');

    $cacheDir = __DIR__ . '/../uploads/cast_cache';
    if (!file_exists($cacheDir)) @mkdir($cacheDir, 0777, true);

    $fileHash = md5($localPath);
    $cachedFile = $cacheDir . '/' . $fileHash . '.mp4';
    $cachedUrl = BASE_DIR . '/uploads/cast_cache/' . $fileHash . '.mp4';

    // Already cached — instant
    if (file_exists($cachedFile) && filesize($cachedFile) > 0) {
        echo json_encode([
            'progress_id' => null,
            'cached' => true,
            'cached_url' => $cachedUrl,
            'diagnostics' => probeCastMedia($localPath),
        ]);
        exit;
    }

    $diagnostics = probeCastMedia($localPath);
    if (isset($diagnostics['error'])) throw new Exception($diagnostics['error']);

    // Get duration for percentage calc
    $durationUs = getDurationUs($localPath);

    $progressId = uniqid('cast_', true);
    $progressFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.txt';
    file_put_contents(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.dur', $durationUs);

    $tempLink = getTempHardlink($localPath);
    $probePath = $tempLink ? $tempLink : $localPath;

    evictCastCache(500 * 1024 * 1024);

    // Build ffmpeg command (replicating checkAndTranscodeMedia logic)
    $needVideoTranscode = !$diagnostics['video_ok'];
    $needAudioTranscode = !$diagnostics['audio_ok'];
    $needRemux = !$diagnostics['container_ok'];

    if ($needVideoTranscode) {
        $encoder = detectGpuEncoder($ffmpegPath);
        $isGpu = ($encoder !== 'libx264');

        $vcmd2 = $ffprobePath = str_replace('ffmpeg.exe', 'ffprobe.exe', str_replace('"', '', $ffmpegPath));
        $vcmd2 .= ' -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ' . escapeshellarg($probePath);
        $vdims = []; $vdc = -1;
        exec($vcmd2, $vdims, $vdc);
        $needScale = false;
        if ($vdc === 0 && !empty($vdims)) {
            $dims = explode(',', trim($vdims[0]));
            $w = intval($dims[0] ?? 0);
            $h = intval($dims[1] ?? 0);
            if ($w > 1920 || $h > 1080) $needScale = true;
        }

        if ($encoder === 'h264_nvenc') {
            $videoArgsGpu = '-c:v h264_nvenc -pix_fmt yuv420p -preset fast -rc vbr -cq:v 23 -b:v 8M -maxrate 10M -bufsize 16M';
        } elseif ($encoder === 'h264_qsv') {
            $videoArgsGpu = '-c:v h264_qsv -pix_fmt yuv420p -preset fast -b:v 8M -maxrate 10M -bufsize 16M';
        } elseif ($encoder === 'h264_amf') {
            $videoArgsGpu = '-c:v h264_amf -pix_fmt yuv420p -preset speed -b:v 8M -maxrate 10M -bufsize 16M';
        } else {
            $videoArgsGpu = '-c:v ' . $encoder . ' -pix_fmt yuv420p -b:v 8M -maxrate 10M -bufsize 16M';
        }
        $videoArgsCpu = '-c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -b:v 8M -maxrate 10M -bufsize 16M';
        $videoArgs = $isGpu ? $videoArgsGpu : $videoArgsCpu;
        $scaleArg = $needScale ? ' -vf "scale=\'min(1920,iw)\':\'min(1080,ih)\':force_original_aspect_ratio=decrease"' : '';

        $scaleArg = $needScale ? ' -vf "scale=\'min(1920,iw)\':\'min(1080,ih)\':force_original_aspect_ratio=decrease"' : '';

        // Pre-build CPU baseline fallback configuration
        $cmdCpu = $ffmpegPath . ' -y -threads 0 -progress ' . escapeshellarg($progressFile)
            . ' -i ' . escapeshellarg($probePath)
            . ' ' . $videoArgsCpu . $scaleArg
            . ' -r 30'
            . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart '
            . escapeshellarg($cachedFile);

        if ($needVideoTranscode && $isGpu) {
            $cmdGpu = $ffmpegPath . ' -y -threads 0 -progress ' . escapeshellarg($progressFile)
                . ' -i ' . escapeshellarg($probePath)
                . ' ' . $videoArgsGpu . $scaleArg
                . ' -r 30'
                . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart '
                . escapeshellarg($cachedFile);
            
            // If GPU chain fails (returns non-zero), instantly invoke CPU execution sequence
            $cmd = $cmdGpu . ' || ' . $cmdCpu;
        } else {
            $cmd = $cmdCpu;
        }
    } else {
        $cmd = $ffmpegPath . ' -y -progress ' . escapeshellarg($progressFile)
            . ' -i ' . escapeshellarg($probePath)
            . ($needAudioTranscode || $needRemux ? ' -c:v copy -c:a aac -ac 2 -ar 44100 -b:a 128k' : ' -c:v copy -c:a copy')
            . ' -movflags +faststart '
            . escapeshellarg($cachedFile);
    }

    // Inject a cleanup command into the background script so the file 
    // is deleted AFTER FFmpeg finishes, instead of PHP deleting it prematurely.
    if ($tempLink) {
        $cmd .= "\r\ndel \"" . $tempLink . "\" 2>NUL";
    }

    execInBackground($cmd, $progressId);

    echo json_encode([
        'progress_id' => $progressId,
        'cached' => false,
        'diagnostics' => $diagnostics,
    ]);
    exit;
}

function handleStartConvertPrep($pdo) {
    $id = intval($_POST['id'] ?? 0);
    $audioIndex = intval($_POST['audio_index'] ?? 0);
    $subtitleIndex = intval($_POST['subtitle_index'] ?? -1);
    if (!$id) throw new Exception('Missing video id');

    $stmt = $pdo->prepare("SELECT link, vid_name FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $localPath = resolveLocalFilePath($row['link']);
    if (!file_exists($localPath)) throw new Exception('Video file not found');

    $ffmpegPath = getFFmpegPath();
    if (!$ffmpegPath) throw new Exception('FFmpeg not found');
    $ffprobePath = str_replace('ffmpeg.exe', 'ffprobe.exe', str_replace('"', '', $ffmpegPath));

    $cacheDir = __DIR__ . '/../uploads/video_cache';
    if (!file_exists($cacheDir)) @mkdir($cacheDir, 0777, true);
    foreach (glob($cacheDir . DIRECTORY_SEPARATOR . '*') ?: [] as $f) { @unlink($f); }

    $suffix = uniqid();
    $outputMp4 = $cacheDir . DIRECTORY_SEPARATOR . "output_{$suffix}.mp4";
    $outputVtt = $cacheDir . DIRECTORY_SEPARATOR . "subtitles_{$suffix}.vtt";
    $publicMp4 = "./uploads/video_cache/output_{$suffix}.mp4";
    $publicVtt = "./uploads/video_cache/subtitles_{$suffix}.vtt";

    // Probe stage decisions
    $videoNeedsTranscode = false;
    $audioNeedsTranscode = false;

    $pixCmd = $ffprobePath . ' -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($localPath);
    $pixOut = []; $pixCode = -1;
    exec($pixCmd, $pixOut, $pixCode);
    if ($pixCode === 0 && !empty($pixOut[0])) {
        $pixFmt = trim($pixOut[0]);
        if (preg_match('/p1[0-9]|1[0-9](le|be)/', $pixFmt)) $videoNeedsTranscode = true;
    }

    $acCmd = $ffprobePath . ' -v error -select_streams a -show_entries stream=index,codec_name -of csv=p=0 ' . escapeshellarg($localPath);
    $acOut = []; $acCode = -1;
    exec($acCmd, $acOut, $acCode);
    if ($acCode === 0) {
        foreach ($acOut as $line) {
            $parts = explode(',', trim($line));
            $idx = intval($parts[0] ?? -1);
            $codec = $parts[1] ?? '';
            if ($idx === $audioIndex) {
                if (!in_array($codec, ['aac', 'mp3', 'ac3', 'eac3'])) $audioNeedsTranscode = true;
                break;
            }
        }
    }

    $durationUs = getDurationUs($localPath);
    $progressId = uniqid('conv_', true);
    $progressFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.txt';
    file_put_contents(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.dur', $durationUs);

    // Build command based on stage
    if (!$videoNeedsTranscode && !$audioNeedsTranscode) {
        $cmd = $ffmpegPath . ' -y -progress ' . escapeshellarg($progressFile)
            . ' -i ' . escapeshellarg($localPath)
            . ' -map 0:v:0 -map 0:' . $audioIndex
            . ' -c:v copy -c:a copy -movflags +faststart -map_metadata -1 '
            . escapeshellarg($outputMp4);
    } elseif (!$videoNeedsTranscode) {
        $cmd = $ffmpegPath . ' -y -progress ' . escapeshellarg($progressFile)
            . ' -i ' . escapeshellarg($localPath)
            . ' -map 0:v:0 -map 0:' . $audioIndex
            . ' -c:v copy -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart -map_metadata -1 '
            . escapeshellarg($outputMp4);
    } else {
        $encoder = detectGpuEncoder($ffmpegPath);
        $isGpu = ($encoder !== 'libx264');
        if ($encoder === 'h264_nvenc') {
            $videoArgs = '-c:v h264_nvenc -pix_fmt yuv420p -preset p1 -rc constqp -qp 28';
        } elseif ($encoder === 'h264_qsv') {
            $videoArgs = '-c:v h264_qsv -pix_fmt yuv420p -preset veryfast';
        } elseif ($encoder === 'h264_amf') {
            $videoArgs = '-c:v h264_amf -pix_fmt yuv420p -preset speed';
        } else {
            $videoArgs = '-c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p';
        }
        if (!$isGpu) $videoArgs = '-c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p';

        $cmdCpu = $ffmpegPath . ' -y -threads 0 -progress ' . escapeshellarg($progressFile)
            . ' -i ' . escapeshellarg($localPath)
            . ' -map 0:v:0 -map 0:' . $audioIndex
            . ' -c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p'
            . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart -map_metadata -1 '
            . escapeshellarg($outputMp4);

        if ($videoNeedsTranscode && isset($isGpu) && $isGpu) {
            $cmdGpu = $ffmpegPath . ' -y -threads 0 -progress ' . escapeshellarg($progressFile)
                . ' -i ' . escapeshellarg($localPath)
                . ' -map 0:v:0 -map 0:' . $audioIndex
                . ' ' . $videoArgs
                . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart -map_metadata -1 '
                . escapeshellarg($outputMp4);
                
            $cmd = $cmdGpu . ' || ' . $cmdCpu;
        } else {
            $cmd = $cmdCpu;
        }
    }

    execInBackground($cmd, $progressId);

    echo json_encode([
        'progress_id' => $progressId,
        'local_path' => $localPath,
        'output_mp4' => $outputMp4,
        'public_mp4' => $publicMp4,
        'output_vtt' => $outputVtt,
        'public_vtt' => $publicVtt,
        'has_subtitle' => ($subtitleIndex >= 0),
        'subtitle_index' => $subtitleIndex,
        'diagnostics' => [
            'video_ok' => !$videoNeedsTranscode,
            'audio_ok' => !$audioNeedsTranscode,
            'container' => strtolower(pathinfo($localPath, PATHINFO_EXTENSION)),
            'container_ok' => false,
        ],
    ]);
    exit;
}

function handleGetProgress() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $progressId = $data['progress_id'] ?? '';
    if (empty($progressId)) throw new Exception('Missing progress_id');

    $progressFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.txt';
    $durFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.dur';
    $batchFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.bat';

    $durationUs = intval(@file_get_contents($durFile) ?: 0);
    $outTimeUs = 0;
    $speed = '';
    $fps = '';
    $status = 'running';

    if (!file_exists($progressFile)) {
        // No progress file yet — ffmpeg may still be starting
        // Check if process is still alive by checking if batch file is being used
        if (!file_exists($batchFile)) {
            $status = 'error';
        }
        echo json_encode(['percent' => 0, 'speed' => '', 'fps' => '', 'status' => $status, 'elapsed' => 0, 'eta' => 0]);
        exit;
    }

    $lines = @file($progressFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        echo json_encode(['percent' => 0, 'speed' => '', 'fps' => '', 'status' => 'error', 'elapsed' => 0, 'eta' => 0]);
        exit;
    }

    foreach (array_reverse($lines) as $line) {
        if (preg_match('/^out_time_us=(\d+)$/', $line, $m)) {
            $outTimeUs = intval($m[1]);
            break;
        }
    }
    foreach (array_reverse($lines) as $line) {
        if (preg_match('/^speed=([\d.]+)x$/', $line, $m)) {
            $speed = $m[1] . 'x';
            break;
        }
    }
    foreach (array_reverse($lines) as $line) {
        if (preg_match('/^fps=([\d.]+)$/', $line, $m)) {
            $fps = $m[1];
            break;
        }
    }

    // Check if ended
    foreach (array_reverse($lines) as $line) {
        if (trim($line) === 'progress=end') {
            $status = 'done';
            break;
        }
    }

    // If progress=end not found but process may have ended (no batch file)
    if ($status === 'running' && !file_exists($batchFile)) {
        // If the progress file doesn't exist or is completely empty, it crashed
        if (!file_exists($progressFile) || filesize($progressFile) == 0) {
            $status = 'error';
        } else {
            $status = 'done';
        }
    }

    $elapsed = $outTimeUs > 0 ? round($outTimeUs / 1000000, 1) : 0;

    $percent = 0;
    $eta = 0;
    if ($durationUs > 0 && $outTimeUs > 0) {
        $percent = min(round($outTimeUs / $durationUs * 100, 1), 99.9);
        if (preg_match('/^([\d.]+)/', $speed, $sm) && floatval($sm[1]) > 0) {
            $remainingUs = $durationUs - $outTimeUs;
            $eta = round($remainingUs / ($outTimeUs / $elapsed) / 1000000);
        }
    }

    echo json_encode([
        'percent' => $percent,
        'speed' => $speed,
        'fps' => $fps,
        'status' => $status,
        'elapsed' => $elapsed,
        'eta' => max(0, $eta),
    ]);
    exit;
}

function handleStopPrep() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $progressId = $data['progress_id'] ?? '';
    if (empty($progressId)) throw new Exception('Missing progress_id');

    stopBackgroundProcess($progressId);
    echo json_encode(['status' => 'stopped']);
    exit;
}

function handleFinishCastPrep() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $videoLink = $data['video_link'] ?? '';
    $progressId = $data['progress_id'] ?? '';
    if (empty($videoLink)) throw new Exception('Missing video_link');

    $localPath = resolveLocalFilePath($videoLink);
    $cacheDir = __DIR__ . '/../uploads/cast_cache';
    $fileHash = md5($localPath);
    $cachedFile = $cacheDir . '/' . $fileHash . '.mp4';
    $cachedUrl = BASE_DIR . '/uploads/cast_cache/' . $fileHash . '.mp4';

    // Clean up temp files
    if ($progressId) {
        @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.txt');
        @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.dur');
        @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.bat');
    }

    if (!file_exists($cachedFile) || filesize($cachedFile) <= 0) {
        throw new Exception('Cast preparation produced no output');
    }

    echo json_encode([
        'cached_url' => $cachedUrl,
        'cached' => true,
        'diagnostics' => probeCastMedia($localPath),
    ]);
    exit;
}

function handleFinishConvertPrep() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    $progressId = $data['progress_id'] ?? '';
    $outputMp4 = $data['output_mp4'] ?? '';
    $outputVtt = $data['output_vtt'] ?? '';
    $publicMp4 = $data['public_mp4'] ?? '';
    $publicVtt = $data['public_vtt'] ?? '';
    $hasSubtitle = !empty($data['has_subtitle']);
    $subtitleIndex = intval($data['subtitle_index'] ?? -1);
    $localPath = $data['local_path'] ?? '';

    if ($progressId) {
        @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.txt');
        @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.dur');
        @unlink(sys_get_temp_dir() . DIRECTORY_SEPARATOR . $progressId . '.bat');
    }

    if (!file_exists($outputMp4) || filesize($outputMp4) <= 0) {
        throw new Exception('Conversion produced no output');
    }

    // Extract subtitle if requested
    $hasVtt = false;
    if ($hasSubtitle && $subtitleIndex >= 0 && !empty($localPath)) {
        $ffmpegPath = getFFmpegPath();
        if ($ffmpegPath) {
            $subCmd = $ffmpegPath . ' -y -i ' . escapeshellarg($localPath)
                . ' -map 0:' . $subtitleIndex
                . ' -c:s webvtt ' . escapeshellarg($outputVtt);
            $subOut = []; $subCode = -1;
            exec($subCmd . ' 2>&1', $subOut, $subCode);
            $hasVtt = ($subCode === 0 && file_exists($outputVtt) && filesize($outputVtt) > 0);
        }
    }

    echo json_encode([
        'mp4' => $publicMp4,
        'mp4_path' => $outputMp4,
        'vtt' => $hasVtt ? $publicVtt : null,
    ]);
    exit;
}

function handleCastControl() {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    $controlUrl = $data['control_url'] ?? '';
    $action = $data['action'] ?? '';
    $videoLink = $data['video_link'] ?? '';

    if (empty($controlUrl) || empty($action)) {
        throw new Exception('Missing control parameters');
    }

    $service = 'urn:schemas-upnp-org:service:AVTransport:1';
    $res;

    switch ($action) {
        case 'set_uri':
            $serverIp = $_GET['server_ip'] ?? $_SERVER['SERVER_ADDR'] ?? 'localhost';
            if (!filter_var($serverIp, FILTER_VALIDATE_IP)) {
                $serverIp = 'localhost';
            }
            $port = $_SERVER['SERVER_PORT'] ?? '80';
            $portSuffix = ($port === '80' || $port === '443') ? '' : ':' . $port;

            $finalMediaUrl = '';

            $preparedUrl = $data['prepared_url'] ?? '';
            if ($preparedUrl) {
                $fileName = basename($preparedUrl);
                $finalMediaUrl = "http://" . $serverIp . $portSuffix . BASE_DIR . "/uploads/cast_cache/" . $fileName;
            } else {
                $cachedPath = checkAndTranscodeMedia($videoLink);
                if ($cachedPath !== null) {
                    $fileName = basename($cachedPath);
                    $finalMediaUrl = "http://" . $serverIp . $portSuffix . BASE_DIR . "/uploads/cast_cache/" . $fileName;
                } else {
                    $localPath = resolveLocalFilePath($videoLink);
                    if (!file_exists($localPath)) {
                        throw new Exception('Video file not found on disk');
                    }
                    $fileHash = md5($localPath);
                    $fallbackCache = __DIR__ . '/../uploads/cast_cache/' . $fileHash . '.mp4';
                    if (!file_exists($fallbackCache)) {
                        if (!@link($localPath, $fallbackCache) && !@copy($localPath, $fallbackCache)) {
                            throw new Exception('Transcoding failed — could not prepare video for casting.');
                        }
                    }
                    if (file_exists($fallbackCache) && filesize($fallbackCache) > 0) {
                        $finalMediaUrl = "http://" . $serverIp . $portSuffix . BASE_DIR . "/uploads/cast_cache/" . $fileHash . '.mp4';
                    } else {
                        throw new Exception('Transcoding failed — could not prepare video for casting.');
                    }
                }
            }

            $title = $data['title'] ?? 'Video';
            $meta = '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/">' .
                    '<item id="0" parentID="0" restricted="1">' .
                    '<dc:title>' . htmlspecialchars($title) . '</dc:title>' .
                    '<upnp:class>object.item.videoItem.movie</upnp:class>' .
                    '<res protocolInfo="http-get:*:video/mp4:DLNA.ORG_PN=AVC_MP4_BL_L31_HD_AAC;DLNA.ORG_OP=11;DLNA.ORG_FLAGS=01700000000000000000000000000000">' . htmlspecialchars($finalMediaUrl) . '</res>' .
                    '</item>' .
                    '</DIDL-Lite>';

            // Stop any currently playing video first to clear UPnP state on older TV renderers
            @sendSOAPRequest($controlUrl, $service, 'Stop', []);

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
        case 'seek':
            $target = $data['target'] ?? '00:00:00';
            $res = sendSOAPRequest($controlUrl, $service, 'Seek', [
                'Unit' => 'REL_TIME',
                'Target' => $target
            ]);
            break;
        case 'get_position':
            $soapRes = sendSOAPRequest($controlUrl, $service, 'GetPositionInfo', []);
            $seconds = 0;
            $durationSeconds = 0;
            if ($soapRes['status'] === 'success' && !empty($soapRes['response'])) {
                if (preg_match('/<RelTime>(.*?)<\/RelTime>/i', $soapRes['response'], $m)) {
                    $relTime = trim($m[1]);
                    $parts = explode(':', $relTime);
                    if (count($parts) === 3) {
                        $seconds = intval($parts[0]) * 3600 + intval($parts[1]) * 60 + intval($parts[2]);
                    }
                }
                if (preg_match('/<TrackDuration>(.*?)<\/TrackDuration>/i', $soapRes['response'], $m)) {
                    $trackDur = trim($m[1]);
                    $parts = explode(':', $trackDur);
                    if (count($parts) === 3) {
                        $durationSeconds = intval($parts[0]) * 3600 + intval($parts[1]) * 60 + intval($parts[2]);
                    }
                }
            }
            echo json_encode([
                'status' => $soapRes['status'],
                'position' => $seconds,
                'duration' => $durationSeconds
            ]);
            exit;
        default:
            throw new Exception('Unsupported cast action');
    }

    echo json_encode($res);
    exit;
}

function handleCastStream() {
    $fileParam = $_GET['file'] ?? '';
    if (empty($fileParam)) {
        header('HTTP/1.1 400 Bad Request');
        exit('Missing file parameter');
    }

    $filePath = '';
    if (preg_match('/^[a-f0-9]{32}\.mp4$/i', $fileParam)) {
        $filePath = __DIR__ . '/../uploads/cast_cache/' . $fileParam;
    } else {
        $fileParam = str_replace(['..\\', '../', '\\\\', '//'], '', $fileParam);
        $fileParam = ltrim($fileParam, '/\\');
        
        // If it starts with a drive letter (e.g. D:), check it directly, otherwise map to workspace root
        if (preg_match('/^[a-zA-Z]:/i', $fileParam)) {
            $filePath = $fileParam;
        } else {
            $filePath = dirname(__DIR__) . '/' . $fileParam;
        }
    }

    if (empty($filePath) || !file_exists($filePath) || !is_file($filePath)) {
        header('HTTP/1.1 404 Not Found');
        exit('File not found: ' . $fileParam);
    }

    $size = filesize($filePath);
    $fp = @fopen($filePath, 'rb');
    if (!$fp) {
        header('HTTP/1.1 500 Internal Server Error');
        exit('Cannot open file');
    }

    header("Content-Type: video/mp4");
    header("Accept-Ranges: bytes");
    header("contentFeatures.dlna.org: DLNA.ORG_PN=AVC_MP4_BL_L31_HD_AAC;DLNA.ORG_OP=11;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000");
    header("transferMode.dlna.org: Streaming");
    header("realTimeInfo.dlna.org: DLNA.ORG_TLAG=*");
    header("Connection: close");

    $start = 0;
    $end = $size - 1;

    if (isset($_SERVER['HTTP_RANGE'])) {
        $c_start = $start;
        $c_end = $end;

        list(, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
        if (strpos($range, ',') !== false) {
            header('HTTP/1.1 416 Requested Range Not Satisfiable');
            header("Content-Range: bytes $start-$end/$size");
            exit;
        }
        if ($range == '-') {
            $c_start = $size - substr($range, 1);
        } else {
            $range = explode('-', $range);
            $c_start = $range[0];
            $c_end = (isset($range[1]) && is_numeric($range[1])) ? $range[1] : $size - 1;
        }
        $c_end = ($c_end > $end) ? $end : $c_end;
        if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
            header('HTTP/1.1 416 Requested Range Not Satisfiable');
            header("Content-Range: bytes $start-$end/$size");
            exit;
        }
        $start = $c_start;
        $end = $c_end;
        $length = $end - $start + 1;
        
        fseek($fp, $start);
        header('HTTP/1.1 206 Partial Content');
        header("Content-Range: bytes $start-$end/$size");
        header("Content-Length: " . $length);
    } else {
        header("Content-Length: " . $size);
    }

    @set_time_limit(0);

    while (ob_get_level()) {
        ob_end_clean();
    }

    if (isset($_SERVER['HTTP_RANGE'])) {
        fseek($fp, $start);
        fpassthru($fp);
    } else {
        fclose($fp);
        readfile($filePath);
    }

    exit;
}

// ----------------------------------------
// yt-dlp Helper Functions
// ----------------------------------------

function getYtdlpPath() {
    $localBin = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'yt-dlp.exe';
    if (file_exists($localBin)) return '"' . $localBin . '"';
    $output = []; $returnVar = -1;
    @exec('where yt-dlp 2>NUL', $output, $returnVar);
    if ($returnVar === 0 && !empty($output)) {
        $foundPath = trim($output[0]);
        if (file_exists($foundPath)) return '"' . $foundPath . '"';
        return 'yt-dlp';
    }
    return null;
}

function handleYtdlpVerify() {
    $path = getYtdlpPath();
    if (!$path) {
        echo json_encode(['installed' => false, 'version' => null, 'update_available' => false, 'error' => 'yt-dlp not found']);
        exit;
    }
    $versionOutput = []; $returnVar = -1;
    @exec("$path --version 2>NUL", $versionOutput, $returnVar);
    $currentVersion = $returnVar === 0 ? trim($versionOutput[0] ?? '') : null;
    $updateOutput = [];
    @exec("$path -U 2>&1", $updateOutput, $returnVar);
    $updateAvailable = false; $updateMessage = '';
    foreach ($updateOutput as $line) {
        if (stripos($line, 'update') !== false || stripos($line, 'already up to date') !== false) {
            $updateMessage = trim($line);
            if (stripos($line, 'already up to date') === false) $updateAvailable = true;
        }
    }
    echo json_encode(['installed' => true, 'version' => $currentVersion, 'update_available' => $updateAvailable, 'update_message' => $updateMessage]);
    exit;
}

function handleYtdlpUpdate() {
    $path = getYtdlpPath();
    if (!$path) { echo json_encode(['success' => false, 'error' => 'yt-dlp not found']); exit; }
    $output = []; $returnVar = -1;
    @exec("$path -U 2>&1", $output, $returnVar);
    $versionOutput = [];
    @exec("$path --version 2>NUL", $versionOutput, $returnVar);
    echo json_encode(['success' => $returnVar === 0, 'version' => $returnVar === 0 ? trim($versionOutput[0] ?? '') : null, 'message' => implode("\n", $output)]);
    exit;
}

function handleYtdlpInfo() {
    $url = $_POST['url'] ?? $_GET['url'] ?? '';
    if (empty($url)) { echo json_encode(['error' => 'No URL provided']); exit; }
    $path = getYtdlpPath();
    if (!$path) { echo json_encode(['error' => 'yt-dlp not found']); exit; }
    $cmd = $path . ' --dump-json --no-download --ignore-errors ' . escapeshellarg($url) . ' 2>NUL';
    $output = []; $returnVar = -1;
    @exec($cmd, $output, $returnVar);
    if ($returnVar !== 0 || empty($output)) { echo json_encode(['error' => 'Failed to fetch video info']); exit; }
    $data = json_decode($output[0], true);
    if (!$data) { echo json_encode(['error' => 'Failed to parse video information']); exit; }

    $formats = [];
    if (isset($data['formats']) && is_array($data['formats'])) {
        foreach ($data['formats'] as $fmt) {
            if (empty($fmt['vcodec']) && empty($fmt['acodec'])) continue;
            if (isset($fmt['vcodec']) && $fmt['vcodec'] === 'none' && isset($fmt['acodec']) && $fmt['acodec'] === 'none') continue;
            $formats[] = [
                'format_id' => $fmt['format_id'] ?? '',
                'ext' => $fmt['ext'] ?? 'unknown',
                'width' => $fmt['width'] ?? null,
                'height' => $fmt['height'] ?? null,
                'vcodec' => $fmt['vcodec'] ?? 'none',
                'acodec' => $fmt['acodec'] ?? 'none',
                'filesize' => $fmt['filesize'] ?? $fmt['filesize_approx'] ?? null,
                'fps' => $fmt['fps'] ?? null,
                'format_note' => $fmt['format_note'] ?? '',
                'has_audio' => !empty($fmt['acodec']) && $fmt['acodec'] !== 'none',
                'has_video' => !empty($fmt['vcodec']) && $fmt['vcodec'] !== 'none',
            ];
        }
    }

    $thumbnail = $data['thumbnail'] ?? '';
    if (isset($data['thumbnails']) && is_array($data['thumbnails'])) {
        $best = null;
        foreach ($data['thumbnails'] as $t) { if (!empty($t['url']) && (!$best || ($t['height'] ?? 0) > ($best['height'] ?? 0))) $best = $t; }
        if ($best) $thumbnail = $best['url'];
    }

    echo json_encode([
        'title' => $data['title'] ?? 'Unknown',
        'description' => mb_substr($data['description'] ?? '', 0, 300),
        'duration' => $data['duration'] ?? 0,
        'duration_string' => $data['duration'] ? gmdate('H:i:s', $data['duration']) : '0:00',
        'uploader' => $data['uploader'] ?? $data['channel'] ?? 'Unknown',
        'view_count' => $data['view_count'] ?? 0,
        'like_count' => $data['like_count'] ?? 0,
        'thumbnail' => $thumbnail,
        'formats' => $formats,
        'extractor' => $data['extractor'] ?? 'generic',
        'webpage_url' => $data['webpage_url'] ?? $url,
    ]);
    exit;
}

function handleYtdlpDownload($pdo = null) {
    $url = $_POST['url'] ?? '';
    $sourceUrl = $_POST['source_url'] ?? $url;
    $cleanUrl = cleanSourceUrl($sourceUrl);
    $format = $_POST['format'] ?? 'best';
    $destination = $_POST['destination'] ?? '';
    $filenameTemplate = $_POST['filename'] ?? '%(title)s.%(ext)s';

    if (empty($url)) { echo json_encode(['error' => 'No URL provided']); exit; }
    $path = getYtdlpPath();
    if (!$path) { echo json_encode(['error' => 'yt-dlp not found']); exit; }

    $outputDir = (!empty($destination) && is_dir($destination)) ? rtrim($destination, '\\/') : (dirname(__DIR__) . DIRECTORY_SEPARATOR . 'yt-dlp-downloads');
    if (!is_dir($outputDir)) mkdir($outputDir, 0777, true);

    $outputTemplate = $outputDir . DIRECTORY_SEPARATOR . $filenameTemplate;
    $infoFile = $outputDir . DIRECTORY_SEPARATOR . '_yt_name_' . uniqid() . '.txt';
    $extraArgs = $_POST['extra_args'] ?? '';
    $cmd = $path . ' -f ' . escapeshellarg($format) . ' -o "' . $outputTemplate . '" --print-to-file filename "' . $infoFile . '" --no-playlist --ignore-errors --no-warnings --no-mtime --progress --newline ' . $extraArgs . ' ' . escapeshellarg($url) . ' 2>&1';

    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');
    @set_time_limit(0);

    // Disable PHP output buffering so SSE events flush immediately
    @ini_set('output_buffering', '0');
    @ini_set('zlib.output_compression', 0);
    while (@ob_get_level() > 0) { @ob_end_flush(); }
    ob_implicit_flush(true);

    $descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
    $process = @proc_open($cmd, $descriptors, $pipes);
    if (!is_resource($process)) { echo "data: " . json_encode(['error' => 'Failed to start download']) . "\n\n"; flush(); exit; }

    fclose($pipes[0]);

    $destinationFile = '';
    $rawLines = '';
    while (!feof($pipes[1])) {
        $line = fgets($pipes[1]);
        if ($line === false) break;
        $line = trim($line);

        if (preg_match('/^\[download\]\s+Destination:\s+(.+)$/i', $line, $dm)) {
            $destinationFile = trim($dm[1]);
        } elseif (preg_match('/^\[download\]\s+(.+?)\s+has already been downloaded$/i', $line, $dm)) {
            $destinationFile = trim($dm[1]);
        } elseif (preg_match('/\[download\]\s+(\d+\.?\d*)%/', $line, $m)) {
            $speed = ''; $eta = '';
            if (preg_match('/at\s+([\d.]+\s*\w+B\/s)/', $line, $sm)) $speed = $sm[1];
            if (preg_match('/ETA\s+([\d:]+)/', $line, $em)) $eta = $em[1];
            echo "data: " . json_encode(['type' => 'progress', 'percent' => (float)$m[1], 'speed' => $speed, 'eta' => $eta]) . "\n\n";
            flush();
        } elseif (strpos($line, 'ERROR:') !== false) {
            echo "data: " . json_encode(['type' => 'error', 'message' => $line]) . "\n\n";
            flush();
        } else {
            $rawLines .= $line . "\n";
        }
    }
    fclose($pipes[1]); fclose($pipes[2]);
    $returnCode = proc_close($process);

    // Use --print-to-file output to get the correct filename (bypasses stdout encoding issues)
    $correctFile = '';
    if (file_exists($infoFile)) {
        $readName = trim(file_get_contents($infoFile));
        @unlink($infoFile);
        if (!empty($readName)) {
            $candidate = $outputDir . DIRECTORY_SEPARATOR . $readName;
            if (file_exists($candidate)) $correctFile = $candidate;
        }
    }
    if (!empty($correctFile)) {
        $destinationFile = $correctFile;
    } elseif (!empty($destinationFile) && !file_exists($destinationFile)) {
        // Last-resort fallback: scan directory for newest file
        $newest = ''; $newestTime = 0;
        foreach (glob($outputDir . DIRECTORY_SEPARATOR . '*') ?: [] as $cand) {
            if (basename($cand) === basename($infoFile)) continue;
            $t = @filemtime($cand);
            if ($t !== false && $t > $newestTime) { $newestTime = $t; $newest = $cand; }
        }
        if ($newest) $destinationFile = $newest;
    }

    if (!empty($destinationFile) && file_exists($destinationFile)) {
        $fs = filesize($destinationFile);
        $indexed = false;
        $vidId = null;
        $autoIndex = ($_POST['auto_index'] ?? '1') === '1';
        if ($pdo && $autoIndex) {
            $uploaderInfo = [
                'id' => $_COOKIE['loggedusernum'] ?? 1,
                'name' => $_COOKIE['loggedusername'] ?? 'Admin',
                'img' => stripBaseDir($_COOKIE['loggeduserpic'] ?? BASE_DIR . '/Userdatabase/profilepic/defaulta.jpg'),
            ];
            $desc = !empty($cleanUrl) ? 'source: ' . $cleanUrl : 'Downloaded via yt-dlp.';
            $result = processSingleVideo($pdo, $destinationFile, $uploaderInfo, getFFmpegPath(), ['mp4', 'webm', 'mkv', 'avi'], $desc);
            if ($result !== false) { $indexed = true; $vidId = $result['id']; }
        }
        echo "data: " . json_encode(['type' => 'done', 'file' => basename($destinationFile), 'size_formatted' => $fs > 1048576 ? round($fs / 1048576, 2) . ' MB' : round($fs / 1024, 2) . ' KB', 'indexed' => $indexed, 'vid_id' => $vidId]) . "\n\n";
    } elseif (!empty($destinationFile)) {
        echo "data: " . json_encode(['type' => 'error', 'message' => 'File not found on disk: ' . utf8_encode($destinationFile)]) . "\n\n";
    } else {
        $debug = !empty($rawLines) ? 'No Destination line found. Raw output: ' . substr($rawLines, 0, 2000) : 'No output from yt-dlp';
        echo "data: " . json_encode(['type' => 'error', 'message' => 'Download failed with code ' . $returnCode . '. ' . $debug]) . "\n\n";
    }
    flush();
    exit;
}

// ============================================================
// FFmpeg Converter Handlers
// ============================================================

function handleFfmpegVerify() {
    echo json_encode(FFmpegService::verify());
    exit;
}

function handleFfmpegInfo() {
    $input = '';
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
        if (!is_dir($tmpDir)) @mkdir($tmpDir, 0777, true);
        $input = $tmpDir . '/' . uniqid('upload_') . '_' . basename($_FILES['file']['name']);
        move_uploaded_file($_FILES['file']['tmp_name'], $input);
    } elseif (!empty($_POST['path'])) {
        $input = $_POST['path'];
        if (!file_exists($input)) {
            echo json_encode(['error' => 'File not found']);
            exit;
        }
    } else {
        echo json_encode(['error' => 'No file provided']);
        exit;
    }
    echo json_encode(FFmpegService::getMediaInfo($input));
    exit;
}

function handleFfmpegConvert() {
    $inputPath = $_POST['input'] ?? '';
    $rawOpts = $_POST['options'] ?? '{}';
    $opts = json_decode($rawOpts, true) ?: [];
    if (empty($inputPath)) {
        echo "data: " . json_encode(['type' => 'error', 'message' => 'No input file provided']) . "\n\n";
        flush(); exit;
    }

    // Handle uploaded file vs path
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
        if (!is_dir($tmpDir)) @mkdir($tmpDir, 0777, true);
        $uploadPath = $tmpDir . '/' . uniqid('upload_') . '_' . basename($_FILES['file']['name']);
        move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath);
        $inputPath = $uploadPath;
    }

    FFmpegService::convert($inputPath, $opts);
}

function handleFfmpegDownload() {
    $token = $_GET['token'] ?? '';
    FFmpegService::download($token);
}

function handleProbeVideo($pdo) {
    $id = intval($_GET['id'] ?? $_POST['id'] ?? 0);
    if (!$id) throw new Exception('Missing video id');

    $stmt = $pdo->prepare("SELECT link FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $localPath = resolveLocalFilePath($row['link']);
    if (!file_exists($localPath)) throw new Exception('Video file not found on disk');

    $ffprobePath = str_replace('"', '', getFFmpegPath());
    $ffprobePath = str_replace('ffmpeg.exe', 'ffprobe.exe', $ffprobePath);

    $cmd = $ffprobePath . ' -v error -print_format json -show_streams ' . escapeshellarg($localPath);
    $output = [];
    $code = -1;
    exec($cmd, $output, $code);
    if ($code !== 0) throw new Exception('Failed to probe video file');

    $ffprobeResult = json_decode(implode("\n", $output), true);
    if (!$ffprobeResult || !isset($ffprobeResult['streams'])) throw new Exception('Invalid ffprobe output');

    $videoCodec = '';
    $videoPixFmt = '';
    $container = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));
    $audioStreams = [];
    $subtitleStreams = [];

    foreach ($ffprobeResult['streams'] as $stream) {
        $codecType = $stream['codec_type'] ?? '';
        $index = $stream['index'] ?? 0;
        $codec = $stream['codec_name'] ?? '';
        $tags = $stream['tags'] ?? [];
        $language = $tags['language'] ?? 'und';
        $title = $tags['title'] ?? '';

        if ($codecType === 'video') {
            $videoCodec = $codec;
            if (empty($videoPixFmt)) $videoPixFmt = $stream['pix_fmt'] ?? '';
        } elseif ($codecType === 'audio') {
            $audioStreams[] = [
                'index' => $index,
                'codec' => $codec,
                'language' => $language,
                'channels' => intval($stream['channels'] ?? 0),
                'title' => $title,
            ];
        } elseif ($codecType === 'subtitle') {
            $isBitmap = in_array($codec, ['hdmv_pgs_subtitle', 'dvd_subtitle', 'dvb_subtitle', 'xsub']);
            $subtitleStreams[] = [
                'index' => $index,
                'codec' => $codec,
                'language' => $language,
                'title' => $title,
                'type' => $isBitmap ? 'bitmap' : 'text',
            ];
        }
    }

    echo json_encode([
        'video_codec' => $videoCodec,
        'container' => $container,
        'copy_safe' => in_array($videoCodec, ['h264', 'hevc', 'h265'])
            && !preg_match('/p1[0-9]|1[0-9](le|be)/', $videoPixFmt),
        'video_pix_fmt' => $videoPixFmt,
        'audio_streams' => $audioStreams,
        'subtitle_streams' => $subtitleStreams,
    ]);
    exit;
}

function handleConvertVideo($pdo) {
    $id = intval($_POST['id'] ?? 0);
    $audioIndex = intval($_POST['audio_index'] ?? 0);
    $subtitleIndex = intval($_POST['subtitle_index'] ?? -1);
    if (!$id) throw new Exception('Missing video id');

    $stmt = $pdo->prepare("SELECT link, vid_name FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $localPath = resolveLocalFilePath($row['link']);
    if (!file_exists($localPath)) throw new Exception('Video file not found on disk');

    $ffmpegPath = getFFmpegPath();

    $cacheDir = __DIR__ . '/../uploads/video_cache';
    if (!file_exists($cacheDir)) @mkdir($cacheDir, 0777, true);

    // Best-effort cleanup of old cache (may fail if files are locked)
    foreach (glob($cacheDir . DIRECTORY_SEPARATOR . '*') ?: [] as $f) {
        @unlink($f);
    }

    // Use unique filenames so locked old files don't block new conversions
    $suffix = uniqid();
    $outputMp4 = $cacheDir . DIRECTORY_SEPARATOR . "output_{$suffix}.mp4";
    $outputVtt = $cacheDir . DIRECTORY_SEPARATOR . "subtitles_{$suffix}.vtt";
    $publicMp4 = "./uploads/video_cache/output_{$suffix}.mp4";
    $publicVtt = "./uploads/video_cache/subtitles_{$suffix}.vtt";

    // Probe to decide which tier of processing is needed
    $videoNeedsTranscode = false;
    $audioNeedsTranscode = false;
    $ffprobePath = str_replace('"', '', $ffmpegPath);
    $ffprobePath = str_replace('ffmpeg.exe', 'ffprobe.exe', $ffprobePath);

    // Check video: high bit depth (10-bit+) requires re-encode
    $pixCmd = $ffprobePath . ' -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($localPath);
    $pixOut = []; $pixCode = -1;
    exec($pixCmd, $pixOut, $pixCode);
    if ($pixCode === 0 && !empty($pixOut[0])) {
        $pixFmt = trim($pixOut[0]);
        if (preg_match('/p1[0-9]|1[0-9](le|be)/', $pixFmt)) {
            $videoNeedsTranscode = true;
        }
    }

    // Check audio: non-AAC/MP3/AC3 codecs need re-encode for browser playback in MP4
    $acCmd = $ffprobePath . ' -v error -select_streams a -show_entries stream=index,codec_name -of csv=p=0 ' . escapeshellarg($localPath);
    $acOut = []; $acCode = -1;
    exec($acCmd, $acOut, $acCode);
    if ($acCode === 0) {
        $audioCodec = '';
        foreach ($acOut as $line) {
            $parts = explode(',', trim($line));
            $idx = intval($parts[0] ?? -1);
            $codec = $parts[1] ?? '';
            if ($idx === $audioIndex) { $audioCodec = $codec; break; }
        }
        if (!in_array($audioCodec, ['aac', 'mp3', 'ac3', 'eac3'])) {
            $audioNeedsTranscode = true;
        }
    }

    $remuxOutput = [];
    $remuxCode = -1;

    // ---------- Stage 1: Copy both (remux) ----------
    if (!$videoNeedsTranscode && !$audioNeedsTranscode) {
        $remuxCmd = $ffmpegPath . ' -y -i ' . escapeshellarg($localPath)
            . ' -map 0:v:0 -map 0:' . $audioIndex
            . ' -c:v copy -c:a copy -movflags +faststart'
            . ' -map_metadata -1'
            . ' ' . escapeshellarg($outputMp4);
        exec($remuxCmd . ' 2>&1', $remuxOutput, $remuxCode);
    }

    // ---------- Stage 2: Copy video + re-encode audio only ----------
    if ($remuxCode !== 0 && !$videoNeedsTranscode) {
        $remuxCmd = $ffmpegPath . ' -y -i ' . escapeshellarg($localPath)
            . ' -map 0:v:0 -map 0:' . $audioIndex
            . ' -c:v copy'
            . ' -c:a aac -ac 2 -ar 44100 -b:a 128k'
            . ' -movflags +faststart'
            . ' -map_metadata -1'
            . ' ' . escapeshellarg($outputMp4);
        $remuxOutput = [];
        $remuxCode = -1;
        exec($remuxCmd . ' 2>&1', $remuxOutput, $remuxCode);
    }

    // ---------- Stage 3: Full transcode (video + audio) ----------
    if ($remuxCode !== 0) {
        $encoder = detectGpuEncoder($ffmpegPath);
        $isGpu = ($encoder !== 'libx264');

        if ($encoder === 'h264_nvenc') {
            $videoArgsGpu = '-c:v h264_nvenc -pix_fmt yuv420p -preset p1 -rc constqp -qp 28';
        } elseif ($encoder === 'h264_qsv') {
            $videoArgsGpu = '-c:v h264_qsv -pix_fmt yuv420p -preset veryfast';
        } elseif ($encoder === 'h264_amf') {
            $videoArgsGpu = '-c:v h264_amf -pix_fmt yuv420p -preset speed';
        } else {
            $videoArgsGpu = '';
        }
        $videoArgsCpu = '-c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p';
        $videoArgs = $isGpu ? $videoArgsGpu : $videoArgsCpu;

        $transcodeCmd = $ffmpegPath . ' -y -threads 0 -i ' . escapeshellarg($localPath)
            . ' -map 0:v:0 -map 0:' . $audioIndex
            . ' ' . $videoArgs
            . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart'
            . ' -map_metadata -1'
            . ' ' . escapeshellarg($outputMp4);
        $remuxOutput = [];
        $remuxCode = -1;
        exec($transcodeCmd . ' 2>&1', $remuxOutput, $remuxCode);

        if ($remuxCode !== 0) {
            error_log("[convert] GPU transcode failed for: " . $row['link'] . " (encoder=$encoder)");
        }

        // GPU → CPU fallback
        if ($remuxCode !== 0 && $isGpu) {
            @unlink($outputMp4);
            $transcodeCmd = $ffmpegPath . ' -y -threads 0 -i ' . escapeshellarg($localPath)
                . ' -map 0:v:0 -map 0:' . $audioIndex
                . ' ' . $videoArgsCpu
                . ' -c:a aac -ac 2 -ar 44100 -b:a 128k -movflags +faststart'
                . ' -map_metadata -1'
                . ' ' . escapeshellarg($outputMp4);
            $remuxOutput = [];
            $remuxCode = -1;
            exec($transcodeCmd . ' 2>&1', $remuxOutput, $remuxCode);

            if ($remuxCode !== 0) {
                error_log("[convert] CPU fallback transcode failed for: " . $row['link']);
            }
        }

        if ($remuxCode !== 0) {
            throw new Exception('Conversion failed: ' . implode("\n", array_slice($remuxOutput, -5)));
        }
    }

    // Extract subtitle if requested (use global stream index)
    $hasVtt = false;
    if ($subtitleIndex >= 0) {
        $subCmd = $ffmpegPath . ' -y -i ' . escapeshellarg($localPath)
            . ' -map 0:' . $subtitleIndex
            . ' -c:s webvtt'
            . ' ' . escapeshellarg($outputVtt);
        $subOutput = [];
        $subCode = -1;
        exec($subCmd . ' 2>&1', $subOutput, $subCode);
        $hasVtt = ($subCode === 0 && file_exists($outputVtt) && filesize($outputVtt) > 0);
    }

    echo json_encode([
        'mp4' => $publicMp4,
        'mp4_path' => $outputMp4,
        'vtt' => $hasVtt ? $publicVtt : null,
    ]);
    exit;
}

// ----------------------------------------
// Subtitle Management
// ----------------------------------------

function handleDetectSubtitle($pdo) {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) throw new Exception('Missing video id');

    $stmt = $pdo->prepare("SELECT link FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $localPath = resolveLocalFilePath($row['link']);
    $candidateDir = null;
    $candidateName = null;
    $autoExists = null;
    if ($localPath && file_exists($localPath)) {
        $candidateDir = dirname($localPath);
        $base = pathinfo($localPath, PATHINFO_FILENAME);
        $candidateName = $base;
        foreach (['.vtt', '.srt'] as $ext) {
            $candidate = $candidateDir . DIRECTORY_SEPARATOR . $base . $ext;
            if (file_exists($candidate)) {
                $autoExists = $candidate;
                break;
            }
        }
    }

    // Decode current subtitle data from DB
    $stmt2 = $pdo->prepare("SELECT subtitles FROM video_metadatas WHERE vid_id = :id");
    $stmt2->execute([':id' => $id]);
    $row2 = $stmt2->fetch();
    $subtitles = json_decode($row2['subtitles'] ?? 'null', true);
    if (!is_array($subtitles)) {
        $subtitles = ['autoload' => false, 'tracks' => [], 'style' => null];
    } else {
        $subtitles = migrateLegacySubtitles($subtitles);
    }

    echo json_encode([
        'candidate_dir' => $candidateDir,
        'candidate_name' => $candidateName,
        'auto_exists' => $autoExists,
        'tracks' => $subtitles['tracks'] ?? [],
        'autoload' => $subtitles['autoload'] ?? false,
        'style' => $subtitles['style'] ?? null,
    ]);
    exit;
}

function migrateLegacySubtitles($subtitles) {
    if (!is_array($subtitles) || isset($subtitles['tracks'])) return $subtitles;
    if (!isset($subtitles['subs']) || !is_array($subtitles['subs'])) {
        return ['autoload' => false, 'tracks' => []];
    }
    $tracks = [];
    foreach ($subtitles['subs'] as $lang => $subData) {
        $path = $subData['url'] ?? '';
        if ($path && $path !== 'url1' && $path !== 'url2') {
            $loc = $subtitles['loc'] ?? '';
            if ($loc && strpos($path, '/') !== 0 && strpos($path, ':') === false) {
                $path = rtrim($loc, '/') . '/' . $path;
            }
        }
        $tracks[] = [
            'lang' => $lang,
            'label' => strtoupper($lang),
            'path' => $path,
        ];
    }
    return [
        'autoload' => !empty($subtitles['autosubs']),
        'tracks' => $tracks,
        'style' => $subtitles['style'] ?? null,
    ];
}

function handleSaveSubtitle($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $id = intval($_POST['id'] ?? 0);
    $lang = trim($_POST['lang'] ?? '');
    $label = trim($_POST['label'] ?? '');
    $mode = $_POST['mode'] ?? 'path';
    if (!$id) throw new Exception('Missing video id');
    if (empty($lang)) throw new Exception('Language code is required');
    if (empty($label)) throw new Exception('Label is required');

    // Fetch current subtitles JSON
    $stmt = $pdo->prepare("SELECT subtitles FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $subtitles = json_decode($row['subtitles'] ?? 'null', true);
    $subtitles = migrateLegacySubtitles($subtitles);

    $path = '';

    if ($mode === 'upload') {
        // Upload mode
        if (!isset($_FILES['subtitle_file']) || $_FILES['subtitle_file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Subtitle file upload failed');
        }
        $uploadDir = __DIR__ . '/../uploads/subtitles';
        if (!file_exists($uploadDir)) @mkdir($uploadDir, 0777, true);

        $tmpPath = $_FILES['subtitle_file']['tmp_name'];
        $origName = $_FILES['subtitle_file']['name'];
        $origExt = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        if (!in_array($origExt, ['vtt', 'srt'])) {
            throw new Exception('Only .vtt and .srt files are accepted');
        }

        $safeLabel = preg_replace('/[^a-zA-Z0-9_-]/', '_', $label);
        $destName = $id . '.' . $lang . '.' . $safeLabel . '.vtt';
        $destPath = $uploadDir . DIRECTORY_SEPARATOR . $destName;

        if ($origExt === 'srt') {
            $srtContent = file_get_contents($tmpPath);
            $vttContent = "WEBVTT\n\n" . preg_replace('/^(\d+)\s*$/m', '', $srtContent);
            $vttContent = preg_replace(
                '/^(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/m',
                '$1.$2 --> $3.$4',
                $vttContent
            );
            file_put_contents($destPath, $vttContent);
        } else {
            move_uploaded_file($tmpPath, $destPath);
        }

        $path = realpath($destPath);
        if ($path === false) throw new Exception('Failed to resolve uploaded file path');
    } else {
        // Path mode
        $path = trim($_POST['path'] ?? '');
        if (empty($path)) throw new Exception('Subtitle file path is required');
        if (!file_exists($path)) throw new Exception('Subtitle file does not exist: ' . $path);
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (!in_array($ext, ['vtt', 'srt'])) {
            throw new Exception('Only .vtt and .srt files are accepted');
        }
    }

    // Replace by label, or append
    $tracks = $subtitles['tracks'];
    $found = false;
    foreach ($tracks as &$track) {
        if ($track['label'] === $label) {
            $track['lang'] = $lang;
            $track['path'] = $path;
            $found = true;
            break;
        }
    }
    unset($track);
    if (!$found) {
        $tracks[] = ['lang' => $lang, 'label' => $label, 'path' => $path];
    }
    $subtitles['tracks'] = $tracks;

    $json = json_encode($subtitles);
    $updateStmt = $pdo->prepare("UPDATE video_metadatas SET subtitles = :subs WHERE vid_id = :id");
    $updateStmt->execute([':subs' => $json, ':id' => $id]);

    echo json_encode(['success' => true, 'tracks' => $tracks, 'autoload' => $subtitles['autoload']]);
    exit;
}

function handleRemoveSubtitle($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $id = intval($_POST['id'] ?? 0);
    $label = trim($_POST['label'] ?? '');
    if (!$id) throw new Exception('Missing video id');
    if (empty($label)) throw new Exception('Label is required');

    $stmt = $pdo->prepare("SELECT subtitles FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $subtitles = json_decode($row['subtitles'] ?? 'null', true);
    $subtitles = migrateLegacySubtitles($subtitles);

    $tracks = $subtitles['tracks'];
    $removedPath = null;
    $newTracks = [];
    foreach ($tracks as $track) {
        if ($track['label'] === $label) {
            $removedPath = $track['path'] ?? null;
        } else {
            $newTracks[] = $track;
        }
    }
    $subtitles['tracks'] = $newTracks;
    if (empty($newTracks)) {
        $subtitles['autoload'] = false;
    }

    // Delete uploaded file if it was in our uploads directory
    if ($removedPath) {
        $realPath = realpath($removedPath);
        $uploadsDir = realpath(__DIR__ . '/../uploads/subtitles');
        if ($realPath && $uploadsDir && strpos($realPath, $uploadsDir) === 0 && file_exists($realPath)) {
            @unlink($realPath);
        }
    }

    $json = json_encode($subtitles);
    $updateStmt = $pdo->prepare("UPDATE video_metadatas SET subtitles = :subs WHERE vid_id = :id");
    $updateStmt->execute([':subs' => $json, ':id' => $id]);

    echo json_encode(['success' => true, 'tracks' => $newTracks, 'autoload' => $subtitles['autoload']]);
    exit;
}

function handleSetAutoload($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $id = intval($_POST['id'] ?? 0);
    $autoload = !empty($_POST['autoload']);
    if (!$id) throw new Exception('Missing video id');

    $stmt = $pdo->prepare("SELECT subtitles FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $subtitles = json_decode($row['subtitles'] ?? 'null', true);
    $subtitles = migrateLegacySubtitles($subtitles);

    $subtitles['autoload'] = $autoload;
    $json = json_encode($subtitles);
    $updateStmt = $pdo->prepare("UPDATE video_metadatas SET subtitles = :subs WHERE vid_id = :id");
    $updateStmt->execute([':subs' => $json, ':id' => $id]);

    echo json_encode(['success' => true, 'autoload' => $autoload]);
    exit;
}

function handleSaveSubtitleStyle($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required');
    }

    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    if (!$data || !isset($data['style'])) throw new Exception('Missing style data');
    $id = intval($data['id'] ?? 0);
    if (!$id) throw new Exception('Missing video id');
    $style = $data['style'];

    $stmt = $pdo->prepare("SELECT subtitles FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $subtitles = json_decode($row['subtitles'] ?? 'null', true);
    if (!is_array($subtitles)) {
        $subtitles = ['autoload' => false, 'tracks' => []];
    } else {
        $subtitles = migrateLegacySubtitles($subtitles);
    }

    $subtitles['style'] = $style;
    $json = json_encode($subtitles);
    $updateStmt = $pdo->prepare("UPDATE video_metadatas SET subtitles = :subs WHERE vid_id = :id");
    $updateStmt->execute([':subs' => $json, ':id' => $id]);

    echo json_encode(['success' => true]);
    exit;
}

function handleServeSubtitle($pdo) {
    $id = intval($_GET['id'] ?? 0);
    $lang = trim($_GET['lang'] ?? '');
    if (!$id || empty($lang)) throw new Exception('Missing video id or language');

    $stmt = $pdo->prepare("SELECT subtitles FROM video_metadatas WHERE vid_id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Video not found');

    $subtitles = json_decode($row['subtitles'] ?? 'null', true);
    if (!is_array($subtitles) || !isset($subtitles['tracks'])) {
        header('HTTP/1.1 404 Not Found');
        echo 'No subtitles available';
        exit;
    }

    $path = null;
    foreach ($subtitles['tracks'] as $track) {
        if ($track['lang'] === $lang && !empty($track['path'])) {
            $path = $track['path'];
            break;
        }
    }

    if (!$path || !file_exists($path)) {
        header('HTTP/1.1 404 Not Found');
        echo 'Subtitle file not found';
        exit;
    }

    $delDouble = !empty($subtitles['style']['delDouble']);

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'srt') {
        $srtContent = file_get_contents($path);
        $vttContent = "WEBVTT\n\n" . preg_replace('/^(\d+)\s*$/m', '', $srtContent);
        $vttContent = preg_replace(
            '/^(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/m',
            '$1.$2 --> $3.$4',
            $vttContent
        );
    } else {
        $vttContent = file_get_contents($path);
    }

    if ($delDouble) {
        $vttContent = removeDuplicateVttCues($vttContent);
    }

    header('Content-Type: text/vtt; charset=utf-8');
    header('Content-Disposition: inline; filename="subtitles.vtt"');
    header('Cache-Control: ' . ($delDouble ? 'no-cache' : 'public, max-age=3600'));
    echo $vttContent;
    exit;
}

function removeDuplicateVttCues($vtt) {
    $lines = preg_split('/\r?\n/', $vtt);
    $result = [];
    $prevText = '';
    $inCue = false;
    $currentCueLines = [];
    $currentTiming = '';
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if (preg_match('/^(\d{2}:)?\d{2}:\d{2}[.,]\d{3}\s*-->\s*(\d{2}:)?\d{2}:\d{2}[.,]\d{3}/', $trimmed)) {
            // Flush previous cue (blank if duplicate)
            if ($currentTiming !== '') {
                $result[] = $currentTiming;
                if (!empty($currentCueLines)) {
                    $cueText = implode("\n", $currentCueLines);
                    $plain = strtolower(strip_tags($cueText));
                    if ($plain !== $prevText) {
                        foreach ($currentCueLines as $cl) $result[] = $cl;
                        $prevText = $plain;
                    }
                }
                $result[] = '';
            }
            $currentTiming = $trimmed;
            $currentCueLines = [];
            $inCue = true;
        } elseif ($inCue) {
            if ($trimmed === '') {
                // End of cue — blank if duplicate
                $result[] = $currentTiming;
                if (!empty($currentCueLines)) {
                    $cueText = implode("\n", $currentCueLines);
                    $plain = strtolower(strip_tags($cueText));
                    if ($plain !== $prevText) {
                        foreach ($currentCueLines as $cl) $result[] = $cl;
                        $prevText = $plain;
                    }
                }
                $result[] = '';
                $currentTiming = '';
                $currentCueLines = [];
                $inCue = false;
            } else {
                $currentCueLines[] = $line;
            }
        } else {
            $result[] = $line;
        }
    }
    // Last cue
    if ($currentTiming !== '') {
        $result[] = $currentTiming;
        if (!empty($currentCueLines)) {
            $cueText = implode("\n", $currentCueLines);
            $plain = strtolower(strip_tags($cueText));
            if ($plain !== $prevText) {
                foreach ($currentCueLines as $cl) $result[] = $cl;
            }
        }
        $result[] = '';
    }
    return implode("\n", $result);
}

function handleGetPresets($pdo) {
    $stmt = $pdo->query("SELECT id, preset_name, target_url FROM crawler_presets ORDER BY id ASC");
    $presets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($presets);
    exit;
}

function handleSavePreset($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('POST method required');
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = trim($data['preset_name'] ?? '');
    $url = trim($data['target_url'] ?? '');

    if ($name === '' || $url === '') throw new Exception('Preset name and target URL are required');

    $stmt = $pdo->prepare("INSERT INTO crawler_presets (preset_name, target_url) VALUES (:name, :url)");
    $stmt->execute([':name' => $name, ':url' => $url]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

function handleDeletePreset($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('POST method required');
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);

    if ($id <= 0) throw new Exception('Valid ID required');

    $stmt = $pdo->prepare("DELETE FROM crawler_presets WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true]);
    exit;
}
