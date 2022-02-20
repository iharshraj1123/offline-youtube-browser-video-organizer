<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);
$vid_id = $_POST['vid_id'];
$query = "DELETE FROM video_metadatas WHERE vid_id='$vid_id'";
if ($conn->query($query) === TRUE) {

echo "<br>Video deleted<br>";

//get old array info in row 10
$vid_data = "SELECT vid_name FROM video_metadatas WHERE vid_id = '10'";
$old_playlist_arr;
$result = $conn->query($vid_data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $old_playlist_arr = unserialize($row["vid_name"]);
    }
}

$key = array_search($vid_id, $old_playlist_arr);
array_splice($old_playlist_arr,$key,1);

//put new array info in row 10
$new_playlist_arr_serialized = serialize($old_playlist_arr);
$update = "UPDATE video_metadatas SET uploader_id=uploader_id -1 , vid_name = '$new_playlist_arr_serialized' WHERE vid_id = '10'";
if ($conn->query($update) === TRUE) {} 
else {}




}
else {echo "<br>Video NOT deleted<br>";}

?>