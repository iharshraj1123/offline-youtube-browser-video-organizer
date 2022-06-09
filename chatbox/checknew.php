<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";
error_reporting(0);

$conn = new mysqli($servername, $username, $password, $dbname);

date_default_timezone_set('Asia/Kolkata');

$usr_num = $_COOKIE['loggedusernum'];
$last_chat_id = $_POST["last_chat_id"];
$last_chat_id = (int)$last_chat_id;
$usr_members = $_COOKIE['loggedmembers'];
$usr_members_arr = unserialize($usr_members);
$usr_members_arr_sql = implode("','",$usr_members_arr);


function give_date_time_diff($date,$time){

    $datetime1 = new DateTime( $date . $time);//start time
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
        else{$time_diff = $raw_time_diff->format('%h') . ' hrs ago';}
    }
    elseif($raw_time_diff->format('%i')>0){
        if($raw_time_diff->format('%i') == 1){$time_diff = $raw_time_diff->format('%i') . ' min ago';}
        else{$time_diff = $raw_time_diff->format('%i') . ' mins ago';}
    }
    elseif($raw_time_diff->format('%s')>0){
        if($raw_time_diff->format('%s') == 1){$time_diff = $raw_time_diff->format('%s') . ' sec ago';}
        else{$time_diff = $raw_time_diff->format('%s') . ' secs ago';}
    }
    else{$time_diff = 'Now';}

    return $time_diff;
}

function give_date_time_diff2($date,$time){
    $datetime1 = new DateTime( $date . $time);//start time
    $date = date("Y-m-d H:i:s");
    $datetime2 = new DateTime($date);//end time
    $raw_time_diff = $datetime1->diff($datetime2);
    $time_diff=NULL;
    if($raw_time_diff->format('%d')<1){
        $time_diff = $datetime1->format('h:i A');
    }
    elseif($raw_time_diff->format('%m')<1){
        $time_diff = $datetime1->format('D') . "day";
    }
    else{
        $time_diff = $datetime1->format('d/m/Y');
    }

    return $time_diff;
}

$poped_id = [0]; 
$data = "SELECT * FROM chat_store WHERE (chatted_to_id = $usr_num OR chatted_by_id = $usr_num OR chatted_to_id IN ('$usr_members_arr_sql')) ORDER BY chat_date DESC, chat_time DESC, chat_id DESC";
$unreads_arr = [0];
$loop_count =0;

$result = $conn->query($data);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $loop_count++;

        
        $chat_id= $row["chat_id"];
        $type = $row["type"];
        $chat_to_id= $row["chatted_to_id"];
        $chat_to_name = $row["chat_to_name"];
        $chat_to_img = $row["chat_to_img"];
        $chat_by_id = $row["chatted_by_id"];
        $chat_by_name = $row["chat_by_name"];
        $chat_by_img = $row["chat_by_img"];
        $chat_date = $row["chat_date"];
        $chat_time = $row["chat_time"];
        $chat_text = $row["chat_text"];
        $read = $row["chat_read"];
        $edited = $row["chat_edited"];

        $chat_text = str_ireplace("src=","" ,$chat_text);                  
        $chat_text = str_ireplace("href=","" ,$chat_text);


