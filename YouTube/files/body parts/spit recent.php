<?php 
session_start();
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";
$conn = new mysqli($servername, $username, $password, $dbname);

$offset = $_POST["offset"];

$vid_data = "SELECT * FROM video_metadatas ORDER BY upload_date DESC, upload_time DESC, vid_id DESC LIMIT $offset,40";


function secToHourMinSec($input){
    $input = floor($input);
    $m = ($input - ($input) % 60)/60 ;
    $s = $input % 60;
    $h = ($m - ($m % 60))/60;
  
    if($s<10 && $m<60){return "${m}:0${s}";}
    if($s>=10 && $m<60){return "${m}:${s}";}
  
    if($m>=60){
      $m = $m % 60;
      if($m<10 && $s<10){return "$h:0$m:0$s";}
      if($m<10 && $s>=10){return "$h:0$m:$s";}
      if($m>=10 && $s<10){return "$h:$m:0$s";}
      if($m>=10 && $s>=10){return "$h:$m:$s";}
    }
  
}

function give_date_time_diff($date,$time){

        $datetime1 = new DateTime( $date . $time);//start time
        $date = date("Y-m-d H:i:s");
        $datetime2 = new DateTime($date);//end time
        $raw_time_diff = $datetime1->diff($datetime2);
        
        $time_diff = 0;
        if($raw_time_diff->format('%y')>0){
            if($raw_time_diff->format('%y') == 1){$time_diff = $raw_time_diff->format('%y') . ' year ago';}
            else{$time_diff = $raw_time_diff->format('%y') . ' years ago';}
        } 
        elseif($raw_time_diff->format('%m')>0){
            if($raw_time_diff->format('%m') == 1){$time_diff = $raw_time_diff->format('%m') . ' month ago';}
            else{$time_diff = $raw_time_diff->format('%m') . ' months ago';}
        }
        elseif($raw_time_diff->format('%d')>0){
            if($raw_time_diff->format('%d') == 1){$time_diff = $raw_time_diff->format('%d') . ' day ago';}
            else{$time_diff = $raw_time_diff->format('%d') . ' days ago';}
        }
        elseif($raw_time_diff->format('%h')>0){
            if($raw_time_diff->format('%h') == 1){$time_diff = $raw_time_diff->format('%h') . ' hour ago';}
            else{$time_diff = $raw_time_diff->format('%h') . ' hours ago';}
        }
        elseif($raw_time_diff->format('%i')>0){
            if($raw_time_diff->format('%i') == 1){$time_diff = $raw_time_diff->format('%i') . ' minute ago';}
            else{$time_diff = $raw_time_diff->format('%i') . ' minutes ago';}
        }
        elseif($raw_time_diff->format('%s')>0){
            if($raw_time_diff->format('%s') == 1){$time_diff = $raw_time_diff->format('%s') . ' second ago';}
            else{$time_diff = $raw_time_diff->format('%s') . ' seconds ago';}
        }
        else{$time_diff = 'Now';}

        return $time_diff;
}

function cut_mp4_name($vid_name) {
    $temperado= explode(".",$vid_name);
    $sliced = array_slice($temperado, 0, -1); 
    $vid_name = implode(".", $sliced); 
    return $vid_name;
}


//    1        2       3         4              5             6          7         8         9         10           11            12          13      14          15          16
// vid_id, vid_name ,link , uploader_id , uploader_name, uploader_img, likes , dislikes , duration , views  , uploaded_date, uploaded_time ,tags , description, comments, subtitles

$result = $conn->query($vid_data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {

        $temp_vid_data_arr = array($row["vid_id"],$row["vid_id"],$row["vid_name"],$row["link"],$row["uploader_id"],$row["uploader_name"],$row["uploader_img"],$row["likes"],$row["dislikes"],$row["duration"],$row["views"],$row["upload_date"],$row["upload_time"],$row["tags"],$row["description"],$row["comments"],$row["subtitles"]);
                   
        $durationonosn;
        $randamono = $temp_vid_data_arr[1];
        if($temp_vid_data_arr[9] == "0"){
        $durationonosn= "none";
        echo "<script>ids_for_dur.push($randamono)</script>";
        }
        else{$durationonosn=secToHourMinSec($temp_vid_data_arr[9]);}
        $nice_time_diff = give_date_time_diff($temp_vid_data_arr[11],$temp_vid_data_arr[12]);
        $temp_vid_data_arr[10];
        $temp_vid_data_arr[2] = cut_mp4_name($temp_vid_data_arr[2]);

    echo "
    <article class='video-cointainer'>           
        <!----thumbnail---->
            <a href='play.php?play_vid=$randamono' target='_self' class='thumbnail thumbnail$randamono' data-duration='$durationonosn'>
            <video data-src='$temp_vid_data_arr[3]#t=6' disablePictureInPicture muted class='video-thumbnail-all video-thumbnail video-thumbnail$randamono' controlsList='nodownload'>
            </video>
        </a>
        <!----below thumbnail---->
        <div class='video-bottom-section'>
            <a href='/comment%20section/Userdatabase/user.php?usr_name=$temp_vid_data_arr[5]' target='_blank'>
                <!----channel icon--------->
                <img class='channel-icon' src='$temp_vid_data_arr[6]'>
            </a>
            <!----Title and channel name--------->
            <div class='video-details'>
                <a href='play.php?play_vid=$randamono' target='_blank' class='video-title'>$temp_vid_data_arr[2]</a>
                <a href='/comment%20section/Userdatabase/user.php?usr_name=$temp_vid_data_arr[5]' target='_blank' class='video-channel-name'>$temp_vid_data_arr[5]</a>
                <div class='video-metadata'>
                    <span class='video-views'>$temp_vid_data_arr[10] views</span>
                    <span class='video-dot'>•</span>
                    <span class='video-upload-date'>$nice_time_diff</span>
                </div>
            </div>
        </div>
    </article>";
    }
}


?>