<?php 
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

$name = $_POST['search'];

if(preg_replace("/\s+/", "", $name) === "") echo "Please search something!";
$name = str_replace("'","&#39;","$name");
$name = str_replace("*","\\*","$name");
$name = str_replace("[!and!]","&","$name");

$name1 = str_replace(" ","%","$name");
//$name = str_replace(" ","|","$name");
$name = preg_replace("/ (?!$)/"," +","$name");
//echo $name;
//$query = "SELECT * FROM video_metadatas WHERE CONCAT(vid_name , ' ' , tags)  LIKE '%$name%' ORDER BY upload_date DESC, upload_time DESC, vid_id DESC";
//$query = "SELECT * FROM video_metadatas WHERE Match(vid_name,tags) Against('(*$name*) (\"$name\")' IN BOOLEAN MODE)  ORDER BY upload_date DESC, upload_time DESC, vid_id DESC";
//$query = "SELECT * FROM video_metadatas WHERE Match(vid_name,tags) Against('(+*$name*) (\"$name\")' IN BOOLEAN MODE)  ORDER BY upload_date DESC, upload_time DESC, vid_id DESC";
//$query = "SELECT * FROM video_metadatas WHERE CONCAT(vid_name , ' ' , tags)  LIKE '$name' ORDER BY upload_date DESC, upload_time DESC, vid_id DESC";
$query = "SELECT * FROM video_metadatas WHERE Match(vid_name,tags) Against('(+*$name*) (\"$name\")' IN BOOLEAN MODE) UNION SELECT * FROM video_metadatas WHERE CONCAT(vid_name , ' ' , tags)  LIKE '%$name1%' ORDER BY upload_date DESC, upload_time DESC, vid_id DESC";

$result = $conn->query($query);
$search_arr;
$count = -1;
if($result){
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        if($row['vid_id'] != "10"){
        $search_result = $row['vid_name'];
        $vid_id = $row['vid_id'];
        $count++;
        echo "<li class='search-result-li' data-vid-id='$vid_id' onmousedown='search_li_click(event,$vid_id,`$search_result`,$count)'>$search_result</li>";}
    }
}}


?>