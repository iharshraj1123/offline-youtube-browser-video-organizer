<?php 
error_reporting(0);
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$usr_name = $_COOKIE['loggedusername'] ;
$usrnameo = $_GET['usr_name'];
if($usrnameo == "010_Harsh Raj"){$usrnameo = "iharshraj";};
if($usrnameo == $usr_name){echo "<script>window.open('./me.php','_self')</script>";}
else{$usr_name = $usrnameo;}

$usr_num = '';
$usr_pic = '';
$usr_privilege = '';
$usr_firstname = '';
$usr_lastname = '';
$usr_desc = '';

$user_data = "SELECT * FROM user_info WHERE user_name = '$usrnameo' ";
$resultom = $conn->query($user_data);
if($resultom->num_rows > 0) {
    while($row = $resultom->fetch_assoc()) {
        $usr_pic = $row['user_pic'];
        $usr_privilege = $row['privilege'];
        $usr_firstname = $row['first_name'];
        $usr_lastname = $row['last_name'];
        $usr_desc = $row['user_desc'];
        $usr_num = $row['user_num'];

    }
}
$total_comments = 0;
$total_upvotes = 0;
$total_downvotes = 0;

$comm_data = "SELECT * FROM comment_store WHERE user_num = $usr_num";
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

$comm_data = "SELECT * FROM reply_store WHERE user_num = $usr_num";
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
    <title>View Profile</title>
    <link href="./user.css" type="text/css" rel="stylesheet">
    <link href="../font-awesome2.css" type="text/css" rel="stylesheet">
    
</head>
<body>

<div class="me-header">
   <span class='logo-span'>Rankerz</span>
</div>
<div class="profile-wrapper">
    <div class="profile-outside">
    <a href="/chatbox/index.php?sm=<?php echo $usrnameo?>"><img src="/comment section/others/icons/send message.png" style="width:35px" class="settings-icon fas fa-cog"></a>
 
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

</div><br><br><br><br><br>
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
                    $comid = $row['com_id'];
                    $upvotes = $row['upvotes'];
                    $downvotes = $row['downvotes'];
                    $replies = $row['total_replies'];
                    

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
                    <span style='float:right'>$time_diff</span><br> 
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
