<?php require './files/body parts/starter.php'; ?>

<?php 
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

date_default_timezone_set('Asia/Kolkata');

$conn = new mysqli($servername, $username, $password, $dbname);

/*Notes
Next to build after the break : 
1) Custom VIDEO player = done
2) restructuring of comments.php
3) Playlist
4) Picture in Picture

// $new_playlist_all_array = all playlist
//similarly var new_playlist_all_array = all playlist

//$maxid = max vid_id

*/

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

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube</title>
    <link rel="icon" type="image/jpeg" href="./resources/icons/yt logo 20px.png" />
    <link href="./style.css" type="text/css" rel="stylesheet">
    <link rel="stylesheet" href="./resources/font-awesome2/font-awesome2.css">
    <link href="./resources/fonts/Roboto/Roboto-Regular.ttf" rel="stylesheet">
</head>
<body>
    <?php require './files/body parts/header.php'; ?>
    
    <!---------Contains Menu, nav and Videos------->
    <div class="content">

        <!------------Menu------------>
        <?php require './files/body parts/menu.php'; ?>


        <div class="nav-videoes">
        <!------------Nav Bar------------>
        <div class="categories">
            <section class="category-section">
                <button onclick="" class="category-btn active-category">All</button>
                <button onclick="" class="category-btn">Hot</button>
                <button onclick="recent_sort()" class="category-btn">Recent</button>
                <button onclick="" class="category-btn">Video Songs</button>
                <button onclick="" class="category-btn">Downloads</button>
                <button onclick="" class="category-btn">Study</button>
                <button onclick="" class="category-btn">My Animes</button>
                <button onclick="" class="category-btn">0-entertainment</button>
            </section>
        </div>
<script>
    window.history.pushState("object or string", "Title", '/YouTube/');
    var ids_for_dur=new Array();

