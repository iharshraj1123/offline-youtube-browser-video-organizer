<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "userdata";

$conn = new mysqli($servername, $username, $password, $dbname);

$comoid = $_POST['comoid'] ;
$usrono = $_COOKIE['loggedusernum'];
$condition = $_POST['condition'];
$table = $_POST['table'];
$column = '';
$whichvote = '';
if($table == 'comment_store'){$column = 'com_id'; $whichvote = 'comment_votes';}
elseif($table == 'reply_store'){$column = 'reply_id';$whichvote = 'reply_votes'; }


$usr_comment_votes = $_COOKIE['comment_votes'];
$usr_reply_votes = '';

$getdata = "SELECT user_info.comment_votes , user_info.reply_votes FROM user_info WHERE user_num = $usrono";
$gotdata = $conn->query($getdata);
if($gotdata->num_rows > 0) {
    // output data of each row
    while($datagot = $gotdata->fetch_assoc()) {
        $usr_comment_votes = $datagot['comment_votes'];
        $usr_reply_votes = $datagot['reply_votes'];
        setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
        setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");
    }
}

$usr_comment_votes = unserialize($usr_comment_votes);
$usr_reply_votes = unserialize($usr_reply_votes);

if($condition == 1){
  echo '<br>condition1<br>';
    //remove upvote
    if($table == 'comment_store'){$usr_comment_votes[$comoid] = '';}
    elseif($table == 'reply_store'){$usr_reply_votes[$comoid] = '';}

    $update = "UPDATE `$table` SET upvotes = upvotes - 1 WHERE $column = $comoid ";
    
    if ($conn->query($update) === TRUE) {
      echo "Upvote Record edited successfully";
    } else {
      echo "Error edited record: " . $conn->error;
    }
    if($table == 'comment_store'){$usr_comment_votes = serialize($usr_comment_votes);}
    elseif($table == 'reply_store'){$usr_reply_votes = serialize($usr_reply_votes);}
    
    $update2 = "";

    if($table == 'comment_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_comment_votes'  WHERE user_num = $usrono ";}
    elseif($table == 'reply_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_reply_votes'  WHERE user_num = $usrono ";}

    if ($conn->query($update2) === TRUE) {
      echo "User Record edited successfully";
    } else {
      echo "Error user edited record: " . $conn->error;
    }
    setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
    setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");
}

elseif($condition == 2){
  echo '<br>condition2<br>';
    //upvote but there was already a downvote 
    if($table == 'comment_store'){$usr_comment_votes[$comoid] = 'upvoted';}
    elseif($table == 'reply_store'){$usr_reply_votes[$comoid] = 'upvoted';}

    $update = "UPDATE `$table` SET upvotes = upvotes + 1 WHERE $column = $comoid";
    
    if ($conn->query($update) === TRUE) {
      echo "Upvote Record edited successfully";
    } else {
      echo "Error edited record: " . $conn->error;
    }

    $updato = "UPDATE `$table` SET downvotes = downvotes - 1 WHERE $column = $comoid";
    if ($conn->query($updato) === TRUE) {
      echo "Upvote Record edited successfully";
    } else {
      echo "Error edited record: " . $conn->error;
    }

    if($table == 'comment_store'){$usr_comment_votes = serialize($usr_comment_votes);}
    elseif($table == 'reply_store'){$usr_reply_votes = serialize($usr_reply_votes);}
    
    $update2 = "";

    if($table == 'comment_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_comment_votes'  WHERE user_num = $usrono ";}
    elseif($table == 'reply_store'){  $update2 ="UPDATE `user_info` SET $whichvote = '$usr_reply_votes'  WHERE user_num = $usrono ";}

    if ($conn->query($update2) === TRUE) {
      echo "User Record edited successfully";
    } else {
      echo "Error user edited record: " . $conn->error;
    }
    setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
    setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");
}

elseif($condition == 3){
    //simple upvote
    if($table == 'comment_store' && $usr_comment_votes[$comoid] == 'upvoted' ){echo 'breach failed lv1';}
    else{
    if($table == 'reply_store' && $usr_reply_votes[$comoid] = 'upvoted' ){echo 'breach failed lv2';}
    else{
    
    if($table == 'comment_store'){$usr_comment_votes[$comoid] = 'upvoted';}
    elseif($table == 'reply_store'){$usr_reply_votes[$comoid] = 'upvoted';}

   

    $update = "UPDATE `$table` SET upvotes = upvotes + 1 WHERE $column = $comoid ";
    
    if ($conn->query($update) === TRUE) {
      echo "Upvote Record edited successfully";
    } else {
      echo "Error edited record: " . $conn->error;
    }
    if($table == 'comment_store'){$usr_comment_votes = serialize($usr_comment_votes);}
    elseif($table == 'reply_store'){$usr_reply_votes = serialize($usr_reply_votes);}
    
    $update2 = "";

    if($table == 'comment_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_comment_votes'  WHERE user_num = $usrono ";}
    elseif($table == 'reply_store'){$update2 = "UPDATE `user_info` SET $whichvote = '$usr_reply_votes'  WHERE user_num = $usrono ";}

    if ($conn->query($update2) === TRUE) {
      echo "User Record edited successfully";
    } else {
      echo "Error user edited record: " . $conn->error;
    }
    setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
    setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");
  }}

}

elseif($condition == 4){
    //remove downvote
    if($table == 'comment_store'){$usr_comment_votes[$comoid] = '';}
    elseif($table == 'reply_store'){$usr_reply_votes[$comoid] = '';}

    $update = "UPDATE `$table` SET downvotes = downvotes - 1 WHERE $column = $comoid ";
    
    if ($conn->query($update) === TRUE) {
      echo "Upvote Record edited successfully";
    } else {
      echo "Error edited record: " . $conn->error;
    }
    if($table == 'comment_store'){$usr_comment_votes = serialize($usr_comment_votes);}
    elseif($table == 'reply_store'){$usr_reply_votes = serialize($usr_reply_votes);}
    
    $update2 = "";

    if($table == 'comment_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_comment_votes'  WHERE user_num = $usrono ";}
    elseif($table == 'reply_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_reply_votes'  WHERE user_num = $usrono ";}

    if ($conn->query($update2) === TRUE) {
      echo "User Record edited successfully";
    } else {
      echo "Error user edited record: " . $conn->error;
    }
    setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
    setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");

}

elseif($condition == 5){
  //remove upvote and downvote
  if($table == 'comment_store'){$usr_comment_votes[$comoid] = 'downvoted';}
  elseif($table == 'reply_store'){$usr_reply_votes[$comoid] = 'downvoted';}

  $update = "UPDATE `$table` SET downvotes = downvotes + 1 WHERE $column = $comoid";
  
  if ($conn->query($update) === TRUE) {
    echo "Upvote Record edited successfully";
  } else {
    echo "Error edited record: " . $conn->error;
  }

  $updato = "UPDATE `$table` SET upvotes = upvotes - 1 WHERE $column = $comoid ";

  if ($conn->query($updato) === TRUE) {
    echo "Upvote Record edited successfully";
  } else {
    echo "Error edited record: " . $conn->error;
  }

  if($table == 'comment_store'){$usr_comment_votes = serialize($usr_comment_votes);}
  elseif($table == 'reply_store'){$usr_reply_votes = serialize($usr_reply_votes);}
  
  $update2 = "";

  if($table == 'comment_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_comment_votes'  WHERE user_num = $usrono ";}
  elseif($table == 'reply_store'){  $update2 ="UPDATE `user_info` SET $whichvote = '$usr_reply_votes'  WHERE user_num = $usrono ";}

  if ($conn->query($update2) === TRUE) {
    echo "User Record edited successfully";
  } else {
    echo "Error user edited record: " . $conn->error;
  }
  setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
  setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");

}

elseif($condition == 6){
  //simple downvote
  if($table == 'comment_store' && $usr_comment_votes[$comoid] == 'downvoted' ){echo 'breach failed lv1';}
  else{
  if($table == 'reply_store' && $usr_reply_votes[$comoid] = 'downvoted' ){echo 'breach failed lv2';}
  else{

  if($table == 'comment_store'){$usr_comment_votes[$comoid] = 'downvoted';}
  elseif($table == 'reply_store'){$usr_reply_votes[$comoid] = 'downvoted';}

  $update = "UPDATE `$table` SET downvotes = downvotes + 1 WHERE $column = $comoid ";
  
  if ($conn->query($update) === TRUE) {
    echo "Upvote Record edited successfully";
  } else {
    echo "Error edited record: " . $conn->error;
  }
  if($table == 'comment_store'){$usr_comment_votes = serialize($usr_comment_votes);}
  elseif($table == 'reply_store'){$usr_reply_votes = serialize($usr_reply_votes);}
  
  $update2 = "";

  if($table == 'comment_store'){ $update2 = "UPDATE `user_info` SET $whichvote = '$usr_comment_votes'  WHERE user_num = $usrono ";}
  elseif($table == 'reply_store'){  $update2 ="UPDATE `user_info` SET $whichvote = '$usr_reply_votes'  WHERE user_num = $usrono ";}

  if ($conn->query($update2) === TRUE) {
    echo "User Record edited successfully";
  } else {
    echo "Error user edited record: " . $conn->error;
  }
  setcookie('comment_votes', $usr_comment_votes  , time() + (365 * 24 * 60 * 60), "/");
  setcookie('reply_votes',  $usr_reply_votes  , time() + (365 * 24 * 60 * 60), "/");
  }}
}


?>