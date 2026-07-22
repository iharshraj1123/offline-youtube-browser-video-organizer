<?php
// c:\laragon\www\youtube\backend\db.php
//
// Loads DB credentials from backend/.env (gitignored).
// To set up: copy backend/.env.example to backend/.env and fill in your credentials.

class Database {
    private static $pdo = null;

    private static function loadEnv() {
        static $loaded = false;
        if ($loaded) return;

        $envFile = __DIR__ . '/.env';
        if (!file_exists($envFile)) {
            // .env missing — allow fallback to defaults below
            $loaded = true;
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            if (strpos($line, '=') === false) continue;
            [$key, $value] = explode('=', $line, 2);
            $key   = trim($key);
            $value = trim($value);
            // Only set if not already defined (allows real env vars to override)
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
        $loaded = true;
    }

    public static function connect($connect_without_db = false) {
        if (self::$pdo !== null && !$connect_without_db) {
            return self::$pdo;
        }

        self::loadEnv();

        $host     = $_ENV['DB_HOST']          ?? 'localhost';
        $user     = $_ENV['DB_USER']          ?? 'root';
        $pass     = $_ENV['DB_PASS']          ?? '';
        $fallback = $_ENV['DB_USER_FALLBACK'] ?? 'root';
        $fbpass   = $_ENV['DB_PASS_FALLBACK'] ?? '';
        $dbname   = $_ENV['DB_NAME']          ?? 'youtube-v2';

        $dsn = "mysql:host=$host;charset=utf8mb4";
        if (!$connect_without_db) {
            $dsn .= ";dbname=$dbname";
        }

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        // Try primary credentials first
        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
            if (!$connect_without_db) {
                self::$pdo = $pdo;
                self::runSchemaUpdates($pdo);
            }
            return $pdo;
        } catch (PDOException $e) {
            // Try fallback (e.g. root / no password)
            try {
                $pdo = new PDO($dsn, $fallback, $fbpass, $options);
                if (!$connect_without_db) {
                    self::$pdo = $pdo;
                    self::runSchemaUpdates($pdo);
                }
                return $pdo;
            } catch (PDOException $e2) {
                header('HTTP/1.1 500 Internal Server Error');
                header('Content-Type: application/json');
                echo json_encode([
                    'error'   => 'Database connection failed. Check backend/.env credentials.',
                    'details' => $e2->getMessage()
                ]);
                exit;
            }
        }
    }

    private static function runSchemaUpdates($pdo) {
        static $updated = false;
        if ($updated) return;
        try {
            $pdo->exec("ALTER TABLE `comments` ADD `attachment_url` varchar(500) DEFAULT NULL");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE `comments` ADD `attachment_type` varchar(20) DEFAULT NULL");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE `replies` ADD `attachment_url` varchar(500) DEFAULT NULL");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE `replies` ADD `attachment_type` varchar(20) DEFAULT NULL");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE `video_metadatas` ADD COLUMN `vid_name_normalized` TEXT NULL AFTER `vid_name`");
        } catch (Exception $e) {}
        try {
            $stmt = $pdo->query("SELECT vid_id, vid_name FROM video_metadatas WHERE vid_name_normalized IS NULL OR vid_name_normalized = ''");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) {
                $updateStmt = $pdo->prepare("UPDATE video_metadatas SET vid_name_normalized = :normalized WHERE vid_id = :id");
                foreach ($rows as $row) {
                    $norm = normalizeSearchText($row['vid_name']);
                    $updateStmt->execute([':normalized' => $norm, ':id' => $row['vid_id']]);
                }
            }
        } catch (Exception $e) {}
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `exclusion_lists` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `list_name` varchar(100) NOT NULL,
                `video_ids` longtext NOT NULL DEFAULT '',
                `exclude_pills` longtext NOT NULL DEFAULT '[]',
                `exclude_next` varchar(20) NOT NULL DEFAULT 'none',
                `exclude_search_suggestions` tinyint(1) NOT NULL DEFAULT 0,
                `exclude_watch_next` tinyint(1) NOT NULL DEFAULT 0,
                `exclude_search_results` tinyint(1) NOT NULL DEFAULT 0,
                `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        } catch (Exception $e) {}
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `category_pills` (
                `id` varchar(100) NOT NULL,
                `label` varchar(100) NOT NULL,
                `filter_type` varchar(50) NOT NULL DEFAULT 'all',
                `filter_val` varchar(500) NOT NULL DEFAULT '',
                `sort_by` varchar(50) NOT NULL DEFAULT 'recent',
                `media_type` varchar(50) NOT NULL DEFAULT 'only_videos',
                `exclude_shorts` tinyint(1) NOT NULL DEFAULT 0,
                `sort_order` int(11) NOT NULL DEFAULT 0,
                `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        } catch (Exception $e) {}
        $updated = true;
    }
}

function getJapaneseKanjiReadings($text) {
    static $kanjiMap = null;
    if ($kanjiMap === null) {
        $dictPath = __DIR__ . '/utils/kanji_romaji.json';
        if (file_exists($dictPath)) {
            $jsonData = file_get_contents($dictPath);
            $kanjiMap = json_decode($jsonData, true) ?: [];
        } else {
            $kanjiMap = [];
        }
    }
    
    if (empty($kanjiMap)) return '';

    $readings = [];
    $len = mb_strlen($text);
    for ($i = 0; $i < $len; $i++) {
        $char = mb_substr($text, $i, 1);
        if (isset($kanjiMap[$char])) {
            $readings[] = $kanjiMap[$char];
        }
    }
    return implode(' ', $readings);
}

function normalizeSearchText($text) {
    if ($text === null) return '';
    $originalLower = mb_strtolower($text);
    
    // First, strip single quotes/apostrophes completely to join letters (e.g. let's -> lets)
    $originalLower = str_replace(["'", "’", "`"], "", $originalLower);
    
    // Replace all other punctuation and symbols with spaces
    $originalClean = preg_replace('/[\p{P}\p{S}]/u', ' ', $originalLower);
    $originalClean = preg_replace('/\s+/', ' ', $originalClean);
    
    $transliterated = '';
    if (class_exists('Transliterator')) {
        $translit = Transliterator::create("Any-Latin; Latin-ASCII; Lower()")->transliterate($text);
        if ($translit !== false) {
            $translit = str_replace(["'", "’", "`"], "", $translit);
            // Replace punctuation and symbols with spaces in transliteration too
            $translitClean = preg_replace('/[\p{P}\p{S}]/u', ' ', $translit);
            // Additionally strip any remaining non-ASCII characters
            $translitClean = preg_replace('/[^a-z0-9\s]/', '', $translitClean);
            $transliterated = preg_replace('/\s+/', ' ', $translitClean);
        }
    }
    
    // Append Japanese Kanji Romaji readings
    $jpKanjiReadings = getJapaneseKanjiReadings($text);
    
    $combined = trim($originalClean . ' ' . $transliterated . ' ' . $jpKanjiReadings);
    $words = array_unique(explode(' ', $combined));
    return trim(implode(' ', $words));
}
