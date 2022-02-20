<?php 
//error_reporting(0);
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);
$comoid = $_POST['comoid'] ;
$comoid2 = $_POST['usrcomid'] ;
$usrono = $_POST['usronum'] ;
$usr_num = $_COOKIE['loggedusernum'] ;
$usr_privilege = $_COOKIE['loggeduserprivilege'];

if($usrono == $usr_num || $usr_privilege == 'ADMIN' || $usr_privilege == 'MOD'){
$delete = "DELETE FROM `reply_store` WHERE reply_id = $comoid && user_num = $usrono";

if ($conn->query($delete) === TRUE) {
    echo "Record deleted successfully";
} else {
    echo "Error deleting record: " . $conn->error;
}

//$insert2  = "UPDATE comment_store SET comment_store.total_replies = (SELECT COUNT(com_id) FROM reply_store WHERE com_id = $comoid2 && page = '$currpage') WHERE com_id = $comoid2";
$insert2  = "UPDATE comment_store SET total_replies = total_replies - 1 WHERE com_id = $comoid2";

if ($insert2 && $conn->query($insert2) === TRUE) {
    echo "<br>Comment replies updated successfully";
} else {
    echo "Error: " . $insert2 . "<br>" . $conn->error;
}
}
?>