<?php
session_start();
//error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);


$work = $_POST["work"];

$usr_num = $_COOKIE['loggedusernum'] ;
$usr_name = $_COOKIE['loggedusername'];
$usr_pic = $_COOKIE['loggeduserpic'];
$usr_privilege = $_COOKIE['loggeduserprivilege'];
$usr_firstname = $_COOKIE['loggeduserfirstname'];
$usr_lastname = $_COOKIE['loggeduserlastname'];
$usr_desc = $_COOKIE['loggeduseruserdesc'];
$usr_comment_votes = $_COOKIE['comment_votes'];

function cut_mp4_name($vid_name) {
    $temperado= explode(".",$vid_name);
    $sliced = array_slice($temperado, 0, -1); 
    $vid_name = implode(".", $sliced); 
    return $vid_name;
}

function format_name($vid_name) {
    $temperado= explode(".",$vid_name);
    $sliced = array_slice($temperado, -1); 
    $vid_name = implode(".", $sliced); 
    return $vid_name;
}

if(!$usr_pic){
    $usr_num = $_SESSION['loggedusernum'] ;
    $usr_name = $_SESSION['loggedusername'];
    $usr_pic = $_SESSION['loggeduserpic'];
    $usr_firstname = $_SESSION['loggeduserfirstname'];
    $usr_lastname = $_SESSION['loggeduserlastname'];
    $usr_desc = $_SESSION['loggeduseruserdesc'];
    $usr_privilege = $_SESSION['loggeduserprivilege'];
    
    if(!$usr_pic){$usr_pic =  '/comment section/userdatabase/profilepic/defaulta.jpg';}
}


//----------------------------------------WORK    A-----------------------------//
//----------------------------------------WORK    A-----------------------------//
//----------------------------------------WORK    A-----------------------------//

//from upload.php 

if($work == "a")
{
$location1 = $_POST["location1"];
$file_no = $_POST["file_no"];
$json_arr = $_POST["json_arr"];

echo "address prefix = $location1 <br>selected files = $file_no <br>json_arr = $json_arr";
$file_name_arr=json_decode($json_arr);
echo "<br>1st file = $file_name_arr[0]";

$vid_name = "";
$vid_link = "";
$vid_likes = 0;
$vid_dislikes = 0;
$vid_duration = 0;
$vid_views = 0;
$vid_tags = "";
$vid_desc = "Enjoy!";
$vid_upload_time = "";
$vid_comments = 0;
$vid_upld_date =NULL;
//----------To upload files--------------//

// vid_id, vid_name ,link , uploader_id , uploader_name, uploader_img, likes , dislikes , duration , views  , uploaded_date, uploaded time ,tags , subtitles, description, comments

//insert all video metadatas
for($i=0; $i<$file_no;$i++){
echo"<br><br>loop no=$i";
$file_name_arr[$i] = str_replace("!1and1!","&",$file_name_arr[$i]);
$file_name_arr[$i] = str_replace("%","%25",$file_name_arr[$i]);

$file_loc= $location1.$file_name_arr[$i];

//----PLS READ : Note that The replacement below will happens in javascript automatically----//

//echo $file_loc;
//$file_loc = str_replace("&#39;","\'",$file_loc);
//$file_loc = str_replace("&quot;","\'\'",$file_loc);
$insert = "INSERT INTO video_metadatas () VALUES (null,'$file_name_arr[$i]','$file_loc',$usr_num ,'$usr_name','$usr_pic',0,0,$vid_duration,0, NOW(),NOW(),'$vid_tags','null','$vid_desc',0)";

 if ($insert && $conn->query($insert) === TRUE) {
    //echo "Comment added successfully";
} else {
   // echo "Error: " . $insert . "<br>" . $conn->error;
}
};

//get latest com_id
$maxid = 0;
$vid_data = "SELECT MAX(vid_id) FROM video_metadatas AS latestID";
$result = $conn->query($vid_data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $maxid = $row["MAX(vid_id)"];
    }
}
$file_no_new = intval($file_no);

//get old array info in row 10
$vid_data = "SELECT vid_name FROM video_metadatas WHERE vid_id = '10'";
$old_playlist_arr;
$result = $conn->query($vid_data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $old_playlist_arr = unserialize($row["vid_name"]);
        for($v=$file_no_new-1;$v>=0;$v--){
            array_push($old_playlist_arr, strval($maxid-$v));
        }
       

    }
}

//put new array info in row 10
$new_playlist_arr_serialized = serialize($old_playlist_arr);
$update = "UPDATE video_metadatas SET uploader_id=uploader_id + $file_no_new , vid_name = '$new_playlist_arr_serialized' WHERE vid_id = '10'";
if ($conn->query($update) === TRUE) {} 
else {}

}



//-------------------------------------------------------WORK   B-------------------------------------------------//
//-------------------------------------------------------WORK   B-------------------------------------------------//
//-------------------------------------------------------WORK   B-------------------------------------------------//
//get vid_link

if($work=="b")
{
$vid_id = $_POST["vid_id"];
//    1        2       3         4              5             6          7         8         9         10           11            12          13      14          15          16        17
// vid_id, vid_name ,link , uploader_id , uploader_name, uploader_img, likes , dislikes , duration , views  , uploaded_date, uploaded_time ,tags , description, comments, subtitles, format

$vid_data = "SELECT * FROM video_metadatas WHERE vid_id = '$vid_id'";

$result = $conn->query($vid_data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {

        $newow_vid_name = cut_mp4_name($row["vid_name"]);
        
       echo $row["vid_id"].'?'.$row["vid_id"].'?'.$newow_vid_name.'?'.$row["link"].'?'.$row["uploader_id"].'?'.$row["uploader_name"].'?'.$row["uploader_img"].'?'.$row["likes"].'?'.$row["dislikes"].'?'.$row["duration"].'?'.$row["views"].'?'.$row["upload_date"].'?'.$row["upload_time"].'?'.$row["tags"].'?'.$row["description"].'?'.$row["comments"].'?'.$row["subtitles"].'?'.$row["subtitles"];
    }
}
}

//-------------------------------------------------------WORK   C-------------------------------------------------//
//-------------------------------------------------------WORK   C-------------------------------------------------//
//-------------------------------------------------------WORK   C-------------------------------------------------//
//Menu close or open?

if($work =="c")
{
    $menu_open = $_POST["menu_open"];
    if($menu_open == "true"){
        setcookie("menu_open", "true", time() + (86400 * 30), "/");
    }
    elseif($menu_open == "false"){
        setcookie("menu_open", "false", time() + (86400 * 30), "/");
    }
}


?>