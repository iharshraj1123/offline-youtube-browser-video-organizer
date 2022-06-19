<?php
$file = $_POST["url"];
$file = str_replace(Array("\n", "\r", "\n\r"), '', $file);
$file = str_replace("[!and!]", '&', $file);
$file = str_replace("&#43;", '+', $file);
echo filesize($file);
?>