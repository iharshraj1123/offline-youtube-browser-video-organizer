<?php 
error_reporting(0);
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname); 
date_default_timezone_set('Asia/Kolkata');

$usr_num = $_COOKIE['loggedusernum'] ;
$usr_name = $_COOKIE['loggedusername'];
$usr_pic = $_COOKIE['loggeduserpic'];
$usr_privilege = $_COOKIE['loggeduserprivilege'];
$usr_firstname = $_COOKIE['loggeduserfirstname'];
$usr_lastname = $_COOKIE['loggeduserlastname'];
$usr_desc = $_COOKIE['loggeduseruserdesc'];
$usr_comment_votes = $_COOKIE['comment_votes'];

//$usr_reply_votes = $_COOKIE['reply_votes'];

$getdata = "SELECT user_info.comment_votes FROM user_info WHERE user_num = $usr_num";
$gotdata = $conn->query($getdata);
if($gotdata->num_rows > 0) {
    // output data of each row
    while($datagot = $gotdata->fetch_assoc()) {
        $usr_comment_votes = $datagot['comment_votes'];
       // $usr_reply_votes = $datagot['reply_votes'];
        setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
      //  setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");
    }
}

$usr_comment_votes = unserialize($usr_comment_votes);


$hidome = '';
$hidome2 = 'hidemepls';
$placoholder = 'Please login or signup';

if(!$usr_pic){
    $usr_num = $_SESSION['loggedusernum'] ;
    $usr_name = $_SESSION['loggedusername'];
    $usr_pic = $_SESSION['loggeduserpic'];
    $usr_firstname = $_SESSION['loggeduserfirstname'];
    $usr_lastname = $_SESSION['loggeduserlastname'];
    $usr_desc = $_SESSION['loggeduseruserdesc'];
    $usr_privilege = $_SESSION['loggeduserprivilege'];
    
    if(!$usr_pic){$usr_pic =  '/comment section/userdatabase/profilepic/defaulta.jpg';}
}


if($usr_name){
    $placoholder = 'Start the discussion';
    $hidome = 'hidemepls';
    $hidome2 = '';
    echo "<script>setInterval(function(){loggedino = true;},1000)</script>";
}

//com_highlight must be at end
$insert = null;
$temp_curr_url = $_SERVER['REQUEST_URI'];
if (strpos($temp_curr_url, '?&com_highlight') !== false) $temp_curr_url2 = explode("?&com_highlight", $temp_curr_url);
//elseif (strpos($temp_curr_url, '&com_highlight') !== false) $temp_curr_url2 = explode("&com_highlight", $temp_curr_url);
else $temp_curr_url2 = explode("&com_highlight", $temp_curr_url);
$_SESSION["curr_page"]=htmlspecialchars($temp_curr_url2[0]);
$currpage = $_SESSION['curr_page'];

//echo $currpage;

if($_SESSION['redirected']){
    $com_inp = $_POST['com_inp'] ;
    $find1 = "script";
    $find2 = "'";
    $find3 = "<video";
    $find4 = "<img";
    $find5 = "<link";
    $find6 = "<style";
    $find7 = "<?";

   // $find5 = 'width="';
   // $find6 = "*/";

    $replace1 = "scripo";
    $replace2 = '&#39;';
    $replace3 = '<br><video onloadstart="this.volume=0.5" class="com_video"';
    $replace5 = '<linko';
    $replace6 = '<styleo';
    $replace7 = '&#60;&#63;';
  //  $replace4 = '<img class="com_img"';

  //  $replace5 = '<b>';
 //   $replace6 ='</b>';

    $com_inp = str_replace($find1,$replace1,$com_inp);
    $com_inp = str_replace($find2,$replace2,$com_inp);
    $com_inp = str_replace($find3,$replace3,$com_inp);
    $com_inp = str_replace($find5,$replace5,$com_inp);
    $com_inp = str_replace($find6,$replace6,$com_inp);
    $com_inp = str_replace($find7,$replace7,$com_inp);

 //   $com_inp = str_replace($find4,$replace4,$com_inp);
  //  $com_inp = str_replace($find5,$replace5,$com_inp);

    $insert = "INSERT INTO comment_store () VALUES (null , '$currpage' , $usr_num , NOW() , NOW() , '$com_inp',0,0,0,0,'false')";
    $_SESSION['redirected'] = false;

    if ($insert && $conn->query($insert) === TRUE) {
        echo "<script>alert('Your Post was submitted successfully!!')</script>";
    } else {
       // echo "Error: " . $insert . "<br>" . $conn->error;
    }
}

