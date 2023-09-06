![image](https://github.com/iharshraj1123/offline-youtube-browser-video-organizer/assets/33609172/191a37c6-6f3c-4070-9517-004ade9f9448)

![image](https://github.com/iharshraj1123/offline-youtube-browser-video-organizer/assets/33609172/4c3be46b-cfcc-4893-84a7-23b04d90cbac)

![image](https://github.com/iharshraj1123/offline-youtube-browser-video-organizer/assets/33609172/f1b5f1db-703a-443b-a6ba-eca9b2214dd3)

![image](https://github.com/iharshraj1123/offline-youtube-browser-video-organizer/assets/33609172/ea07b43a-caf0-4fa0-8e2e-8a7932d702a2)


summoning code: <?php include '/comment section/comments.php' ?>

How to set it up :

1: Add this folder to your website root (htdocs) 

2: link to 'comments.css' and include 'comments.php' to the part of page you want the comment section to summon.
   or just copy-paste whats given below :
   "<?php include '/comment section/comments.php' ?>"

   also add "<?php session_start();?>" at top , yeah like top-top , before <!DOCTYPE html>

3: link font-awesome 5 to your page , also link 'Roboto' font for better looking results.

   In case I didnt provided font-awesome file , sign up a free version on font awesome , 
   https://www.w3schools.com/icons/fontawesome5_intro.asp  : use this as your guide , this page also contains the link to sign up
   
   I prefer the cdn version Search it on web for font-awesome 5


4: Make a database and name it 'userdata' in your MySQL database ,if you dont understand databases....well its kinda hard now... 
   ok first 
    if(you are going to use it on localhost) {
       Make a new user account to handle mysql in phpmysql (there should be an option for this in the tabs where , databases,sql,status etc are present) 
       Make user name : "admin" and password : "pwdpwd"
       Check all permissions in the bottom section
       im sure you are using xampp , please dont use just a basic php server for this
       setting up Xampp will be tedious , ok i recomend uninstalling your current apache server or it will get even harder
       watch you are on your own here now
    }
    else_if(you are going to use it on your website){
       there should be a database present most likely named phpmyadmin or mysql database
    }

///////////////////////////////////////////////////////////////////////////////////////    
NOW AFTER INSTALLING MYSQL or Phpmyadmin environment
    or finding it on your Cpanel

You have to make a database like this
> userdata                   (database)
---> comment_store           (table)
---> reply_store             (table)
---> user_info               (table)

where 'userdata' is the database and other two are tables

First create a database named 'userdata' then in its SQL Page (or RUN SQL depending upon what what environment you using)
copy paste given two commands one by one (its better to do it one by one i think)

NOTE :  If you are using a hosting service sometimes you have to save database names like :
      epizy_user1829_userdata

  !!!!!Change $servername , $username , $password , $database in all php files 
       according to the data given by your hosting service or as set by you in Apache!!!!

<-------use these two commands below in the given order------->

///////////////////1st for 'user_info Table'////////////////////

CREATE TABLE `user_info` (
 `user_num` int(11) NOT NULL AUTO_INCREMENT,
 `user_name` varchar(40) COLLATE utf8mb4_bin NOT NULL,
 `privilege` varchar(10) COLLATE utf8mb4_bin NOT NULL DEFAULT 'USER',
 `user_pass` varchar(40) COLLATE utf8mb4_bin DEFAULT NULL,
 `first_name` varchar(15) COLLATE utf8mb4_bin DEFAULT NULL,
 `last_name` varchar(15) COLLATE utf8mb4_bin DEFAULT NULL,
 `user_desc` varchar(2000) COLLATE utf8mb4_bin DEFAULT 'Hiii There its me !!! yeah you dont know me....',
 `user_pic` varchar(200) COLLATE utf8mb4_bin DEFAULT '/comment section/Userdatabase/ProfilePic/default1.jpg',
 `comment_votes` longtext COLLATE utf8mb4_bin NOT NULL,
 `reply_votes` longtext COLLATE utf8mb4_bin NOT NULL,
 PRIMARY KEY (`user_num`,`user_name`,`privilege`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

///////////////////2nd for 'comment_store' Table/////////////////////

CREATE TABLE `comment_store` (
 `com_id` int(11) NOT NULL AUTO_INCREMENT,
 `com_page` varchar(40) COLLATE utf8mb4_bin NOT NULL,
 `user_num` int(11) NOT NULL,
 `com_date` date NOT NULL,
 `com_time` time NOT NULL,
 `comment` longtext COLLATE utf8mb4_bin NOT NULL,
 `total_replies` int(11) NOT NULL,
 `upvotes` int(11) NOT NULL,
 `downvotes` int(11) NOT NULL,
 `points` int(11) NOT NULL,
 `edited` varchar(20) COLLATE utf8mb4_bin NOT NULL DEFAULT 'false',
 PRIMARY KEY (`com_id`),
 UNIQUE KEY `com_id` (`com_id`),
 KEY `comment_store_ibfk_1` (`user_num`),
 CONSTRAINT `comment_store_ibfk_1` FOREIGN KEY (`user_num`) REFERENCES `user_info` (`user_num`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

///////////////////3rd for 'reply_store' Table/////////////////////

CREATE TABLE `reply_store` (
 `reply_id` int(11) NOT NULL AUTO_INCREMENT,
 `com_id` int(11) NOT NULL,
 `user_num` int(11) NOT NULL,
 `page` varchar(100) COLLATE utf8mb4_bin NOT NULL,
 `reply_date` date NOT NULL,
 `reply_time` time NOT NULL,
 `replied_to` varchar(40) COLLATE utf8mb4_bin NOT NULL,
 `reply` longtext COLLATE utf8mb4_bin NOT NULL,
 `upvotes` int(11) NOT NULL,
 `downvotes` int(11) NOT NULL,
 `points` int(11) NOT NULL,
 `edited` varchar(20) COLLATE utf8mb4_bin NOT NULL DEFAULT 'false',
 PRIMARY KEY (`reply_id`),
 KEY `com_id` (`com_id`),
 KEY `reply_store_ibfk_2` (`user_num`),
 CONSTRAINT `reply_store_ibfk_1` FOREIGN KEY (`com_id`) REFERENCES `comment_store` (`com_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `reply_store_ibfk_2` FOREIGN KEY (`user_num`) REFERENCES `user_info` (`user_num`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

///////////////////////////////////////////////////////////////


5: Make yourself a profile in user_info table ,and add 'MOD' or 'ADMIN' inside privilege.
   Also make yourself a normal profile with privilege 'USER' to check the difference in looks
   As a MOD/ADMIN you can delete or edit even others comments , though you can do it directly with the data base aswell lol.


6: Final thing to do is customize css colors or other styles for the comments according to your need 
   The is a variable holder in top of 'comments.css' named ':root'
   you can interchange light and dark mode from there.
   if you encounter any css problems with Math objects , try solving them with normal CSS if you CONSTRAINT 
   you need to visit 'comments.js' 80% of that file is just for maths lol.All CSS for Math objects are applied from that js script no seperate CSS file exists for Math objects.
   there are a lot of unused maths and chemistry things there aswell try exploring.
   and add it to your comment arsenal if you wish.

you are on your own for this for any minor bugs you face during to customisation :]

Good day ;)