if($chat_to_id == $usr_num){

        if(in_array($chat_by_id, $poped_id)==false){
            $chat_read_hide= "";

            array_push($poped_id, $chat_by_id);
            $nice_time_diff = give_date_time_diff($chat_date,$chat_time);
            $nice_time_diff2 = give_date_time_diff2($chat_date,$chat_time);

            if($read == "true"){
                $chat_read_hide = "hidemepls";
            }
            else{
                $unreads_arr[$chat_by_id] = 1;
            }

        echo "
    <div class='index-msg-outer index-msg-outer$chat_by_id'>
    <div onclick='getchats($chat_by_id,`$chat_by_img`,`$chat_by_name`,`$type`)' class='index-msg-inner index-msg-inner$chat_by_id'>
        <div class='index-msg-sender-left'><img class='index-msg-sender-img' src='$chat_by_img' ></div>
        <div class='index-msg-sender-midright'>
        <div class='index-msg-sender-middle'>
            <div class='index-msg-chattername'>$chat_by_name</div>
            <div class='index-msg-chat-text index-msg-chat-text$chat_by_id'>$chat_text</div>
        </div>
        <div class='index-msg-sender-right'>
            <div class='index-msg-time'>$nice_time_diff2</div>
            <div class='index-msg-time-diff'>$nice_time_diff</div>
            <div class='index-msg-extra index-msg-extra$chat_by_id'><span class='$chat_read_hide index-msg-extra-notifs index-msg-extra-notifs$chat_by_id'>
                <span class='index-msg-extra-notifs-inside unreads$chat_by_id'>1</span></span>
                <p class='hidemepls chat-id-p'>$chat_by_id</p>
            </div>
        </div>
        </div>
    </div>
</div>
<p class='hidemepls left-chat-id-p'>$chat_id</p>
<p class='hidemepls left-chat-type-p'>$type</p>
        ";

        }
        else{
            if($read == "false")
            {
                $unreads_arr[$chat_by_id] = $unreads_arr[$chat_by_id]+ 1;
                echo "<p class='hidemepls unreads-p$chat_by_id'>$unreads_arr[$chat_by_id]</p>";
            }
        }

    }

//chat by id = usernum   
else{

    if(in_array($chat_to_id, $poped_id)==false){
            $chat_read_hide= "";

            if($usr_num == $chat_by_id){
                if($read == "true") $sent_img = "<img class='sent-icon-left' src='img/check1.png'>";
                else $sent_img = "<img class='sent-icon-left sent1-icon' src='img/sent1.png'>";}
            else {$sent_img = "<b>$chat_by_name</b>&nbsp;:&nbsp;";}

            array_push($poped_id, $chat_to_id);
            $nice_time_diff = give_date_time_diff($chat_date,$chat_time);
            $nice_time_diff2 = give_date_time_diff2($chat_date,$chat_time);

            if($read == "true"){
                $chat_read_hide = "hidemepls";
            }
            else{
                $unreads_arr[$chat_by_id] = 1;
            }

        echo "
    <div class='index-msg-outer index-msg-outer$chat_to_id'>
    <div onclick='getchats($chat_to_id,`$chat_to_img`,`$chat_to_name`,`$type`)' class='index-msg-inner index-msg-inner$chat_to_id'>
        <div class='index-msg-sender-left'><img class='index-msg-sender-img' src='$chat_to_img' ></div>
        <div class='index-msg-sender-midright'>
        <div class='index-msg-sender-middle'>
            <div class='index-msg-chattername'>$chat_to_name</div>
            <div class='index-msg-chat-text index-msg-chat-text$chat_to_id'>$sent_img$chat_text</div>
        </div>
        <div class='index-msg-sender-right'>
            <div class='index-msg-time'>$nice_time_diff2</div>
            <div class='index-msg-time-diff'>$nice_time_diff</div>
            <div class='index-msg-extra index-msg-extra$chat_to_id'><span class='$chat_read_hide index-msg-extra-notifs hidemepls index-msg-extra-notifs$chat_to_id'>
                <span class='index-msg-extra-notifs-inside unreads$chat_to_id'>1</span></span>
                <p class='hidemepls chat-id-p'>$chat_to_id</p>
            </div>
        </div>
        </div>
    </div>
</div>
<p class='hidemepls left-chat-id-p'>$chat_id</p>
<p class='hidemepls left-chat-type-p'>$type</p>
        ";

        }
        else{
            /* if($read == "false")
            {
                $unreads_arr[$chat_to_id] = $unreads_arr[$chat_to_id]+ 1;
                echo "<p class='hidemepls unreads-p$chat_to_id'>$unreads_arr[$chat_to_id]</p>";
            }*/
        }
}



}
}

?>