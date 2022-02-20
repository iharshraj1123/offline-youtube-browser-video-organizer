<?php 
session_start();
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";
//http://rankerz.epizy.com/chatbox/index.php
//
/*
$servername = "sql210.byetcluster.com";
$username = "epiz_24058577";
$password = "bHqvg5YSVJ";
$dbname = "epiz_24058577_userdata";

Things to add: 
- Make New Group
- Delete chats
- Mobile friendly
- Upload images & documents
- Efficient chat refresh
*/

$conn = new mysqli($servername, $username, $password, $dbname);
$islogged = true;
date_default_timezone_set('Asia/Kolkata');

$send_message_username = $_GET["sm"];


$usr_num = $_COOKIE['loggedusernum'] ;
$usr_name = $_COOKIE['loggedusername'];
$usr_pic = $_COOKIE['loggeduserpic'];
$usr_privilege = $_COOKIE['loggeduserprivilege'];
$usr_firstname = $_COOKIE['loggeduserfirstname'];
$usr_lastname = $_COOKIE['loggeduserlastname'];
$usr_desc = $_COOKIE['loggeduseruserdesc'];
$usr_comment_votes = $_COOKIE['comment_votes'];
$usr_members = $_COOKIE['loggedmembers'];


if(!$usr_pic){
    $usr_num = $_SESSION['loggedusernum'] ;
    $usr_name = $_SESSION['loggedusername'];
    $usr_pic = $_SESSION['loggeduserpic'];
    $usr_firstname = $_SESSION['loggeduserfirstname'];
    $usr_lastname = $_SESSION['loggeduserlastname'];
    $usr_desc = $_SESSION['loggeduseruserdesc'];
    $usr_privilege = $_SESSION['loggeduserprivilege'];
    $usr_members = $_SESSION['members'];
    
    if(!$usr_pic){$usr_pic =  '/comment section/userdatabase/profilepic/defaulta.jpg';$islogged = false;}
}
$usr_members_arr = unserialize($usr_members);
$usr_members_arr_sql = implode("','",$usr_members_arr);


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
        else{$time_diff = $raw_time_diff->format('%h') . ' hours ago';}
    }
    elseif($raw_time_diff->format('%i')>0){
        if($raw_time_diff->format('%i') == 1){$time_diff = $raw_time_diff->format('%i') . ' min ago';}
        else{$time_diff = $raw_time_diff->format('%i') . ' mins ago';}
    }
    elseif($raw_time_diff->format('%s')>0){
        if($raw_time_diff->format('%s') == 1){$time_diff = $raw_time_diff->format('%s') . ' second ago';}
        else{$time_diff = $raw_time_diff->format('%s') . ' secs ago';}
    }
    else{$time_diff = 'Now';}

    return $time_diff;
}

?>




<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="./style.css" type="text/css" rel="stylesheet">
    <title>Chat</title>
</head>
<body>
<script>
var send_message_username = "";
var last_chat_id=0;
function add_unreads(x){
    let unreads = parseInt(document.getElementsByClassName(`unreads${x}`)[0].textContent)
    if(unreads > 0)unreads++;
    else unreads = 1;
    
    document.getElementsByClassName(`unreads${x}`)[0].textContent = unreads;
    document.getElementsByClassName(`index-msg-extra-notifs${x}`)[0].classList.remove("hidemepls")

}

function delete_unreads(x){
    document.getElementsByClassName(`index-msg-extra-notifs${x}`)[0].remove()
}

function hide_unreads(x){
    document.getElementsByClassName(`index-msg-extra-notifs${x}`)[0].classList.add("hidemepls")
}

</script>
<?php if($send_message_username != "")echo "<script>send_message_username = '$send_message_username';</script>";?>

<form class="hidemepls" id="new-grp-form" enctype="multipart/form-data" method="post" target="_self" action="/comment section/loggin.php">
<input id="input-type" class="hidemepls" type="text" name="chat_type">
</form>


