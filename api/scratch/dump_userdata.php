<?php
require_once __DIR__ . '/../db.php';
try {
    $pdo = Database::connect(true);
    
    // Check if userdata database exists
    $stmt = $pdo->query("SHOW DATABASES LIKE 'userdata'");
    $dbExists = $stmt->fetch();
    if (!$dbExists) {
        echo "userdata database does not exist\n";
        exit;
    }
    
    $pdo->exec("USE `userdata`");
    echo "Tables in userdata database:\n";
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "- Table: $table\n";
        // Describe table
        $cols = $pdo->query("DESCRIBE `$table`")->fetchAll();
        foreach ($cols as $col) {
            echo "  * {$col['Field']} ({$col['Type']}) - Null: {$col['Null']}, Key: {$col['Key']}, Default: {$col['Default']}\n";
        }
        
        // Show count
        $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        echo "  * Total rows: $count\n\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
