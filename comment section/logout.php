<?php 
session_start();
error_reporting(0);

setcookie('loggedusername', null , time() + (24 * 60 * 60), "/");
setcookie('loggedusernum', null , time() + (24 * 60 * 60), "/");
setcookie('loggeduserpic', null  , time() + (24 * 60 * 60), "/");
setcookie('loggeduserpass', null , time() + (24 * 60 * 60), "/");
setcookie('loggeduserprivilege', null  , time() + (24 * 60 * 60), "/");
setcookie('loggeduserfirstname', null  , time() + (365 * 24 * 60 * 60), "/");
setcookie('loggeduserlastname', null  , time() + (365 * 24 * 60 * 60), "/");
setcookie('loggeduseruserdesc', null  , time() + (365 * 24 * 60 * 60), "/");
setcookie('comment_votes', null  , time() + (365 * 24 * 60 * 60), "/");
setcookie('reply_votes', null  , time() + (365 * 24 * 60 * 60), "/");
setcookie('members', null  , time() + (365 * 24 * 60 * 60), "/");

$_SESSION['loggedusername'] = null;
$_SESSION['loggedusernum'] = null;
$_SESSION['loggeduserpic'] = null;
$_SESSION['loggeduserpass'] = null;
$_SESSION['loggeduserprivilege'] = null;
$_SESSION['loggeduserfirstname'] = null;
$_SESSION['loggeduserlastname'] = null;
$_SESSION['loggeduseruserdesc'] = null;
$_SESSION['comment_votes'] = null;
$_SESSION['reply_votes'] = null;
$_SESSION['members'] = null;

echo '<script>window.history.go(-1);</script>';


?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>logging out...</title>
</head>
<body>
<?php 
?>
</body>
</html>