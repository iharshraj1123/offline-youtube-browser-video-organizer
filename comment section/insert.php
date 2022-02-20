<?php 
//error_reporting(0);
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

//if(isset($_FILES['fileToUpload']['name'])){
   echo 'done here 1';
   $file_name_raw = $_FILES['fileToUpload']['name'];
   $arr_com_1 = explode(".",$file_name_raw);
   $arr_com = end($arr_com_1);
   $file_name = $_POST['file_name'] . '.' .$arr_com;
   $file_tmp = $_FILES['fileToUpload']['tmp_name'];

   move_uploaded_file($file_tmp,"uploads/".$file_name);
   echo $file_name_raw .'<br>'. $arr_com .'<br>'. $file_name .'<br>' ;
   
//}

$usr_num = $_COOKIE['loggedusernum'] ;
$usr_name = $_COOKIE['loggedusername'];
$usr_pic = $_COOKIE['loggeduserpic'];
$usr_privilege = $_COOKIE['loggeduserprivilege'];
$usr_firstname = $_COOKIE['loggeduserfirstname'];
$usr_lastname = $_COOKIE['loggeduserlastname'];
$usr_desc = $_COOKIE['loggeduseruserdesc'];


if(!$usr_pic){
    $usr_num = $_SESSION['loggedusernum'] ;
    $usr_name = $_SESSION['loggedusername'];
    $usr_pic = $_SESSION['loggeduserpic'];
    $usr_firstname = $_SESSION['loggeduserfirstname'];
    $usr_lastname = $_SESSION['loggeduserlastname'];
    $usr_desc = $_SESSION['loggeduseruserdesc'];
    $usr_privilege = $_SESSION['loggeduserprivilege'];
}

$insert = null;
//$_SESSION["curr_page"] = htmlspecialchars($_SERVER["PHP_SELF"]);
$currpage = $_SESSION['curr_page'];


    $com_inp = $_POST['com_inp'] ;
    $find1 = "<script";
    $find2 = "'";
    $find3 = "<video";
   // $find4 = "<img";
    $find5 = "<link";
    $find6 = "<style";
    $find7 = "<?";
    $find8 = "$";
 //   $find9 = "<";
//   $find10 = ">";

   // $find5 = 'width="';
   // $find6 = "*/";

    $replace1 = "&#60;script";
    $replace2 = '&#39;';
    $replace3 = '<br><video onloadstart="this.volume=0.5" class="com_video"';
    $replace5 = '&#60;link';
    $replace6 = '&#60;style';
    $replace7 = '&#60;&#63;';
    $replace8 = '&#36;';
 //   $replace9 = '&#60;';
 //   $replace10 = '&#62;';
  //  $replace4 = '<img class="com_img"';

  //  $replace5 = '<b>';
 //   $replace6 ='</b>';

    $com_inp = str_replace($find1,$replace1,$com_inp);
    $com_inp = str_replace($find2,$replace2,$com_inp);
    $com_inp = str_replace($find3,$replace3,$com_inp);
   // $com_inp = str_replace($find4,$replace4,$com_inp);
    $com_inp = str_replace($find5,$replace5,$com_inp);
    $com_inp = str_replace($find6,$replace6,$com_inp);
    $com_inp = str_replace($find7,$replace7,$com_inp);
    $com_inp = str_replace($find8,$replace8,$com_inp);
   // $com_inp = str_replace($find9,$replace9,$com_inp);
   // $com_inp = str_replace($find10,$replace10,$com_inp);





//----------To upload files--------------//



$insert = "INSERT INTO comment_store () VALUES (null , '$currpage' , $usr_num , NOW() , NOW() , '$com_inp', 0,0,0,0,'false')";

 if ($insert && $conn->query($insert) === TRUE) {
    //echo "Comment added successfully";
} else {
   // echo "Error: " . $insert . "<br>" . $conn->error;
}

?>