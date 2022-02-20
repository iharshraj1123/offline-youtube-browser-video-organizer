<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
</head>
<body>
<?php
session_start();
error_reporting(0);

$usr_num = $_COOKIE['loggedusernum'];
$usr_members = $_COOKIE['loggedmembers'];
$usr_members_arr = unserialize($usr_members);
$a = $_POST['loginsubmit'];
$b = $_POST['signupsubmit'];
$c = $_POST['com_inp'];


$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);


/* check connection */
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}


function base_path(){
    // I go back 2 directories here - it all depends where
    // you decide to place this global helper function.
    return realpath(__DIR__ . '/.');
}

$destination = base_path() ;


///////////////////////If logged in////////////////////////////
if($a){
    //logged in
    $given_username = $_POST['loggedusername'];
    $giver_pass = $_POST['loggedpassword'];

    $comm_data = "SELECT * FROM user_info WHERE user_info.user_name = '$given_username' AND user_info.user_pass ='$giver_pass' AND privilege != 'GROUP'";
    $result = $conn->query($comm_data);

    if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $a =  $row["user_name"];
        $b = $row["user_num"];
        $c = $row["user_pic"];
        $d = $row["user_pass"];
        $e = $row["privilege"];
        $f = $row["first_name"];
        $g = $row["last_name"];
        $h = $row["user_desc"];
        $i = $row["comment_votes"];
        $j = $row["reply_votes"];
        $k = $row["Members"];



        setcookie('loggedusername', $a , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggedusernum', $b , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggeduserpic', $c  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggeduserpass', $d , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggeduserprivilege', $e  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggeduserfirstname', $f  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggeduserlastname', $g  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggeduseruserdesc', $h  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('comment_votes', $i  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('reply_votes', $j  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('loggedmembers', $k  , time() + (365 * 24 * 60 * 60), "/");

      
        $_SESSION['loggedusername'] = $a;
        $_SESSION['loggedusernum'] = $b;
        $_SESSION['loggeduserpic'] = $c;
        $_SESSION['loggeduserpass'] = $d;
        $_SESSION['loggeduserprivilege'] = $e;
        $_SESSION['loggeduserfirstname'] = $f;
        $_SESSION['loggeduserlastname'] = $g;
        $_SESSION['loggeduseruserdesc'] = $h;
        $_SESSION['comment_votes'] = $i;
        $_SESSION['reply_votes'] = $j; 
        $_SESSION['loggedmembers'] = $k; 

        echo "<script>window.history.go(-2);</script>";
        
        }
   }
    else{
    $_SERVER['incorrect login details'] = true;
    echo "<script>alert('Incorrect Username or Password');window.history.back()</script>";
    }
   
}

