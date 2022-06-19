<?php 
$work = $_POST["work"];
error_reporting(0);

if($work == "a"){
    $myfile = fopen("pip.txt", "w+") or die("Unable to open file!");
    fwrite($myfile, '{"pip_out":true}');
    fclose($myfile);
}
elseif($work == "b"){
    //xmlhttp.send(`work=b&vid_id=${curr_vid_id}&time=${vid.currentTime}&play_history=${play_history}`);
    $vid_id = $_POST["vid_id"];
    $time = $_POST["time"];
    $play_history = $_POST["play_history"];
    $myfile = fopen("pip.txt", "w+") or die("Unable to open file!");
    fwrite($myfile, "{\"time\":$time,\"vid_id\": $vid_id,\"play_history\":[$play_history],\"pip_out\": false}");
    fclose($myfile);
}

$myfile2 = fopen("pip.txt", "r") or die("Unable to open file!");
echo fread($myfile2,filesize("pip.txt"));

?>