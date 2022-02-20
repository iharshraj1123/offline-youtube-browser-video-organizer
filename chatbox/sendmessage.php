<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$usr_num = $_COOKIE['loggedusernum'];
$usr_name = $_COOKIE['loggedusername'];
$usr_pic = $_COOKIE['loggeduserpic'];
$talk_usr_name = $_POST["talk_usr_name"];
$usr_members = $_COOKIE['loggedmembers'];
$usr_members_arr = unserialize($usr_members);
$usr_members_arr2="";
//$usr_members_arr_sql = implode("','",$usr_members_arr);
$type = 'user';
$text = $_POST["text"];
$pass = $_POST["pass"];
$talk_usr_num;
$talk_usr_img="";
$false_data = false;
$was_member = false;

if($pass == "" || $pass == NULL){
    $data = "SELECT user_num,user_pic FROM user_info WHERE `user_name` = '$talk_usr_name'";
    $result = $conn->query($data);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $talk_usr_num = $row["user_num"];
            $talk_usr_img= $row["user_pic"];
        }
    }
}
else{
    $data = "SELECT user_num,user_pic,user_pass,privilege,Members FROM user_info WHERE `user_name` = '$talk_usr_name'";
    $result = $conn->query($data);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $talk_usr_num = $row["user_num"];
            $talk_usr_img= $row["user_pic"];
            $usr_members_arr2 = unserialize($row["Members"]);
            if(in_array($usr_num, $usr_members_arr2)==true) $was_member =true;

            $type = "GROUP";
            if($pass != $row["user_pass"] || $row["privilege"] != "GROUP") $false_data = true;
        }
    }

    if($was_member==false){
        $k="";
        $talk_usr_num = intval($talk_usr_num);
        if($usr_members_arr =="" || $usr_members_arr == NULL) {$k = "a:1:{i:0;i:$talk_usr_num;}";}
        else {array_push($usr_members_arr,$talk_usr_num);$k = serialize($usr_members_arr);}
        setcookie('loggedmembers', $k  , time() + (365 * 24 * 60 * 60), "/");
    
        $usr_num = intval($usr_num);
        $l = "";
        if($usr_members_arr2 =="" || $usr_members_arr2 == NULL) {$l = "a:1:{i:0;i:$usr_num;}";}
        else {array_push($usr_members_arr2,$usr_num);$l = serialize($usr_members_arr2);}
    
        $update = "UPDATE user_info SET Members = '$k' WHERE user_num = $usr_num";
        if ($conn->query($update) === TRUE) {} 
        else {}
        
        $update = "UPDATE user_info SET Members = '$l' WHERE user_num = $talk_usr_num";
        if ($conn->query($update) === TRUE) {} 
        else {}
    
        $insert = "INSERT INTO chat_store () VALUES (null,'GROUP',$talk_usr_num ,'$talk_usr_name','$talk_usr_img', 3 ,'talk bot','/comment section/Userdatabase/ProfilePic/default1.jpg',NOW(),NOW(),'$usr_name joined','false','false')";
        if ($insert && $conn->query($insert) === TRUE) {
                //echo "Comment added successfully";
        } 
        else {
                // echo "Error: " . $insert . "<br>" . $conn->error;
        }
        
    }
}

if($false_data == false){



    $insert = "INSERT INTO chat_store () VALUES (null,'$type',$talk_usr_num ,'$talk_usr_name','$talk_usr_img',$usr_num ,'$usr_name','$usr_pic',NOW(),NOW(),'$text','false','false')";

        if ($insert && $conn->query($insert) === TRUE) {
            //echo "Comment added successfully";
        } 
        else {
            // echo "Error: " . $insert . "<br>" . $conn->error;
        }
}

?>