//////////////////////If Signed In///////////////////////////////
elseif($b){
    //signed in
    echo '<script>function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }</script>';
    
    
    $given_username = $_POST['selectedusername'];
    $given_firstname = $_POST['selectedfirstname'];
    $given_lastname = $_POST['selectedlastname'];
    $given_userpass = $_POST['selectedpassword'];
    $given_userdesc = $_POST['selecteddesc'];
    $given_type= $_POST['chat_type'];

    
/*-----------------CLEAN UP CODES-----------------------------------------------------------
    $find = array("script");
    $find1 = array("'");

    $replace = array("scriptoooo");
    $replace1 = array('"');

    $exp = str_replace($find,$replace,$exp);
    $exp = str_replace($find1,$replace1,$exp);

//-----------------CLEAN UP-----------------------------------------------------------*/


if($given_userdesc === ''){
    if($given_type == "GROUP") $given_userdesc = 'Group Description';
    else $given_userdesc = 'Hiii There its me !!! yeah you dont know me...';
 }
 $text= $given_userdesc;

$text = str_ireplace("'","&#39;" ,$text);
$text = str_ireplace("\\","&#92;" ,$text);
$text = str_ireplace("(","&#40;" ,$text);
$text = str_ireplace(")","&#41;" ,$text);
$text = str_ireplace("[","&#91;" ,$text);
$text = str_ireplace("]","&#93;" ,$text);

$given_userdesc = $text;
 $randomo =  '/comment section/Userdatabase/ProfilePic/default' . rand(1,10) . '.jpg';
 

 $query1= "SELECT * FROM user_info WHERE user_name = '$given_username'";

 $result = $conn->query($query1);
 
 if($result->num_rows > 0) {
   echo "<script>alert('username taken');setCookie('usernametaken',true);window.history.back()</script>";
 }
 else{
     if(isset($_FILES['selectedpic']['name'])){
         $file_name_raw = $_FILES['selectedpic']['name'];
         $arr_com_1 = explode(".",$file_name_raw);
         $arr_com = end($arr_com_1);
         $file_name =  $given_username . '.' .$arr_com;
         $file_tmp = $_FILES['selectedpic']['tmp_name'];
         echo $destination;
     
         move_uploaded_file($file_tmp,"./Userdatabase/ProfilePic/".$file_name);
         if($arr_com != null){
         $randomo = '/comment section/Userdatabase/ProfilePic/'.$file_name;}
         
     }
     $insert = "";
     if($given_type == "GROUP") $insert = "INSERT INTO user_info () VALUES (null , '$given_username' , 'GROUP' , 'a:1:{i:0;i:$usr_num;}', '$given_userpass' , '$given_firstname' , '$given_lastname' ,'$given_userdesc','$randomo','a:1:{i:0;s:7:\"upvoted\";}','a:1:{i:0;s:7:\"upvoted\";}')";
     else $insert = "INSERT INTO user_info () VALUES (null , '$given_username' , '$given_type' , NULL, '$given_userpass' , '$given_firstname' , '$given_lastname' ,'$given_userdesc','$randomo','a:1:{i:0;s:7:\"upvoted\";}','a:1:{i:0;s:7:\"upvoted\";}')";
     
     if ($insert && $conn->query($insert) === TRUE){
        if($given_type != "GROUP") echo 'User added Successfully<script>alert("You have been Registered successfully \nPlease login normally now");window.history.back()</script>';
     }
     else{
         echo 'something went wrong<script>alert("Something went wrong please try again");window.history.back()</script>';
     }

     if($given_type == "GROUP"){
        $talk_usr_num;
        $talk_usr_name="";
        $talk_usr_img="";
        $talk_usr_pass="";
        $query1= "SELECT * FROM user_info WHERE user_name = '$given_username' LIMIT 1";
        $result = $conn->query($query1);
        if($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $talk_usr_num = $row["user_num"];
                $talk_usr_img = $row["user_pic"];
                $talk_usr_name = $row["user_name"];
                $talk_usr_pass = $row["user_pass"];

                if($talk_usr_pass == ""){$talk_usr_pass = $given_userpass;}
            }
        }
        $k="";
        $talk_usr_num = intval($talk_usr_num);
        if($usr_members_arr =="" || $usr_members_arr == NULL) {$k = "a:1:{i:0;i:$talk_usr_num;}";}
        else {array_push($usr_members_arr,$talk_usr_num);$k = serialize($usr_members_arr);}
        setcookie('loggedmembers', $k  , time() + (365 * 24 * 60 * 60), "/");
    
        $usr_num = intval($usr_num);
    
        $update = "UPDATE user_info SET Members = '$k' WHERE user_num = $usr_num";
        if ($conn->query($update) === TRUE) {} 
        else {}
    
        $insert = "INSERT INTO chat_store () VALUES (null,'GROUP',$talk_usr_num ,'$talk_usr_name','$talk_usr_img', 3 ,'talk bot','/comment section/Userdatabase/ProfilePic/default1.jpg',NOW(),NOW(),'Welcome !! <br>Group Name: $talk_usr_name <br>Group Password: $talk_usr_pass','false','false')";
        if ($insert && $conn->query($insert) === TRUE) {
              echo 'Group added Successfully<script>window.history.go(-2);</script>';
        } 
        else {
                // echo "Error: " . $insert . "<br>" . $conn->error;
        }
     }
 }
 

}
////////////////////////////////UPLOAD PICS or VIDEO on SERVER/////////////////////////////////////
elseif($c){
    //done copied
   
    $_SESSION['redirected'] = true;
    if(isset($_FILES['fileToUpload']['name'])){
       

        $file_name_raw = $_FILES['fileToUpload']['name'];
        $arr_com_1 = explode(".",$file_name_raw);
        $arr_com = end($arr_com_1);
        $file_name = $_POST['file_name'] . '.' .$arr_com;
        $file_tmp = $_FILES['fileToUpload']['tmp_name'];

        move_uploaded_file($file_tmp,"uploads/".$file_name);
        
    };
   echo '<script>setTimeout(function(){let last_page = document.referrer;document.getElementById("red_form").action = `${last_page}`;document.getElementById("red_form").submit();},100)</script>';
   
}
elseif($_POST["word"]=="d"){
    $given_username = $_POST["typed_usrname"];
    $query1= "SELECT * FROM user_info WHERE user_name = '$given_username'";

    $result = $conn->query($query1);
    
    if($result->num_rows > 0) {
      echo "username taken";
    }
    else{echo "<img src='./others/icons/greentick.png' width='20px'>";}
}

?>


<form style="visibility: hidden" id="red_form" enctype="multipart/form-data" method="post">

    <textarea name="com_inp" id="text-area"><?php echo $_POST['com_inp']?></textarea><br>

    <input id="red_submit" type="submit"><br>

</form>
<script>
    
    
</script>

    
</body>
</html>