<?php
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

$vid_id = $_POST["vid_id"];
$vid_title = $_POST["new_title"];
echo "$vid_title <br>";
$vid_title = str_replace("!1and1!","&",$vid_title);
echo "$vid_title <br>";
$update = "UPDATE video_metadatas SET vid_name = '$vid_title' WHERE vid_id = '$vid_id'";
if ($conn->query($update) === TRUE) { echo "done";} 
else {echo "failed";}

?>