function give_nice_diff($datetime1,$datetime2){
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
return $time_diff;
}
?>


<script type="text/javascript">

var linkorokimo = document.createElement( "link" );
linkorokimo.href = "/comment section/comments.css";
linkorokimo.type = "text/css";
linkorokimo.rel = "stylesheet";
linkorokimo.media = "screen,print";

document.getElementsByTagName( "head" )[0].appendChild(linkorokimo);

var linkorokimo2 = document.createElement( "link" );
linkorokimo2.href = "/comment section/others/font-awesome2/font-awesome2.css";
linkorokimo2.type = "text/css";
linkorokimo2.rel = "stylesheet";
linkorokimo2.media = "screen,print";

document.getElementsByTagName( "head" )[0].appendChild(linkorokimo2);

</script>
<style>
.flex-display-com-old{
    display: flex !important;
}
</style>
<div class="com_debuggero hidemepls">
    curr_page = <?php echo $currpage;?>
</div>

<div class='com-popup-summoner'></div>
<!------------------------------------FORM START-------------------------------------->
<form id="formoplso" enctype="multipart/form-data" method="post" action="/comment section/redirect.php">
<div class="upload-form-div">
    <input onchange="file_inputd();" type="file" name="fileToUpload" accept="image/png, image/jpeg, image/gif, video/mp4" id="ImageUpload">
 
    <br>
    <input id="file_name" type="text" name="file_name" >
<textarea id="com-textarea2" name="com_inp"></textarea>
</div>
</form>


<!-----------------COMMENT START-------------->
<div class="commenter-body"> 

