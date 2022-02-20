<?php 
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

$name = $_POST['search'];
$query = "SELECT * FROM video_metadatas WHERE (vid_name LIKE '%$name%') OR (tags LIKE '%$name%')";

$result = $conn->query($query);
$search_arr;

if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        if($row['vid_id'] != "10"){
        $search_result = $row['vid_name'];
        $vid_id = $row['vid_id'];
        echo "<li onclick='vid_play_search($vid_id,`$search_result`)' class='search-result-li'>$search_result</li>";}
    }
}


?>