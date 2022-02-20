<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);
$comoid = $_POST['comoid'] ;
$usrono = $_POST['usronum'] ;
$newcom = $_POST['nowcom'];

$usr_num = $_COOKIE['loggedusernum'] ;
$usr_privilege = $_COOKIE['loggeduserprivilege'];

if($usrono == $usr_num || $usr_privilege == 'ADMIN' || $usr_privilege == 'MOD'){

$find1 = "script";
$find2 = "'";
$find3 = "[!and!]";
$find5 = "<link";
$find6 = "<style";

// $find5 = 'width="';
// $find6 = "*/";

$replace1 = "scripo";
$replace2 = '&#39;';
$replace3 = "&";   
$replace5 = '<linko';
$replace6 = '<styleo';


$newcom = str_replace($find1,$replace1,$newcom);
$newcom = str_replace($find2,$replace2,$newcom);
$newcom = str_replace($find3,$replace3,$newcom);
$newcom = str_replace($find5,$replace5,$newcom);
$newcom = str_replace($find5,$replace6,$newcom);


echo $newcom . '<br>';

$update = "UPDATE `reply_store` SET `reply` = '$newcom' , edited = 'true' WHERE reply_id = $comoid ";

if ($conn->query($update) === TRUE) {
    echo "Record edited successfully";
} else {
    echo "Error edited record: " . $conn->error;
}

}
?>