<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>login/Signup</title>
</head>
<body>
<?php
session_start();
error_reporting(0);

$type=$_POST["chat_type"];

if($type == "" || $type == NULL) $type = "USER";

?>

<style>
.hidemepls{
    display:none !important;
}
.clearfile{
    background-color: #e5e2e2;
    padding: 3px 6px;
    border: 1px solid grey;
    border-radius: 4px;
    font-size: 13px;
    font-family: sans-serif;
    cursor: pointer;
}

input , label {
    cursor: pointer;
}

.clearfile:hover {
    background-color: #d6d6d6;
}

.clearfile::selection{
    color: none;
}


#user_Desc{
    resize: none;
}
</style>

<!-----------LOGIN--------------------->

<form  enctype="multipart/form-data" method="post" target="_self" action="redirect.php">

<div class="whole-form">
    
    <div class="login-form <?php if($type == "GROUP") echo 'hidemepls';?>">
        <h1>Login Here</h1>
        <label for="loggedusername" pattern=".{10,40}">Username : </label>
        <input required id="loggedusername" onkeydown="checkusername(1)" type="text" name="loggedusername"><span style="color:red;" class="usernametakeno"></span> <br><br>
        <label for="loggedpassword">Password : </label>
        <input required type="password" name="loggedpassword" id="loggedpassword" pattern=".{6,}" title="Six or more characters"> <br><br>
        <input name="loginsubmit" type="submit" value="Login">
    </div>
</form>

<!-----------SIGN UP--------------------->
<form enctype="multipart/form-data" id="signup-form" method="post" target="_self" action="redirect.php">

    <div class="signup-form">
        <h1>Signup here for New <?php echo $type?></h1>
        <input id="input-type" class="hidemepls" type="text" name="chat_type" value="<?php echo $type;?>">
        <label class="<?php if($type == "GROUP") echo 'hidemepls';?>" for="selectedfirstname" ">Your First name : </label>
        <input class="<?php if($type == "GROUP") echo 'hidemepls';?>" pattern=".{,15}" id="selectedfirstname" type="text" name="selectedfirstname"><br class="<?php if($type == "GROUP") echo 'hidemepls';?>"><br class="<?php if($type == "GROUP") echo 'hidemepls';?>">
        <label class="<?php if($type == "GROUP") echo 'hidemepls';?>" for="selectedlastname" >Your Last Name : </label>
        <input class="<?php if($type == "GROUP") echo 'hidemepls';?>" pattern=".{,15}" id="selectedlastname" type="text" name="selectedlastname"> <br class="<?php if($type == "GROUP") echo 'hidemepls';?>"><br class="<?php if($type == "GROUP") echo 'hidemepls';?>">
        <label for="selectedusername" ><?php if($type == "GROUP") echo 'Choose a group name: ';else echo 'Choose a username : '?></label>
        <input pattern=".{,30}" required id="selectedusername" onkeydown="checkusername(2)" type="text" name="selectedusername"><span style="color:red;" class="usernametakeno"></span><br><br>
        
        <label for="selectedpassword">Choose a password : </label>
        <input required name="selectedpassword" type="password" id="selectedpassword" pattern="^((?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$" title="Six or more characters"> 
        <ul>
            <li>Password must be atleast 6 characters long</li>
            <li>Must contain atleast one number</li>
            <li>No spaces in between</li>
        </ul>
        <label for="user_Desc"><?php if($type == "GROUP") echo 'Group Description: ';else echo 'Description you want on your profile (optional) : '?></label><br><br>
        <textarea id="user_Desc" name="selecteddesc" cols="100" rows="5" style="font-family:sans-serif;font-size:14px;background-color: smokewhite;border:0;border:2px solid rgb(211, 199, 199);" placeholder="<?php if($type == "GROUP") echo 'Group desc';else echo 'Hii There its me !!! yeah you dont know me...';?>"></textarea><br><br>
        <label >Choose a Profile picture (Make it square 1:1 ratio for best results) or leave it empty if you want to let us choose one for you :</label><br><br>
        <input accept="image/*" id="selectpic-input" name="selectedpic" type="file">
        <span onclick="document.getElementById('selectpic-input').value = '';" class="clearfile">Clear selected file</span><br><br>
           <br>
        <input id="signupsubmit" name="signupsubmit" type="submit" value="Sign-up">
    </div>
</div>

</form>
<br><br>
<br><br>
<br><br>


<script>

function checkusername(x){

setTimeout(function(){
    let typed_usrname;
    if(x == 1) typed_usrname = document.getElementById("loggedusername").value;
    else typed_usrname = document.getElementById("selectedusername").value;

    let temp_word = typed_usrname;
    temp_word = temp_word.replaceAll("\”","&quot;")
    temp_word = temp_word.replaceAll("\“","&quot;")
    temp_word = temp_word.replaceAll("\'","&quot;")
    temp_word = temp_word.replaceAll("\"","&quot;")
    temp_word = temp_word.replaceAll("\+","&#43;")
    temp_word = temp_word.replaceAll("&","!-and-!")
    typed_usrname = temp_word;

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./others/checkusername.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`work=${x}&typed_usrname=${typed_usrname}`);
         
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementsByClassName("usernametakeno")[x-1].innerHTML = xmlhttp.responseText;
        }
    }
},100)

}

document.getElementById("signupsubmit").onclick = function(){
    document.getElementById("signup-form").submit();
}

/*----------------cookies-----------------*/
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

</script>


</body>
</html>