</script>
<!---------------------------------------------Videoes-------------------------------------------->

    <div class="Main-Video-div">
        <section class="video-section recent-section" style="max-height: 370px;overflow: hidden;">
        <h2 class="video-section-title">Recent<button onclick="show_recent()" class="section-close-btn"><i class="fas fa-chevron-down down-arrow-section"></i></button></h2>

            <?php 
                
            

                $vid_data = "SELECT * FROM video_metadatas ORDER BY upload_date DESC, upload_time DESC, vid_id DESC LIMIT 20";

                //    1        2       3         4              5             6          7         8         9         10           11            12          13      14          15          16
                // vid_id, vid_name ,link , uploader_id , uploader_name, uploader_img, likes , dislikes , duration , views  , uploaded_date, uploaded_time ,tags , description, comments, subtitles
                
                $temp_vid_data_arr;
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
                   
                </article>
                "
                ;
                    }
                }   
                
                ?>
        </section>
        <section class="video-section">
            <h2 class="video-section-title">Mix<button onclick="mix_cross()" class="section-close-btn">&times;</button></h2>
                
            <?php 

            //1487 1488 1489
            $blacklist_vids = [330 ,445 ,540 ,645, 646 ,647 ,648 ,649 ,650, 517,518,519];
                
            for($i=0;$i<20;$i++){
                $randamono = rand(0,$total_vids-1);
                
                //blacklists
                if (in_array($randamono, $blacklist_vids)==true) {
                    $randamono = rand(0,$total_vids-1);
                    if (in_array($randamono, $blacklist_vids)==true){
                        $randamono = rand(0,$total_vids-1);
                        if (in_array($randamono, $blacklist_vids) ==true){
                           $randamono = rand(0,$total_vids-1);
                           if (in_array($randamono, $blacklist_vids) ==true){
                            $randamono = 2;
                           }
                        }
                    }   
                    
                }
               // echo "second random = $randamono<br>";
                array_push($blacklist_vids, $randamono);
                $randamono = $new_playlist_all_array[$randamono];
              //  echo "third random (vid_id) = $randamono";
                $vid_data = "SELECT * FROM video_metadatas WHERE vid_id = '$randamono'";

                //    1        2       3         4              5             6          7         8         9         10           11            12          13      14          15          16
                // vid_id, vid_name ,link , uploader_id , uploader_name, uploader_img, likes , dislikes , duration , views  , uploaded_date, uploaded_time ,tags , description, comments, subtitles
                
                $temp_vid_data_arr;
                $result = $conn->query($vid_data);
                if($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        
                        $temp_vid_data_arr = array($row["vid_id"],$row["vid_id"],$row["vid_name"],$row["link"],$row["uploader_id"],$row["uploader_name"],$row["uploader_img"],$row["likes"],$row["dislikes"],$row["duration"],$row["views"],$row["upload_date"],$row["upload_time"],$row["tags"],$row["description"],$row["comments"],$row["subtitles"]);
                    }
                }   
                    //$temp_vid_data_arr[9]
                    $durationonosn;
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
                    <!----<article ondblclick='vid_play($randamono)' onclick='article_click($randamono);' class='video-cointainer'>---->
               
                    <!----thumbnail---->
                        <a href='play.php?play_vid=$randamono' target='_self' class='thumbnail' data-duration='$durationonosn'>
                       <video muted data-src='$temp_vid_data_arr[3]#t=6' disablePictureInPicture class='video-thumbnail-all video-thumbnail video-thumbnail$randamono' controlsList='nodownload'>
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
                            <a target='_blank' href='/comment%20section/Userdatabase/user.php?usr_name=$temp_vid_data_arr[5]' class='video-channel-name'>$temp_vid_data_arr[5]</a>
                            <div class='video-metadata'>
                                <span class='video-views'>$temp_vid_data_arr[10] views</span>
                                <span class='video-dot'>•</span>
                                <span class='video-upload-date'>$nice_time_diff</span>
                            </div>
                        </div>
                    </div>
                   
                </article>
                "
                ;
            }
                
                ?>
                
                <!--
                <article class="video-cointainer">
                    <a href="#" class="thumbnail" data-duration="12:30">
                        <img class="video-thumbnail" src="./resources/icons/default thumbnail.png"/>
                    </a>
                    <div class="video-bottom-section">
                        <a href="#">
                            <img class="channel-icon" src="./resources/icons/default me.jpg">
                        </a>
                        <div class="video-details">
                            <a href="#" class="video-title">Video Title</a>
                            <a href="#" class="video-channel-name">Channel Name</a>
                            <div class="video-metadata">
                                <span class="video-views">100 views</span>
                                <span class="video-dot">•</span>
                                <span class="video-upload-date">1 days ago</span>
                            </div>
                        </div>
                    </div>
                </article>
                <article class="video-cointainer">
                    <a href="#" class="thumbnail" data-duration="12:30">
                        <img class="video-thumbnail" src="./resources/icons/default thumbnail.png"/>
                    </a>
                    <div class="video-bottom-section">
                        <a href="#">
                            <img class="channel-icon" src="./resources/icons/default me.jpg">
                        </a>
                        <div class="video-details">
                            <a href="#" class="video-title">Video Title</a>
                            <a href="#" class="video-channel-name">Channel Name</a>
                            <div class="video-metadata">
                                <span class="video-views">100 views</span>
                                <span class="video-dot">•</span>
                                <span class="video-upload-date">1 days ago</span>
                            </div>
                        </div>
                    </div>
                </article>
                <article class="video-cointainer">
                    <a href="#" class="thumbnail" data-duration="12:30">
                        <img class="video-thumbnail" src="./resources/icons/default thumbnail.png"/>
                    </a>
                    <div class="video-bottom-section">
                        <a href="#">
                            <img class="channel-icon" src="./resources/icons/default me.jpg">
                        </a>
                        <div class="video-details">
                            <a href="#" class="video-title">Video Title</a>
                            <a href="#" class="video-channel-name">Channel Name</a>
                            <div class="video-metadata">
                                <span class="video-views">100 views</span>
                                <span class="video-dot">•</span>
                                <span class="video-upload-date">1 days ago</span>
                            </div>
                        </div>
                    </div>
                </article>
                <article class="video-cointainer">
                    <a href="#" class="thumbnail" data-duration="12:30">
                        <img class="video-thumbnail" src="./resources/icons/default thumbnail.png"/>
                    </a>
                    <div class="video-bottom-section">
                        <a href="#">
                            <img class="channel-icon" src="./resources/icons/default me.jpg">
                        </a>
                        <div class="video-details">
                            <a href="#" class="video-title">Video Title</a>
                            <a href="#" class="video-channel-name">Channel Name</a>
                            <div class="video-metadata">
                                <span class="video-views">100 views</span>
                                <span class="video-dot">•</span>
                                <span class="video-upload-date">1 days ago</span>
                            </div>
                        </div>
                    </div>
                </article>-->
            </section>
        </div>
        <!------------Videoes END------------>
        </div>

    </div>
    <script src="./my JS library.js"></script>
    <script src="./script.js"></script>
    <?php echo "<script>last_vid_id=$maxid</script>";?>
</body>
</html>