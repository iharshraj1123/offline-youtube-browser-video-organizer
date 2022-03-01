<?php require './files/body parts/starter.php'; ?>
<?php 
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

$vid_id = $_GET['play_vid'];

//add view
$update = "UPDATE video_metadatas SET views = views + 1 WHERE vid_id = '$vid_id'";
if ($conn->query($update) === TRUE) {} 
else {}

$vid_data = "SELECT * FROM video_metadatas WHERE vid_id='$vid_id'";

$result = $conn->query($vid_data);
$vid_name = "";
$vid_link = "";
$vid_likes = 0;
$vid_dislikes = 0;
$vid_duration = 0;
$vid_views = 0;
$vid_tags = "";
$vid_desc = "";
$vid_upload_time = "";
$vid_comments = 0;
$vid_upld_date ="";
$vid_uploader_img = "/comment%20section/userdatabase/profilepic/defaulta.jpg";
$vid_uploader_id;
$vid_uploader_name;
$ifsutitlososo="";
$vid_subtitles="";

if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $vid_name = $row["vid_name"];        
        if($vid_id>900) $vid_name = cut_mp4_name($vid_name);

        $vid_link = $row["link"];
        $vid_likes = $row["likes"];
        $vid_dislikes = $row["dislikes"];
        $vid_duration = $row["duration"];
        $vid_views = $row["views"];
        $vid_tags = $row["tags"];
        $vid_desc = $row["description"];
        $vid_comments = $row["comments"];
        $vid_upld_date = $row["upload_date"];
        $vid_uploader_name= $row["uploader_name"];
        $vid_uploader_id=$row["uploader_id"];
        $vid_uploader_img=$row["uploader_img"];
        $vid_subtitles = $row["subtitles"];
        if($vid_subtitles == "null"|| $vid_subtitles == ""||$vid_subtitles == " "||$vid_subtitles == "files/subtitles/.vtt") $ifsutitlososo = "nosubtitloso";
    }
}
else{}


function nice_date($d){
    $ms = array('Jan','Feb','March','April','May','June','Jul','Aug','Sept','Oct','Nov','Dec');
   // 2021-08-10
    $the_return = '';
    $the_day = abs(substr($d,8,2));
    if ($the_day != 0){
        $the_return .= ' '.$the_day;
    }
    $the_month = abs(substr($d,5,2));
    if ($the_month != 0) {
        $the_return .= ' ' . $ms[$the_month-1];
    }

    $the_year = substr($d,0,4);
    if ($the_year != 0){
        if ($the_return != '') {
            $the_return .= ' ';
        }
        $the_return .= $the_year;
    }

    return $the_return;
}

$vid_upld_date2 = nice_date($vid_upld_date);

if($vid_likes !=0 & $vid_dislikes != 0){
    $like_perc = ($vid_likes/($vid_likes+$vid_dislikes))*100;
}
elseif($vid_likes !=0 & $vid_dislikes == 0){
    $like_perc = 100;
}
elseif($vid_likes ==0 & $vid_dislikes != 0){
    $like_perc = 0;
}

function cut_mp4_name($vid_name) {
    $temperado= explode(".",$vid_name);
    $sliced = array_slice($temperado, 0, -1); 
    $vid_name = implode(".", $sliced); 
    return $vid_name;
}


?>

<!DOCTYPE html>
<html class="html-tag" lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo"$vid_name"?></title>
    <link rel="icon" type="image/jpeg" href="./resources/icons/yt logo 20px.png" />
    <link href="./style.css" type="text/css" rel="stylesheet">
    <link href="./custom video player.css" type="text/css" rel="stylesheet">
    <link href="./resources/fonts/Roboto/Roboto-Regular.ttf" rel="stylesheet">
