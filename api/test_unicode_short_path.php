<?php
// c:\xampp\htdocs\youtube-v2\api\test_unicode_short_path.php

// Force COM to use UTF-8 codepage (65001) for string conversions
ini_set('com.code_page', 65001);

try {
    $fso = new COM("Scripting.FileSystemObject");
    
    // Test Unicode file that exists
    $filePath = "D:\\Video songs\\【ホロライブ】3人で『Bad Apple!!』歌ってみた【湊あくあ･白上フブキ･兎田ぺこら】Hololive member.mp4";
    
    echo "Checking file_exists: " . (file_exists($filePath) ? "YES" : "NO") . "\n";
    
    try {
        $file = $fso->GetFile($filePath);
        echo "ShortPath: " . $file->ShortPath . "\n";
    } catch (Exception $e) {
        echo "COM GetFile failed: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "COM init failed: " . $e->getMessage() . "\n";
}
