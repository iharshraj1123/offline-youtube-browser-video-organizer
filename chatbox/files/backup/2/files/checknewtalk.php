<?php 
session_start();
error_reporting(0);

$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$usr_num = $_COOKIE['loggedusernum'];
$talk_usr_num = $_POST["talk_usr_num"];
$chattype= $_POST["chat_type"];
$last_talk_chat_id= $_POST["last_talk_chat_id"];
$is_last_seen = $_POST["is_last_seen"];

if($chattype == "user"){

    $data = "SELECT chat_id,chat_read FROM chat_store WHERE (chatted_to_id = $usr_num AND chatted_by_id = $talk_usr_num) OR (chatted_to_id = $talk_usr_num AND chatted_by_id = $usr_num)  ORDER BY chat_date DESC, chat_time DESC, chat_id DESC LIMIT 1";

    $result = $conn->query($data);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            if($row["chat_id"]  == $last_talk_chat_id && $row["chat_read"] == $is_last_seen) echo "false";
            elseif($row["chat_id"]  == $last_talk_chat_id && $row["chat_read"] != $is_last_seen) echo "truebutnobtn";
            else echo "true";
        }
    }

}

else{
    $data = "SELECT chat_id FROM chat_store WHERE chatted_to_id = $talk_usr_num ORDER BY chat_date DESC, chat_time DESC, chat_id DESC LIMIT 1";

    $result = $conn->query($data);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            if($row["chat_id"]  == $last_talk_chat_id) echo "false";
            else echo "true";
            
        }
    }
}

?>