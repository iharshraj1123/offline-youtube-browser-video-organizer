<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$usr_num = $_COOKIE['loggedusernum'] ;
$usr_name = $_COOKIE['loggedusername'];
$usr_pass = $_COOKIE['loggeduserpass'];

$condition = $_POST['condition'];

$firstname = $_POST['new-firstname'];
$lastname = $_POST['new-lastname'];

$oldpass = $_POST['old-pass'];
$newpass = $_POST['new-pass'];

$desc = $_POST['new-desc'];

if($condition == 'pfp'){

    $file_name_raw = $_FILES['newpfp']['name'];
    $arr_com_1 = explode(".",$file_name_raw);
    $arr_com = end($arr_com_1);
    $file_name = $usr_name . '.' .$arr_com;
    $file_tmp = $_FILES['newpfp']['tmp_name'];

    move_uploaded_file($file_tmp,"ProfilePic/".$file_name);
    $full_loc = '/comment section/Userdatabase/ProfilePic/' . $file_name;

    $insert = "UPDATE `user_info` SET `user_pic` = '$full_loc' WHERE user_num = $usr_num";
    if ($conn->query($insert) === TRUE) {
        echo "Profile Pic updated successfully <script>alert('Your profile picture was updated \nRefresh the page if you see the old photo');window.history.back()</script>";
    } else {
        echo "Couldnt update profile pic: " . $conn->error;
    }

    setcookie('loggeduserpic', $full_loc  , time() + (365 * 24 * 60 * 60), "/");


}
elseif ($condition == 'desc') {
    $insert = "UPDATE `user_info` SET `user_desc` = '$desc' WHERE user_num = $usr_num";
    if ($conn->query($insert) === TRUE) {
        echo "Description updated successfully";
    } else {
        echo "Couldnt update profile : " . $conn->error;
    }

    setcookie('loggeduseruserdesc', $desc  , time() + (365 * 24 * 60 * 60), "/");
    echo "<script>alert('Your Description was updated \nRefresh the page if you see the older version');window.history.back()</script>";

}

elseif ($condition == 'name') {
    $insert = "UPDATE `user_info` SET `first_name` = '$firstname' , `last_name` = '$lastname' WHERE user_num = $usr_num";
    if ($conn->query($insert) === TRUE) {
        echo "Name updated successfully";
    } else {
        echo "Couldnt update profile : " . $conn->error;
    }
    setcookie('loggeduserfirstname', $firstname  , time() + (365 * 24 * 60 * 60), "/");
    setcookie('loggeduserlastname', $lastname  , time() + (365 * 24 * 60 * 60), "/");
    echo "<script>window.history.back()</script>";

}

elseif ($condition == 'pass') {
    if($oldpass == $usr_pass){
    $insert = "UPDATE `user_info` SET `user_pass` = '$newpass' WHERE user_num = $usr_num";
    if ($conn->query($insert) === TRUE) {
        echo "Password updated successfully";
    } else {
        echo "Couldnt update profile : " . $conn->error;
    }

    setcookie('loggeduserpass', $newpass , time() + (365 * 24 * 60 * 60), "/");
    echo "<script>alert('Your Password was updated');window.history.back()</script>";
    }
    else{ echo "<script>alert('Sorry you typed incorrect old password')</script>";}

}








?>