<?php 
session_start();
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname); 

$currpage = $_SESSION['curr_page'];
$comoid = $_POST['comoid'] ;
$usr_num = $_COOKIE['loggedusernum'] ;
$privil = $_COOKIE['loggeduserprivilege'];


$usr_reply_votes = '';

$getdata = "SELECT user_info.reply_votes FROM user_info WHERE user_num = $usr_num";
$gotdata = $conn->query($getdata);
if($gotdata->num_rows > 0) {
    // output data of each row
    while($datagot = $gotdata->fetch_assoc()) {
        $usr_reply_votes = $datagot['reply_votes'];
        setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");
    }
}

$usr_reply_votes = unserialize($usr_reply_votes);


$comm_data2 = "SELECT reply_store.points,reply_store.edited, reply_store.replied_to, reply_store.upvotes, reply_store.downvotes, reply_store.com_id,reply_store.user_num ,reply_store.reply_date , reply_store.reply_time , reply_store.reply , reply_store.reply_id, user_info.user_pic , user_info.user_name , user_info.privilege, user_info.first_name, user_info.last_name,user_info.user_desc FROM reply_store JOIN user_info ON reply_store.user_num = user_info.user_num WHERE reply_store.com_id = $comoid && reply_store.page = '$currpage' ORDER BY reply_store.reply_id ASC";
$result2 = $conn->query($comm_data2);

    if($result2->num_rows > 0) {
        while($row2 = $result2->fetch_assoc()) {
                static $round = 0;

                $usrname2 = $row2['user_name'];
                $usrnum2 = $row2['user_num'];
                $usrpic2 = $row2['user_pic'];
                $usrfirstname2 = $row2['first_name'];
                $usrlastname2 = $row2['last_name'];
                $usrdesc2 = $row2["user_desc"];
                $usrcomid2 = $row2["com_id"];
                $usrreplyid2 = $row2["reply_id"];
                $usrrepliedto = $row2["replied_to"];
                $upvotes = $row2['upvotes'];
                $downvotes = $row2['downvotes'];
                $points = $row2['points'];
                $edited = $row2['edited'];
         

                $ifaccess = 'hidemepls';
                $ifupvoted = '';
                $ifdownvoted = '';
                if($upvotes == 0){$upvotes = '';}
                if($downvotes == 0){$downvotes = '';}
             
                if($usr_reply_votes[$usrreplyid2] == 'upvoted'){$ifupvoted = 'upvoted';}
                else if($usr_reply_votes[$usrreplyid2] == 'downvoted'){$ifdownvoted = 'downvoted';}

                $ifedited = 'hidemepls';
                if($edited == 'true'){$ifedited = '';}

                if($privil == 'ADMIN' || $privil == 'MOD' || $usrnum2 == $usr_num ){
                    $ifaccess = '';
                }

                $datetime3 = new DateTime( $row2["reply_time"] . $row2["reply_date"]);//start time
                $date2 = date("Y-m-d H:i:s");
                $datetime4 = new DateTime($date2);//end time
                $raw_time_diff2 = $datetime3->diff($datetime4);
                $time_diff2 = 0;
                if($raw_time_diff2->format('%y')>0){
                    if($raw_time_diff2->format('%y') == 1){$time_diff2 = $raw_time_diff2->format('%y') . ' year ago';}
                    else{$time_diff2 = $raw_time_diff2->format('%y') . ' years ago';}
                } 
                elseif($raw_time_diff2->format('%m')>0){
                    if($raw_time_diff2->format('%m') == 1){$time_diff2 = $raw_time_diff2->format('%m') . ' month ago';}
                    else{$time_diff2 = $raw_time_diff2->format('%m') . ' months ago';}
                }
                elseif($raw_time_diff2->format('%d')>0){
                    if($raw_time_diff2->format('%d') == 1){$time_diff2 = $raw_time_diff2->format('%d') . ' day ago';}
                    else{$time_diff2 = $raw_time_diff2->format('%d') . ' days ago';}
                }
                elseif($raw_time_diff2->format('%h')>0){
                    if($raw_time_diff2->format('%h') == 1){$time_diff2 = $raw_time_diff2->format('%h') . ' hour ago';}
                    else{$time_diff2 = $raw_time_diff2->format('%h') . ' hours ago';}
                }
                elseif($raw_time_diff2->format('%i')>0){
                    if($raw_time_diff2->format('%i') == 1){$time_diff2 = $raw_time_diff2->format('%i') . ' minute ago';}
                    else{$time_diff2 = $raw_time_diff2->format('%i') . ' minutes ago';}
                }
                elseif($raw_time_diff2->format('%s')>0){
                    if($raw_time_diff2->format('%s') == 1){$time_diff2 = $raw_time_diff2->format('%s') . ' second ago';}
                    else{$time_diff2 = $raw_time_diff2->format('%s') . ' seconds ago';}
                }
                else{$time_diff2 = 'Now';}
                echo "
                <div class='reply-body-wrap'>
                <form class='' target='_blank' method='get' action='/comment section/Userdatabase/user.php' id='com-form$usrreplyid2'>
                <input name='usr_name' value='$usrname2' type='hidden'>
                </form>
                <div class='outside-reply-body$usrreplyid2' style='position:relative'>
                <div class='com-body reply-body reply-body$usrreplyid2'>
                <div class='inside-user-pic-div'><div onmouseover='tooltip_reply_show($usrreplyid2,\"show\")' onmouseout='tooltip_reply_show($usrreplyid2,\"hide\")' style='position:relative' class='reply-pic-summon'><img class='inside-user-pic' src='" . $row2["user_pic"] . "'></div></div>
                <div class='inside-user-name-div'><span onclick='window.open(/Userdatabase/user.php)' class='real-username-div'>" . $row2["user_name"]. "&nbsp;⋅</span>
                    <span class='time-div'>$time_diff2</span> <b class='com-color-for-text'>⋅</b> <span class='time-div'><i class='fas fa-reply'></i> <i>$usrrepliedto</i></span><span class='time-div $ifedited rep-edited$usrreplyid2'> <b class='com-color-for-text'>⋅</b> (edited)</span>
                </div><br><br><br>

               <pre class='com-texto rep-texto reply-editable-texto$usrreplyid2'><p class='com-texto-p'>". $row2["reply"]."</p></pre>

               <div class='com-options'><i onclick='com_vote(\"upvoted\",$usrreplyid2,\"reply_store\")' class='$ifupvoted rep-upvotes$usrreplyid2 fas fa-chevron-up'>$upvotes</i><div class='vertical-buttonus'></div> 
               <i onclick='com_vote(\"downvoted\",$usrreplyid2,\"reply_store\")' class='$ifdownvoted rep-downvotes$usrreplyid2 fas fa-chevron-down'>$downvotes</i>&nbsp;&nbsp;&nbsp;
               <span class='$ifaccess' onclick='edit_rep($usrreplyid2,$usrnum2)'>Edit</span> <b class='$ifaccess'>⋅</b> 
               <span class='$ifaccess' onclick='delete_rep($usrreplyid2,$usrnum2,$usrcomid2)'>Delete</span> <b class='$ifaccess'>⋅</b> 
               <span onclick='reply_rep($usrreplyid2,$usrnum2,\"$usrname2\",$usrcomid2)'>Reply</span>  
               <span class='hidemepls rep-cancelEdit$usrreplyid2' onclick='cancel_rep($usrreplyid2,$usrnum2)'><b style='position:relative;top:0px'>⋅</b> Cancel</span></div>

               </div>
               <span style='top:0%;margin-left:210px' class='reply-tooltip$usrreplyid2 tooltiptextox3 tooltiptextox'>
               <div class='tooltip-user-pic'><div onclick='document.getElementById(\"com-form$usrreplyid2\").submit()' class='tooltip-user-pic-inner'><img class='tooltip-user-img' src='$usrpic2'></div></div>
               <div class='tooltip-user-info'><a onclick='document.getElementById(\"com-form$usrreplyid2\").submit()' class='tooltip-username'>$usrname2</a></div>
               <div class='tooltip-user-info2'><span class='tooltip-userfullname'>$usrfirstname2  $usrlastname2</span></div>
               <div class='tooltip-user-desc'><p class='tooltip-user-desc-inner'>$usrdesc2</p></div>
               <div class='tooltip-user-footer'></div>
               </span>
               </div>
               </div>

                ";



        }

    }
    else{echo "<p style='text-align:center'>No Replies Found :(</p>";}






?>