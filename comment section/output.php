<?php
error_reporting(0);
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);
//comment throw

$currpage = $_SESSION['curr_page'];
$usr_num = $_COOKIE['loggedusernum'] ;

//$comm_data = "SELECT comment_store.com_id, comment_store.com_date , comment_store.com_time , comment_store.comment ,user_info.user_pic , user_info.user_name , user_info.privilege, user_info.first_name, user_info.last_name,user_info.user_desc FROM comment_store JOIN user_info ON comment_store.user_num = user_info.user_num WHERE comment_store.com_page = '$currpage' && comment_store.user_num = $usr_num ORDER BY com_id DESC LIMIT 1";
$comm_data = "SELECT comment_store.points,comment_store.edited,comment_store.total_replies,comment_store.upvotes,comment_store.downvotes, comment_store.com_id,comment_store.user_num ,comment_store.com_date , comment_store.com_time , comment_store.comment ,user_info.user_pic , user_info.user_name , user_info.privilege, user_info.first_name, user_info.last_name,user_info.user_desc FROM comment_store JOIN user_info ON comment_store.user_num = user_info.user_num WHERE comment_store.com_page = '$currpage' && comment_store.user_num = $usr_num ORDER BY com_id DESC LIMIT 1; ";


$result = $conn->query($comm_data);

if($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $usrname = $row['user_name'];
        $usrnum = $row['user_num'];
        $usrpic = $row['user_pic'];
        $usrfirstname = $row['first_name'];
        $usrlastname = $row['last_name'];
        $usrdesc = $row["user_desc"];
        $usrcomid = $row["com_id"];
        $totalreplies = $row["total_replies"];
        $replyhide = 'hidemepls';
        $upvotes = $row['upvotes'];
        $downvotes = $row['downvotes'];
        $points = $row['points'];
        $edited = $row['edited'];
        $privil = $row['privilege'];

        $ifaccess = 'hidemepls';
        $ifupvoted = '';
        $ifdownvoted = '';
        $ifedited = 'hidemepls';

        if($upvotes == 0){$upvotes = '';}
        if($downvotes == 0){$downvotes = '';}
        if($totalreplies > 0){$replyhide = '';}
     
        if($usr_comment_votes[$usrcomid] == 'upvoted'){$ifupvoted = 'upvoted';}
        else if($usr_comment_votes[$usrcomid] == 'downvoted'){$ifdownvoted = 'downvoted';}
        

        if($edited == 'true'){$ifedited = '';}
        if($usr_privilege == 'ADMIN' ||$usr_privilege == 'MOD' || $usrnum == $usr_num ){
            $ifaccess = '';
        }

        $time_diff = 'Now';

       //echo similar to highlight except , no <br> , no <div highlight> , com-old -> com-new

        echo "
        <div class='com-wrap$usrcomid'>
        <form class='' target='_blank' method='get' action='/comment section/Userdatabase/user.php' id='com-form$usrcomid'>
        <input name='usr_name' value='$usrname' type='hidden'>
        </form>
        <div style='position:relative'>
  
        <div class='com-new com-body com-body$usrcomid'>
      
        <div class='inside-user-pic-div'><div onmouseover='tooltip_show(\"show\", $usrcomid)' onmouseout='tooltip_show(\"hide\", $usrcomid)' style='position:relative' class='pic-summon'><img class='inside-user-pic' src='" . $row["user_pic"] . "'></div></div>
        <div class='inside-user-name-div'><span onclick='window.open(/Userdatabase/user.php)' class='real-username-div'>" . $row["user_name"]. "&nbsp;⋅</span>
            <span class='time-div'>$time_diff</span><span class='time-div $ifedited com-edited$usrcomid'> <b class='com-color-for-text'>⋅</b> (edited)</span>
        </div><br><br><br>

    <pre class='com-texto com-editable-texto com-editable-texto$usrcomid'> ". $row["comment"]."</pre>
    <div class='com-options'><i onclick='com_vote(\"upvoted\",$usrcomid,\"comment_store\")' class='$ifupvoted com-upvotes$usrcomid fas fa-chevron-up'>$upvotes</i><div class='vertical-buttonus'></div> 
    <i onclick='com_vote(\"downvoted\",$usrcomid,\"comment_store\")' class='$ifdownvoted com-downvotes$usrcomid fas fa-chevron-down'>$downvotes</i>&nbsp;&nbsp;&nbsp;
    <span class='$ifaccess' onclick='edit_com($usrcomid,$usrnum,$usrcomid)'>Edit</span> 
    <b class='$ifaccess'>⋅</b> <span class='$ifaccess' onclick='delete_com($usrcomid,$usrnum,$usrcomid)'>Delete</span> 
    <b class='$ifaccess'>⋅</b> <span onclick='reply_com($usrcomid,$usrnum,$usrcomid,\"$usrname\")'>Reply</span> 
    <b>⋅</b> <span onclick='share_com($usrcomid)'>Share</span> 
    <span class='hidemepls com-cancelEdit$usrcomid' onclick='cancel_com($usrcomid,$usrnum,$usrcomid)'><b style='position:relative;top:0px'>⋅</b> Cancel</span>  
    
    <div class='$replyhide' style='float:right; margin-right:20px'><span class='com-show-replies$usrcomid' onclick='show_replies($usrcomid,$usrcomid)'>Show Replies</span> <span> ($totalreplies)</span></div>
   <!--<span style='float:right; margin-right:20px' class='com-refresh-replies$usrcomid' onclick='refresh_replies($usrcomid)'>Refresh Replies</span>--></div>

    </div>
    <span class='com-tooltip com-tooltip$usrcomid inside-com-tooltip tooltiptextox'>
    <div class='tooltip-user-pic'><div onclick='document.getElementById(\"com-form$usrcomid\").submit()' class='tooltip-user-pic-inner'><img class='tooltip-user-img' src='$usrpic'></div></div>
    <div class='tooltip-user-info'><a onclick='document.getElementById(\"com-form$usrcomid\").submit()' class='tooltip-username'>$usrname</a></div>
    <div class='tooltip-user-info2'><span class='tooltip-userfullname'>$usrfirstname  $usrlastname</span></div>
    <div class='tooltip-user-desc'><p class='tooltip-user-desc-inner'>$usrdesc</p></div>
    <div class='tooltip-user-footer'><span class='$ifaccess logout-span' onclick='logout()'>logout</span></div>

    <div class='tooltip-user-footer'></div>
    
    </span>   
    </div>

    <div class='com-reply-summoner$usrcomid com-reply-summoner'></div>
    </div>
         ";
    }
} 
else {
    echo "Error";
}

?>