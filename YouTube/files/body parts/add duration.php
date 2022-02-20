<?php
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

$vid_id = $_POST["vid_id"];
$vid_dur = $_POST["vid_dur"];

$update = "UPDATE video_metadatas SET duration = $vid_dur WHERE vid_id = '$vid_id'";
if ($conn->query($update) === TRUE) {} 
else {}

?>