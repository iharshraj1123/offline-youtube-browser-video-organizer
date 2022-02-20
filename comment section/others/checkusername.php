<?php
session_start();
error_reporting(0);

$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$given_username = $_POST["typed_usrname"];
$work = $_POST["work"];

$text = $given_username;
$text = str_ireplace("!-and-!","&" ,$text);
$text = strip_tags($text);
$given_username = $text;

$query1= "SELECT * FROM user_info WHERE user_name = '$given_username'";

$result = $conn->query($query1);

if($result->num_rows > 0) {
    if($work == 1)  echo "&nbsp;&nbsp;<img style='position:relative;top:5px' src='./others/icons/greentick.png' width='20px'>";
    else echo "&nbsp;&nbsp;username taken";
}
else{
    if($work == 1)  echo "&nbsp;&nbsp;no such username";
    else {
        if($given_username!="")echo "&nbsp;&nbsp;$given_username is available&nbsp;&nbsp;<img style='position:relative;top:5px' src='./others/icons/greentick.png' width='20px'>";
    }
}


?>
