<?php 
error_reporting(0);
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$usr_num = $_COOKIE['loggedusernum'] ;
$usr_name = $_COOKIE['loggedusername'];
$usr_pic = $_COOKIE['loggeduserpic'];
$usr_privilege = $_COOKIE['loggeduserprivilege'];
$usr_firstname = $_COOKIE['loggeduserfirstname'];
$usr_lastname = $_COOKIE['loggeduserlastname'];
$usr_desc = $_COOKIE['loggeduseruserdesc'];

$total_comments = 0;
$total_upvotes = 0;
$total_downvotes = 0;

$comm_data = "SELECT * FROM comment_store WHERE user_num = $usr_num ";
$result = $conn->query($comm_data);

if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        static $comments_count = 1;
        static $upvote_count = 0;
        static $downvote_count = 0;

        $upvote_count = $upvote_count + $row['upvotes'];
        $downvote_count = $downvote_count + $row['downvotes'];
        
        $total_comments = $comments_count;
        $total_upvotes = $upvote_count;
        $total_downvotes = $downvote_count;
        $comments_count++;

        
    }
}

$total_replies = 0;
$total_upvotes2 = 0;
$total_downvotes2 = 0;

$comm_data = "SELECT * FROM reply_store WHERE user_num = $usr_num ";
$result = $conn->query($comm_data);

if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        static $reply_count = 1;
        static $upvote2_count = 0;
        static $downvote2_count = 0;

        $upvote2_count = $upvote2_count + $row['upvotes'];
        $downvote2_count = $downvote2_count + $row['downvotes'];
        
        $total_replies = $reply_count;
        $total_upvotes2 = $upvote2_count;
        $total_downvotes2 = $downvote2_count;
        $reply_count++;

        
    }
}

$total_upvotes3 = $total_upvotes + $total_upvotes2;
$total_downvotes3 = $total_downvotes + $total_downvotes2;
$total_karma = $total_upvotes3*5 - $total_downvotes3*3 + $total_replies*5 + $total_comments*3 ;
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile</title>
    <link href="./user.css" type="text/css" rel="stylesheet">
    <link href="../font-awesome2.css" type="text/css" rel="stylesheet">

</head>
<body>

<div class="me-header">
   <span class='logo-span'>Rankerz</span>
</div>
<div class="profile-wrapper">
    <div class="profile-outside">    
        <i onclick='drop_menu()' class="settings-icon fas fa-cog"></i>
          <div id="myDropdown" class="noheighto dropdown-content">
               <div onclick="form_sum('pfp')">Change Profile Picture</div>
               <div onclick="form_sum('desc')">Change Description</div>
               <div onclick="form_sum('pass')">Change Password</div>
               <div onclick="form_sum('name')">Change Name</div>
               <div><a style="display:block;text-decoration:none;color:rgb(80, 78, 78);width:100%" href="<?php if($usr_num == ""){echo "/comment section/loggin.php";}else{echo "/comment section/logout.php";}?>"><?php if($usr_num == ""){echo "Login";}else{echo "Logout";}?></a></div>
          </div>
        <a href="/chatbox/index.php"><img src="/comment section/others/icons/send message.png" style="width:35px;bottom: 11px;" class="settings-icon fas fa-cog"></a>



        <div class="profile-inside">
            <img class="user-img" src="<?php echo $usr_pic?>">
        </div>
    </div>
</div>
<div class="profile-info-div">
<div class="profile-info username-span"><?php echo $usr_name?></div><br>
<div class="profile-info name-span"><?php echo $usr_firstname .' ' . $usr_lastname?></div>
<div class="profile-info privil-span"> <?php echo $usr_privilege?></div><br>
<div class="profile-info desc-span"><?php echo $usr_desc?></div>
</div>
<br><br>