<hr class="outro-hr">




    <div class="comment-flex">
    <div aria-multiline="true" class="edit-div"></div>
    <span class="tooltiptextox com-tooltip com-tooltip0 tooltiptextox2">
            <div class="tooltip-user-pic"><div title='View Profile' onclick="window.open('/comment section/Userdatabase/me.php','_blank')" class="tooltip-user-pic-inner"><img class="tooltip-user-img" src="<?php echo $usr_pic;?>"></div></div>
            <div class="tooltip-user-info"><a title='View Profile' target="_blank" href="/comment section/Userdatabase/me.php" class="tooltip-username"><?php echo $usr_name ?></a></div>
            <div class="tooltip-user-info2"><span class="tooltip-userfullname"><?php echo $usr_firstname . ' ' . $usr_lastname ?></span></div>
            <div class="tooltip-user-desc"><p class="tooltip-user-desc-inner"><?php echo $usr_desc ?></p></div>
            <div class="tooltip-user-footer"><span class="<?php echo $hidome2?> logout-span" onclick="logout()">logout</span></div>
        </span>
        <div class="user-pic-div"><div onmouseover='tooltip_show("show", 0)' onmouseout='tooltip_show("hide", 0)' class="com-user-div pic-summon"><img class="com-user-img" src="<?php echo $usr_pic;?>">
        
        </div>
        </div>

        <div class="comment-box">
            <div clas="textarea-container">
                <textarea required onclick="click_textoarea = true;com_div_clicked()" placeholder="<?php echo $placoholder?>" class="com-textarea" id="com-textarea"></textarea>
            </div>
            <div style="position: relative">
                <div  id="buttonus-container" class="buttonus-container hidemepls">
                    <div  class="buttonus-container-left">
                        <i title='Video' onclick="icon_clicked('video')" class="buttonus-icon buttonus-icon1 far fa-images"></i>
                        <i title='Image: Jpeg, png or GIF' onclick="icon_clicked('image')" class="buttonus-icon buttonus-icon1 far fa-image"></i>

                        <div class="vertical-buttonus"></div>
                        <i title='Bold' onclick="icon_clicked('bold')" class="buttonus-icon buttonus-icon2 fas fa-bold"></i>
                        <i title='Italic' onclick="icon_clicked('italic')" class="buttonus-icon buttonus-icon2 fas fa-italic"></i>
                        <i title='Underlined' onclick="icon_clicked('underline')" class="buttonus-icon buttonus-icon2 fas fa-underline"></i>
                        <div class="buttonus-container-left-p2">
                        <i title='Stike-through' onclick="icon_clicked('strike')" class="buttonus-icon buttonus-icon2 fas fa-strikethrough"></i>
                        <i title='link' onclick="icon_clicked('link')" class="buttonus-icon buttonus-icon2 fas fa-link"></i>
                        <i title='Spoiler' onclick="icon_clicked('spoiler')" class="buttonus-icon buttonus-icon2 fas fa-eye"></i>
                        <i title='Code' onclick="icon_clicked('code')" class="buttonus-icon buttonus-icon2 fas fa-code"></i>
                        <i title='Quote' onclick="icon_clicked('quote')" class="buttonus-icon buttonus-icon2 fas fa-quote-left"></i>
                        <i title='Click to toggle Maths Bar , Write in between <eqn-space> tags' onclick="icon_clicked('maths');document.getElementsByClassName('maths-container')[0].classList.toggle('hidemepls')" style="font-size:22px;font-weight:800;bottom:0" class="buttonus-icon buttonus-icon2"><b>Maths</b></i>
                        </div>
                    </div>
                        
                <!-------------POST BUTTON-------------->

                    <div class="buttonus-container-right">
                        <span onclick="com_main_cancel_butn()" class='com-cancel-butn'>Cancel</span>
                        <input id="submit_buttonus" class="buttonus5" name="submit_com" value="Post" type="submit">
                    </div>
                <!--------------SUBMIT BUTTON------------------>
      

                </div>

                <div class="maths-container hidemepls">
                    <i title='Limits' onclick="icon_clicked('limit')" class="buttonus-icon buttonus-icon2"><b>Limit</b></i>
                    <i title='Integration' onclick="icon_clicked('integ')" class="buttonus-icon buttonus-icon2"><b>∫Integ</b></i>
                    <i title='Power: Replace "n" with your desired characters (any character is allowed)' onclick="icon_clicked('power')" class="buttonus-icon buttonus-icon2"><b>^n</b></i>
                    <i title='Base: Replace "n" with your desired characters (any character is allowed)' onclick="icon_clicked('base')"  class="buttonus-icon buttonus-icon2"><b>_n</b></i>
                    <i title="log: <sub> is for base" onclick="icon_clicked('log')"  class="buttonus-icon buttonus-icon2"><b>log<sub>x</sub>y</b></i>
                    
                    <i title="matrice" onclick="icon_clicked('matrice')"  class="buttonus-icon buttonus-icon2"><b>[Matr.]</b></i>
                    <i title="determinants" onclick="icon_clicked('determinant')"  class="buttonus-icon buttonus-icon2"><b>|Det.|</b></i>

                </div>
            </div>
        </div>
    </div>



   <!--------If not logged in------->
   <div class="<?php echo $hidome?> loggin-pls">
       <a class="loggin-link" href="/comment section/loggin.php" target="_self">login/Sign up</a>
   </div>

    <!--------IF NO COMMENTS--------->
    <div class="hidemepls no-post">
        <p>Be the first to Comment.</p>
    </div>

    <!--------Form to sort--------->
 
