<?php
//error_reporting(0);
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$comoid = $_POST['comoid'] ;
$usrono = $_POST['usronum'] ;

$conn = new mysqli($servername, $username, $password, $dbname);

$comm_data = "SELECT reply_store.reply FROM reply_store WHERE reply_store.reply_id = $comoid && reply_store.user_num = $usrono LIMIT 1";
$result = $conn->query($comm_data);


if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo $row['reply'];
    }
}
?>