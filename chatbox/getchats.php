<?php 
session_start();
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$usr_num = $_COOKIE['loggedusernum'];
$talk_usr_num = $_POST["talk_usr_num"];
$chattype= $_POST["chat_type"];

date_default_timezone_set('Asia/Kolkata');

function nice_date($d){
    $ms = array('Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sept','Oct','Nov','Dec');
   // 2021-08-10 , YYYY-MM-DD
    $today = date('d-m-Y');
    $the_return = '';

    $datetime1 = new DateTime($d);
    $datetime2 = new DateTime($today);
    $raw_time_diff = $datetime1->diff($datetime2);
    
    if($raw_time_diff->format('%d')==0) $the_return = "Today";
    elseif($raw_time_diff->format('%d')==1) $the_return = "Yesterday";
    else{
        $the_day = abs(substr($d,8,2));
        if ($the_day != 0){
            $the_return .= ' '.$the_day;
        }
        $the_month = abs(substr($d,5,2));
        if ($the_month != 0) {
            $the_return .= ' ' . $ms[$the_month-1];
        }
    
        $the_year = substr($d,0,4);
        if ($the_year != 0){
            if ($the_return != '') {
                $the_return .= ' ';
            }
            $the_return .= $the_year;
        }
    }
    return $the_return;
}

// function give_date_time_diff2($date,$time){
//     $datetime1 = new DateTime( $date . $time);//start time
//     $date = date("Y-m-d H:i:s");
//     $datetime2 = new DateTime($date);//end time
//     $raw_time_diff = $datetime1->diff($datetime2);
//     $time_diff=NULL;
//     if($raw_time_diff->format('%d')<1){
//         $time_diff = $datetime1->format('h:i A');
//     }
//     elseif($raw_time_diff->format('%m')<1){
//         $time_diff = $datetime1->format('D') . "day";
//     }
//     else{
//         $time_diff = $datetime1->format('d/m/Y');
//     }

//     return $time_diff;
// }
if($chattype == "user"){

    $data = "SELECT X.* FROM (SELECT * FROM chat_store WHERE (chatted_to_id = $usr_num AND chatted_by_id = $talk_usr_num) OR (chatted_to_id = $talk_usr_num AND chatted_by_id = $usr_num)  ORDER BY chat_date DESC, chat_time DESC, chat_id DESC LIMIT 1000) X ORDER BY chat_date, chat_time, chat_id";
    $last_user="";
    $last_date="";
    $result = $conn->query($data);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $chat_text = $row["chat_text"];
            $time = $row["chat_time"];
            $time =  new DateTime($time);
            $time = $time->format('h:i A');
            $date = $row["chat_date"];
            $date2 = nice_date($date);
            $nodate2 = "";
            if($date2 == $last_date) $nodate2 = "hidemepls";
            $last_date = $date2;
            $extramargin="";
            if($last_user != $row["chatted_by_id"] && $last_user !="") $extramargin="extramargin2";
            $last_user = $row["chatted_by_id"];
            
            $chat_id = $row["chat_id"];
            $read = $row["chat_read"];
            $color_chat="chat-r-yellow";

            if($row["chatted_by_id"]==$usr_num){
                $chat_dir = 'chat-r';
            }
            else{$chat_dir = 'chat-l';$color_chat="chat-l-white";}

            $sent_img="";

            if($chat_dir == 'chat-r'){
                if($read == "true") $sent_img = "<img class='sent-icon-right' src='img/check1.png'>";
                else $sent_img = "<img class='sent-icon-right sent1-icon' src='img/sent1.png'>";
            }

            echo "
            <div class='chat-timediv $nodate2'><div>$date2</div></div>
            <div class='chat-outer $extramargin'>
            <div class='$chat_dir'>
            <div class='chat-inner $color_chat' ondblclick='copy_text($chat_id)'><div class='chat-inner-text$chat_id'>$chat_text</div><div class='chat-time'>$time $sent_img</div></div>
            </div>
            </div>
            <p class='hidemepls talk_id_p'>$chat_id</p>
            ";
        }
    }

    $update = "UPDATE chat_store SET chat_read = 'true' WHERE chatted_to_id = $usr_num AND chatted_by_id = $talk_usr_num ORDER BY chat_date DESC, chat_time DESC, chat_id DESC";
    if ($conn->query($update) === TRUE) {} 
    else {}
}
//for groups
else{
    $data = "SELECT X.* FROM (SELECT * FROM chat_store WHERE chatted_to_id = $talk_usr_num ORDER BY chat_date DESC, chat_time DESC, chat_id DESC LIMIT 1000) X ORDER BY chat_date, chat_time, chat_id";
    $last_date="";
    $last_user="";
    $result = $conn->query($data);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $chat_text = $row["chat_text"];
            $time = $row["chat_time"];
            $time =  new DateTime($time);
            $time = $time->format('h:i A');
            $chat_id = $row["chat_id"];
            $read = $row["chat_read"];
            $date = $row["chat_date"];
            $date2 = nice_date($date);
            $nodate2 = "";
            if($date2 == $last_date) $nodate2 = "hidemepls";
            $last_date = $date2;
            $extramargin="";
            if($last_user != $row["chatted_by_id"] && $last_user !="") $extramargin="extramargin";
            $last_user = $row["chatted_by_id"];

            $color_chat="chat-r-yellow";

            if($row["chatted_by_id"]==$usr_num){
                $chat_dir = 'chat-r';
            }
            elseif($row["chatted_by_id"]==3){$chat_dir = 'chat-m';}
            else{$chat_dir = 'chat-l';$color_chat="chat-l-white";}

            $sent_img="";

            $chat_l_username = "";

            $hide_chat_m="";

            if($chat_dir == 'chat-r'){
                if($read == "true") $sent_img = "<img class='sent-icon-right' src='img/check1.png'>";
                else $sent_img = "<img class='sent-icon-right sent1-icon' src='img/sent1.png'>";
            }
            elseif($chat_dir == 'chat-m') $hide_chat_m = "hidemepls";
            else{$chat_l_username = "-left";}

            $user_nameo = "";
            $group_pad="";


            if($row["type"] != "user" && $chat_dir == 'chat-l') {$user_nameo = $row["chat_by_name"];$group_pad="pad-top-chat";}

            if($chat_dir == 'chat-m'){}

            echo "
            <div class='chat-timediv $nodate2'><div>$date2</div></div>
            <div class='chat-outer $extramargin'>
            <div class='$chat_dir'>
            <div class='chat-inner $color_chat $group_pad' ondblclick='copy_text($chat_id)'><a target='_blank' href='/comment%20section/Userdatabase/user.php?usr_name=$user_nameo' class='chat-user-name$chat_l_username $hide_chat_m'>$user_nameo</a><div class='chat-inner-text$chat_id'>$chat_text</div><div class='chat-time $hide_chat_m'>$time $sent_img</div></div>
            </div>
            </div>
            <p class='hidemepls talk_id_p'>$chat_id</p>
            ";
        }
    }

    /*$update = "UPDATE chat_store SET chat_read = 'true' WHERE chatted_to_id = $usr_num AND chatted_by_id = $talk_usr_num ORDER BY chat_date DESC, chat_time DESC";
    if ($conn->query($update) === TRUE) {} 
    else {}*/
}
?>