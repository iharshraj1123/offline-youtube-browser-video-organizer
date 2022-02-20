<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";
error_reporting(0);

$conn = new mysqli($servername, $username, $password, $dbname);

$usr_members = $_COOKIE['loggedmembers'];
$usr_members_arr = unserialize($usr_members);
$usr_members_arr_sql = implode("','",$usr_members_arr);


$usr_num = $_COOKIE['loggedusernum'];
$current_talk_id = $_POST["talk_usr_num"];
$last_left_chat_id= $_POST["last_left_chat_id"];
$is_last_seen = $_POST["is_last_seen"];

$poped_id = [0]; 
$data = "SELECT * FROM chat_store WHERE (chatted_to_id = $usr_num OR chatted_by_id = $usr_num OR chatted_to_id IN ('$usr_members_arr_sql')) ORDER BY chat_date DESC, chat_time DESC, chat_id DESC LIMIT 1";

$result = $conn->query($data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        
        $chat_to_id= $row["chatted_to_id"];
        $chat_by_id = $row["chatted_by_id"];
        $read = $row["chat_read"];

        if($row["chat_id"]  == $last_left_chat_id) echo "false";
        //elseif($row["chat_id"]  == $last_left_chat_id && $row["chat_read"] != $is_last_seen) echo "truebutonlychangedseen";
        elseif($row["chat_id"]  != $last_left_chat_id && ($current_talk_id == $row["chatted_to_id"]||$current_talk_id == $row["chatted_by_id"])) echo "truebutnonotif";
        else echo "true";

    }
}

?>