<div class="container">

    <div class="container-left">
		<div class="chat">
			<div class="chat-header">
				<div class="profile">
					<div class="left">
						<a target="<?php if($islogged){echo "_blank";}else{echo "_self";}?>" href="<?php if($islogged){echo "/comment%20section/Userdatabase/me.php";}else{echo "/comment section/loggin.php";}?>">
						    <img src="<?php echo $usr_pic?>" class="pp">
                        </a>
				
						
					</div>
					<div class="right dropdown">
						    <img onclick="left_drop_btn()" src="img/baseline_add_white_24dp.png" class="icon add dropbtn">
                            <div id="leftDropdown" class="dropdown-content">
                                <a class="dropdown-a" onclick="message_on()" href="#User">Add User</a>
                                <a class="dropdown-a" onclick="message_on_grp()" href="#Group">Add Group</a>
                                <a class="dropdown-a" onclick="message_on_new_grp()" href="#NewGroup">Make a new Group</a>
                            </div>
						<a href='/comment section/logout.php'><img src="img/logout.png" class="icon dotmenu dotmenu-index"></a>
					</div>
				</div>
			</div>
			<div class="chat-box">
               

                <?php
                $poped_id = [0];
                $chat_id_arr = [0];
                $data = "SELECT * FROM chat_store WHERE (chatted_to_id = $usr_num OR chatted_by_id = $usr_num OR chatted_to_id IN ('$usr_members_arr_sql')) ORDER BY chat_date DESC, chat_time DESC, chat_id DESC";

                $result = $conn->query($data);
                if($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        
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

                            array_push($poped_id, $chat_by_id);
                            array_push($chat_id_arr, $chat_id);
                            $nice_time_diff = give_date_time_diff($chat_date,$chat_time);
                            $nice_time_diff2 = give_date_time_diff2($chat_date,$chat_time);


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
                            <div class='index-msg-extra index-msg-extra$chat_by_id'><span class='index-msg-extra-notifs index-msg-extra-notifs$chat_by_id'>
                                <span class='index-msg-extra-notifs-inside unreads$chat_by_id'>1</span></span>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                <p class='hidemepls left-chat-id-p'>$chat_id</p>
                <p class='hidemepls left-chat-type-p'>$type</p>
                        ";
                        if($read == "true") echo "<script>delete_unreads($chat_by_id)</script>";
                        

                        }
                        else{
                            array_push($chat_id_arr, $chat_id);
                            if($read == "false")echo "<script>add_unreads($chat_by_id)</script>";
                        }
                    }//^^^if chatted to =usernum




            //if chatted by =usernum
            
            else{
                        if(in_array($chat_to_id, $poped_id)==false){
                            if($usr_num == $chat_by_id){
                                if($read == "true") $sent_img = "<img class='sent-icon-left' src='img/check1.png'>";
                                else $sent_img = "<img class='sent-icon-left sent1-icon' src='img/sent1.png'>";}
                                else {$sent_img = "<b>$chat_by_name</b>&nbsp;:&nbsp;";}

                            array_push($poped_id, $chat_to_id);
                            array_push($chat_id_arr, $chat_id);
                            $nice_time_diff = give_date_time_diff($chat_date,$chat_time);
                            $nice_time_diff2 = give_date_time_diff2($chat_date,$chat_time);


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
                            <div class='index-msg-extra index-msg-extra$chat_to_id'><span class='index-msg-extra-notifs hidemepls index-msg-extra-notifs$chat_to_id'>
                                <span class='index-msg-extra-notifs-inside unreads$chat_to_id'>0</span></span>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                <p class='hidemepls left-chat-type-p'>$type</p>
                <p class='hidemepls left-chat-id-p'>$chat_id</p>
                        ";
                        //if($read == "true") echo "<script>delete_unreads($chat_to_id)</script>";
                        

                        }
                        else{
                          //  array_push($chat_id_arr, $chat_id);
                           // if($read == "false")echo "<script>add_unreads($chat_to_id)</script>";
                        }
                }//if chatted by =usernum ENDS


                    }

                }

                echo "<script>last_chat_id=$chat_id_arr[1]</script>";
                
                ?>
			</div>

		</div>
	</div>

    <!--------talk header------->

    <div class="container-right mobile-hide">
        <div class="talk-header">
            <div class="talk-header-inner">
                <div class="talk-header-left">
                    <div class='talk-header-img-div'><img class='talk-header-arrow nomobile-hide' onclick="gobackarrow()" src='img/arrow.png'><a target="_blank" class="talk-header-link" href="#"><img class='talk-header-img hidemepls' src=''></a></div>
                    <div class="talk-header-username"></div>
                </div>
                <div class="talk-header-right">
                    <div onclick="header_dot()" class="three-dots"></div>
                </div>
            </div>
        </div>


        <!--------talk middle/main-------->

        <div onscroll="talk_main_scrolled()" class="talk-main">
            <div class="talk-main-inside">
                <div class="summon-chats" ></div>
            </div>
        <div class="go-bottom-talk-div hidemepls"><img class="go-bottom-img" onclick="gobottom()" src="img/down-arrow.png"><div class="go-bottom-exclaim hidemepls">!</div></div>

        </div>


        <!--------footer------->
        <div class="chat-footer-outer">
            <div class="footer-emogies-div hidemepls" style="flex-direction:column;">
                <div>
                <img class="emogies-choose" onclick="add_emogie(':gurablush:')" ondblclick="send_text2(':gurablush:')" src="/comment section/uploads/emogies/gura blush.jpg">
                <img class="emogies-choose" onclick="add_emogie(':aquacry:')" ondblclick="send_text2(':aquacry:')" src="/comment section/uploads/emogies/aquaCry.png">
                <img class="emogies-choose" onclick="add_emogie(':kappa:')" ondblclick="send_text2(':kappa:')" src="/comment section/uploads/emogies/kappa.png">
                <img class="emogies-choose" onclick="add_emogie(':matsurismug:')" ondblclick="send_text2(':matsurismug:')" src="/comment section/uploads/emogies/matsuri smug 3.jpg">
                <img class="emogies-choose" onclick="add_emogie(':megumin:')" ondblclick="send_text2(':megumin:')" src="/comment section/uploads/emogies/Megumin_Tsundere.png">
                <img class="emogies-choose" onclick="add_emogie(':meguminbored:')" ondblclick="send_text2(':meguminbored:')" src="/comment section/uploads/emogies/MeguminLurk.png">
                <img class="emogies-choose" onclick="add_emogie(':awkwardmonke:')" ondblclick="send_text2(':awkwardmonke:')" src="/comment section/uploads/emogies/awkward monke.png">
                <img class="emogies-choose" onclick="add_emogie(':phonelick:')" ondblclick="send_text2(':phonelick:')" src="/comment section/uploads/emogies/phone licking.gif">
                <img class="emogies-choose" onclick="add_emogie(':PepePerfect:')" ondblclick="send_text2(':PepePerfect:')" src="/comment section/uploads/emogies/PepePerfect.png">
                <img class="emogies-choose" onclick="add_emogie(':Swag:')" ondblclick="send_text2(':Swag:')" src="/comment section/uploads/emogies/Swag.png">
                <img class="emogies-choose" onclick="add_emogie(':pepenamaste:')" ondblclick="send_text2(':pepenamaste:')" src="/comment section/uploads/emogies/pepe namaste.png">
                </div>
                <div>
                <img class="emogies-choose" onclick="add_emogie(':amehorny:')" ondblclick="send_text2(':amehorny:')" src="/comment section/uploads/emogies/horny amelia watson ame.png">
                <img class="emogies-choose" onclick="add_emogie(':lunagun:')" ondblclick="send_text2(':lunagun:')" src="/comment section/uploads/emogies/luna gun.png">
                <img class="emogies-choose" onclick="add_emogie(':filthyFrank:')" ondblclick="send_text2(':filthyFrank:')" src="/comment section/uploads/emogies/filthyFrank.png">
                <img class="emogies-choose" onclick="add_emogie(':MeguminMope:')" ondblclick="send_text2(':MeguminMope:')" src="/comment section/uploads/emogies/MeguminMope.png">
                <img class="emogies-choose" onclick="add_emogie(':evilPatrick:')" ondblclick="send_text2(':evilPatrick:')" src="/comment section/uploads/emogies/evilPatrick.png">
                <img class="emogies-choose" onclick="add_emogie(':pepesweat:')" ondblclick="send_text2(':pepesweat:')" src="/comment section/uploads/emogies/pepesweat.png">
                <img class="emogies-choose" onclick="add_emogie(':saigiribigbrain:')" ondblclick="send_text2(':saigiribigbrain:')" src="/comment section/uploads/emogies/saigiri big brain.jpg">
                <img class="emogies-choose" onclick="add_emogie(':squidbeg:')" ondblclick="send_text2(':squidbeg:')" src="/comment section/uploads/emogies/begging squidward.jpg">
                <img class="emogies-choose" onclick="add_emogie(':notpogbro:')" ondblclick="send_text2(':notpogbro:')" src="/comment section/uploads/emogies/not pogchamp bruh.gif">
                <img class="emogies-choose" onclick="add_emogie(':huhm:')" ondblclick="send_text2(':huhm:')" ondblclick="send_text()" src="/comment section/uploads/emogies/huhm.jpg">
                </div>
            </div>
            <div class="footer-left">
			    <img src="img/emo.png" onclick="emogie_bar()" class="emo"/>
			    <img class="attatch" onclick="attach()" src="img/attach file.png">
            </div>
            <div class="footer-middle">
				<textarea onkeyup="text_keyup()" placeholder="Type a message" class="talk-text"></textarea>
		    </div>
            <div class="footer-right">
                <img src="img/mic.png" class="mic">
                <img onclick="send_text()" src="img/send2.png" class="hidemepls send">
            </div>
        </div>
    </div>


</div>  

    <audio id="notif-audio">
        <source src="./resources/notification.mp3" type="audio/mpeg">
    </audio> 
    <script src="./script.js"></script>
    <script src="./resources/my JS library.js"></script>
</body>
</html>

