<?php 
session_start();
error_reporting(0);


//menu toggle
$menu_open = $_COOKIE['menu_open'];
$menutogglediv="";
$menutogglei="";
$menutogglea="";
$menutogglebelow="";

if($current_url_noget == "/YouTube/play.php"){}
else{
    if($menu_open == "false"){
        $menutogglediv="toggle-style-div";
        $menutogglei="toggle-style-i";
        $menutogglea="toggle-style-links";
        $menutogglewidth="put-width-100px";
        $menutogglebelow="invisible";

    }
    else{
        echo '<script>
        setTimeout(function(){
              for(i=0;i<document.getElementsByClassName("thumbnail").length;i++)
              {
                  document.getElementsByClassName("thumbnail")[i].style.maxHeight ="170px";
                  document.getElementsByClassName("video-thumbnail")[i].style.minHeight ="170px";
              }
            },100)
            </script>';
    }
}



?>
<div class="<?php echo $menutogglewidth?> Menu-div">
            <div class="Menu-div-sticky">
            <div class="menu-btns menu-div1">
                <div onclick="redirectTo('/YouTube/')" class="menu-a-divs <?php echo $menutogglediv?>"><i class="fa fa-home <?php echo $menutogglei?>" aria-hidden="true"></i> <a class="menu-links <?php echo $menutogglea?>" href="/YouTube/">Home</a></div>
                <div onclick="redirectTo('/Explorer/')" class="menu-a-divs <?php echo $menutogglediv?>"><i class="fa fa-compass <?php echo $menutogglei?>" aria-hidden="true"></i> <a class="menu-links <?php echo $menutogglea?>" href="/Explorer/">Explorer</a></div>
                <div onclick="redirectTo('/')" class="menu-a-divs <?php echo $menutogglediv?>"><i class="far fa-folder-open <?php echo $menutogglei?>"></i> <a class="menu-links <?php echo $menutogglea?>" href="/">Server</a></div>
            </div>
            <div class="menu-btns menu-div2">
                <div class="menu-a-divs <?php echo $menutogglediv?>"><i class="far fa-newspaper <?php echo $menutogglei?>"></i> <a class="menu-links <?php echo $menutogglea?>" href="#">Journal</a></div>
                <div class="menu-a-divs <?php echo $menutogglediv?>"><i class="fas fa-video <?php echo $menutogglei?>"></i> <a class="menu-links <?php echo $menutogglea?>" href="#">Courses</a></div>
                <div class="menu-a-divs <?php echo $menutogglediv?>"><i class="far fa-list-alt <?php echo $menutogglei?>"></i> <a class="menu-links <?php echo $menutogglea?>" href="#">To do</a></div>
                <div class="menu-a-divs <?php echo $menutogglediv?>"><i class="fas fa-pager <?php echo $menutogglei?>"></i> <a class="menu-links <?php echo $menutogglea?>" href="#">Keep</a></div>
            </div>
            <div class="menu-btns menu-div3 <?php echo $menutogglebelow?>">
                <div class="menu-btns-title"><span>Favorites</span></div>
            </div>
            </div>
</div>
