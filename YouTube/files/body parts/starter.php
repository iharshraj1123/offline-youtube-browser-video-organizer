<?php
session_start();
error_reporting(0);

$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

//get playlist array
$vid_data = "SELECT * FROM video_metadatas WHERE vid_id='10'";
$result = $conn->query($vid_data);
$new_playlist_all_array = null;
$total_vids;
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $new_playlist_all_array = unserialize($row["vid_name"]);
        $total_vids= floor($row["uploader_id"]);
    }
}

//get latest vid_id
$maxid = 0;
$vid_data = "SELECT MAX(vid_id) FROM video_metadatas AS latestID";
$result = $conn->query($vid_data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $maxid = $row["MAX(vid_id)"];
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<body>

<script type="text/javascript">
var new_playlist_all_array;
var maxid;
var total_vids;
new_playlist_all_array = new Array(<?php echo json_encode($new_playlist_all_array)?>);
maxid = <?php echo $maxid?>;
total_vids = <?php echo $total_vids?>;
</script>
</body>
</html>