<div class="change-form-div hidemepls">
<form enctype="multipart/form-data" id="change-form" method="post" action="change info.php">
   <div class='new-pic hidemepls'><label for="new-pic">Select yourself a new pic , we highly recommend a square picture</label><input id='newpfp' name="newpfp" type="file"></div><br>
   <div class='new-desc hidemepls'><textarea name="new-desc" placeholder="Type yourself a new description"></textarea></div><br>
   <div class='new-pass hidemepls'><label for="new-pass">type your old password : </label><input id="old-pass" name="old-pass" type="text"></div><br>
   <div class='new-pass hidemepls'><label for="new-pass">type your new password : </label><input pattern="^((?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$" id="new-pass" name="new-pass" type="text"><br>Note that your password must be atleast 6 characters long , no spaces and must contain a number</div><br>
   <div class='new-name hidemepls'><label for="new-firstname"> (note that username cant be changed) <br>type your new first name : </label><input pattern=".{,15}" id="new-firstname" name="new-firstname" type="text"></div><br>
   <div class='new-name hidemepls'><label for="new-lastname">type your new last name  : </label><input pattern=".{,15}"  id="new-lastname" name="new-lastname" type="text"></div><br>
    <input id="condition" type="hidden" name="condition">
   <div><input value="submit" type="submit"><span onclick="form_sum('cancel')" class="cancel-form">Cancel</span></div>
</form>
</div>





<br><br><br><br><br>
<div class="extra-info-wrapper">
<div class='extra-info'>
  <table class="statistics-table">
      <tr>
        <td class="info-stastics">Total Comments</td> <td class="info-stastics"><?php echo"$total_comments" ?> </td>
     </tr>
     <tr>
        <td class="info-stastics">Total Replies</td> <td class="info-stastics"><?php echo"$total_replies" ?> </td>
     </tr>
     <tr>
       <td class="info-stastics">Total Upvotes </td> <td class="info-stastics"><?php echo"$total_upvotes" ?> </td>
     </tr>
     <tr>
       <td class="info-stastics">Total Downvotes </td><td class="info-stastics"> <?php echo"$total_downvotes" ?>  </td>
     </tr>
     <tr>
       <td class="info-stastics">Total Karma </td><td class="info-stastics"> <?php echo"$total_karma" ?></td>
     </tr>
  </table>
</div>

