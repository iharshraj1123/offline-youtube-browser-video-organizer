<?php 

error_reporting(0);

$usr_num = $_COOKIE['loggedusernum'] ;
$usr_name = $_COOKIE['loggedusername'];
$usr_pic = $_COOKIE['loggeduserpic'];
$usr_privilege = $_COOKIE['loggeduserprivilege'];
$usr_firstname = $_COOKIE['loggeduserfirstname'];
$usr_lastname = $_COOKIE['loggeduserlastname'];
$usr_desc = $_COOKIE['loggeduseruserdesc'];
$usr_comment_votes = $_COOKIE['comment_votes'];


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

?>

<script>
    var ismouseoverheadicon = false;
</script>

<div id="main"> 

  <header  onmouseover="removothecontroloboxo(0)" class="outer-header">
    <div class="inner-header">

       <div class="Menu-holder"  onclick="toggleNav()" >
            <div>
                <div class="Menu menu1"></div>
                <div class="Menu menu2"></div>
                <div class="Menu menu3"></div>
            </div> 
        </div>
        <a class="logo-link" href="/YouTube/index.php"> 
           <img class="yt-header-logo" src="./resources/icons/youtube header hd 4.png">
           <img class="yt-header-logo-two" src="./resources/icons/yt logo hd 2.png">
        </a>
        <div class="search-bar" autocomplete="off">
              <div class="searchbar-div">
                <input id="search-bar" onkeydown="search_keydown()" class="search-input" type="search" placeholder="Search"/><span onclick="clear_search()" class="clear-search hideme">&times;</span>
                <div class="search-results hideme">
                    <ul onmouseover="not_over_search_div=false" onmouseout="not_over_search_div=true" class="search-results-ul">
                    </ul>
                </div>
              </div>
            <button onmouseover="ismouseoverheadicon = true" onmouseout="ismouseoverheadicon = false" onclick="yt_search()" class="yt-search tooltip"><span class="tooltiptext">Search</span>
                <img class="search-magni" src="./resources/icons/search_white_24dp.svg">
            </button>
            <div onmouseover="ismouseoverheadicon = true" onmouseout="ismouseoverheadicon = false" class="tooltip voice-search-div"><span class="tooltiptext">Voice Search</span><img aria-label="voice search" class="search-mic" src="./resources/icons/mic_white_24dp.svg"></div>
        </div>

        <div onmouseover="ismouseoverheadicon = true" onmouseout="ismouseoverheadicon = false" class="menu-icons">
            <a class="tooltip" href="upload.php" target="_blank"><span class="create-tip tooltiptext">Create</span>
                <img class="create-vid-icon" src="./resources/icons/video_call_white_24dp.svg"/>
            </a>
            <a class="tooltip" href="#"><span class="create-tip tooltiptext">Random</span>
                <img onclick="rando_songo()" src="./resources/icons/apps_white_24dp.svg"/>
            </a>
            <a class="tooltip notification-linkoa" href="#"><span class="tooltiptext">Notifications</span>
                <img src="./resources/icons/notifications_white_24dp.svg"/>
            </a>
            <a class="tooltip" href="/comment%20section/Userdatabase/me.php" target="_blank"><span class="create-tip tooltiptext"><?php echo $usr_name?></span>
                <img class="my-channel-icon" src='<?php echo "$usr_pic"?>'/>
            </a>
        </div>


    </div>
    </header>


  </header>
      