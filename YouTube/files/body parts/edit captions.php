<?php
session_start();
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

$vid_id = $_POST["vid_id"];
$work = $_POST["work"];

//get sub
if($work=="a"){
    $vid_data = "SELECT subtitles FROM video_metadatas WHERE vid_id='$vid_id'";
    $result = $conn->query($vid_data);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo $row["subtitles"];
        }
    }
}

//change sub
else if($work=="b"){
    $subtitles = $_POST["new_captions"];
    $update = "UPDATE video_metadatas SET subtitles = '$subtitles' WHERE vid_id = '$vid_id'";
    if ($conn->query($update) === TRUE) {} 
    else {}
}



?>