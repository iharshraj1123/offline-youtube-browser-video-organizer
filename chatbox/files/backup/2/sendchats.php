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
$talk_usr_num = $_POST["talk_usr_num"];
$type = $_POST["type"];
$talk_usr_name = $_POST["talk_usr_name"];
$talk_usr_img = $_POST["talk_usr_img"];
$text = $_POST["text"];

$text = str_ireplace("!-and-!","&" ,$text);

$url = '@(http)?(s)?(://)?(([a-zA-Z])([-\w]+\.)+([^\s\.]+[^\s]*)+[^,.\s])@';
$text = preg_replace($url, '<a href="http$2://$4" target="_blank" title="$0">$0</a>', $text);

$text = str_ireplace("'","&#39;" ,$text);
$text = str_ireplace("\\","&#92;" ,$text);
$text = str_ireplace("(","&#40;" ,$text);
$text = str_ireplace(")","&#41;" ,$text);
$text = str_ireplace("[","&#91;" ,$text);
$text = str_ireplace("]","&#93;" ,$text);

$text = strip_tags($text,['img','a','b']);

$text = str_ireplace(":gurablush:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/gura blush.jpg\" height=\"100\">" ,$text);
$text = str_ireplace(":letsgo:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/alright lets go.gif\" height=\"100\">" ,$text);
$text = str_ireplace(":aquacry:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/aquaCry.png\" height=\"100\">" ,$text);
$text = str_ireplace(":arthurfist:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/arthurfist.png\" height=\"100\">" ,$text);
$text = str_ireplace(":awkwardmonke:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/awkward monke.png\" height=\"100\">" ,$text);
$text = str_ireplace(":kappa:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/kappa.png\" height=\"100\">" ,$text);
$text = str_ireplace(":matsurismug:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/matsuri smug 3.jpg\" height=\"100\">" ,$text);
$text = str_ireplace(":megumin:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/Megumin_Tsundere.png\" height=\"100\">" ,$text);
$text = str_ireplace(":meguminbored:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/MeguminLurk.png\" height=\"100\">" ,$text);
$text = str_ireplace(":phonelick:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/phone licking.gif\" height=\"100\">" ,$text);
$text = str_ireplace(":PepePerfect:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/PepePerfect.png\" height=\"100\">" ,$text);
$text = str_ireplace(":Swag:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/Swag.png\" height=\"100\">" ,$text);
$text = str_ireplace(":pepenamaste:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/pepe namaste.png\" height=\"100\">" ,$text);
$text = str_ireplace(":amehorny:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/horny amelia watson ame.png\" height=\"100\">" ,$text);
$text = str_ireplace(":huhm:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/huhm.jpg\" height=\"100\">" ,$text);
$text = str_ireplace(":lunagun:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/luna gun.png\" height=\"100\">" ,$text);
$text = str_ireplace(":filthyFrank:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/filthyFrank.png\" height=\"100\">" ,$text);
$text = str_ireplace(":MeguminMope:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/MeguminMope.png\" height=\"100\">" ,$text);
$text = str_ireplace(":notpogbro:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/not pogchamp bruh.gif\" height=\"100\">" ,$text);
$text = str_ireplace(":squidbeg:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/begging squidward.jpg\" height=\"100\">" ,$text);
$text = str_ireplace(":evilPatrick:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/evilPatrick.png\" height=\"100\">" ,$text);
$text = str_ireplace(":pepesweat:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/pepesweat.png\" height=\"100\">" ,$text);
$text = str_ireplace(":saigiribigbrain:","<img alt=\"[Sticker]\" class=\"emogies\" src=\"/comment section/uploads/emogies/saigiri big brain.jpg\" height=\"100\">" ,$text);


echo $text;


//if (preg_match('/*([^"]+)*/', $text, $m)) {
//   $text = $m[1];   
//}

$insert = "INSERT INTO chat_store () VALUES (null,'$type',$talk_usr_num ,'$talk_usr_name','$talk_usr_img',$usr_num ,'$usr_name','$usr_pic',NOW(),NOW(),'$text','false','false')";

 if ($insert && $conn->query($insert) === TRUE) {
    //echo "Comment added successfully";
} else {
   // echo "Error: " . $insert . "<br>" . $conn->error;
}

?>