</head>
<body onclick="focusout()">

    <?php require './files/body parts/header.php'; ?> 
    <!------------Menu------------>
    <?php require './files/body parts/menu.php'; ?>

    <div onclick="focusin()" class="video-outer-div">
    <div onclick="focusin()" class="video-inner-div" style="z-index:1">

    <!---------------Video------------>
    <div class="video-summoner-divttt" onmousemove="mousemove_move(0)">
    <div class="video-summoner-divttte"></div>
    <div class="video-summoner-divttte2" onclick="togglevideoplaypause(0)" ondblclick="fullscreno_clickod(0)"></div>
    <div class="video-summoner-divttte3" onclick="togglevideoplaypause(0)" ondblclick="fullscreno_clickod(0)"></div>
    <div class="show_vid_mode hideme" id="show_vid_mode"></div>
    <div class="show-statistics-videomogoso hidemepls"></div>
        <div class="video-summoner-controlboxo">
            <div class="video-progressometer-outer-div" onmouseout="previewcarreirehider(0)" onmousemove="previewcarreireshower(0,event)" onclick="setvideoometro(0,event)">
                <div class="video-progressometer-outer">
                <div class="previewcarrier-divos hidemepls"><video class="previewcarrier-videosos"><source src=""></video><div class="previewcarrier-videosos-currtime"></div></div>
                <div class="video-progressometer-preview"></div>   
                <div class="video-progressometer-progressed"><i class="fas fa-circle video-progressometer-blob"></i></div>
                </div>
            </div>
            <div class="video-summoner-controlboxo-bottom">
                <div class="video-summoner-controlboxo-bottom-left">
                    <img src="./resources/custom video player/icons/skip_previous_white_24dp.svg" onclick="previoskip_clickod(0)" class="play-pause-buttonos-video hidemepls prev-skip-icnos">
                    <img src="./resources/custom video player/icons/play_arrow_white_24dp.svg" onclick="play_clickod(0)" class="play-pause-buttonos-video play-buttonos-video">
                    <img src="./resources/custom video player/icons/pause_white_24dp.svg" onclick="pause_clickod(0)" class="hidemepls play-pause-buttonos-video pause-buttonos-video">
                    <img src="./resources/custom video player/icons/skip_next_white_24dp.svg" onclick="nextoskip_clickod(0)" class="play-pause-buttonos-video next-skip-icnos">
                    <div class="video-summoner-controlboxo-voldiv" onmouseover="onvideosVol_change(0)">
                        <img src="./resources/custom video player/icons/volume_off_white_24dp.svg" onclick="volume_clickod(0)" class="hidemepls play-pause-buttonos-video volumes-videopl-icnos mutevol-videopl-icnos">
                        <img src="./resources/custom video player/icons/volume_down_white_24dp.svg" onclick="volume_clickod(0)" class="play-pause-buttonos-video volumes-videopl-icnos lowvol-videopl-icnos">
                        <img src="./resources/custom video player/icons/volume_up_white_24dp.svg" onclick="volume_clickod(0)" class="hidemepls play-pause-buttonos-video volumes-videopl-icnos highvol-videopl-icnos">
                        <div class="vidoevolumo-meter-outer-div" onclick="setvolumometro(0,event)">
                        <div class="vidoevolumo-meter-outer">
                            <div class="vidoevolumo-meter-progressometer"><i class="fas fa-circle videovol-progressometer-blob"></i></div>
                        </div>
                    </div>
                    </div>
                    <div class="videosos-timemetro"><div class="videos-curretimeo">0:00</div>&nbsp;/&nbsp;<div class="videos-dureationtimeo">0:00</div></div>
                </div>
                <div class="video-summoner-controlboxo-bottom-right">
                    <div class="subiitilesooovideos-div hidemepls">
                        <img src="./resources/custom video player/icons/subtitles_white_24dp.svg" onclick="turnonsubstitleso(0)" class="play-pause-buttonos-video subiitilesooovideos">
                        <div class="subiitilesooovideos-innerdiv"></div>
                    </div>
                    <img src="./resources/custom video player/icons/fit_screen_white_24dp.svg" onclick="theatremod_clickod()" class="play-pause-buttonos-video theatremodevid">
                    <img src="./resources/custom video player/icons/settings_white_24dp.svg" onclick="settingsoo_clickod(0)" class="play-pause-buttonos-video settingsoovideos">
                    <img src="./resources/custom video player/icons/fullscreen_white_24dp.svg" onclick="fullscreno_clickod(0)" class="play-pause-buttonos-video fullscrnvideovid fullscreenvideos">
                    <img src="./resources/custom video player/icons/fullscreen_exit_white_24dp.svg" onclick="fullscreno_clickod(0)" class="play-pause-buttonos-video extfullscrnvideovid fullscreenvideos hidemepls">
                </div>
            </div>
        </div>
    <!---------VIDEO TAG--------->
    <video id="playing-video" onfocus="focusin()" class="video-playing custom-videopls" autoplay>
        <source class="video-src" src="<?php echo"$vid_link"?>">
        <track class="temposos-trackos <?php echo"$ifsutitlososo"?>" src="<?php echo"$vid_subtitles"?>" kind="subtitles" srclang="en" label="English">
    </video>
    </div>
    <?php echo"<script>first_src='$vid_link';</script>"?>
    </div>
    </div>

    <div onmouseover="removothecontroloboxo(0)" class="below-play-video">
        <div class="play-video-left">
            <section class="video-play-details">
                <!---------Video Title--------->
                <p class="vid-title-p"><?php echo"$vid_name"?></p>
                <div class="title_edit_div hidemepls"><button onclick="canceledittitle_vid()" class="desc_edit_btn desc_edit_cancel">Cancel</button><button onclick="saveedittitle_vid()" class="desc_edit_btn desc_edit_save">Save</button></div>
                
                <div class="vid-statistics-div">
                    <div class="vid-views-upload-date"><?php echo"$vid_views views <span style='font-size:12px;'>•</span>"?><?php echo"$vid_upld_date2"?></div>
                    <div class="title-btn-div">
                        <div class="like-dislike-div"> 
                          <div style="position: relative;top:135%;right:10%;height:2px;background-color: #5f5e5e;">
                            <div style='height:3px;background-color: #747373; position:absolute;left:0; width:<?php echo "$like_perc%"?>'></div>
                          </div>
                           <span class="btn-icon-items tooltip"><img class="like-dislike like-icon" src="./resources/icons/thumb_up_white_24dp.svg"> <span class="likes-dislikes-count vid-likes-div"><?php echo"$vid_likes"?></span><span class="tooltiptext">I like this</span></span>
                           <span class="btn-icon-items tooltip"><img class="like-dislike dislike-icon" src="./resources/icons/thumb_down_white_24dp.svg"> <span class="likes-dislikes-count vid-dislikes-div"><?php echo"$vid_dislikes"?></span><span class="tooltiptext">I dislike this</span></span>
                        </div>
                        <span onclick="share_vid()" class="btn-icon-items btn-icon-share tooltip"><i class="fas fa-share"></i> SHARE<span class="tooltiptext">Share</span></span>
                        <span class="btn-icon-items tooltip"><i class="fas fa-plus-square"></i> SAVE<span class="tooltiptext">Save to playlist</span></span>
                        <span class="btn-icon-items">
                            <div class="dropdown-container" tabindex="-1">
                                <div class="three-dots"></div>
                                <div class="dropdown">
                                    <div onclick="edit_title()" class='dropdown-menu-item'>Edit Title</div>
                                    <div onclick="editdesc_vid()" class='dropdown-menu-item'>Edit Description</div>
                                    <div onclick="edit_captions()" class='dropdown-menu-item'>Edit Captions</div>
                                    <div onclick="edit_tags()" class='dropdown-menu-item'>Edit Tags</div>
                                    <div onclick="delete_vid()" class='dropdown-menu-item'>Delete</div>
                                </div>
                            </div>
                        </span>
                    </div>
                </div>
            </section>
            <!-----Description---------->
            <section class="video-play-desc">
                <div class="change-data-div"></div>
                <div class="changedata_ctrl_div hidemepls" style="text-align:right;"><button onclick="cancel_change_data()" class="desc_edit_btn desc_edit_cancel">Cancel</button><button onclick="save_change_data()" class="desc_edit_btn desc_edit_save">Save</button></div>

                    <div class="video-bottom-section">
                        <a class="upldr-profile-link" href="/comment%20section/Userdatabase/user.php?usr_name=<?php echo $vid_uploader_name?>" target="_blank">
                            <!----channel icon--------->
                            <img class="channel-icon" style="width: 45px; height: 45px" src="<?php echo $vid_uploader_img ?>">
                        </a>
                        <!----Title and channel name--------->
                        <div class="video-details">
                            <a href="/comment%20section/Userdatabase/user.php?usr_name=<?php echo $vid_uploader_name?>" target="_blank"  class="video-title upldr-profile-link"><?php echo $vid_uploader_name ?></a>
                            <a href="/comment%20section/Userdatabase/user.php?usr_name=<?php echo $vid_uploader_name?>" target="_blank" class="video-channel-name upldr-profile-link"><?php echo $vid_uploader_name ?></a>
                        </div>
                    </div>
                    <button onclick="expand_desc()" class="section-close-btn2"><i class="fas fa-chevron-down down-arrow-section down-arrow-section2"></i></button>

                <pre class="vid-desc-pre"><?php echo"$vid_desc"?></pre>
                <div class="desc_edit_div hidemepls"><button onclick="canceleditdesc_vid()" class="desc_edit_btn desc_edit_cancel">Cancel</button><button onclick="saveeditdesc_vid()" class="desc_edit_btn desc_edit_save">Save</button></div>
            </section>

            <!-----Comment Section---------->
            <section class="video-play-comments"><span class="vid-comment-numbers"><?php echo"$vid_comments"?></span> Comments
               <div class="pleaserefresh-com hidemepls"> <br>Please Refresh to get new Comments</div>
               <div class="video-play-comments-summoner"> <?php  include '../comment section/comments.php' ?></div>
            </section>
        <div class="play-video-right">
        <!--playlist-->
        </div>

        </div>
        
    <div class="debuger-div-bot"></div>
    </div>
    
    <script src="./my JS library.js"></script>
    <script src="./script.js"></script>
    <script src="./play.js"></script>
    <script src="./custom video player.js"></script>
    <?php echo"<script>;play_page($vid_id)</script>"?>
    <?php echo "<script>last_vid_id=$maxid;setTimeout(function(){add_duration()})</script>";?>
</body>
</html>