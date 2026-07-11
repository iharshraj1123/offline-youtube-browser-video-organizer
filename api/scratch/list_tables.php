<?php
// c:\xampp\htdocs\youtube-v2\api\scratch\list_tables.php

try {
    $pdo = new PDO("mysql:host=localhost", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== DATABASES ===\n";
    $dbs = $pdo->query("SHOW DATABASES")->fetchAll(PDO::FETCH_COLUMN);
    print_r($dbs);
    
    foreach (['youtube', 'youtube-v2'] as $db) {
        if (in_array($db, $dbs)) {
            echo "\n=== TABLES IN $db ===\n";
            $pdo->exec("USE `$db`");
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            print_r($tables);
            
            foreach ($tables as $table) {
                echo "  Columns in $table:\n";
                $cols = $pdo->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_ASSOC);
                foreach ($cols as $col) {
                    echo "    - {$col['Field']} ({$col['Type']})\n";
                }
            }
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