<div class="comment-navbar2">
        <div class="sort-select-div">
        <form id="com-sortby-form" method="post" action="<?php //echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
          <select name="com-sort-by" class="sort-select" id="sort-select">
            <option value="best" onclick="document.getElementById('com-sortby-form').submit()">Best</option>
            <option value="new" onclick="document.getElementById('com-sortby-form').submit()" >New</option>
          </select>
        </form>
        </div>
    </div>
    <!---------------REPLY BOX------------------>

<br><br><br>



<div class="hidemepls reply-box comment-box">
        <div clas="textarea-container">
            <textarea required placeholder="Write your reply" class="reply-textarea" ></textarea>
        </div>
        <div style="position: relative">
            <div  id="buttonus-container" class="buttonus-container reply-buttonus-container">
                <div class="buttonus-container-left">

                <!----REMOVED1 FROM HERE---->
          
                    <i onclick="reply_icon_clicked('bold')" class="buttonus-icon buttonus-icon2 fas fa-bold"></i>
                    <i onclick="reply_icon_clicked('italic')" class="buttonus-icon buttonus-icon2 fas fa-italic"></i>
                    <i onclick="reply_icon_clicked('underline')" class="buttonus-icon buttonus-icon2 fas fa-underline"></i>
                    <i onclick="reply_icon_clicked('strike')" class="buttonus-icon buttonus-icon2 fas fa-strikethrough"></i>
                    <i onclick="reply_icon_clicked('link')" class="buttonus-icon buttonus-icon2 fas fa-link"></i>
                    <i onclick="reply_icon_clicked('spoiler')" class="buttonus-icon buttonus-icon2 fas fa-eye"></i>
                    <i onclick="reply_icon_clicked('code')" class="buttonus-icon buttonus-icon2 fas fa-code"></i>
                    <i onclick="reply_icon_clicked('quote')" class="buttonus-icon buttonus-icon2 fas fa-quote-left"></i>
                    <i onclick="reply_icon_clicked('maths');document.getElementsByClassName('maths-container')[1].classList.toggle('hidemepls')" style="font-size:22px;font-weight:800;bottom:0" class="buttonus-icon buttonus-icon2"><b>Maths</b></i>
                    </div>
            <!-------------POST BUTTON-------------->
                <div class="buttonus-container-right">
                    <span onclick="com_cancel_butn()" class='com-cancel-butn'>Cancel</span>
                    <button onclick='reply_post()' class="buttonus5 reply-submit" >Post</button>
                </div>
      

            <!--------------Maths container------------------>
  

            </div>

            <div class="maths-container hidemepls">
                <i onclick="reply_icon_clicked('limit')" class="buttonus-icon buttonus-icon2"><b>Limit</b></i>
                <i onclick="reply_icon_clicked('integ')" class="buttonus-icon buttonus-icon2"><b>∫Integ</b></i>
                <i onclick="reply_icon_clicked('power')" class="buttonus-icon buttonus-icon2"><b>^n</b></i>
                <i onclick="reply_icon_clicked('base')"  class="buttonus-icon buttonus-icon2"><b>_n</b></i>
                <i onclick="reply_icon_clicked('log')"  class="buttonus-icon buttonus-icon2"><b>log<sub>x</sub>y</b></i>
                
                <i onclick="reply_icon_clicked('matrice')"  class="buttonus-icon buttonus-icon2"><b>[Matr.]</b></i>
                <i onclick="reply_icon_clicked('determinant')"  class="buttonus-icon buttonus-icon2"><b>|Det.|</b></i>

            </div>
        </div>
    </div>
<!--------REMOVED1----------------
<i onclick=\"reply_icon_clicked('video')\" class=\"buttonus-icon buttonus-icon1 far fa-images\"></i>
<i onclick=\"reply_icon_clicked('image')\" class=\"buttonus-icon buttonus-icon1 far fa-image\"></i>
<div class=\"vertical-buttonus\"></div>
-->


    <div class="comments-summoner">

        