<div class='extra-info2'>
    <div class="info-option-div">
   <div class="info-option com-recent">Recent Comments</div> <div class="info-option com-mostupvoted">Most Upvoted Comments</div> <div class="info-option com-mostdownvoted">Most Downvoted Comments</div>
    </div>
   <div class="comments-summon-recent">

        <?php 
            $comm_data = "SELECT * FROM comment_store WHERE user_num = $usr_num ORDER BY com_id DESC";

            $result = $conn->query($comm_data);
              
            if($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $page = $row['com_page'];
                    if (strpos($page, '.php?') == false) $page = $page . "?";
                    $comment = $row['comment'];
                    $upvotes = $row['upvotes'];
                    $downvotes = $row['downvotes'];
                    $replies = $row['total_replies'];
                    $comid = $row['com_id'];

                    $datetime1 = new DateTime( $row["com_time"] . $row["com_date"]);//start time
                    $date = date("Y-m-d H:i:s");
                    $datetime2 = new DateTime($date);//end time
                    $raw_time_diff = $datetime1->diff($datetime2);
                    $time_diff = 0;
                    if($raw_time_diff->format('%y')>0){
                        if($raw_time_diff->format('%y') == 1){$time_diff = $raw_time_diff->format('%y') . ' year ago';}
                        else{$time_diff = $raw_time_diff->format('%y') . ' years ago';}
                    } 
                    elseif($raw_time_diff->format('%m')>0){
                        if($raw_time_diff->format('%m') == 1){$time_diff = $raw_time_diff->format('%m') . ' month ago';}
                        else{$time_diff = $raw_time_diff->format('%m') . ' months ago';}
                    }
                    elseif($raw_time_diff->format('%d')>0){
                        if($raw_time_diff->format('%d') == 1){$time_diff = $raw_time_diff->format('%d') . ' day ago';}
                        else{$time_diff = $raw_time_diff->format('%d') . ' days ago';}
                    }
                    elseif($raw_time_diff->format('%h')>0){
                        if($raw_time_diff->format('%h') == 1){$time_diff = $raw_time_diff->format('%h') . ' hour ago';}
                        else{$time_diff = $raw_time_diff->format('%h') . ' hours ago';}
                    }
                    elseif($raw_time_diff->format('%i')>0){
                        if($raw_time_diff->format('%i') == 1){$time_diff = $raw_time_diff->format('%i') . ' minute ago';}
                        else{$time_diff = $raw_time_diff->format('%i') . ' minutes ago';}
                    }
                    elseif($raw_time_diff->format('%s')>0){
                        if($raw_time_diff->format('%s') == 1){$time_diff = $raw_time_diff->format('%s') . ' second ago';}
                        else{$time_diff = $raw_time_diff->format('%s') . ' seconds ago';}
                    }
                    else{$time_diff = 'Now';}

                    echo "<div class='com-body'>
                    <span style='float:right'>$time_diff</span> <br> 
                            <pre class='com-holder'>$comment</pre><br> 
                            <div class='com-nav'><i class='fas fa-chevron-up'>$upvotes</i>&nbsp;&nbsp;<div class='vertical-buttonus'></div>&nbsp;&nbsp;<i class='fas fa-chevron-down'>$downvotes</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total Replies : $replies<a target='_blank' href='$page&com_highlight=$comid'>$page&com_highlight=$comid</a> </div>
                        </div>";
                }
            }

        ?>
   </div>
      <div class="comments-summon-mostupvoted hidemepls">

      <?php 
            $comm_data = "SELECT * FROM comment_store WHERE user_num = $usr_num ORDER BY upvotes DESC , downvotes ASC,total_replies DESC";

            $result = $conn->query($comm_data);
              
            if($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $page = $row['com_page'];
                    if (strpos($page, '.php?') == false) $page = $page . "?";
                    $comment = $row['comment'];
                    $upvotes = $row['upvotes'];
                    $downvotes = $row['downvotes'];
                    $replies = $row['total_replies'];
                    $comid = $row['com_id'];

                    $datetime1 = new DateTime( $row["com_time"] . $row["com_date"]);//start time
                    $date = date("Y-m-d H:i:s");
                    $datetime2 = new DateTime($date);//end time
                    $raw_time_diff = $datetime1->diff($datetime2);
                    $time_diff = 0;
                    if($raw_time_diff->format('%y')>0){
                        if($raw_time_diff->format('%y') == 1){$time_diff = $raw_time_diff->format('%y') . ' year ago';}
                        else{$time_diff = $raw_time_diff->format('%y') . ' years ago';}
                    } 
                    elseif($raw_time_diff->format('%m')>0){
                        if($raw_time_diff->format('%m') == 1){$time_diff = $raw_time_diff->format('%m') . ' month ago';}
                        else{$time_diff = $raw_time_diff->format('%m') . ' months ago';}
                    }
                    elseif($raw_time_diff->format('%d')>0){
                        if($raw_time_diff->format('%d') == 1){$time_diff = $raw_time_diff->format('%d') . ' day ago';}
                        else{$time_diff = $raw_time_diff->format('%d') . ' days ago';}
                    }
                    elseif($raw_time_diff->format('%h')>0){
                        if($raw_time_diff->format('%h') == 1){$time_diff = $raw_time_diff->format('%h') . ' hour ago';}
                        else{$time_diff = $raw_time_diff->format('%h') . ' hours ago';}
                    }
                    elseif($raw_time_diff->format('%i')>0){
                        if($raw_time_diff->format('%i') == 1){$time_diff = $raw_time_diff->format('%i') . ' minute ago';}
                        else{$time_diff = $raw_time_diff->format('%i') . ' minutes ago';}
                    }
                    elseif($raw_time_diff->format('%s')>0){
                        if($raw_time_diff->format('%s') == 1){$time_diff = $raw_time_diff->format('%s') . ' second ago';}
                        else{$time_diff = $raw_time_diff->format('%s') . ' seconds ago';}
                    }
                    else{$time_diff = 'Now';}

                    echo "<div class='com-body'>
                    <span style='float:right'>$time_diff</span> <br> 
                            <pre class='com-holder'>$comment</pre><br> 
                            <div class='com-nav'><i class='fas fa-chevron-up'>$upvotes</i>&nbsp;&nbsp;<div class='vertical-buttonus'></div>&nbsp;&nbsp;<i class='fas fa-chevron-down'>$downvotes</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total Replies : $replies<a target='_blank' href='$page&com_highlight=$comid'>$page&com_highlight=$comid</a> </div>
                       </div>";
                }
            }

        ?>
    </div>
    <div class="comments-summon-mostdownvoted hidemepls">
        

    <?php 
            $comm_data = "SELECT * FROM comment_store WHERE user_num = $usr_num ORDER BY downvotes DESC , upvotes ASC,total_replies DESC";

            $result = $conn->query($comm_data);
              
            if($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $page = $row['com_page'];
                    if (strpos($page, '.php?') == false) $page = $page . "?";
                    $comment = $row['comment'];
                    $upvotes = $row['upvotes'];
                    $downvotes = $row['downvotes'];
                    $replies = $row['total_replies'];
                    $comid = $row['com_id'];

                    $datetime1 = new DateTime( $row["com_time"] . $row["com_date"]);//start time
                    $date = date("Y-m-d H:i:s");
                    $datetime2 = new DateTime($date);//end time
                    $raw_time_diff = $datetime1->diff($datetime2);
                    $time_diff = 0;
                    if($raw_time_diff->format('%y')>0){
                        if($raw_time_diff->format('%y') == 1){$time_diff = $raw_time_diff->format('%y') . ' year ago';}
                        else{$time_diff = $raw_time_diff->format('%y') . ' years ago';}
                    } 
                    elseif($raw_time_diff->format('%m')>0){
                        if($raw_time_diff->format('%m') == 1){$time_diff = $raw_time_diff->format('%m') . ' month ago';}
                        else{$time_diff = $raw_time_diff->format('%m') . ' months ago';}
                    }
                    elseif($raw_time_diff->format('%d')>0){
                        if($raw_time_diff->format('%d') == 1){$time_diff = $raw_time_diff->format('%d') . ' day ago';}
                        else{$time_diff = $raw_time_diff->format('%d') . ' days ago';}
                    }
                    elseif($raw_time_diff->format('%h')>0){
                        if($raw_time_diff->format('%h') == 1){$time_diff = $raw_time_diff->format('%h') . ' hour ago';}
                        else{$time_diff = $raw_time_diff->format('%h') . ' hours ago';}
                    }
                    elseif($raw_time_diff->format('%i')>0){
                        if($raw_time_diff->format('%i') == 1){$time_diff = $raw_time_diff->format('%i') . ' minute ago';}
                        else{$time_diff = $raw_time_diff->format('%i') . ' minutes ago';}
                    }
                    elseif($raw_time_diff->format('%s')>0){
                        if($raw_time_diff->format('%s') == 1){$time_diff = $raw_time_diff->format('%s') . ' second ago';}
                        else{$time_diff = $raw_time_diff->format('%s') . ' seconds ago';}
                    }
                    else{$time_diff = 'Now';}

                    echo "<div class='com-body'>
                    <span style='float:right'>$time_diff</span> <br> 
                            <pre class='com-holder'>$comment</pre><br> 
                            <div class='com-nav'><i class='fas fa-chevron-up'>$upvotes</i>&nbsp;&nbsp;<div class='vertical-buttonus'></div>&nbsp;&nbsp;<i class='fas fa-chevron-down'>$downvotes</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total Replies : $replies<a target='_blank' href='$page&com_highlight=$comid'>$page&com_highlight=$comid</a> </div>
                        </div>";
                }
            }

        ?>
    </div>
</div>

</div>

<br><br><br><br>
<div class="footer">Created by u/iharshraj</div>

<script src="user.js"></script>
</body>
</html>
