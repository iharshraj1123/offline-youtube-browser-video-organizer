<?php 
//error_reporting(0);
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);
$comoid = $_POST['comoid'] ;
$usrono = $_POST['usronum'] ;
$usr_num = $_COOKIE['loggedusernum'] ;
$usr_privilege = $_COOKIE['loggeduserprivilege'];

if($usrono == $usr_num || $usr_privilege == 'ADMIN' || $usr_privilege == 'MOD'){
$delete = "DELETE FROM `comment_store` WHERE com_id = $comoid && user_num = $usrono";

if ($conn->query($delete) === TRUE) {
    echo "Record deleted successfully";
} else {
    echo "Error deleting record: " . $conn->error;
}
}
?>