<!--------submiting/retrieving the comments------------->
<?php

$sort1 = 'upvotes';
$sort2 = 'com_id';
//comment throw
$sort_by = $_POST['com-sort-by'];

if($sort_by == 'new'){
    $sort2 = 'upvotes';
    $sort1 = 'com_id';
    echo "<script>document.getElementById('sort-select').value = 'new'</script>";
}

//---------------------------Highlighted comment-------------------------------------//


$highlight_num = $_GET['com_highlight'];

if($highlight_num){

$comm_data = "SELECT comment_store.points,comment_store.edited,comment_store.total_replies,comment_store.upvotes,comment_store.downvotes, comment_store.com_id,comment_store.user_num ,comment_store.com_date , comment_store.com_time , comment_store.comment ,user_info.user_pic , user_info.user_name , user_info.privilege, user_info.first_name, user_info.last_name,user_info.user_desc FROM comment_store JOIN user_info ON comment_store.user_num = user_info.user_num WHERE comment_store.com_page = '$currpage' && comment_store.com_id = $highlight_num LIMIT 1; ";

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


        $datetime1 = new DateTime( $row["com_time"] . $row["com_date"]);//start time
        $date = date("Y-m-d H:i:s");
        $datetime2 = new DateTime($date);//end time
        $time_diff =  give_nice_diff($datetime1,$datetime2);


     
        echo "
        <div class='com-wrap$usrcomid'>
        <form class='' target='_blank' method='get' action='/comment section/Userdatabase/user.php' id='com-form$usrcomid'>
        <input name='usr_name' value='$usrname' type='hidden'>
        </form>
        <div style='position:relative'>
        <br>
        <div class='highlight-text-div'><span class='highlight-text-span'>Highlighted comment</span></div>
        <div class='com-old com-body com-body$usrcomid'>
      
        <div class='inside-user-pic-div'><div onmouseover='tooltip_show(\"show\", $usrcomid)' onmouseout='tooltip_show(\"hide\", $usrcomid)' style='position:relative' class='pic-summon'><img class='inside-user-pic' src='" . $row["user_pic"] . "'></div></div>
        <div class='inside-user-name-div'><span onclick='window.open(/Userdatabase/user.php)' class='real-username-div'>" . $row["user_name"]. "&nbsp;⋅</span>
            <span class='time-div'>$time_diff</span><span class='time-div $ifedited com-edited$usrcomid'> <b class='com-color-for-text'>⋅</b> (edited)</span>
        </div><br><br><br>

    <pre class='com-texto com-editable-texto com-editable-texto$usrcomid'><p class='com-texto-p'>".$row["comment"]."</p></pre>
    <div class='com-options'><i onclick='com_vote(\"upvoted\",$usrcomid,\"comment_store\")' class='$ifupvoted com-upvotes$usrcomid fas fa-chevron-up'>$upvotes</i><div class='vertical-buttonus'></div> 
    <i onclick='com_vote(\"downvoted\",$usrcomid,\"comment_store\")' class='$ifdownvoted com-downvotes$usrcomid fas fa-chevron-down'>$downvotes</i>&nbsp;&nbsp;&nbsp;
    <span class='$ifaccess' onclick='edit_com($usrcomid,$usrnum,$usrcomid)'>Edit</span> 
    <b class='$ifaccess'>⋅</b> <span class='$ifaccess' onclick='delete_com($usrcomid,$usrnum,$usrcomid)'>Delete</span> 
    <b class='$ifaccess'>⋅</b> <span onclick='reply_com($usrcomid,$usrnum,$usrcomid,\"$usrname\")'>Reply</span> 
    <b>⋅</b> <span onclick='share_com($usrcomid)'>Share</span> 
    <span class='hidemepls com-cancelEdit$usrcomid' onclick='cancel_com($usrcomid,$usrnum,$usrcomid)'><b style='position:relative;top:0px'>⋅</b> Cancel</span>  
    
    <div class='$replyhide com-options-right' style='float:right; margin-right:20px'><span class='com-show-replies$usrcomid' onclick='show_replies($usrcomid,$usrcomid)'>Show Replies</span> <span> ($totalreplies)</span></div>
   <!--<span style='float:right; margin-right:20px' class='com-refresh-replies$usrcomid' onclick='refresh_replies($usrcomid)'>Refresh Replies</span>--></div>

    </div>
    <span class='com-tooltip com-tooltip$usrcomid inside-com-tooltip tooltiptextox'>
    <div class='tooltip-user-pic'><div title='View Profile' onclick='document.getElementById(\"com-form$usrcomid\").submit()' class='tooltip-user-pic-inner'><img class='tooltip-user-img' src='$usrpic'></div></div>
    <div class='tooltip-user-info'><a title='View Profile' onclick='document.getElementById(\"com-form$usrcomid\").submit()' class='tooltip-username'>$usrname</a></div>
    <div class='tooltip-user-info2'><span class='tooltip-userfullname'>$usrfirstname  $usrlastname</span></div>
    <div class='tooltip-user-desc'><p class='tooltip-user-desc-inner'>$usrdesc</p></div>
    <div class='tooltip-user-footer'><span class='$ifaccess logout-span' onclick='logout()'>logout</span></div>
 
    <div class='tooltip-user-footer'></div>
    </span>   
    </div>

    <div class='com-reply-summoner$usrcomid com-reply-summoner'></div>
    </div><script>setTimeout(function(){document.getElementsByClassName(\"com-body$usrcomid\")[0].classList.add('flex-display-com-old');setTimeout(function(){document.getElementsByClassName(\"com-body$usrcomid\")[0].classList.remove('flex-display-com-old')},100);document.getElementsByClassName(\"com-texto\")[0].scrollIntoView({behavior: \"smooth\", block: \"center\"});document.getElementsByClassName('com-wrap$usrcomid')[1].classList.add('hidemepls')},100)</script>
        ";
    ;
     
    }
} 

}

//------------------------------Main Comment Section------------------------------//

$comm_data = "SELECT comment_store.points,comment_store.edited,comment_store.total_replies,comment_store.upvotes,comment_store.downvotes, comment_store.com_id,comment_store.user_num ,comment_store.com_date , comment_store.com_time , comment_store.comment ,user_info.user_pic , user_info.user_name , user_info.privilege, user_info.first_name, user_info.last_name,user_info.user_desc FROM comment_store JOIN user_info ON comment_store.user_num = user_info.user_num WHERE comment_store.com_page = '$currpage' ORDER BY  $sort1 DESC ,total_replies DESC , $sort2 DESC; ";

$result = $conn->query($comm_data);

if($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {

        static $roundo = 1;

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


        $datetime1 = new DateTime( $row["com_time"] . $row["com_date"]);//start time
        $date = date("Y-m-d H:i:s");
        $datetime2 = new DateTime($date);//end time
        $time_diff = give_nice_diff($datetime1,$datetime2);

     
        echo "
        <div class='com-wrap$usrcomid'>
        <form class='' target='_blank' method='get' action='/comment section/Userdatabase/user.php' id='com-form$usrcomid'>
        <input name='usr_name' value='$usrname' type='hidden'>
        </form>
        <div  style='position:relative'>

        <div class='com-old com-body com-body$usrcomid'>
      
        <div class='inside-user-pic-div'><div onmouseover='tooltip_show(\"show\", $usrcomid)' onmouseout='tooltip_show(\"hide\", $usrcomid)' style='position:relative' class='pic-summon'><img class='inside-user-pic' src='" . $row["user_pic"] . "'></div></div>
        <div class='inside-user-name-div'><span onclick='window.open(/Userdatabase/user.php)' class='real-username-div'>" . $row["user_name"]. "&nbsp;⋅</span>
            <span class='time-div'>$time_diff</span><span class='time-div $ifedited com-edited$usrcomid'> <b class='com-color-for-text'>⋅</b> (edited)</span>
        </div><br><br><br>

    <pre class='com-texto com-editable-texto com-editable-texto$usrcomid'><p class='com-texto-p'>". $row["comment"]."</p></pre>
    <div class='com-options'><i onclick='com_vote(\"upvoted\",$usrcomid,\"comment_store\")' class='$ifupvoted com-upvotes$usrcomid fas fa-chevron-up'>$upvotes</i><div class='vertical-buttonus'></div> 
    <i onclick='com_vote(\"downvoted\",$usrcomid,\"comment_store\")' class='$ifdownvoted com-downvotes$usrcomid fas fa-chevron-down'>$downvotes</i>&nbsp;&nbsp;&nbsp;
    <span class='$ifaccess' onclick='edit_com($usrcomid,$usrnum,$usrcomid)'>Edit</span> 
    <b class='$ifaccess'>⋅</b> <span class='$ifaccess' onclick='delete_com($usrcomid,$usrnum,$usrcomid)'>Delete</span> 
    <b class='$ifaccess'>⋅</b> <span onclick='reply_com($usrcomid,$usrnum,$usrcomid,\"$usrname\")'>Reply</span> 
    <b>⋅</b> <span onclick='share_com($usrcomid)'>Share</span> 
    <span class='hidemepls com-cancelEdit$usrcomid' onclick='cancel_com($usrcomid,$usrnum,$usrcomid)'><b style='position:relative;top:0px'>⋅</b> Cancel</span>  
    
    <div class='$replyhide com-options-right' style='float:right; margin-right:20px'><span class='com-show-replies$usrcomid' onclick='show_replies($usrcomid,$usrcomid)'>Show Replies</span> <span> ($totalreplies)</span></div>
   <!--<span style='float:right; margin-right:20px' class='com-refresh-replies$usrcomid' onclick='refresh_replies($usrcomid)'>Refresh Replies</span>--></div>

    </div>
    <span class='com-tooltip com-tooltip$usrcomid inside-com-tooltip tooltiptextox'>
    <div class='tooltip-user-pic'><div title='View Profile' onclick='document.getElementById(\"com-form$usrcomid\").submit()' class='tooltip-user-pic-inner'><img class='tooltip-user-img' src='$usrpic'></div></div>
    <div class='tooltip-user-info'><a title='View Profile' onclick='document.getElementById(\"com-form$usrcomid\").submit()' class='tooltip-username'>$usrname</a></div>
    <div class='tooltip-user-info2'><span class='tooltip-userfullname'>$usrfirstname  $usrlastname</span></div>
    <div class='tooltip-user-desc'><p class='tooltip-user-desc-inner'>$usrdesc</p></div>
    <div class='tooltip-user-footer'><span class='$ifaccess logout-span' onclick='logout()'>logout</span></div>
    <div class='tooltip-user-footer'></div>
    </span>   
    </div>

    <div class='com-reply-summoner$usrcomid com-reply-summoner'></div>
    </div>
        ";
       // echo "<script>alert('$roundo')</script>";
       if($roundo == 20){
         echo "<script>setTimeout(function(){document.getElementsByClassName('load-more-p')[0].classList.remove('hidemepls')},200)</script>";
       }

        $roundo++;
    }
} 
else {
    echo "<script>document.getElementsByClassName('no-post')[0].classList.remove('hidemepls');
    document.getElementsByClassName('comment-navbar2')[0].classList.add('hidemepls');
    </script>";
}





$conn->close();

?>


</div>
    <div onclick="load_more_com()" class="hidemepls load-more-p">Load More...</div>
    <hr class="outro-hr">
</div>


</div>
    <script src="/comment section/comments.js"></script>
   
   
