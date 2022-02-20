<?php
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

$vid_id = $_POST["vid_id"];

$update = "UPDATE video_metadatas SET views = views + 1 WHERE vid_id = '$vid_id'";
if ($conn->query($update) === TRUE) {} 
else {}

?>