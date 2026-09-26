<?php
/**
 * CLI Auto-Sync Script for Offline YouTube Organizer
 * 
 * Usage:
 *   php backend/auto_sync.php           (Runs if interval has elapsed, or default 24h)
 *   php backend/auto_sync.php --check   (Same as default)
 *   php backend/auto_sync.php --force   (Runs immediately regardless of last sync time)
 */

if (php_sapi_name() !== 'cli') {
    die("This script can only be run from the command line.\n");
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/index.php';

$options = getopt('', ['force', 'check']);
$isForce = isset($options['force']);

$pdo = Database::connect();

echo "========================================\n";
echo " Offline YouTube Organizer - Auto Sync \n";
echo "========================================\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n";

// Read auto_sync_interval
$stmt = $pdo->prepare("SELECT setting_key, setting_value FROM share_settings WHERE setting_key IN ('auto_sync_interval', 'auto_sync_last_run_at', 'auto_sync_last_status')");
$stmt->execute();
$settings = [];
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $settings[$row['setting_key']] = $row['setting_value'];
}

$intervalHours = isset($settings['auto_sync_interval']) ? intval($settings['auto_sync_interval']) : 24;
$lastRunAt = $settings['auto_sync_last_run_at'] ?? 'Never';
$lastStatus = $settings['auto_sync_last_status'] ?? 'None';
$uploader = getCurrentLoggedInUploader($pdo);

echo "Active User Account: {$uploader['name']} (ID: {$uploader['id']})\n";
echo "Configured Interval: " . ($intervalHours > 0 ? "Every {$intervalHours} hour(s)" : "Disabled (0)") . "\n";
echo "Last Run At:         {$lastRunAt}\n";
echo "Last Status:         {$lastStatus}\n\n";

if (!$isForce) {
    if ($intervalHours <= 0) {
        echo "[SKIP] Auto-sync is currently disabled in settings (interval = 0).\n";
        exit(0);
    }

    $lastRunTimestamp = ($lastRunAt && $lastRunAt !== 'Never') ? strtotime($lastRunAt) : 0;
    $secondsElapsed = time() - $lastRunTimestamp;
    $secondsRequired = $intervalHours * 3600;

    if ($secondsElapsed < $secondsRequired) {
        $remaining = round(($secondsRequired - $secondsElapsed) / 3600, 1);
        echo "[SKIP] Auto-sync is not due yet. Next run due in ~{$remaining} hour(s).\n";
        echo "Tip: Run with --force to run immediately.\n";
        exit(0);
    }
} else {
    echo "[INFO] Running with --force flag. Bypassing interval checks.\n";
}

echo "[START] Starting auto-sync for all presets...\n";

try {
    $result = executeSyncAllPresets($pdo, true);
    if (!empty($result['success'])) {
        echo "[SUCCESS] {$result['summary']}\n";
        if (!empty($result['presets'])) {
            foreach ($result['presets'] as $p) {
                $status = $p['status'] ?? 'unknown';
                $name = $p['name'] ?? 'Unnamed';
                $added = $p['added'] ?? 0;
                $skipped = $p['skipped'] ?? 0;
                echo "  - Preset '{$name}': [{$status}] Added: {$added}, Skipped: {$skipped}\n";
            }
        }
    } else {
        echo "[FAILED] " . ($result['message'] ?? 'Unknown error during sync.') . "\n";
    }
} catch (Exception $e) {
    echo "[ERROR] Exception during sync: " . $e->getMessage() . "\n";
    exit(1);
}

echo "Done.\n";
