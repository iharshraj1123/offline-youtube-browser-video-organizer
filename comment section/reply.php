<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname); 

$currpage = $_SESSION['curr_page'];
$comoid = $_POST['comoid'] ;
$usrono = $_POST['usronum'] ;
$com_inp = $_POST['newrep'];
$repliedto = $_POST['repliedto'];

$usr_num = $_COOKIE['loggedusernum'] ;


//-----------------CLEARING START------------------------//

$find1 = "script";
$find2 = "'";
$find3 = "<video";
// $find4 = "<img";
$find5 = "<link";
$find6 = "<style";

// $find5 = 'width="';
// $find6 = "*/";

$replace1 = "scripo";
$replace2 = '&#39;';
$replace3 = '<br><video onloadstart="this.volume=0.5" class="com_video"';
$replace5 = '<linko';
$replace6 = '<styleo';
//  $replace4 = '<img class="com_img"';

//  $replace5 = '<b>';
//   $replace6 ='</b>';

$com_inp = str_replace($find1,$replace1,$com_inp);
$com_inp = str_replace($find2,$replace2,$com_inp);
$com_inp = str_replace($find3,$replace3,$com_inp);
// $com_inp = str_replace($find4,$replace4,$com_inp);
$com_inp = str_replace($find5,$replace5,$com_inp);
$com_inp = str_replace($find6,$replace6,$com_inp);


//-----------------CLEARING END------------------------//


$insert  = "INSERT INTO reply_store () VALUES (null , $comoid , $usr_num , '$currpage' , NOW() , NOW() , '$repliedto' ,'$com_inp',0,0,0,'false')";;

if ($insert && $conn->query($insert) === TRUE) {
    echo "Reply added successfully";
} else {
    echo "Error: " . $insert . "<br>" . $conn->error;
}

$insert2  = "UPDATE comment_store SET comment_store.total_replies = (SELECT COUNT(com_id) FROM reply_store WHERE com_id = $comoid && page = '$currpage') WHERE com_id = $comoid";

if ($insert2 && $conn->query($insert2) === TRUE) {
    echo "<br>Comment replies updated successfully";
} else {
    echo "Error: " . $insert2 . "<br>" . $conn->error;
}

?>