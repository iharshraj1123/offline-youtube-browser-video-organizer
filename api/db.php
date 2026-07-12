<?php
// c:\laragon\www\youtube\api\db.php
//
// Loads DB credentials from api/.env (gitignored).
// To set up: copy api/.env.example to api/.env and fill in your credentials.

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
                    'error'   => 'Database connection failed. Check api/.env credentials.',
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
        $updated = true;
    }
}
