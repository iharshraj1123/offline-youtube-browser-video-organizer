<?php
$file = $_POST["url"];
$file = str_replace(Array("\n", "\r", "\n\r"), '', $file);
echo filesize($file);
?>