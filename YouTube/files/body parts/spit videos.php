<?php
session_start();
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";
$conn = new mysqli($servername, $username, $password, $dbname);

$req_vid = 1000;

$conn = new mysqli($servername, $username, $password, $dbname);
$vid_data = "SELECT * FROM video_metadatas WHERE vid_id = '$req_vid'";

//    1        2       3         4              5             6          7         8         9         10           11            12          13      14          15          16
// vid_id, vid_name ,link , uploader_id , uploader_name, uploader_img, likes , dislikes , duration , views  , uploaded_date, uploaded_time ,tags , description, comments, subtitles

$new_vid_data_arr;
$result = $conn->query($vid_data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        
        $new_vid_data_arr = array($row["vid_id"],$row["vid_id"],$row["vid_name"],$row["link"],$row["uploader_id"],$row["uploader_name"],$row["uploader_img"],$row["likes"],$row["dislikes"],$row["duration"],$row["views"],$row["upload_date"],$row["upload_time"],$row["tags"],$row["description"],$row["comments"],$row["subtitles"]);
    }
}//<- not the function end

    echo "
    <article class='video-cointainer'>
    <!----thumbnail---->
    <a href='#' onclick='vid_play($x)' class='thumbnail' data-duration='1:32'>
        <video disablePictureInPicture class='video-thumbnail' muted preload='metadata' controlsList='nodownload'>
            <source class='video-src' src='file:///D:/Video%20songs/Kakegurui ED1.webm#t=3'>
        </video>
    </a>
    <!----below thumbnail---->
    <div class='video-bottom-section'>
        <a href='#'>
            <!----channel icon--------->
            <img class='channel-icon' src='./resources/icons/default me.jpg'>
        </a>
        <!----Title and channel name--------->
        <div class='video-details'>
            <a href='#' onclick='vid_play(1)' class='video-title'>Tsukihime OP 1</a>
            <a href='#' class='video-channel-name'>010_Harsh Raj</a>
            <div class='video-metadata'>
                <span class='video-views'>3 views</span>
                <span class='video-dot'>•</span>
                <span class='video-upload-date'>3 hours ago</span>
            </div>
        </div>
    </div>
</article>"
?>